import os
import requests
from server.utils.html_scraper import extract_text_from_url

# Load API keys from environment variables
SERPAPI_KEY = "9ab5617efed8eccbb95f4a8aa659d6e6574db7e798e7f0e0bc9b378ba83d54f3"
CSE_API_KEY = "AIzaSyD2xMx7BlRu4hqSHU58uN77khkZ8ebr-VU"
CSE_ID = os.getenv("CSE_ID")


def fetch_serpapi_results(query, max_results=5):
    """Fetch search results from SerpAPI."""
    if not SERPAPI_KEY:
        return "[SerpAPI key not set]", []
    try:
        print(f"[DEBUG] Query to SerpAPI: {query}")
        response = requests.get(
            "https://serpapi.com/search",
            params={
                "q": query,
                "api_key": SERPAPI_KEY,
                "num": max_results,
                "engine": "google"
            },
            timeout=10
        )
        data = response.json()
        results = data.get("organic_results", [])
        if not results:
            return "[No SerpAPI results found]", []

        formatted = []
        urls = []
        for r in results:
            title = r.get("title", "")
            snippet = r.get("snippet", "")
            link = r.get("link", "")
            if link:
                urls.append(link)
            formatted.append(f"[SerpAPI] {title}\n{snippet}\n{link}")

        return "\n\n".join(formatted), urls
    except Exception as e:
        return f"[SerpAPI error: {e}]", []


def fetch_cse_results(query, max_results=5):
    """Fetch search results from Google Custom Search Engine."""
    if not CSE_API_KEY or not CSE_ID:
        return "[CSE key or ID not set]", []
    try:
        print(f"[DEBUG] Query to CSE: {query}")
        response = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={
                "q": query,
                "key": CSE_API_KEY,
                "cx": CSE_ID,
                "num": max_results
            },
            timeout=10
        )
        data = response.json()
        results = data.get("items", [])
        if not results:
            return "[No CSE results found]", []

        formatted = []
        urls = []
        for item in results:
            title = item.get("title", "")
            snippet = item.get("snippet", "")
            link = item.get("link", "")
            if link:
                urls.append(link)
            formatted.append(f"[CSE] {title}\n{snippet}\n{link}")

        return "\n\n".join(formatted), urls
    except Exception as e:
        return f"[CSE error: {e}]", []


def fetch_web_results(query, max_results=5) -> str:
    """
    Fetch combined web search results using SerpAPI & CSE,
    scrape top pages, and return structured text.
    """
    print(f"\n🔍 Final Search Query: {query}\n")

    # Step 1: Fetch results
    serpapi_text, serpapi_links = fetch_serpapi_results(query, max_results)
    cse_text, cse_links = fetch_cse_results(query, max_results)

    # Step 2: Merge links (remove duplicates while preserving order)
    combined_links = list(dict.fromkeys(serpapi_links + cse_links))

    if not combined_links:
        print("⚠ No search results found from SerpAPI or CSE.")
        return f"""### ✅ PRIORITIZED WEB RESULTS ###

### 🔍 SEARCH QUERY ###
{query}

### 📄 SERPAPI RESULTS ###
{serpapi_text}

### 📄 CSE RESULTS ###
{cse_text}

### 📑 SCRAPED CONTENT ###
[No pages scraped - No search results found]

### ✅ END OF WEB RESULTS ###
"""

    print("\n🔗 Top Result Links:")
    for i, link in enumerate(combined_links[:5]):
        print(f"  {i+1}. {link}")

    # Step 3: Scrape top pages
    extracted = []
    for i, url in enumerate(combined_links[:2]):  # scrape only top 2 links
        print(f"\n🌐 Scraping Page {i+1}: {url}")
        try:
            content = extract_text_from_url(url)
            if not content.strip():
                content = "[Empty or failed to extract meaningful content]"
            extracted.append(f"[Page {i+1}]: {url}\n{content}")
            print(f"✅ Successfully scraped Page {i+1}")
        except Exception as e:
            print(f"❌ Failed to scrape Page {i+1}: {e}")
            extracted.append(f"[Page {i+1}]: {url}\n[ERROR: {e}]")

    extracted_text = '\n\n'.join(extracted)

    # Step 4: Combine final result
    combined_output = f"""### ✅ PRIORITIZED WEB RESULTS ###

### 🔍 SEARCH QUERY ###
{query}

### 📄 SERPAPI RESULTS ###
{serpapi_text}

### 📄 CSE RESULTS ###
{cse_text}

### 📑 SCRAPED CONTENT (Top {min(2, len(combined_links))} pages) ###
{extracted_text}

### ✅ END OF WEB RESULTS ###
"""

    return combined_output
