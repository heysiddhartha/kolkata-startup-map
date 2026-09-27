#!/usr/bin/env python3
import json, os, re, time
from datetime import datetime, timezone, timedelta
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

SUPABASE_URL=os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY=os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS={"apikey":SUPABASE_KEY,"Authorization":f"Bearer {SUPABASE_KEY}","Content-Type":"application/json"}
session=requests.Session()
session.headers.update({"User-Agent":"KolkataStartupMapBot/1.0 (public startup directory)"})

def api(path, method="GET", payload=None):
    r=session.request(method,SUPABASE_URL+"/rest/v1/"+path,headers=HEADERS,json=payload,timeout=25)
    r.raise_for_status()
    return r.json() if r.text else None

def norm(s): return re.sub(r"\s+"," ",str(s or "")).strip()

def fresher(title, desc):
    return bool(re.search(r"\b(fresher|entry[- ]level|graduate|intern(ship)?|trainee|0[- ]?1 years?)\b",(title+" "+desc).lower()))

def parse_jobs(soup, source):
    out=[]
    for node in soup.select('script[type="application/ld+json"]'):
        try: data=json.loads(node.string or node.get_text())
        except Exception: continue
        items=data if isinstance(data,list) else data.get("@graph",[data]) if isinstance(data,dict) else []
        if isinstance(items,dict): items=[items]
        for item in items:
            if not isinstance(item,dict) or item.get("@type") not in ("JobPosting",["JobPosting"]): continue
            title=norm(item.get("title")); url=item.get("url") or source
            if not title: continue
            loc=item.get("jobLocation")
            if isinstance(loc,list): loc=loc[0] if loc else {}
            address=(loc or {}).get("address",{}) if isinstance(loc,dict) else {}
            location=norm(" ".join(str(address.get(k,"")) for k in ("addressLocality","addressRegion","addressCountry")))
            desc=BeautifulSoup(str(item.get("description","")),"html.parser").get_text(" ",strip=True)
            ident=item.get("identifier",{})
            external=(ident.get("value") if isinstance(ident,dict) else None) or url
            out.append({"title":title,"location":location,"mode":"Remote" if item.get("jobLocationType")=="TELECOMMUTE" else "On-site/Hybrid","employment_type":norm(item.get("employmentType")),"fresher":fresher(title,desc),"apply_url":url,"source_url":source,"external_id":external})
    return out

def discover(startup):
    if startup.get("careers_url"): return startup["careers_url"]
    website=startup.get("website")
    if not website: return None
    for path in ("/careers","/career","/jobs","/join-us","/work-with-us"):
        url=urljoin(website,path)
        try:
            r=session.get(url,timeout=12,allow_redirects=True)
            if r.ok and "text/html" in r.headers.get("content-type","") and any(x in r.text.lower() for x in ("job","career","vacanc","opening","position","join us")):
                return r.url
        except requests.RequestException: pass
    return None

def main():
    startups=api("startups?select=id,name,website,careers_url&status=eq.approved")
    checked=0
    for s in startups:
        url=discover(s)
        if not url: continue
        try:
            r=session.get(url,timeout=20,allow_redirects=True)
            jobs=parse_jobs(BeautifulSoup(r.text,"html.parser"),r.url) if r.ok else []
            for j in jobs:
                api("jobs?on_conflict=startup_id,external_id","POST",{**j,"startup_id":s["id"],"last_seen_at":datetime.now(timezone.utc).isoformat(),"status":"live"})
            api(f"startups?id=eq.{s['id']}","PATCH",{"careers_url":r.url,"last_checked_at":datetime.now(timezone.utc).isoformat()})
            checked+=1
            time.sleep(1)
        except Exception as e: print("[WARN]",s["name"],e)
    cutoff=(datetime.now(timezone.utc)-timedelta(days=7)).isoformat()
    api(f"jobs?last_seen_at=lt.{cutoff}&status=eq.live","PATCH",{"status":"stale"})
    print("Checked",checked,"career pages.")

if __name__=="__main__": main()
