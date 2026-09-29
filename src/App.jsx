import {Component,useEffect,useMemo,useState} from 'react'
import {MapContainer,TileLayer,Marker,Popup,useMap} from 'react-leaflet'
import L from 'leaflet'
import {startups as seedStartups,jobs as seedJobs} from './data'

const bounds=[[22.43,88.20],[22.75,88.62]]
const center=[22.5726,88.3639]
const CARTO_KEY=import.meta.env.VITE_CARTO_API_KEY||''
const mapTileUrl=CARTO_KEY?'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key='+encodeURIComponent(CARTO_KEY):'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const mapAttribution=CARTO_KEY?'© OpenStreetMap contributors, © CARTO':'© OpenStreetMap contributors'

const ecosystemItems=[
 {category:'Funding',date:'24 Aug 2026',title:'IDFC FIRST Bank and IIMCIP launch a ₹2 crore incubation programme',text:'A new incubation programme connecting founders with structured support and ecosystem access.',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/news/'},
 {category:'AI',date:'10 Aug 2026',title:'AI Day for Startups India 2026 comes to Kolkata',text:'A Kolkata ecosystem event focused on AI, startups, founders and emerging technology.',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/news/'},
 {category:'Cohort',date:'13 Jul 2026',title:'Bengal Business Accelerator Programme Cohort 3 reaches Demo Day',text:'Founders from the Bengal ecosystem present their businesses and progress at the end of the accelerator cycle.',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/events/?y=2022'},
 {category:'Event',date:'6–7 Sep 2026',title:'RISE Conclave brings startups, research, industry and investors together',text:'A cross-ecosystem conclave connecting founders and institutions around innovation and entrepreneurship.',source:'RISE Conclave',url:'https://riseconclave.immt.res.in/schedule'},
 {category:'Ecosystem',date:'8 Sep 2026',title:'IIM Calcutta Innovation Park partners with Army Institute of Management Kolkata',text:'The partnership expands collaboration between an innovation ecosystem institution and a Kolkata management institute.',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/news/'},
 {category:'Startup',date:'23 Sep 2026',title:'Startup nurtured at IIM Calcutta works on Bengal-specific antivenom',text:'An IIM Calcutta Innovation Park startup is working on a Bengal-specific approach to snakebite treatment.',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/topic/startup-sinks-teeth-into-bengal-specific-antivenom-for-tailored-snakebite-cure/'}
]

const seedNewsItems=[
 {cat:'Ecosystem',date:'23 Sep 2026',title:'Startup nurtured at IIM Calcutta works on Bengal-specific antivenom',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/topic/startup-sinks-teeth-into-bengal-specific-antivenom-for-tailored-snakebite-cure/'},
 {cat:'Ecosystem',date:'8 Sep 2026',title:'IIM Calcutta Innovation Park partners with Army Institute of Management Kolkata',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/news/'},
 {cat:'Event',date:'12–13 Sep 2026',title:'Machine Learning Accelerator Summit 4.0 takes place at Jadavpur University',source:'IEEE JUSB',url:'https://mlas.ieee-jaduniv.in/'},
 {cat:'Event',date:'6–7 Sep 2026',title:'RISE Conclave connects startups, research, industry and investors in Kolkata',source:'RISE Conclave',url:'https://riseconclave.immt.res.in/schedule'},
 {cat:'Cohort',date:'1 Sep 2026',title:'SPJIMR WISE Tech India Pitchathon — West Bengal Edition brings startups to IIM Calcutta',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/events/?y=2022'},
 {cat:'Funding',date:'24 Aug 2026',title:'IDFC FIRST Bank and IIMCIP launch ₹2 crore incubation programme',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/news/'},
 {cat:'AI',date:'10 Aug 2026',title:'AI Day for Startups India 2026 comes to Kolkata',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/news/'},
 {cat:'Funding',date:'6 Aug 2026',title:'Five social enterprises selected for implementation grants of up to ₹20 lakh',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/news/'},
 {cat:'Cohort',date:'13 Jul 2026',title:'Bengal Business Accelerator Programme Cohort 3 concludes with Demo Day',source:'IIM Calcutta Innovation Park',url:'https://iimcip.org/news-event/events/?y=2022'},
 {cat:'Cohort',date:'14 Jul 2026',title:'AIC Techno invites startups into its incubation ecosystem',source:'AIC Techno',url:'https://technotimes.info/index.php/2026/07/14/aic-techno-final-startup-applications-august-2026/'}
]

function ThemeMap(){const map=useMap();useEffect(()=>{setTimeout(()=>map.invalidateSize(),50)},[]);return null}

function mapLogoUrl(url, fallback=''){
 try{
  if(fallback)return fallback
  const host=new URL(url).hostname.replace(/^www\\./,'')
  return host?'https://www.google.com/s2/favicons?domain='+host+'&sz=128':''
 }catch{return ''}
}
function mapCompanyIcon(s){
 const logo=mapLogoUrl(s.url,s.logo), initial=(s.name||'K').trim().charAt(0).toUpperCase()
 const html='<span class="company-map-icon"><span class="company-map-fallback">'+initial+'</span>'+(logo?'<img src="'+logo+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'')+'</span>'
 return L.divIcon({className:'company-map-icon-wrap',html,iconSize:[38,38],iconAnchor:[19,19],popupAnchor:[0,-20]})
}
function MapMarkers({items,markerPositions,onSelect,isOfficialUrl}){
 const mapped=items.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng))
 return <>{mapped.map(s=><Marker key={s.name} position={markerPositions.get(s.name)||[s.lat,s.lng]} icon={mapCompanyIcon(s)} eventHandlers={{click:()=>onSelect(s)}}><Popup><b>{s.name}</b><br/>{s.sector} · {s.area}<br/><span>{s.desc}</span><br/><small>{s.locationType==='headquarters'?'Kolkata HQ':s.locationType==='registered_office'?'Registered office':s.locationType==='kolkata_office'?'Kolkata office':'Kolkata connection'} · {s.locationConfidence==='approximate'?'Approximate map point':'Public-source location'}</small><br/>{isOfficialUrl(s.url)?<a href={s.url} target="_blank" rel="noreferrer">Open official website →</a>:<span>No verified website link</span>}</Popup></Marker>)}</>
}

function App(){
 const [startups,setStartups]=useState(seedStartups),[jobs,setJobs]=useState(seedJobs),[dataSource,setDataSource]=useState('seed'),[dataLoading,setDataLoading]=useState(true),[dataError,setDataError]=useState(''),[newsError,setNewsError]=useState('')
 const [theme,setTheme]=useState(localStorage.getItem('ksm-theme')||'light')
 const [view,setView]=useState('map'),[query,setQuery]=useState(''),[area,setArea]=useState(''),[sector,setSector]=useState(''),[stage,setStage]=useState(''),[hiring,setHiring]=useState(''),[quality,setQuality]=useState(''),[selected,setSelected]=useState(null)
 const [showSubmit,setShowSubmit]=useState(false),[showNews,setShowNews]=useState(true),[submitState,setSubmitState]=useState('idle'),[submitRef,setSubmitRef]=useState(''),[jobMode,setJobMode]=useState(''),[jobType,setJobType]=useState(''),[sortBy,setSortBy]=useState('name'),[news,setNews]=useState(seedNewsItems),[newsPage,setNewsPage]=useState(0),[copiedUpi,setCopiedUpi]=useState(false),[newsLoading,setNewsLoading]=useState(false),[resources,setResources]=useState([])
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('ksm-theme',theme)},[theme])
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const q=params.get('q');if(q)setQuery(q)},[])
 const refreshData=async()=>{
   const SUPABASE_URL='https://rkzkpwaexadlwxqdfjlm.supabase.co'
   const SUPABASE_KEY='sb_publishable_V7WzcNGV2x4J1OlDrepTnw_1sMgFz43'
   const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}
   setDataLoading(true);setNewsLoading(true);setDataError('');setNewsError('')
   try{
     const [sr,jr,rr]=await Promise.all([
       fetch(SUPABASE_URL+'/rest/v1/startups?select=name,area,sector,stage,lat,lng,verified,description,website,linkedin_url,public_email,address,founder,careers_url,hiring_status,hiring_source_url,location_type,location_confidence,last_checked_at,logo_url&status=eq.approved&order=name',{headers}),
       fetch(SUPABASE_URL+'/rest/v1/jobs?select=title,location,mode,employment_type,fresher,apply_url,source_url,startups(name)&status=eq.live&order=created_at.desc',{headers}),
       fetch(SUPABASE_URL+'/rest/v1/ecosystem_resources?select=id,name,resource_type,category,description,url,source_name,location,verified,last_checked_at&status=eq.published&order=category,name',{headers})
     ])
     if(!sr.ok||!jr.ok)throw new Error('Live directory could not be reached')
     const [s,j,r]=await Promise.all([sr.json(),jr.json(),rr.json()])
     const normalizeStartup=x=>({name:x.name,area:x.area||'Kolkata',sector:x.sector||'Other',stage:x.stage||'Unknown',lat:Number.isFinite(Number(x.lat))?Number(x.lat):null,lng:Number.isFinite(Number(x.lng))?Number(x.lng):null,verified:!!x.verified,desc:x.description||'',url:safeUrl(x.website||''),linkedin:x.linkedin_url||'',email:x.public_email||'',address:x.address||'',founder:x.founder||'',careers:x.careers_url||'',logo:x.logo_url||'',hiring:x.hiring_status||'unknown',hiringSource:x.hiring_source_url||'',locationType:x.location_type||'headquarters',locationConfidence:x.location_confidence||'approximate',lastChecked:x.last_checked_at||''})
     const normalizeJob=x=>({company:x.startups?.name||'',title:x.title,mode:x.mode||x.location||'Kolkata',type:x.employment_type||'Full-time',freshers:!!x.fresher,url:safeUrl(x.apply_url||x.source_url||'#')})
     setStartups(s?.length?s.map(normalizeStartup):seedStartups)
     setJobs((j||[]).map(normalizeJob));setResources(r||[])
     setDataSource('live')
   }catch(err){setDataError(err.message||'Live directory unavailable')}
   finally{setDataLoading(false)}
   try{
     const nr=await fetch(SUPABASE_URL+'/rest/v1/news_items?select=id,title,category,summary,source_name,source_url,published_at,verified&status=eq.published&order=published_at.desc&limit=30',{headers})
     if(!nr.ok)throw new Error('News feed unavailable')
     const n=await nr.json()
     setNews(n?.length?(n||[]).map(x=>({cat:x.category,date:x.published_at?new Date(x.published_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'',title:x.title,summary:x.summary||'',source:x.source_name,url:sourceUrl(x.source_url),verified:!!x.verified})):seedNewsItems)
     setNewsPage(0);setNewsError('')
   }catch(err){setNewsError(err.message||'News feed unavailable')}
   finally{setNewsLoading(false)}
 }
 useEffect(()=>{refreshData()},[])
 const sectors=[...new Set(startups.map(s=>s.sector))].sort(),areas=[...new Set(startups.map(s=>s.area))].sort(),stages=[...new Set(startups.map(s=>s.stage))].sort()
 const isOfficialUrl=url=>{if(!url||url==='#')return false;try{const h=new URL(url).hostname.toLowerCase();return !h.includes('echai.ventures')&&!h.includes('echai')&&!h.includes('crunchbase.com')&&!h.includes('tracxn.com')&&!h.includes('yourstory.com')&&!h.includes('inc42.com')}catch{return false}}
 const safeUrl=url=>isOfficialUrl(url)?url:'#'
 const sourceUrl=url=>{if(!url||url==='#')return '#';try{return /^https?:$/.test(new URL(url).protocol)?url:'#'}catch{return '#'}}
 const companyLogoUrl=(url,fallback='')=>{
   try{
     if(fallback)return fallback
     const host=new URL(url).hostname.replace(/^www\\./,'')
     return host?`https://www.google.com/s2/favicons?domain=${host}&sz=128`:'' 
   }catch{return ''}
 }
 const companyIcon=s=>{
   const logo=companyLogoUrl(s.url,s.logo)
   const initial=(s.name||'K').trim().charAt(0).toUpperCase()
   return L.divIcon({
     className:'company-map-icon-wrap',
     html:`<span class="company-map-icon"><span class="company-map-fallback">${initial}</span>${logo?`<img src="${logo}" alt="" loading="lazy" onerror="this.style.display='none'">`:''}</span>`,
     iconSize:[38,38],
     iconAnchor:[19,19],
     popupAnchor:[0,-20]
   })
 }
 const companyJobs=name=>jobs.filter(j=>j.company.toLowerCase()===name.toLowerCase())
 const filtered=useMemo(()=>startups.filter(s=>{const hay=(s.name+' '+s.sector+' '+s.area+' '+s.stage+' '+s.desc+' '+s.founder).toLowerCase();const js=companyJobs(s.name);return (!query||hay.includes(query.toLowerCase()))&&(!area||s.area===area)&&(!sector||s.sector===sector)&&(!stage||s.stage===stage)&&(!hiring||(hiring==='hiring'&&((s.hiring||'unknown')==='hiring'))||(hiring==='freshers'&&js.some(j=>j.freshers)))&&(!quality||(quality==='verified'&&s.verified)||(quality==='mapped'&&Number.isFinite(s.lat)&&Number.isFinite(s.lng))||(quality==='website'&&isOfficialUrl(s.url)))}),[query,area,sector,stage,hiring,quality,jobs])
 const clear=()=>{setQuery('');setArea('');setSector('');setStage('');setHiring('');setQuality('');setJobMode('');setJobType('')}
 const sortedFiltered=useMemo(()=>[...filtered].sort((a,b)=>sortBy==='hiring'?Number(b.hiring==='hiring')-Number(a.hiring==='hiring')||a.name.localeCompare(b.name):sortBy==='recent'?String(b.lastChecked||'').localeCompare(String(a.lastChecked||''))||a.name.localeCompare(b.name):a.name.localeCompare(b.name)),[filtered,sortBy])
 const mappedCount=useMemo(()=>filtered.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng)).length,[filtered])
 const markerPositions=useMemo(()=>{
   const mapped=filtered.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng))
   const groups=new Map()
   mapped.forEach(s=>{
     const key=s.lat.toFixed(6)+','+s.lng.toFixed(6)
     if(!groups.has(key))groups.set(key,[])
     groups.get(key).push(s)
   })
   const out=new Map()
   groups.forEach(group=>{
     if(group.length===1){out.set(group[0].name,[group[0].lat,group[0].lng]);return}
     group.forEach((s,i)=>{
       if(group.length===2){
         const side=i===0?-1:1
         out.set(s.name,[s.lat, s.lng+side*0.00055])
         return
       }
       const angle=i*2.39996323
       const radius=0.00038*Math.sqrt(i+1)
       out.set(s.name,[s.lat+Math.sin(angle)*radius, s.lng+Math.cos(angle)*radius])
     })
   })
   return out
 },[filtered])
 const verifiedCount=useMemo(()=>startups.filter(s=>s.verified).length,[startups])
 const allMappedCount=useMemo(()=>startups.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng)).length,[startups])
 const visibleJobs=useMemo(()=>jobs.filter(j=>(!jobMode||j.mode===jobMode)&&(!jobType||j.type===jobType)),[jobMode,jobType])
 useEffect(()=>{const onKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.querySelector('.search input')?.focus()}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
 const submitStartup=async e=>{
   e.preventDefault();setSubmitState('sending')
   const f=new FormData(e.currentTarget);const payload=Object.fromEntries(f.entries())
   try{
     const res=await fetch('https://rkzkpwaexadlwxqdfjlm.supabase.co/functions/v1/submit-startup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
     const data=await res.json()
     if(!res.ok)throw new Error(data.error||'Could not submit')
     setSubmitRef(data.reference||'')
     setSubmitState('success');e.currentTarget.reset()
   }catch(err){setSubmitState(err.message||'Could not submit')}
 }
 return <div className="app">
  <header className="topbar"><div className="brand"><span className="brand-mark">K</span><div><b>Kolkata Startup Map</b><small>Startups · Companies · Jobs · Ecosystem</small></div></div><nav><a className="top-nav-link" href="/kolkata-startup-map/startups/">Directory</a><a className="top-nav-link" href="/kolkata-startup-map/ecosystem/">Ecosystem</a><a className="top-nav-link" href="#jobs">Jobs <strong>{jobs.length}</strong></a><a className="top-nav-link" href="/kolkata-startup-map/news/">News</a><a className="top-nav-link" href="#resources">Resources</a><button onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label="Toggle colour theme">{theme==='dark'?'☀':'◐'}</button><button onClick={()=>setShowSubmit(true)} className="add">Add startup <b>+</b></button></nav></header>
  <main>
   <section className="hero"><div className="hero-orbit hero-orbit-one"></div><div className="hero-orbit hero-orbit-two"></div><div className="hero-copy"><div className="hero-kicker"><span className="kicker-dot"></span> KOLKATA’S STARTUP ECOSYSTEM</div><h1>Find what’s being built<br/><em>in Kolkata.</em></h1><p>Startups, companies, agencies, sectors and live hiring signals — in one map.</p><div className="hero-actions"><button onClick={()=>document.querySelector(".content")?.scrollIntoView({behavior:"smooth"})}>Explore the map <span>↓</span></button><a className="hero-link" href="/kolkata-startup-map/ecosystem/">Explore the ecosystem →</a><button className="hero-link" onClick={()=>document.querySelector("#jobs")?.scrollIntoView({behavior:"smooth"})}>See who’s hiring →</button></div></div><div className="hero-side"><div className="stats"><div><b>{startups.length}</b><span>listings</span></div><div><b>{allMappedCount}</b><span>mapped</span></div><div><b>{verifiedCount}</b><span>verified</span></div><div><b>{jobs.length}</b><span>open roles</span></div></div><div className="hero-note"><span>●</span> Live public-source signals</div></div></section>
   {dataError&&<div className="data-notice" role="status"><b>Using cached directory data.</b> Live company/job updates are temporarily unavailable. <button onClick={()=>window.location.reload()}>Retry</button></div>}{newsError&&<div className="data-notice" role="status"><b>News feed temporarily unavailable.</b> Showing the last available news set.</div>}
   <section className="toolbar"><div className="toolbar-context"><b>{filtered.length}</b><span>of {startups.length} listings</span></div><button className="news-toggle" onClick={()=>setShowNews(v=>!v)}>{showNews?'Hide news':'Show news'}</button><div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search companies, sectors, founders…" aria-label="Search companies, sectors and founders"/>{query&&<button type="button" className="search-clear" onClick={()=>setQuery('')} aria-label="Clear search">×</button>}<kbd>⌘ K</kbd></div><div className="toggle"><button className={view==='map'?'active':''} onClick={()=>setView('map')}>Map</button><button className={view==='grid'?'active':''} onClick={()=>setView('grid')}>Grid</button></div><div className="toolbar-filters">{[area,sector,stage,hiring,quality].filter(Boolean).length>0&&<span className="active-filter-count">{[area,sector,stage,hiring,quality].filter(Boolean).length}</span>}<select value={area} onChange={e=>setArea(e.target.value)}><option value="">All areas</option>{areas.map(x=><option key={x}>{x}</option>)}</select><select value={sector} onChange={e=>setSector(e.target.value)}><option value="">All sectors</option>{sectors.map(x=><option key={x}>{x}</option>)}</select><select value={stage} onChange={e=>setStage(e.target.value)}><option value="">All stages</option>{stages.map(x=><option key={x}>{x}</option>)}</select><select value={hiring} onChange={e=>setHiring(e.target.value)}><option value="">Hiring status</option><option value="hiring">Hiring now</option><option value="freshers">Fresher friendly</option></select><select value={quality} onChange={e=>setQuality(e.target.value)}><option value="">Data quality</option><option value="verified">Verified only</option><option value="mapped">Mapped only</option><option value="website">Has official website</option></select>{[area,sector,stage,hiring,quality].some(Boolean)&&<button className="clear-filters" onClick={clear}>Clear all</button>}</div></section>
   <section className={"content "+(view==='grid'?'content-grid':'content-map')}>{view==='map'?<><MapContainer center={center} zoom={12} minZoom={11} maxZoom={18} maxBounds={bounds} maxBoundsViscosity={1} scrollWheelZoom zoomControl={false} className="map"><TileLayer url={mapTileUrl} attribution={mapAttribution} maxZoom={20} subdomains="abcd"/><MapMarkers items={filtered} markerPositions={markerPositions} onSelect={setSelected} isOfficialUrl={isOfficialUrl}/></MapContainer>
{showNews&&<aside className="news-panel">
 <div className="news-head"><div><b>Latest news</b><span>Kolkata startup ecosystem</span></div><button onClick={()=>setShowNews(false)} aria-label="Close news">×</button></div>
 <div className="news-list">{news.slice(newsPage*5,newsPage*5+5).map(item=><a className="news-item" key={item.title} href={item.url} target="_blank" rel="noreferrer"><h4>{item.title}</h4>{item.summary&&<p>{item.summary}</p>}<div><span className="news-source">{item.source}</span><span>{item.date}</span><span className="news-cat">{item.cat}</span></div></a>)}</div>
 <div className="news-foot"><span>{newsPage*5+1}–{Math.min(newsPage*5+5,news.length)} of {news.length}</span><button disabled={newsPage===0} onClick={()=>setNewsPage(p=>p-1)}>Prev</button><button disabled={(newsPage+1)*5>=news.length} onClick={()=>setNewsPage(p=>p+1)}>Next</button></div>
</aside>}<aside className="side"><div className="side-head"><div><b>{filtered.length}</b> listings <span>· {mappedCount} mapped</span></div><button onClick={clear}>Clear</button></div>{dataLoading?<div className="empty-state"><b>Loading the directory…</b><span>Pulling the latest company and hiring data.</span></div>:filtered.length===0?<div className="empty-state"><b>No companies match these filters.</b><span>Try clearing a filter or searching for another company.</span><button onClick={clear}>Reset filters</button></div>:filtered.map(s=><article className="card" key={s.name} onClick={()=>setSelected(s)}><h3>{s.name}{s.verified&&<span className="verified-mark" title="Verified from public sources" aria-label="Verified">✓</span>}</h3>{s.hiring==='hiring'&&<div className="company-status status-hiring"><span>✓</span> HIRING NOW</div>}{s.hiring==='not_hiring'&&<div className="company-status status-not-hiring"><span>✓</span> NOT HIRING</div>}<p>{s.desc}</p><div className="company-meta">{s.sector} · {s.area} · {s.stage}</div><div className="company-links">{s.url&&s.url!=='#'&&<a href={s.url} target="_blank" rel="noreferrer">Website</a>}{s.linkedin&&<a href={s.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}{s.email&&<a href={'mailto:'+s.email}>Email</a>}</div>{s.address&&<div className="company-address">{s.address}</div>}{s.lastChecked&&<div className="company-address">Source checked {new Date(s.lastChecked).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>}</article>)}</aside></>:<div className="grid-wrap"><div className="grid-toolbar"><div><b>{filtered.length===startups.length?'All':filtered.length} companies</b><span>{filtered.length===startups.length?'Showing the full approved directory.':'Matching the current filters.'}</span></div><label>Sort <select value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="name">A–Z</option><option value="hiring">Hiring first</option><option value="recent">Recently checked</option></select></label></div>{dataLoading?<div className="empty-state"><b>Loading the directory…</b><span>Pulling the latest company and hiring data.</span></div>:filtered.length===0?<div className="empty-state"><b>No companies match these filters.</b><span>Try clearing a filter or searching for another company.</span><button onClick={clear}>Reset filters</button></div>:<div className="grid">{sortedFiltered.map(s=><article className="grid-card" key={s.name} onClick={()=>setSelected(s)}><div className="grid-card-top"><div className="grid-logo">{companyLogoUrl(s.url,s.logo)?<img src={companyLogoUrl(s.url,s.logo)} alt="" loading="lazy"/>:<span>{(s.name||'K').charAt(0).toUpperCase()}</span>}</div><div><h3>{s.name}{s.verified&&<span className="verified-mark" title="Verified from public sources">✓</span>}</h3>{s.hiring==='hiring'&&<span className="grid-hiring">Hiring now</span>}{(!s.url||s.url==='#')&&<span className="grid-incomplete">Profile needs enrichment</span>}</div></div><p>{s.desc||'Public directory record for a Kolkata company or startup.'}</p><small>{s.sector} · {s.area} · {s.stage}</small><div className="grid-card-links"><a href={"/kolkata-startup-map/startup/"+s.name.toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+"/"} onClick={e=>e.stopPropagation()}>Profile →</a>{isOfficialUrl(s.url)&&<a href={s.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>Website ↗</a>}</div></article>)}</div>}</div>}</section>
   <section id="jobs" className="jobs"><div className="jobs-head"><div><div className="eyebrow"><i/> LIVE HIRING SIGNALS</div><h2>Hiring in the ecosystem</h2><p>Public-source job signals attached to the directory. The original application source is the final authority.</p></div><div className="job-filters"><select value={jobMode} onChange={e=>setJobMode(e.target.value)}><option value="">All work modes</option>{[...new Set(jobs.map(j=>j.mode))].map(x=><option key={x}>{x}</option>)}</select><select value={jobType} onChange={e=>setJobType(e.target.value)}><option value="">All job types</option>{[...new Set(jobs.map(j=>j.type))].map(x=><option key={x}>{x}</option>)}</select></div></div><div className="job-list">{visibleJobs.map(j=>j.url&&j.url!=='#'?<a className="job" key={j.company+j.title} href={j.url} target="_blank" rel="noreferrer"><div><b>{j.title}</b><span>{j.company} · {j.mode}</span></div><em>{j.freshers?'Fresher':'Open'} →</em></a>:<div className="job job-disabled" key={j.company+j.title}><div><b>{j.title}</b><span>{j.company} · {j.mode}</span></div><em>Source unavailable</em></div>)}</div></section>

   <section id="resources" className="ecosystem">
    <div className="ecosystem-head">
      <div><div className="eyebrow"><i/> ECOSYSTEM RESOURCES</div><h2>Find the people, programmes & places</h2><p>Communities, incubators, accelerators, funding programmes, job boards, data sources and events worth knowing about.</p></div>
      <a className="refresh-button" href="/kolkata-startup-map/resources/">See all resources →</a>
    </div>
    <div className="ecosystem-grid">
      {resources.slice(0,12).map(item=><a className="ecosystem-card" key={item.id||item.url} href={item.url} target="_blank" rel="noreferrer">
        <div className="ecosystem-meta"><span>{item.category}</span><time>{item.location||'Kolkata'}</time></div>
        <h3>{item.name}</h3><p>{item.description}</p><small>{item.source_name} ↗</small>
      </a>)}
    </div>
    <div className="ecosystem-note"><b>Community sources are kept separate from verified news.</b><span>Reddit communities, founder networks and public ecosystem resources are discovery channels — always check the original source.</span></div>
   </section>

   <section id="ecosystem" className="ecosystem">
    <div className="ecosystem-head">
      <div><div className="eyebrow"><i/> KOLKATA STARTUP PULSE</div><h2>News, funding, cohorts & events</h2><p>Curated public-source signals from Kolkata and the wider West Bengal startup ecosystem.</p></div>
      <button type="button" className="refresh-button" onClick={refreshData} disabled={dataLoading || newsLoading}>{dataLoading || newsLoading ? 'Refreshing…' : 'Refresh updates ↻'}</button>
    </div>
    <div className="ecosystem-grid">
      {ecosystemItems.map(item=><a className="ecosystem-card" key={item.title} href={item.url} target="_blank" rel="noreferrer">
        <div className="ecosystem-meta"><span>{item.category}</span><time>{item.date}</time></div>
        <h3>{item.title}</h3><p>{item.text}</p><small>{item.source} ↗</small>
      </a>)}
    </div>
    <div className="ecosystem-note"><b>This is a curated pulse, not an exhaustive news feed.</b><span>We’ll keep expanding it across funding, accelerators, grants, demo days, meetups, founder programmes and startup policy.</span></div>
   </section>

   <footer className="site-footer">
 <div className="footer-brand"><div className="footer-kicker">KOLKATA STARTUP MAP</div><b>See what Kolkata<br/>is building.</b><span>A public-source directory of companies, startups, jobs and the wider ecosystem.</span></div>
 <div className="footer-column"><small>EXPLORE</small><div className="footer-links"><a href="/kolkata-startup-map/startups/">Directory ↗</a><a href="#jobs">Jobs ↗</a><a href="#ecosystem">Ecosystem ↗</a><a href="#resources">Resources ↗</a><a href="/kolkata-startup-map/news/">News ↗</a></div></div>
 <div className="footer-column"><small>MAP</small><div className="footer-links"><a href="/kolkata-startup-map/sectors/">Sectors ↗</a><a href="/kolkata-startup-map/locations/">Locations ↗</a><a href="/kolkata-startup-map/methodology/">Methodology ↗</a><a href="/kolkata-startup-map/privacy.html">Privacy ↗</a></div></div>
 <div className="footer-note"><b>Know a company we're missing?</b><span>Add it to the map and help keep the directory useful.</span><button type="button" className="support-link footer-add" onClick={()=>setShowSubmit(true)}>Add a startup <span>+</span></button></div>
 <div className="creator-credit"><span>Built and maintained by</span><a href="https://www.linkedin.com/in/heysiddhartha/" target="_blank" rel="noreferrer">Siddhartha Sarkar ↗</a><button type="button" className="support-link" onClick={async()=>{try{await navigator.clipboard.writeText('7047731824@superyes');setCopiedUpi(true);setTimeout(()=>setCopiedUpi(false),2200)}catch{setCopiedUpi(false)}}}>{copiedUpi?'UPI ID copied ✓':'Support via UPI'}</button></div>
 <small className="footer-disclaimer">Company and job information can change. Verify details at the linked source before relying on them.</small>
</footer>
  </main>
  {selected&&<div className="detail-backdrop" onClick={()=>setSelected(null)}><div className="detail" onClick={e=>e.stopPropagation()}><button onClick={()=>setSelected(null)}>×</button><div className="eyebrow">STARTUP PROFILE</div><h2>{selected.name}</h2><p>{selected.desc}</p><div className="detail-tags"><span>{selected.sector}</span><span>{selected.area}</span><span>{selected.stage}</span><span>{selected.locationType==='headquarters'?'Kolkata HQ':selected.locationType==='registered_office'?'Registered office':selected.locationType==='kolkata_office'?'Kolkata office':'Kolkata roots'}</span></div><div className="detail-status"><b>{selected.hiring==='hiring'?'✓':selected.hiring==='not_hiring'?'✓':'?'}</b> {selected.hiring==='hiring'?'HIRING':selected.hiring==='not_hiring'?'NOT HIRING':'HIRING STATUS UNKNOWN'}</div>{selected.founder&&<p><b>Founder:</b> {selected.founder}</p>}{selected.address&&<p><b>Address:</b> {selected.address}</p>}{selected.email&&<p><b>Public email:</b> {selected.email}</p>}{selected.lastChecked&&<p className="detail-freshness">Source checked {new Date(selected.lastChecked).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>}<div className="detail-links"><a href={"/kolkata-startup-map/startup/"+selected.name.toLowerCase().trim().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"/"} className="source">Full profile →</a>{isOfficialUrl(selected.url)?<a href={selected.url} target="_blank" rel="noreferrer" className="source secondary">Official website ↗</a>:<div className="source source-disabled">Official website not verified yet</div>}{selected.linkedin&&<a href={selected.linkedin} target="_blank" rel="noreferrer" className="source secondary">LinkedIn ↗</a>}{selected.careers&&isOfficialUrl(selected.careers)&&<a href={selected.careers} target="_blank" rel="noreferrer" className="source secondary">Careers ↗</a>}</div></div></div>}
  {showSubmit&&<div className="detail-backdrop" onClick={()=>setShowSubmit(false)}><div className="detail" onClick={e=>e.stopPropagation()}><button onClick={()=>setShowSubmit(false)}>×</button><div className="eyebrow">ADD TO THE MAP</div><h2>What are you building?</h2>{submitState==='success'?<><p className="submit-success">Your startup is now live in the directory. We’ll keep verification and the exact map location separate so we don’t publish unverified details as fact.</p>{submitRef&&<p className="submit-reference">Submission reference: <b>{submitRef}</b></p>}<button className="primary" onClick={()=>{setSubmitState('idle');setSubmitRef('');setShowSubmit(false)}}>Done</button></>:<form className="submit-form" onSubmit={submitStartup}><input name="_company_website" tabIndex="-1" autoComplete="off" aria-hidden="true" className="honeypot-field" placeholder=""/><input name="startup_name" required maxLength="160" placeholder="Startup name"/><input name="website" required type="url" maxLength="500" placeholder="Website (https://…)"/><div className="form-grid"><input name="founder" maxLength="200" placeholder="Founder(s)"/><input name="email" type="email" maxLength="254" placeholder="Contact email (optional)"/><select name="sector" required defaultValue=""><option value="" disabled>Select sector</option>{['Agritech','AI & Deeptech','Climate & Sustainability','Consumer & D2C','Edtech & Education','Fintech','Food & Consumer','Healthtech & Healthcare','Industrial & Manufacturing','Marketing & Advertising','Media & Entertainment','Mobility & Logistics','Professional Services','Real Estate','SaaS & Software','Technology & Software','Travel & Tourism'].map(x=><option key={x} value={x}>{x}</option>)}</select><input name="locality" maxLength="120" placeholder="Kolkata locality / connection"/></div><input name="linkedin_url" type="url" maxLength="500" placeholder="LinkedIn URL (optional)"/><input name="careers_url" type="url" maxLength="500" placeholder="Careers URL (optional)"/><textarea name="description" rows="4" maxLength="1200" placeholder="What does the startup build? (optional)"></textarea><p className="submit-note">Submissions are published automatically after basic validation. Public-source verification and exact map location are kept separate so we do not present unverified details as fact.</p>{submitState!=='idle'&&submitState!=='sending'&&<p className="submit-error">{submitState}</p>}<button className="primary" disabled={submitState==='sending'}>{submitState==='sending'?'Submitting…':'Submit startup'}</button></form>}</div></div>}
 </div>
}

class AppErrorBoundary extends Component{
 constructor(props){super(props);this.state={hasError:false}}
 static getDerivedStateFromError(){return {hasError:true}}
 componentDidCatch(error){console.error('Kolkata Startup Map error',error)}
 render(){return this.state.hasError?<div className="app-error"><div><b>Something went wrong.</b><p>The map could not finish loading. Refresh the page to try again.</p><button onClick={()=>window.location.reload()}>Refresh</button></div></div>:this.props.children}
}
export default function AppRoot(){return <AppErrorBoundary><App/></AppErrorBoundary>}