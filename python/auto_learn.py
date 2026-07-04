import os
import json
import logging
import re
from urllib.parse import urlparse
from collections import Counter

# Set up logging configuration to monitor execution
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("PatternLearner")

PROTECTED_BRANDS = [
    "amazon", "paypal", "google", "facebook", "microsoft", "apple", "dhl", "fedex", 
    "netflix", "chase", "ebay", "instagram", "linkedin", "dropbox", "adobe", "whatsapp",
    "twitter", "yahoo", "outlook", "steam", "coinbase", "binance", "discord", "zoom", "stripe"
]

class PatternLearner:
    """
    Self-learning, heuristic engine that analyzes threat repositories to extract
    topological traits of phishing attacks, such as compromised TLDs, keyword weights,
    and brand impersonation structures.
    """
    def __init__(self, data_path: str = "data/threats.json"):
        self.data_path = data_path
        self.threats = []
        self.hostnames = []
        self.load_threats()

    def load_threats(self) -> None:
        """
        Loads collected threat instances from local json database.
        """
        if not os.path.exists(self.data_path):
            logger.warning(f"Indicators source '{self.data_path}' not found. Cannot perform intelligence task.")
            # Default fallback threats to allow intelligence simulation when empty
            self.threats = [
                {"url": "http://amaz0n-security-update-verification.tk/login"},
                {"url": "https://paypal-verify-credential-activity.ml/signin"},
                {"url": "http://g00gle-account-billing-support.ga/alert"},
                {"url": "https://facebo0k-login-unusual-attempt.cf/index.php"},
                {"url": "http://micr0soft-update-system-win10.top/patch"},
                {"url": "http://wellsfargo-verify-account-active.xyz/online"},
                {"url": "https://netflixx-security-billing-credential.live/verify"},
                {"url": "http://dhl-express-tracking-delivery-confirm.date/package"},
                {"url": "http://fed3x-shipment-alert-notification.click/tracking"},
                {"url": "https://secured-chaseonline-banking-alerts.download/login"}
            ]
        else:
            try:
                with open(self.data_path, "r", encoding="utf-8") as file:
                    self.threats = json.load(file)
                logger.info(f"Loaded {len(self.threats)} raw phishing threat data samples.")
            except Exception as e:
                logger.error(f"Failed to parsing threat resource JSON: {e}")
                self.threats = []

        # Extract hot domains/hostnames
        for item in self.threats:
            url = item.get("url", "")
            if url:
                try:
                    parsed = urlparse(url)
                    hostname = parsed.hostname or parsed.path.split("/")[0]
                    if hostname:
                        self.hostnames.append(hostname.lower())
                except Exception:
                    pass

    def extract_dangerous_tlds(self) -> dict:
        """
        Extracts and counts TLD occurrences in the malicious URL dataset
        to capture the highest risk TLD distribution.
        """
        logger.info("Decompiling hostile Top-Level Domains (TLD) distributions...")
        tlds = []
        for hostname in self.hostnames:
            parts = hostname.split(".")
            if len(parts) > 1:
                # Append last suffix
                tlds.append("." + parts[-1])
        
        counter = Counter(tlds)
        reported_tlds = dict(counter.most_common(15))
        logger.info(f"Top high-hazard TLDs extracted: {reported_tlds}")
        return reported_tlds

    def extract_suspicious_patterns(self) -> dict:
        """
        Tokenizes paths, query parameters, and subdomains to extract high-risk
        recurring words and semantic patterns.
        """
        logger.info("Scanning URL paths and parameters for recurring phish signals...")
        words = []
        # Pattern matching strictly non-alphabetic separators to capture tokens
        token_regex = re.compile(r"[^a-zA-Z]")
        
        for item in self.threats:
            url = item.get("url", "").lower()
            if not url:
                continue
            
            # Clean protocol and domain to only tokenize path/parameters
            try:
                parsed = urlparse(url)
                body = (parsed.path + " " + parsed.query).lower()
            except Exception:
                body = url.lower()

            tokens = token_regex.split(body)
            for token in tokens:
                if len(token) > 3:  # Only count meaningful indicator terms (e.g., login, verify)
                    words.append(token)

        counter = Counter(words)
        # Select common phishing markers
        common_phish_markers = [
            "verify", "login", "secure", "update", "signin", "account", "banking",
            "billing", "confirm", "security", "admin", "alert", "service", "credential"
        ]
        
        matched_patterns = {}
        for marker in common_phish_markers:
            matched_patterns[marker] = counter.get(marker, 0)

        # Sort patterns by frequency high-to-low
        matched_patterns = dict(sorted(matched_patterns.items(), key=lambda x: x[1], reverse=True))
        logger.info(f"Phishing keyword weights calculated: {matched_patterns}")
        return matched_patterns

    def extract_typo_brands(self) -> dict:
        """
        Cross-checks brand names with suspicious mutation occurrences in domains.
        """
        logger.info("Analyzing datasets for brand typosquatting variations...")
        impersonated_brand_stats = {brand: 0 for brand in PROTECTED_BRANDS}
        
        for hostname in self.hostnames:
            for brand in PROTECTED_BRANDS:
                # Check for typo-squatting or brand inclusions
                # e.g., if domain includes 'paypal-login-secure' or 'paypa1'
                if brand in hostname:
                    impersonated_brand_stats[brand] += 1
                else:
                    # Detect letter mutation/repeats/substitutions logic
                    # Calculate if it matches simulated typo variations easily
                    # e.g., character insertions, zero replacements
                    for char_replace in [("o", "0"), ("l", "1"), ("i", "1"), ("m", "rn"), ("vv", "w")]:
                        mutated = brand.replace(char_replace[0], char_replace[1])
                        if mutated in hostname:
                            impersonated_brand_stats[brand] += 1
                            break

        # Filter out brands with zero triggers for cleaner intelligence output
        active_impersonations = {k: v for k, v in impersonated_brand_stats.items() if v > 0}
        active_impersonations = dict(sorted(active_impersonations.items(), key=lambda x: x[1], reverse=True))
        
        logger.info(f"Target brand distribution index: {active_impersonations}")
        return active_impersonations

    def generate_report(self, output_path: str = "data/patterns_report.json") -> bool:
        """
        Compiles the learned patterns into an intelligence report and persists it to file.
        """
        logger.info("Formatting self-learning threat pattern report...")
        report = {
            "metadata": {
                "total_urls_processed": len(self.threats),
                "uniqueness_factor": len(self.hostnames) / max(1, len(self.threats))
            },
            "topological_statistics": {
                "hazardous_tlds": self.extract_dangerous_tlds(),
                "keyword_attack_weights": self.extract_suspicious_patterns(),
                "targeted_brands_index": self.extract_typo_brands()
            }
        }

        try:
            # Create write dirs automatically
            dir_name = os.path.dirname(output_path)
            if dir_name and not os.path.exists(dir_name):
                os.makedirs(dir_name, exist_ok=True)
                logger.info(f"Created intelligence report container: {dir_name}")

            with open(output_path, "w", encoding="utf-8") as out_file:
                json.dump(report, out_file, indent=2, ensure_ascii=False)
            
            logger.info(f"Intelligence report successfully compiled: {output_path}")
            return True
        except Exception as e:
            logger.critical(f"Failed to generate intelligence model report: {e}")
            return False


if __name__ == "__main__":
    learner = PatternLearner()
    learner.generate_report()
