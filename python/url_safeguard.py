import os
import sys
import socket
import logging
import json
import ipaddress
from urllib.parse import urlparse
import urllib.request
import urllib.error

# Configure logging for security auditing and diagnostic tracking
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("URLSafeguard")

class URLSafeguard:
    """
    URL Safeguard Engine: Built for defanging suspect URLs, safely expanding 
    shortened links without executing client-side tracking, and blocking SSRF attacks.
    Uses pure python standard library to secure execution & prevent supply chain risks.
    """
    def __init__(self, max_redirects: int = 5, timeout: int = 5):
        self.max_redirects = max_redirects
        self.timeout = timeout
        self.user_agent = "SentryAI-SafeLink-Analyzer/1.0 (Security Auditing Tool; contact: bouglalayassin700@gmail.com)"
        
    @staticmethod
    def defang(url: str) -> str:
        """
        Neutralizes a URL so it cannot be accidentally double-clicked or rendered by browsers.
        Turns 'https://evil.com/login' into 'hxxps[://]evil[.]com/login'.
        """
        if not url:
            return ""
        
        # Neutralize protocols
        defanged = url.replace("https://", "hxxps[://]").replace("http://", "hxxp[://]")
        
        # Neutralize dot operators in the domain name
        parsed = urlparse(url)
        hostname = parsed.hostname
        if hostname:
            neutralized_host = hostname.replace(".", "[.]")
            defanged = defanged.replace(hostname, neutralized_host, 1)
            
        return defanged

    @staticmethod
    def refang(defanged_url: str) -> str:
        """
        Restores a neutralized defanged URL back into its clickable, functional format.
        Turns 'hxxps[://]evil[.]com/login' back into 'https://evil.com/login'.
        """
        if not defanged_url:
            return ""
        
        refanged = defanged_url.replace("hxxps[://]", "https://").replace("hxxp[://]", "http://")
        refanged = refanged.replace("[.]", ".")
        return refanged

    def is_ssrf_safe(self, hostname: str) -> bool:
        """
        Security Enforcement: Resolves the hostname IP (both IPv4 and IPv6) and checks it against 
        local/private networks using standard ipaddress library to prevent SSRF vulnerabilities.
        """
        if not hostname:
            return False

        try:
            # Resolve all addresses (including IPv4 and IPv6 records)
            addr_info = socket.getaddrinfo(hostname, None)
        except socket.gaierror:
            # Domain could not be resolved, so it cannot resolve to an active private IP (SSRF safe)
            return True

        for family, socktype, proto, canonname, sockaddr in addr_info:
            ip_str = sockaddr[0]
            try:
                ip = ipaddress.ip_address(ip_str)
                
                # Check standard ipaddress ranges (private, loopback, link_local, multicast, etc.)
                if (ip.is_private or 
                    ip.is_loopback or 
                    ip.is_link_local or 
                    ip.is_multicast or 
                    ip.is_unspecified or 
                    ip.is_reserved):
                    logger.warning(f"SSRF Check: Hostname '{hostname}' resolved to unsafe IP: {ip_str}")
                    return False
                    
                # Handle IPv4-mapped IPv6 addresses manually
                if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
                    mapped_ipv4 = ip.ipv4_mapped
                    if (mapped_ipv4.is_private or 
                        mapped_ipv4.is_loopback or 
                        mapped_ipv4.is_link_local or 
                        mapped_ipv4.is_multicast or 
                        mapped_ipv4.is_unspecified or 
                        mapped_ipv4.is_reserved):
                        logger.warning(f"SSRF Check: Hostname '{hostname}' resolved to unsafe mapped IPv4: {mapped_ipv4}")
                        return False
                        
            except ValueError:
                # If parsing fails, be safe and reject
                logger.warning(f"SSRF Check: Hostname '{hostname}' returned invalid/unparseable IP: {ip_str}")
                return False

        return True

    def safely_expand_link(self, shortened_url: str) -> dict:
        """
        Sends low-overhead secure HTTP HEAD requests to trace redirection links (hops)
        and discover their final destination safely, without downloading full executable payloads.
        """
        # Clean & refang URL if it was defanged
        current_url = shortened_url.strip()
        if current_url.startswith("hxxp"):
            current_url = self.refang(current_url)

        history = []
        status = "Success"
        error_msg = None

        logger.info(f"Initializing safety trace check on: {current_url}")

        # Class to handle head redirects manually so we can enforce SSRF and limit hop counts at each stage
        class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
            # Overriding redirect checks to prevent automatic hops
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                return None

        # Build custom opener with custom redirect block
        opener = urllib.request.build_opener(NoRedirectHandler())

        for hop in range(self.max_redirects + 1):
            parsed = urlparse(current_url)
            hostname = parsed.hostname

            if not hostname:
                status = "Failed"
                error_msg = "Invalid URL structure"
                break

            # Prevent SSRF attack vectors on hostnames
            if not self.is_ssrf_safe(hostname):
                status = "Blocked"
                error_msg = "SSRF Alert: Destination points to a protected or private subnet."
                logger.warning(f"Blocked SSRF attempt on domain: '{hostname}'")
                break

            # Add to redirection history list
            history.append({
                "hop": hop,
                "url": current_url,
                "defanged": self.defang(current_url),
                "domain": hostname
            })

            # Fetch headers using HEAD request to optimize bandwidth and minimize exploit footprint
            try:
                req = urllib.request.Request(
                    current_url, 
                    headers={"User-Agent": self.user_agent},
                    method="HEAD"
                )
                
                # Execute request
                with opener.open(req, timeout=self.timeout) as response:
                    code = response.getcode()
                    
                    # If we get a 3xx code, check for the Location header
                    if code in [301, 302, 303, 307, 308]:
                        next_url = response.info().get("Location")
                        if not next_url:
                            break # No redirect target specified
                        
                        # Handle relative URLs in redirection
                        if next_url.startswith("/"):
                            next_url = f"{parsed.scheme}://{hostname}{next_url}"
                        elif not next_url.startswith("http"):
                            next_url = f"{parsed.scheme}://{hostname}/{next_url}"
                        
                        current_url = next_url
                    else:
                        # 200 OK or non-redirect code reached
                        break
            except urllib.error.HTTPError as e:
                # Some servers return error codes on HEAD (e.g. 405 Method Not Allowed or 404/403)
                # But they might still offer a redirect header or mark the final destination.
                if e.code in [301, 302, 303, 307, 308]:
                    next_url = e.headers.get("Location")
                    if next_url:
                        if next_url.startswith("/"):
                            next_url = f"{parsed.scheme}://{hostname}{next_url}"
                        elif not next_url.startswith("http"):
                            next_url = f"{parsed.scheme}://{hostname}/{next_url}"
                        current_url = next_url
                        continue
                
                status = "Warning"
                error_msg = f"HTTP request returned status {e.code}"
                break
            except socket.timeout:
                status = "Timeout"
                error_msg = "Connection timed out during link resolution"
                break
            except Exception as e:
                status = "Error"
                error_msg = f"Failed to follow redirection path: {str(e)}"
                break
        else:
            status = "Warning"
            error_msg = f"Redirection loop detected. Exceeded max limit of {self.max_redirects} hops."

        # Perform a final risk analysis on the destination
        destination = history[-1]["url"] if history else shortened_url
        dest_hostname = urlparse(destination).hostname or ""
        
        # Categorize threat markers
        threat_markers = []
        suspicious_keywords = ["login", "verify", "secure", "billing", "signin", "update", "bank", "account"]
        for word in suspicious_keywords:
            if word in destination.lower():
                threat_markers.append(f"Contains keyword: '{word}'")
                
        # Common suspicious TLDs
        suspicious_tlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".click", ".top", ".xyz", ".live"]
        for tld in suspicious_tlds:
            if dest_hostname.endswith(tld):
                threat_markers.append(f"Abused TLD: '{tld}'")

        return {
            "original_url": shortened_url,
            "status": status,
            "error": error_msg,
            "hops_count": len(history) - 1 if history else 0,
            "redirect_chain": history,
            "final_destination": destination,
            "final_destination_defanged": self.defang(destination),
            "threat_markers": threat_markers,
            "is_suspicious": len(threat_markers) > 0,
            "action_recommendation": "BLOCK" if len(threat_markers) >= 2 or status == "Blocked" else ("WARN" if len(threat_markers) == 1 else "ALLOW")
        }


