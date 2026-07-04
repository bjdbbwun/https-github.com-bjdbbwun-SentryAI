import math
import logging
import json
import os
from urllib.parse import urlparse

# Configure logging for security auditing and diagnostic tracking
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("EntropyAnalyzer")

class EntropyAnalyzer:
    """
    Advanced security analyzer to detect DGA (Domain Generation Algorithm)
    and randomized malicious hostnames using Shannon Entropy calculations.
    """
    def __init__(self, high_entropy_threshold: float = 3.8):
        # 3.8 is a standard academic threshold for detecting randomized english/latin-character domains
        self.high_entropy_threshold = high_entropy_threshold

    @staticmethod
    def calculate_shannon_entropy(string: str) -> float:
        """
        Calculates the Shannon Entropy of a string.
        Higher values indicate higher randomness/disorder (typical of DGA domains).
        """
        if not string:
            return 0.0

        # Calculate character frequencies
        total_len = len(string)
        char_counts = {}
        for char in string:
            char_counts[char] = char_counts.get(char, 0) + 1

        # Calculate Shannon Entropy: -sum(P(x) * log2(P(x)))
        entropy = 0.0
        for count in char_counts.values():
            probability = count / total_len
            entropy -= probability * math.log2(probability)

        return round(entropy, 4)

    def extract_subdomain_and_sld(self, hostname: str) -> tuple:
        """
        Secures and splits hostname into subdomain, SLD (Second-Level Domain), and TLD.
        """
        if not hostname:
            return "", "", ""
        
        # Strip common port declarations
        if ":" in hostname:
            hostname = hostname.split(":")[0]

        parts = hostname.split(".")
        if len(parts) < 2:
            return "", hostname, ""
        
        # Simplistic secure extraction
        tld = parts[-1]
        sld = parts[-2]
        subdomain = ".".join(parts[:-2]) if len(parts) > 2 else ""
        
        return subdomain, sld, tld

    def analyze_domain(self, domain_or_url: str) -> dict:
        """
        Performs a full entropy analysis on a given URL or hostname.
        Enforces input constraints to prevent DoS attacks (string length bounds).
        """
        # Cybersecurity sanity constraint: Prevent massive strings causing high CPU computation
        if len(domain_or_url) > 2048:
            logger.warning("Rejected input: URL/Domain length exceeds security limit of 2048 characters.")
            return {
                "error": "Input length exceeds security constraints",
                "risk_score": 0.0,
                "is_dga": False
            }

        # Safe URL parsing
        try:
            if "://" not in domain_or_url:
                # Add pseudo protocol to parse correctly
                parsed = urlparse(f"http://{domain_or_url}")
            else:
                parsed = urlparse(domain_or_url)
            
            hostname = parsed.hostname or parsed.path.split("/")[0]
            hostname = hostname.lower().strip()
        except Exception as e:
            logger.error(f"Failed to safely parse input string: {e}")
            return {
                "error": "Invalid URL or domain format",
                "risk_score": 0.0,
                "is_dga": False
            }

        if not hostname:
            return {
                "error": "Empty or unresolvable hostname",
                "risk_score": 0.0,
                "is_dga": False
            }

        subdomain, sld, tld = self.extract_subdomain_and_sld(hostname)
        
        # Calculate individual entropy scores
        sld_entropy = self.calculate_shannon_entropy(sld)
        hostname_entropy = self.calculate_shannon_entropy(hostname)
        
        # Determine DGA Likelihood
        # DGA usually targets the Second-Level Domain (SLD) or subdomains
        is_dga = sld_entropy >= self.high_entropy_threshold
        
        # Calculate normalized risk score based on entropy values
        # Max theoretical entropy for English lowercase + digits domain of standard size is ~4.7
        risk_score = min(100.0, max(0.0, (sld_entropy / 4.5) * 100))

        result = {
            "input": domain_or_url,
            "hostname": hostname,
            "sld": sld,
            "sld_entropy": sld_entropy,
            "hostname_entropy": hostname_entropy,
            "high_entropy_threshold": self.high_entropy_threshold,
            "is_dga_candidate": is_dga,
            "risk_score": round(risk_score, 2),
            "threat_rating": "High" if is_dga else ("Medium" if sld_entropy > 3.2 else "Low")
        }
        
        logger.info(f"Analyzed '{hostname}' - Entropy: {sld_entropy} (DGA Candidate: {is_dga})")
        return result

    def batch_analyze_threats(self, source_json: str = "data/threats.json", output_json: str = "data/entropy_report.json") -> bool:
        """
        Reads threats from the main database, performs batch entropy inspections,
        and saves the findings securely.
        """
        if not os.path.exists(source_json):
            logger.warning(f"Source database '{source_json}' not found. Cannot perform batch audit.")
            return False

        try:
            with open(source_json, "r", encoding="utf-8") as f:
                threat_list = json.load(f)
        except Exception as e:
            logger.error(f"Failed to read source threat database: {e}")
            return False

        report_data = []
        for item in threat_list:
            url = item.get("url")
            if url:
                analysis = self.analyze_domain(url)
                analysis["source_feed"] = item.get("source", "Unknown")
                report_data.append(analysis)

        try:
            os.makedirs(os.path.dirname(output_json), exist_ok=True)
            with open(output_json, "w", encoding="utf-8") as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Successfully generated batch entropy intelligence report at: {output_json}")
            return True
        except Exception as e:
            logger.critical(f"Failed to save entropy intelligence report: {e}")
            return False


if __name__ == "__main__":
    analyzer = EntropyAnalyzer()
    
    # Test individual domains
    test_domains = [
        "google.com",
        "paypal-secure-login.com",
        "cx8719asjdhgq9871as.biz",  # Classic random DGA
        "qweqweqweqwe.ru"
    ]
    
    print("\n=== SentryAI Shannon Entropy & DGA Test ===")
    for domain in test_domains:
        res = analyzer.analyze_domain(domain)
        print(f"Domain: {res['hostname']:<30} | SLD Entropy: {res['sld_entropy']:<6} | Threat Level: {res['threat_rating']}")
    
    # Try batch run on threat data if available
    analyzer.batch_analyze_threats()
