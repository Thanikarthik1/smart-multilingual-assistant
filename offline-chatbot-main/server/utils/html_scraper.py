# server/utils/html_scraper.py
import requests
from bs4 import BeautifulSoup

def extract_text_from_url(url, timeout=10):
    try:
        response = requests.get(url, timeout=timeout)
        soup = BeautifulSoup(response.text, "html.parser")

        # Kill scripts/styles
        for script in soup(["script", "style", "noscript"]):
            script.decompose()

        text = soup.get_text(separator="\n")
        lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 40]
        return "\n".join(lines[:50])  # return first 50 long lines
    except Exception as e:
        return f"[Failed to extract content from {url}]: {e}"
