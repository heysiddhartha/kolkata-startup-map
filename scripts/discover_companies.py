import os
import re
from datetime import datetime, timezone
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "KolkataStartupMap/1.0 (+public ecosystem directory)"})

SOURCES = [
    ("StartupBlink Kolkata", "https://www.startupblink.com/top-startups/kolkata-in", "startupblink.com"),
    ("CompWorth Kolkata Startups", "https://compworth.com/top-100-startups-of-kolkata", "compworth.com"),
]
EXCLUDED = {"events", "people", "startups", "vcs", "incubators", "coworking", "communities", "cafes", "login", "sign in", "home", "view full page", "website", "visit", "load more", "download csv file"}


def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:110] or "company"


def clean_name(value):
    value = re.sub(r"\s+", " ", value or "").strip(" ·|-–—")
    if not value or value.lower() in EXCLUDED or len(value) < 2 or len(value) > 120:
        return ""
    return value


def discover_echai(html, base):
    soup = BeautifulSoup(html, "html.parser")
    found = {}
    heading = next((h for h in soup.find_all(["h2", "h3"]) if "Startups building in Kolkata" in " ".join(h.stripped_strings)), None)
    if not heading:
        return []
    for node in heading.find_all_next():
        if node is not heading and node.name in {"h2", "h3"} and "Who funds founders" in " ".join(node.stripped_strings):
            break
        if node.name != "a" or not node.get("href"):
            continue
        href = urljoin(base, node["href"])
        name = clean_name(" ".join(node.stripped_strings))
        if not name or href.startswith("https://echai.ventures"):
            continue
        try:
            host = re.sub(r"^www\.", "", href.split("/")[2].lower()) if href.startswith("http") else ""
        except IndexError:
            host = ""
        if not host or host in {"linkedin.com", "facebook.com", "instagram.com", "x.com", "twitter.com"}:
            continue
        found.setdefault(name.lower(), {"name": name, "website": href, "source_url": base})
    return list(found.values())


def discover_startupblink(html, base):
    soup = BeautifulSoup(html, "html.parser")
    found = {}
    for a in soup.find_all("a", href=True):
        href = urljoin(base, a["href"])
        if "/startup/" not in href:
            continue
        name = clean_name(" ".join(a.stripped_strings))
        if name:
            found.setdefault(name.lower(), {"name": name, "website": "", "source_url": href})
    return list(found.values())


def discover_compworth(html, base):
    soup = BeautifulSoup(html, "html.parser")
    found = {}
    for row in soup.find_all("tr"):
        cells = row.find_all(["td", "th"])
        if len(cells) < 6:
            continue
        values = [" ".join(cell.stripped_strings) for cell in cells]
        if values[0].lower() in {"ranking", "rank"} or values[1].lower() in {"company name", "company"}:
            continue
        name = clean_name(values[1] if len(values) > 1 else "")
        if not name:
            continue
        website = ""
        for a in row.find_all("a", href=True):
            href = urljoin(base, a["href"])
            if href.startswith("http") and "compworth.com" not in href:
                website = href
                break
        found.setdefault(name.lower(), {"name": name, "website": website, "source_url": base})
    return list(found.values())


def existing_slugs():
    r = SESSION.get(f"{SUPABASE_URL}/rest/v1/startups", headers=HEADERS, params={"select": "slug", "limit": "5000"}, timeout=30)
    r.raise_for_status()
    return {row.get("slug") for row in r.json() if row.get("slug")}


def insert_candidate(item, slug):
    # Discovery is intentionally non-public. A candidate must be reviewed before appearing on the map.
    payload = {
        "name": item["name"],
        "slug": slug,
        "website": item.get("website") or None,
        "area": "Kolkata",
        "sector": "Other",
        "stage": "Unknown",
        "description": "Discovered through a public Kolkata startup ecosystem directory. Verification and location details are pending review.",
        "verified": False,
        "status": "needs_review",
        "source_url": item["source_url"],
        "verification_source_url": item["source_url"],
        "location_type": "kolkata_roots",
        "last_checked_at": datetime.now(timezone.utc).isoformat(),
    }
    r = SESSION.post(
        f"{SUPABASE_URL}/rest/v1/startups",
        headers={**HEADERS, "Prefer": "return=minimal"},
        json=payload,
        timeout=30,
    )
    if r.status_code in (409, 422):
        return False
    r.raise_for_status()
    return True


def main():
    known = existing_slugs()
    added = 0
    for source_name, url, source_host in SOURCES:
        try:
            response = SESSION.get(url, timeout=30)
            response.raise_for_status()
            if source_host == "startupblink.com":
                items = discover_startupblink(response.text, url)
            elif source_host == "compworth.com":
                items = discover_compworth(response.text, url)
            else:
                items = []
            print(f"[{source_name}] discovered {len(items)} candidates")
            for item in items:
                slug = slugify(item["name"])
                if slug in known:
                    continue
                if insert_candidate(item, slug):
                    known.add(slug)
                    added += 1
                    print(f"[REVIEW] {item['name']}")
        except Exception as exc:
            print(f"[WARN] {source_name}: {exc}")
    print(f"Company discovery complete: added_for_review={added}")


if __name__ == "__main__":
    main()
