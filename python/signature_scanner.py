import re
import json
import logging
from urllib.parse import urlparse

# Configure logging for security trace auditing
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SignatureScanner")

class SignatureScanner:
    """
    Phishing & Smishing Heuristics Signature Scanner: Uses compiled regex matrices,
    lexical threat markers, and weight indexes to audit message bodies (SMS or Emails)
    for cyber-fraud patterns.
    """
    def __init__(self):
        # High-risk panic, urgency, or authority impersonation keywords
        self.scam_keywords = {
            "urgency": ["urgent", "action required", "immediate", "suspending", "suspended", "blocked", "restricted", "expired", "terminate", "last warning"],
            "financial": ["bank", "paypal", "crypto", "bitcoin", "refund", "invoice", "payment", "billing", "transfer", "claim", "prize", "lottery", "cash", "bonus"],
            "authentication": ["verify", "login", "signin", "reset", "password", "credential", "unusual activity", "unauthorized", "security alert"],
            "smishing_specific": ["shipping", "package", "delivery", "dhl", "fedex", "usps", "customs", "post office", "tracking"]
        }

        # Multi-stage security regular expressions
        self.signatures = {
            # Detect masked phone numbers or spoofed short codes
            "phone_number": re.compile(r"(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"),
            # Detect suspicious cryptocoin wallets (BTC, ETH address lookalikes)
            "btc_wallet": re.compile(r"\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b"),
            "eth_wallet": re.compile(r"\b0x[a-fA-F0-9]{40}\b"),
            # Detect suspicious link shortener domains or raw IP URLs
            "shortlinks": re.compile(r"\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|rebrand\.ly|is\.gd|buff\.ly|ow\.ly|lnkd\.in)\b", re.IGNORECASE),
            "ip_in_url": re.compile(r"\bhttps?://(?:\d{1,3}\.){3}\d{1,3}\b")
        }

    def analyze_message_content(self, text: str) -> dict:
        """
        Scans SMS or Email text content against known cyberattack signatures and 
        returns a detailed telemetry threat scorecard.
        """
        if not text:
            return {
                "risk_score": 0.0,
                "threat_level": "Low",
                "triggered_rules": [],
                "keyword_hits": {}
            }

        # Prevent DoS attacks on extremely large strings
        if len(text) > 100000:
            logger.warning("Rejected input: Message length exceeds safety processing limit.")
            return {"error": "Input text length exceeds safe limits (100KB max)"}

        triggered_rules = []
        keyword_hits = {}
        risk_score = 0.0

        # 1. Evaluate Lexical Keyword Markers
        text_lower = text.lower()
        for category, list_of_words in self.scam_keywords.items():
            category_hits = []
            for word in list_of_words:
                # Use word-boundary checks to prevent false-positives
                pattern = re.compile(r'\b' + re.escape(word) + r'\b')
                if pattern.search(text_lower):
                    category_hits.append(word)
                    
            if category_hits:
                keyword_hits[category] = category_hits
                # Weighted additions to overall risk
                if category == "urgency":
                    risk_score += len(category_hits) * 12.0
                    triggered_rules.append(f"Urgency Patterns Detected: {category_hits}")
                elif category == "financial":
                    risk_score += len(category_hits) * 15.0
                    triggered_rules.append(f"Financial Scams/Targets Detected: {category_hits}")
                elif category == "authentication":
                    risk_score += len(category_hits) * 18.0
                    triggered_rules.append(f"Account Harvesting Key Phrases: {category_hits}")
                elif category == "smishing_specific":
                    risk_score += len(category_hits) * 10.0
                    triggered_rules.append(f"Delivery & Tracking Bait Indicators: {category_hits}")

        # 2. Check Cryptographic/Address Signatures
        # Bitcoin Wallet Signature
        if self.signatures["btc_wallet"].search(text):
            triggered_rules.append("Crypto Ransom Signature: Contains valid Bitcoin address format.")
            risk_score += 45.0

        # Ethereum Wallet Signature
        if self.signatures["eth_wallet"].search(text):
            triggered_rules.append("Crypto Fraud Signature: Contains valid Ethereum address format.")
            risk_score += 40.0

        # 3. Check Connection/Domain Signatures
        # URL detection (generic)
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
        if urls:
            triggered_rules.append(f"Active Web Links Detected: Found {len(urls)} target link(s).")
            risk_score += 10.0
            
            # Check for suspicious url shorteners
            for url in urls:
                if self.signatures["shortlinks"].search(url):
                    triggered_rules.append(f"Obfuscation Alert: Shortened Link detected to mask redirection destination: '{url}'")
                    risk_score += 25.0
                if self.signatures["ip_in_url"].search(url):
                    triggered_rules.append(f"Extreme Security Hazard: Link uses raw IP address instead of domain hostname: '{url}'")
                    risk_score += 35.0

        # 4. Check Call-to-Action phone number signatures in smishing scams
        if "sms" in text_lower or len(text) < 300: # SMS messages are short
            phone_matches = self.signatures["phone_number"].findall(text)
            if phone_matches and urls: # Combined URL + Callback number in a short message is highly indicative of SMS phish
                triggered_rules.append("Smishing Dual-Vector Pattern: Found callback number alongside web links.")
                risk_score += 20.0

        # Normalize score
        risk_score = min(100.0, max(0.0, risk_score))
        
        # Threat rating categories
        threat_level = "Low"
        if risk_score >= 75.0:
            threat_level = "High"
        elif risk_score >= 35.0:
            threat_level = "Medium"

        report = {
            "text_preview": text[:120] + ("..." if len(text) > 120 else ""),
            "risk_score": round(risk_score, 2),
            "threat_level": threat_level,
            "triggered_rules": triggered_rules,
            "keyword_hits": keyword_hits,
            "metadata": {
                "character_length": len(text),
                "url_count": len(urls)
            }
        }
        
        logger.info(f"Scanned text (Risk: {risk_score} - level: {threat_level})")
        return report

if __name__ == "__main__":
    scanner = SignatureScanner()

    # Simulate Smishing Scam
    smishing_raw = "DHL Delivery Alert: Your package is held at our customs office. Action Required: Please verify your billing details at http://192.168.1.5/dhl-package-verification or call +1 (555) 019-2831 within 24 hours to claim your delivery."
    
    # Simulate Ransomware Email
    ransom_email = "Your computer files have been encrypted using military grade AES keys. To restore your database, transfer exactly 0.5 BTC to our wallet address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. Failure to submit immediate payment will result in data deletion."

    # Simulate Safe Email
    safe_email = "Hi team, we have completed the Recharts dashboard deployment for the cyber security log viewer. Let's schedule a meeting tomorrow to review the telemetry stats."

    print("\n=== SentryAI Heuristics Signature & Regex Scanner ===")
    
    print("\nAnalyzing Smishing SMS...")
    print(json.dumps(scanner.analyze_message_content(smishing_raw), indent=2))

    print("\nAnalyzing Cryptocoin Ransom Threat...")
    print(json.dumps(scanner.analyze_message_content(ransom_email), indent=2))

    print("\nAnalyzing Safe Team Memo...")
    print(json.dumps(scanner.analyze_message_content(safe_email), indent=2))
