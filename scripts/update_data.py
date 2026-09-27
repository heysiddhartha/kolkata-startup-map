import json, re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

SOURCE = "https://echai.ventures/kolkata"
OUT = Path("data/startups.json")

def fetch(url):
    req = Request(url, headers={"User-Agent": "KolkataStartupMap/1.0 (+https://github.com/heysiddhartha/kolkata-startup-map)"})
    with urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")

def main():
    html = fetch(SOURCE)

    # Keep this scraper deliberately conservative. We only extract startup names
    # when they appear in the public page text; coordinates and hiring status are
    # never invented here.
    names = []
    seen = set()
    for match in re.finditer(r'<(?:h[1-6]|a|div|span)[^>]*>\\s*([^<]{2,100})\\s*</(?:h[1-6]|a|div|span)>', html, re.I):
        value = re.sub(r'\\s+', ' ', match.group(1)).strip()
        if value and value.lower() not in seen and len(value.split()) <= 10:
            if value not in {"Kolkata", "Startups", "Startups and spaces in Kolkata"}:
                seen.add(value.lower())
                names.append(value)

    # Store raw discoveries for review rather than presenting scraped text as
    # verified companies. The frontend can consume reviewed records separately.
    payload = {
        "source": SOURCE,
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "discoveredNames": names[:500],
        "companies": []
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\\n", encoding="utf-8")
    print(f"Discovered {len(names)} candidate names")

if __name__ == "__main__":
    main()
