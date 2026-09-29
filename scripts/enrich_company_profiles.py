import os, re, time, datetime
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

SUPABASE_URL=os.environ["SUPABASE_URL"].rstrip("/")
KEY=os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS={"apikey":KEY,"Authorization":f"Bearer {KEY}","Content-Type":"application/json"}
S=requests.Session()
S.headers.update({"User-Agent":"KolkataStartupMapProfileEnricher/1.0 (+https://heysiddhartha.github.io/kolkata-startup-map/)"})

BLOCKED={"linkedin.com","facebook.com","instagram.com","x.com","twitter.com","youtube.com","crunchbase.com",
"startupblink.com","wellfound.com","fliarbi.com","compworth.com","seedtable.com","lets-code.co.in",
"builtinkolkata.in","echai.ventures","inc42.com","yourstory.com","ambitionbox.com","indeed.com",
"glassdoor.co.in","glassdoor.com","naukri.com","zaubacorp.com","tofler.in","thecompanycheck.com","tracxn.com"}

def get(path,params):
    r=S.get(f"{SUPABASE_URL}/rest/v1/{path}",headers=HEADERS,params=params,timeout=30); r.raise_for_status(); return r.json()
def patch(path,params,payload):
    r=S.patch(f"{SUPABASE_URL}/rest/v1/{path}",headers={**HEADERS,"Prefer":"return=minimal"},params=params,json=payload,timeout=30); r.raise_for_status()
def post(path,payload):
    r=S.post(f"{SUPABASE_URL}/rest/v1/{path}",headers={**HEADERS,"Prefer":"return=minimal"},json=payload,timeout=30); r.raise_for_status()
def host(u):
    try:return urlparse(u).hostname.lower().replace("www.","")
    except:return ""
def clean(u):
    if not u:return ""
    if u.startswith("//"):u="https:"+u
    if not u.startswith(("http://","https://")):return ""
    return u.split("#")[0].rstrip("/")
def blocked(u):
    h=host(u); return not h or any(h==d or h.endswith("."+d) for d in BLOCKED)
def toks(n):
    stop={"the","and","india","private","limited","pvt","ltd","solutions","technologies","technology","services","group","company","software","industries"}
    return [x for x in re.findall(r"[a-z0-9]+",n.lower()) if len(x)>2 and x not in stop]
def score(n,title,u):
    if blocked(u):return -99
    h=host(u); ts=toks(n); hay=(title+" "+h).lower()
    s=sum(3 for t in ts if t in hay)
    s+=4 if any(t in h for t in ts) else 0
    s+=1 if h.endswith((".com",".in",".org",".co")) else 0
    return s
def bing(q,limit=8):
    try:
        r=S.get("https://www.bing.com/search",params={"q":q,"count":limit},timeout=20); r.raise_for_status()
        soup=BeautifulSoup(r.text,"html.parser"); out=[]
        for item in soup.select("li.b_algo"):
            a=item.select_one("h2 a")
            if a:out.append((a.get_text(" ",strip=True),clean(a.get("href",""))))
        return out
    except Exception as e:
        print("SEARCH_ERROR",q,e); return []
def official(n):
    cand=[]
    for q in (f'"{n}" Kolkata official website',f'"{n}" India official website'):
        for t,u in bing(q): 
            if u:cand.append((score(n,t,u),t,u))
        if cand and max(x[0] for x in cand)>=8:break
    for sc,t,u in sorted(cand,reverse=True):
        if sc<6:continue
        try:
            r=S.get(u,timeout=15,allow_redirects=True)
            if r.status_code<400 and not blocked(r.url):return clean(r.url)
        except:pass
    return ""
def linkedin(n):
    for _,u in bing(f'"{n}" site:linkedin.com/company Kolkata',5):
        if "linkedin.com/company/" in u:return u
    return ""
def inspect(u):
    try:
        r=S.get(u,timeout=20,allow_redirects=True)
        if r.status_code>=400:return {}
        soup=BeautifulSoup(r.text,"html.parser"); base=r.url
        desc=""
        for attrs in ({"name":"description"},{"property":"og:description"}):
            m=soup.find("meta",attrs=attrs)
            if m and m.get("content"):desc=m["content"].strip();break
        logo=""
        for link in soup.find_all("link",href=True):
            rel=" ".join(link.get("rel") or []).lower()
            if "icon" in rel:
                logo=urljoin(base,link["href"]);break
        if not logo:
            for attrs in ({"property":"og:image"},{"name":"twitter:image"}):
                m=soup.find("meta",attrs=attrs)
                if m and m.get("content"):logo=urljoin(base,m["content"]);break
        careers=""
        for a in soup.find_all("a",href=True):
            label=(a.get_text(" ",strip=True)+" "+a.get("href","")).lower()
            if re.search(r"\b(careers?|jobs?|join us|work with us|opportunities)\b",label):
                u2=urljoin(base,a["href"])
                if host(u2)==host(base):careers=u2;break
        return {"url":clean(base),"description":desc[:1500],"logo":clean(logo),"careers":clean(careers)}
    except Exception:return {}

def main():
    rows=[]; off=0
    while True:
        b=get("startups",{"select":"id,name,website,logo_url,linkedin_url,careers_url,description,source_url","status":"eq.approved","order":"name.asc","offset":off,"limit":100})
        rows+=b
        if len(b)<100:break
        off+=100
    print("PROFILES",len(rows))
    done=updated=0
    for row in rows:
        now=datetime.datetime.now(datetime.timezone.utc).isoformat()
        name=(row.get("name") or "").strip()
        changes={}; source=clean(row.get("website") or "")
        if not source:
            source=official(name)
            if source:changes["website"]=source
        if source:
            d=inspect(source)
            source=d.get("url") or source
            if not row.get("logo_url"):
                changes["logo_url"]=d.get("logo") or f"https://www.google.com/s2/favicons?domain={host(source)}&sz=128"
            if not row.get("careers_url") and d.get("careers"):changes["careers_url"]=d["careers"]
            if len((row.get("description") or "").strip())<40 and d.get("description"):changes["description"]=d["description"]
        if not row.get("linkedin_url"):
            li=linkedin(name)
            if li:changes["linkedin_url"]=li
        changes["last_checked_at"]=now; changes["updated_at"]=now
        if source:
            changes["verification_source_url"]=source; changes["verification_checked_at"]=now
        if len(changes)>2:
            patch("startups",{"id":f"eq.{row['id']}"},changes);updated+=1
        try:
            post("source_checks",{"startup_id":row["id"],"source_url":source or row.get("source_url") or "",
                "source_type":"profile_enrichment","checked_at":now,"http_status":200 if source else None,
                "jobs_found":0,"success":bool(source),"error":None if source else "No verified official website found"})
            post("audit_log",{"action":"profile_enrichment","entity_type":"startup","entity_id":row["id"],
                "metadata":{"name":name,"fields_updated":sorted(k for k in changes if k not in {"updated_at","last_checked_at"})}})
        except Exception as e:print("LOG_ERROR",name,e)
        done+=1
        if done%10==0:print(f"PROGRESS {done}/{len(rows)} updated={updated}")
        time.sleep(.2)
    print(f"COMPLETE checked={done} updated={updated}")

if __name__=="__main__":main()
