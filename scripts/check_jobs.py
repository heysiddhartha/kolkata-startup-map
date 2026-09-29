#!/usr/bin/env python3
import json, os, re, time
from datetime import datetime, timezone, timedelta
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

SUPABASE_URL=os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY=os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS={"apikey":SUPABASE_KEY,"Authorization":f"Bearer {SUPABASE_KEY}","Content-Type":"application/json","Prefer":"return=minimal,resolution=merge-duplicates"}
session=requests.Session()
session.headers.update({"User-Agent":"KolkataStartupMapBot/1.0 (public startup directory)"})

JOB_BOARD_SOURCES = [
    ("Cutshort Kolkata", "https://cutshort.io/jobs/startup-jobs-in-kolkata"),
    ("Wellfound Kolkata", "https://wellfound.com/location/kolkata-wb"),
    ("Indeed Kolkata startups", "https://in.indeed.com/q-startup-l-kolkata,-west-bengal-jobs.html"),
    ("Glassdoor Kolkata startups", "https://www.glassdoor.co.in/Job/kolkata-startup-hiring-startup-jobs-SRCH_IL.0,7_IC2901633_KO8,30.htm"),
]

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

def parse_board_jobs(soup, source, startups):
    known = {re.sub(r"[^a-z0-9]+", "", s["name"].lower()): s for s in startups}
    out = []
    for node in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(node.string or node.get_text())
        except Exception:
            continue
        items = data if isinstance(data, list) else data.get("@graph", [data]) if isinstance(data, dict) else []
        if isinstance(items, dict):
            items = [items]
        for item in items:
            if not isinstance(item, dict) or item.get("@type") not in ("JobPosting", ["JobPosting"]):
                continue
            title = norm(item.get("title"))
            if not title:
                continue
            org = item.get("hiringOrganization") or {}
            company = norm(org.get("name") if isinstance(org, dict) else "")
            key = re.sub(r"[^a-z0-9]+", "", company.lower())
            startup = known.get(key)
            if not startup:
                matches = [s for k, s in known.items() if key and (key in k or k in key) and len(key) > 4]
                startup = matches[0] if matches else None
            if not startup:
                continue
            url = item.get("url") or source
            loc = item.get("jobLocation")
            if isinstance(loc, list):
                loc = loc[0] if loc else {}
            address = (loc or {}).get("address", {}) if isinstance(loc, dict) else {}
            location = norm(" ".join(str(address.get(k, "")) for k in ("addressLocality", "addressRegion", "addressCountry")))
            desc = BeautifulSoup(str(item.get("description", "")), "html.parser").get_text(" ", strip=True)
            ident = item.get("identifier", {})
            external = (ident.get("value") if isinstance(ident, dict) else None) or url
            out.append({
                "startup_id": startup["id"], "title": title, "location": location,
                "mode": "Remote" if item.get("jobLocationType") == "TELECOMMUTE" else "On-site/Hybrid",
                "employment_type": norm(item.get("employmentType")),
                "fresher": fresher(title, desc), "apply_url": url,
                "source_url": source, "external_id": external
            })
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
    board_added=0
    for source_name, source_url in JOB_BOARD_SOURCES:
        try:
            r=session.get(source_url,timeout=25,allow_redirects=True)
            if r.ok:
                board_jobs=parse_board_jobs(BeautifulSoup(r.text,"html.parser"),r.url,startups)
                for j in board_jobs:
                    api("jobs?on_conflict=startup_id,external_id","POST",{**j,"last_seen_at":datetime.now(timezone.utc).isoformat(),"status":"live"})
                    board_added+=1
                print("[BOARD]",source_name,"jobs=",len(board_jobs))
        except Exception as e:
            print("[WARN] job board",source_name,e)
    for s in startups:
        started=datetime.now(timezone.utc)
        url=discover(s)
        if not url:
            api("source_checks","POST",{"startup_id":s["id"],"source_url":s.get("website") or "unknown","source_type":"careers_discovery","checked_at":started.isoformat(),"jobs_found":0,"success":False,"error":"No careers page discovered"})
            continue
        try:
            r=session.get(url,timeout=20,allow_redirects=True)
            jobs=parse_jobs(BeautifulSoup(r.text,"html.parser"),r.url) if r.ok else []
            for j in jobs:
                api("jobs?on_conflict=startup_id,external_id","POST",{**j,"startup_id":s["id"],"last_seen_at":datetime.now(timezone.utc).isoformat(),"status":"live"})
            now=datetime.now(timezone.utc).isoformat()
            api("source_checks","POST",{"startup_id":s["id"],"source_url":r.url,"source_type":"careers","checked_at":now,"http_status":r.status_code,"jobs_found":len(jobs),"success":bool(r.ok),"error":None if r.ok else f"HTTP {r.status_code}"})
            api(f"startups?id=eq.{s['id']}","PATCH",{"careers_url":r.url,"last_checked_at":now,"hiring_status":"hiring" if jobs else "unknown","hiring_source_url":r.url,"hiring_checked_at":now})
            checked+=1
            time.sleep(0.7)
        except Exception as e:
            api("source_checks","POST",{"startup_id":s["id"],"source_url":url,"source_type":"careers","checked_at":datetime.now(timezone.utc).isoformat(),"jobs_found":0,"success":False,"error":str(e)[:500]})
            print("[WARN]",s["name"],e)
    cutoff=(datetime.now(timezone.utc)-timedelta(days=7)).isoformat()
    # Mark stale listings individually. This is more reliable than a bulk PATCH
    # with a timestamp filter through PostgREST and lets one bad record fail
    # without aborting the whole twice-daily refresh.
    stale_jobs=api("jobs?select=id,last_seen_at&status=eq.live&last_seen_at=lt."+cutoff)
    stale_count=0
    for job in stale_jobs or []:
        try:
            api("jobs?id=eq."+job["id"],"PATCH",{"status":"stale"})
            stale_count+=1
        except Exception as e:
            print("[WARN] Could not mark job stale:",job.get("id"),e)
    print("Checked",checked,"career pages; added/updated",board_added,"board jobs; marked",stale_count,"stale jobs after 7 days unseen.")

if __name__=="__main__": main()
