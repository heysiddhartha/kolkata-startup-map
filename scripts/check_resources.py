import os
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "KolkataStartupMap/1.0 (+public ecosystem directory)"})

def main():
    r = SESSION.get(f"{SUPABASE_URL}/rest/v1/ecosystem_resources", headers=HEADERS, params={"select":"id,url,status","status":"eq.published","limit":"500"}, timeout=30)
    r.raise_for_status()
    checked = 0
    failed = 0
    now = datetime.now(timezone.utc).isoformat()
    for row in r.json():
        try:
            res = SESSION.head(row["url"], allow_redirects=True, timeout=15)
            if res.status_code >= 400:
                res = SESSION.get(row["url"], allow_redirects=True, timeout=20, stream=True)
            if res.status_code >= 400:
                failed += 1
                continue
            SESSION.patch(
                f"{SUPABASE_URL}/rest/v1/ecosystem_resources",
                headers={**HEADERS, "Prefer":"return=minimal"},
                params={"id":f"eq.{row['id']}"},
                json={"last_checked_at":now,"updated_at":now},
                timeout=20,
            )
            checked += 1
        except Exception as exc:
            failed += 1
            print(f"[WARN] {row['url']}: {exc}")
    print(f"Resource maintenance complete: checked={checked}, failed={failed}")

if __name__ == "__main__":
    main()
