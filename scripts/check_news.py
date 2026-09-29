import os
import re
from datetime import datetime, timedelta, timezone
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "KolkataStartupMap/1.0 (+public ecosystem directory)"})

SOURCES = [
    # Kolkata / West Bengal ecosystem institutions
    ("IIM Calcutta Innovation Park", "https://iimcip.org/topic/", "Ecosystem"),
    ("IIM Calcutta Innovation Park", "https://iimcip.org/announce/", "Programme"),
    ("IIM Calcutta Innovation Park", "https://iimcip.org/news-event/events/?y=2022", "Event"),
    ("Startup Bengal", "https://startupbengal.in/", "Policy"),
        ("Kolkata Calling", "https://www.kolkatacalling.com/news/startups-entrepreneurship", "Local"),
    # Business / startup media
    ("Economic Times", "https://economictimes.indiatimes.com/topic/kolkata-startups/news", "Funding"),
    ("Telegraph India", "https://www.telegraphindia.com/topic/startups", "Local"),
    ("Business Standard", "https://www.business-standard.com/topic/kolkata-startups", "Business"),
    ("Financial Express", "https://www.financialexpress.com/about/kolkata-startups/", "Business"),
    ("Inc42", "https://inc42.com/buzz/", "Funding"),
    ("YourStory", "https://yourstory.com/tag/kolkata", "Startup"),
    ("Entrackr", "https://entrackr.com/tag/kolkata/", "Funding"),
    ("BW Businessworld", "https://www.businessworld.in/topic/Startups", "Startup"),
    ("Indian Express Kolkata", "https://indianexpress.com/section/cities/kolkata/", "Local"),
    ("Indian Express Business", "https://indianexpress.com/section/business/", "Business"),
    ("The Hindu Kolkata", "https://www.thehindu.com/news/cities/kolkata/", "Local"),
    ("The Hindu Business", "https://www.thehindu.com/business/", "Business"),
    ("Moneycontrol Startup", "https://www.moneycontrol.com/news/business/startup/", "Funding"),
    ("ET Startup", "https://economictimes.indiatimes.com/tech/startups", "Funding"),
    ("TechCircle", "https://www.techcircle.in/", "Startup"),
    ("Inc42 Kolkata", "https://inc42.com/tag/kolkata/", "Startup"),
    ("Headstart Kolkata", "https://www.meetup.com/headstart-kolkata/events/calendar/", "Event"),
    ("Built In Kolkata", "https://builtinkolkata.in/articles", "Tech"),
    ("PIB Kolkata", "https://www.pib.gov.in/PressReleasePage.aspx?reg=3&lang=2", "Government"),
    ("Startup India", "https://www.startupindia.gov.in/content/sih/en/search.html?query=Kolkata", "Government"),
    ("RISE Conclave", "https://riseconclave.immt.res.in/", "Event"),
]

KOLKATA_TERMS = (
    "kolkata", "calcutta", "west bengal", "bengal", "joka", "salt lake",
    "jadavpur", "howrah", "barasat", "durgapur", "siliguri"
)
MAX_AGE_DAYS = 180
MAX_ITEMS_PER_SOURCE = 40


def parse_date(text):
    match = re.search(
        r"(?P<day>\d{1,2})\s+(?P<month>[A-Za-z]+)[,\s]+(?P<year>20\d{2})",
        text,
    )
    if not match:
        return None
    for fmt in ("%d %B %Y", "%d %b %Y"):
        try:
            return datetime.strptime(
                f"{match.group('day')} {match.group('month')} {match.group('year')}",
                fmt,
            ).replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return None


def fetch_candidates(source_name, page_url, category):
    response = SESSION.get(page_url, timeout=25)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    candidates = []

    for link in soup.find_all("a", href=True):
        title = " ".join(link.stripped_strings)
        if len(title) < 20:
            continue
        href = urljoin(page_url, link["href"])
        if not href.startswith(("http://", "https://")):
            continue
        parent = link
        context = title
        for _ in range(4):
            parent = parent.parent
            if not parent:
                break
            context = " ".join(parent.stripped_strings)
            if len(context) > len(title) + 30:
                break

        published = parse_date(context)
        if not published:
            continue

        lower = context.lower()
        if not any(term in lower for term in KOLKATA_TERMS):
            continue

        summary = re.sub(r"\s+", " ", context).strip()
        if len(summary) > 320:
            summary = summary[:317].rsplit(" ", 1)[0] + "..."

        candidates.append({
            "title": title[:300],
            "category": category,
            "summary": summary,
            "source_name": source_name,
            "source_url": href,
            "published_at": published.isoformat(),
            "verified": True,
            "status": "published",
        })

    unique = {}
    for item in candidates[:MAX_ITEMS_PER_SOURCE]:
        unique[item["source_url"]] = item
    return list(unique.values())


def existing_urls():
    url = f"{SUPABASE_URL}/rest/v1/news_items"
    params = {"select": "source_url", "limit": "1000"}
    r = SESSION.get(url, headers=HEADERS, params=params, timeout=25)
    r.raise_for_status()
    return {row["source_url"] for row in r.json() if row.get("source_url")}


def insert(item):
    r = SESSION.post(
        f"{SUPABASE_URL}/rest/v1/news_items",
        headers={**HEADERS, "Prefer": "return=minimal"},
        json=item,
        timeout=25,
    )
    r.raise_for_status()


def archive_old():
    cutoff = (datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)).isoformat()
    r = SESSION.patch(
        f"{SUPABASE_URL}/rest/v1/news_items",
        headers={**HEADERS, "Prefer": "return=minimal"},
        params={"published_at": f"lt.{cutoff}", "status": "eq.published"},
        json={"status": "archived", "updated_at": datetime.now(timezone.utc).isoformat()},
        timeout=25,
    )
    r.raise_for_status()


def main():
    known = existing_urls()
    added = 0

    for source_name, page_url, category in SOURCES:
        try:
            items = fetch_candidates(source_name, page_url, category)
        except Exception as exc:
            print(f"[WARN] {source_name} {page_url}: {exc}")
            continue

        for item in items:
            if item["source_url"] in known:
                continue
            insert(item)
            known.add(item["source_url"])
            added += 1
            print(f"[ADD] {item['title']}")

    archive_old()
    print(f"News maintenance complete: added={added}, archived older than {MAX_AGE_DAYS} days.")


if __name__ == "__main__":
    main()
