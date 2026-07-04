import re
import json
import socket
import logging
from email import message_from_string
from email.utils import parseaddr
from urllib.parse import urlparse

# Configure structured logging for real-time cyber intelligence audits
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("EmailAuthenticator")

PROTECTED_BRANDS = [
    "amazon", "paypal", "google", "facebook", "microsoft", "apple", "dhl", "fedex", 
    "netflix", "chase", "ebay", "instagram", "linkedin", "dropbox", "adobe", "whatsapp",
    "twitter", "yahoo", "outlook", "steam", "coinbase", "binance", "discord", "zoom", "stripe"
]

class EmailAuthenticator:
    """
    Email Header and Sender Spoofing Authenticator: Parses email content or header blobs,
    verifies SPF/DKIM/DMARC results from headers, evaluates sender reputation,
    and flags impersonation/typosquatting of critical brands.
    """
    def __init__(self):
        pass

    def check_brand_impersonation(self, from_email: str, from_name: str) -> dict:
        """
        Detects if the email sender is impersonating a protected brand via name-spoofing
        or typosquatted sender domains.
        """
        alerts = []
        is_spoofed = False
        
        # Parse actual domain
        email_parts = from_email.lower().split("@")
        domain = email_parts[-1] if len(email_parts) > 1 else ""
        
        # 1. Name Spoofing: Brand in Display Name, but domain is generic (e.g., gmail, yahoo, outlook, or unknown)
        from_name_lower = from_name.lower()
        is_generic_domain = any(gen in domain for gen in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton", "icloud.com"])
        
        for brand in PROTECTED_BRANDS:
            # Check if brand name is in the display name
            if brand in from_name_lower:
                # If domain does not match the official brand domain
                if brand not in domain:
                    alerts.append(f"Display Name Spoofing: Sender display name contains brand '{brand.upper()}', but envelope domain is generic/unaffiliated ('{domain}')")
                    is_spoofed = True

        # 2. Typosquatting / Domain Lookalikes: Brand name misspelled in the domain
        # e.g., 'paypa1.com', 'amaz0n-security.xyz'
        if domain:
            for brand in PROTECTED_BRANDS:
                # If brand is NOT exactly in the domain, check for common mutations
                # Or check if brand is combined with suspicious words (e.g., brand-security-update.com)
                if brand != domain.split(".")[0]:
                    # Typo variations
                    for char_replace in [("o", "0"), ("l", "1"), ("i", "1"), ("m", "rn"), ("vv", "w")]:
                        mutated = brand.replace(char_replace[0], char_replace[1])
                        if mutated in domain and brand not in domain:
                            alerts.append(f"Brand Typosquatting: Sender domain '{domain}' appears to be a spoofed/mutated variation of protected brand '{brand.upper()}'")
                            is_spoofed = True
                            break
                            
                    # Keyword combination (e.g., paypal-billing-support.com instead of paypal.com)
                    if brand in domain and f"{brand}.com" not in domain and f"{brand}.org" not in domain:
                        # Ensure it's not a subdomain of the official brand
                        if not domain.endswith(f".{brand}.com") and not domain.endswith(f".{brand}.net"):
                            alerts.append(f"Suspicious Brand Combination: Sender domain '{domain}' contains brand name '{brand.upper()}' combined with auxiliary/untrusted tokens.")
                            is_spoofed = True

        return {
            "is_impersonation_detected": is_spoofed,
            "alerts": alerts
        }

    def parse_authentication_results(self, headers_dict: dict) -> dict:
        """
        Extracts SPF, DKIM, and DMARC verification results from standard email headers.
        """
        results = {
            "spf": "NONE",
            "dkim": "NONE",
            "dmarc": "NONE",
            "details": []
        }
        
        # 1. Received-SPF header
        spf_header = headers_dict.get("Received-SPF", "") or headers_dict.get("received-spf", "")
        if spf_header:
            spf_header = spf_header.lower()
            if "pass" in spf_header:
                results["spf"] = "PASS"
            elif "fail" in spf_header:
                results["spf"] = "FAIL"
            elif "softfail" in spf_header:
                results["spf"] = "SOFTFAIL"
            elif "neutral" in spf_header:
                results["spf"] = "NEUTRAL"
            results["details"].append(f"SPF Header Record: {spf_header.split(';')[0].strip()}")

        # 2. Authentication-Results header (contains unified SPF/DKIM/DMARC status)
        auth_header = headers_dict.get("Authentication-Results", "") or headers_dict.get("authentication-results", "")
        if auth_header:
            auth_header = auth_header.lower()
            
            # Extract spf status
            spf_match = re.search(r"spf=(\w+)", auth_header)
            if spf_match:
                results["spf"] = spf_match.group(1).upper()
                
            # Extract dkim status
            dkim_match = re.search(r"dkim=(\w+)", auth_header)
            if dkim_match:
                results["dkim"] = dkim_match.group(1).upper()
                
            # Extract dmarc status
            dmarc_match = re.search(r"dmarc=(\w+)", auth_header)
            if dmarc_match:
                results["dmarc"] = dmarc_match.group(1).upper()
                
            results["details"].append(f"Authentication-Results Analysis: SPF={results['spf']}, DKIM={results['dkim']}, DMARC={results['dmarc']}")

        return results

    def analyze_email_message(self, raw_email_string: str) -> dict:
        """
        Performs a full architectural, header-level, and cryptographic-alignment audit on raw email content.
        """
        # Limit processing length for safety to avoid DoS on huge logs
        if len(raw_email_string) > 1024 * 1024:
            logger.warning("Rejected large raw email content to prevent system resource exhaustion.")
            return {"error": "Email exceeds size constraints"}

        try:
            msg = message_from_string(raw_email_string)
        except Exception as e:
            logger.error(f"Failed to parse email message string: {e}")
            return {"error": f"Invalid email structure: {str(e)}"}

        # Extract envelope parameters
        from_header = msg.get("From", "")
        to_header = msg.get("To", "")
        subject_header = msg.get("Subject", "[No Subject]")
        reply_to_header = msg.get("Reply-To", "")
        return_path = msg.get("Return-Path", "")

        # Parse real sender email and name
        from_name, from_email = parseaddr(from_header)
        reply_name, reply_email = parseaddr(reply_to_header)

        # Build dictionary of all headers for helper methods
        headers_dict = {key: val for key, val in msg.items()}

        # 1. Audit Authentication Records (SPF, DKIM, DMARC)
        auth_stats = self.parse_authentication_results(headers_dict)

        # 2. Audit Brand Impersonations
        brand_audit = self.check_brand_impersonation(from_email, from_name)

        # 3. Header Alignment Audits
        alignment_alerts = []
        risk_score = 0.0

        # Check Return-Path (Envelope Sender) alignment with From domain
        if return_path and from_email:
            from_domain = from_email.split("@")[-1].lower()
            return_addr = parseaddr(return_path)[1]
            return_domain = return_addr.split("@")[-1].lower() if return_addr else ""
            
            if return_domain and from_domain != return_domain:
                # Minor mismatch is okay in mailing lists, but is a risk indicator
                alignment_alerts.append(f"Mismatched Return-Path: Envelope return address domain '{return_domain}' does not match From sender domain '{from_domain}'")
                risk_score += 15.0

        # Check Reply-To alignment with From email
        if reply_email and from_email:
            from_domain = from_email.split("@")[-1].lower()
            reply_domain = reply_email.split("@")[-1].lower()
            if from_domain != reply_domain:
                alignment_alerts.append(f"Mismatched Reply-To Domain: Replies are routed to domain '{reply_domain}', which differs from sender domain '{from_domain}'")
                risk_score += 25.0

        # Evaluate Authentication Security Failures
        if auth_stats["spf"] == "FAIL":
            alignment_alerts.append("SPF Failure: Sender host is explicitly unauthorized to send on behalf of the domain.")
            risk_score += 35.0
        elif auth_stats["spf"] == "SOFTFAIL":
            alignment_alerts.append("SPF Softfail: Sender host identity could not be fully verified.")
            risk_score += 15.0

        if auth_stats["dkim"] == "FAIL":
            alignment_alerts.append("DKIM Failure: Cryptographic message signature is broken or modified.")
            risk_score += 35.0

        if auth_stats["dmarc"] == "FAIL":
            alignment_alerts.append("DMARC Failure: Domain protection policy failed alignment checks.")
            risk_score += 40.0

        if brand_audit["is_impersonation_detected"]:
            risk_score += 55.0

        # Cap the security hazard score between 0 and 100
        risk_score = min(100.0, max(0.0, risk_score))
        
        # Categorize overall threat ranking
        threat_level = "Low"
        if risk_score >= 70.0:
            threat_level = "High"
        elif risk_score >= 30.0:
            threat_level = "Medium"

        return {
            "envelope": {
                "from_name": from_name,
                "from_email": from_email,
                "to": to_header,
                "subject": subject_header,
                "reply_to": reply_email,
                "return_path": return_path
            },
            "authentication": {
                "spf_status": auth_stats["spf"],
                "dkim_status": auth_stats["dkim"],
                "dmarc_status": auth_stats["dmarc"],
                "records": auth_stats["details"]
            },
            "brand_impersonation": brand_audit,
            "security_alerts": brand_audit["alerts"] + alignment_alerts,
            "risk_score": risk_score,
            "threat_level": threat_level
        }

if __name__ == "__main__":
    authenticator = EmailAuthenticator()

    # Simulate a spoofed PayPal email header log
    spoofed_email_raw = """From: "PayPal Security" <support@paypa1-security-verification.cf>
To: bouglalayassin700@gmail.com
Subject: Action Required: Your account has been suspended
Reply-To: support-refunds@gmail.com
Return-Path: <bounce-agent@untrusted-mailserver.com>
Received-SPF: fail (google.com: domain of support@paypa1-security-verification.cf does not designate 192.0.2.1 as permitted sender)
Authentication-Results: mx.google.com; spf=fail; dkim=fail; dmarc=fail

Dear Customer, please verify your bank credentials immediately.
"""

    # Simulate a verified official Google security alert
    safe_email_raw = """From: "Google Account Security" <no-reply@accounts.google.com>
To: bouglalayassin700@gmail.com
Subject: New sign-in alert on SentryAI
Return-Path: <no-reply@accounts.google.com>
Received-SPF: pass (google.com: domain of no-reply@accounts.google.com designates 209.85.220.41 as permitted sender)
Authentication-Results: mx.google.com; spf=pass; dkim=pass; dmarc=pass

Someone logged in. If this was you, ignore this.
"""

    print("\n=== SentryAI Email Authenticator Heuristic Engine ===")
    
    # Audit 1 (Spoofed)
    print("\nAnalyzing Suspicious Email...")
    report_1 = authenticator.analyze_email_message(spoofed_email_raw)
    print(json.dumps(report_1, indent=2))

    # Audit 2 (Safe)
    print("\nAnalyzing Verified Email...")
    report_2 = authenticator.analyze_email_message(safe_email_raw)
    print(json.dumps(report_2, indent=2))