if __name__ == "__main__":
    safeguard = URLSafeguard()

    # Test 1: Defanging feature
    test_url = "https://paypal-security-check.cf/login?user=admin"
    defanged = safeguard.defang(test_url)
    refanged = safeguard.refang(defanged)
    
    print("\n=== Test 1: URL Defanging & Refanging ===")
    print(f"Original: {test_url}")
    print(f"Defanged: {defanged}")
    print(f"Refanged: {refanged}")

    # Test 2: SSRF Safety Verification
    print("\n=== Test 2: SSRF Cyber-Defenses ===")
    safe_test = safeguard.is_ssrf_safe("google.com")
    unsafe_test_1 = safeguard.is_ssrf_safe("127.0.0.1")
    
    print(f"google.com IP Safe?          : {safe_test}")
    print(f"127.0.0.1 (Localhost) Safe?  : {unsafe_test_1}")

    # Test 3: Link expansion simulator with reputation analysis
    print("\n=== Test 3: Link Expansion & Threat Check ===")
    short_urls = [
        "https://paypal-security-check.cf/login",
        "http://127.0.0.1/admin-portal" # SSRF Block test
    ]
    
    for short in short_urls:
        report = safeguard.safely_expand_link(short)
        print(json.dumps(report, indent=2, ensure_ascii=False))
