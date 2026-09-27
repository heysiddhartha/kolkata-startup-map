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
    ("eChai Kolkata Startup Grid", "https://echai.ventures/kolkata/grid", "echai.ventures"),
    ("StartupBlink Kolkata", "https://www.startupblink.com/top-startups/kolkata-in", "startupblink.com"),
    ("Startup India", "https://www.startupindia.gov.in/content/sih/en/search.html?roles=Startup", "startupindia.gov.in"),
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
    for a in soup.find_all("a", href=True):
        href = urljoin(base, a["href"])
        name = clean_name(" ".join(a.stripped_strings))
        if not name or href.startswith("https://echai.ventures"):
            continue
        host = re.sub(r"^www\\.", "", href.split("/")[2].lower()) if href.startswith("http") else ""
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


def discover_startup_india(html, base):
    soup = BeautifulSoup(html, "html.parser")
    found = {}
    for a in soup.find_all("a", href=True):
        name = clean_name(" ".join(a.stripped_strings))
        href = urljoin(base, a["href"])
        if not name or len(name.split()) > 12:
            continue
        if "startup" not in href.lower() and "entity" not in href.lower():
            continue
        if name.lower() in EXCLUDED:
            continue
        found.setdefault(name.lower(), {"name": name, "website": "", "source_url": base})
    return list(found.values())


def existing_slugs():
    r = SESSION.get(f"{SUPABASE_URL}/rest/v1/startups", headers=HEADERS, params={"select":"slug", "limit":"5000"}, timeout=30)
    r.raise_for_status()
    return {row.get("slug") for row in r.json() if row.get("slug")}


def insert_candidate(item, slug):
    payload = {
        "name": item["name"], "slug": slug, "website": item.get("website") or None,
        "area": "Kolkata", "sector": "Other", "stage": "Unknown",
        "description": "Discovered through a public Kolkata startup ecosystem directory. Verification and location details are pending.",
        "verified": False, "status": "approved", "source_url": item["source_url"],
        "verification_source_url": item["source_url"], "location_type": "district",
        "last_checked_at": datetime.now(timezone.utc).isoformat(),
    }
    r = SESSION.post(f"{SUPABASE_URL}/rest/v1/startups", headers={**HEADERS, "Prefer":"return=minimal"}, json=payload, timeout=30)
    if r.status_code in (409, 422):
        return False
    r.raise_for_status()
    return True


def main():
    known = existing_slugs(); added = 0
    for source_name, url, source_host in SOURCES:
        try:
            response = SESSION.get(url, timeout=30); response.raise_for_status()
            if source_host == "echai.ventures":
                items = discover_echai(response.text, url)
            elif source_host == "startupblink.com":
                items = discover_startupblink(response.text, url)
            else:
                items = discover_startup_india(response.text, url)
            print(f"[{source_name}] discovered {len(items)} candidates")
            for item in items:
                slug = slugify(item["name"])
                if slug in known:
                    continue
                if insert_candidate(item, slug):
                    known.add(slug); added += 1; print(f"[ADD] {item['name']}")
        except Exception as exc:
            print(f"[WARN] {source_name}: {exc}")
    print(f"Company discovery complete: added={added}")


if __name__ == "__main__":
    main()
