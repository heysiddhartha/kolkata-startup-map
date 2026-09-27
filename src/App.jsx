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

function App(){
 const [startups,setStartups]=useState(seedStartups),[jobs,setJobs]=useState(seedJobs),[dataSource,setDataSource]=useState('seed'),[dataLoading,setDataLoading]=useState(true),[dataError,setDataError]=useState(''),[newsError,setNewsError]=useState('')
 const [theme,setTheme]=useState(localStorage.getItem('ksm-theme')||'light')
 const [view,setView]=useState('map'),[query,setQuery]=useState(''),[area,setArea]=useState(''),[sector,setSector]=useState(''),[stage,setStage]=useState(''),[hiring,setHiring]=useState(''),[selected,setSelected]=useState(null)
 const [showSubmit,setShowSubmit]=useState(false),[submitState,setSubmitState]=useState('idle'),[jobMode,setJobMode]=useState(''),[jobType,setJobType]=useState(''),[news,setNews]=useState(seedNewsItems),[newsPage,setNewsPage]=useState(0),[copiedUpi,setCopiedUpi]=useState(false)
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('ksm-theme',theme)},[theme])
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const q=params.get('q');if(q)setQuery(q)},[])
 useEffect(()=>{
   const SUPABASE_URL='https://rkzkpwaexadlwxqdfjlm.supabase.co'
   const SUPABASE_KEY='sb_publishable_V7WzcNGV2x4J1OlDrepTnw_1sMgFz43'
   const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}
   const loadDirectory=async()=>{
     try{
       const [sr,jr]=await Promise.all([
         fetch(SUPABASE_URL+'/rest/v1/startups?select=name,area,sector,stage,lat,lng,verified,description,website,linkedin_url,public_email,address,founder,careers_url,hiring_status,hiring_source_url,location_type,last_checked_at&status=eq.approved&order=name',{headers}),
         fetch(SUPABASE_URL+'/rest/v1/jobs?select=title,location,mode,employment_type,fresher,apply_url,source_url,startups(name)&status=eq.live&order=created_at.desc',{headers})
       ])
       if(!sr.ok||!jr.ok)throw new Error('Live directory could not be reached')
       const [s,j]=await Promise.all([sr.json(),jr.json()])
       const normalizeStartup=x=>({name:x.name,area:x.area||'Kolkata',sector:x.sector||'Other',stage:x.stage||'Unknown',lat:x.lat||22.5726,lng:x.lng||88.3639,verified:!!x.verified,desc:x.description||'',url:safeUrl(x.website||''),linkedin:x.linkedin_url||'',email:x.public_email||'',address:x.address||'',founder:x.founder||'',careers:x.careers_url||'',hiring:x.hiring_status||'unknown',hiringSource:x.hiring_source_url||'',locationType:x.location_type||'headquarters',lastChecked:x.last_checked_at||''})
       const normalizeJob=x=>({company:x.startups?.name||'',title:x.title,mode:x.mode||x.location||'Kolkata',type:x.employment_type||'Full-time',freshers:!!x.fresher,url:safeUrl(x.apply_url||x.source_url||'#')})
       setStartups(s?.length?s.map(normalizeStartup):seedStartups)
       setJobs((j||[]).map(normalizeJob))
       setDataSource('live')
     }catch(err){setDataError(err.message||'Live directory unavailable')}
     finally{setDataLoading(false)}
     try{
       const nr=await fetch(SUPABASE_URL+'/rest/v1/news_items?select=id,title,category,summary,source_name,source_url,published_at,verified&status=eq.published&order=published_at.desc&limit=30',{headers})
       if(!nr.ok)throw new Error('News feed unavailable')
       const n=await nr.json()
       setNews(n?.length?(n||[]).map(x=>({cat:x.category,date:x.published_at?new Date(x.published_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'',title:x.title,summary:x.summary||'',source:x.source_name,url:sourceUrl(x.source_url),verified:!!x.verified})):seedNewsItems)
       setNewsPage(0)
       setNewsError('')
     }catch(err){setNewsError(err.message||'News feed unavailable')}
   }
   loadDirectory()
 },[])
 const sectors=[...new Set(startups.map(s=>s.sector))].sort(),areas=[...new Set(startups.map(s=>s.area))].sort(),stages=[...new Set(startups.map(s=>s.stage))].sort()
 const isOfficialUrl=url=>{if(!url||url==='#')return false;try{const h=new URL(url).hostname.toLowerCase();return !h.includes('echai.ventures')&&!h.includes('echai')&&!h.includes('crunchbase.com')&&!h.includes('tracxn.com')&&!h.includes('yourstory.com')&&!h.includes('inc42.com')}catch{return false}}
 const safeUrl=url=>isOfficialUrl(url)?url:'#'
 const sourceUrl=url=>{if(!url||url==='#')return '#';try{return /^https?:$/.test(new URL(url).protocol)?url:'#'}catch{return '#'}}
 const companyLogoUrl=url=>{
   try{
     const host=new URL(url).hostname.replace(/^www\\./,'')
     return host?`https://www.google.com/s2/favicons?domain=${host}&sz=128`:'' 
   }catch{return ''}
 }
 const companyIcon=s=>{
   const logo=companyLogoUrl(s.url)
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
 const filtered=useMemo(()=>startups.filter(s=>{const hay=(s.name+' '+s.sector+' '+s.area+' '+s.stage+' '+s.desc).toLowerCase();const js=companyJobs(s.name);return (!query||hay.includes(query.toLowerCase()))&&(!area||s.area===area)&&(!sector||s.sector===sector)&&(!stage||s.stage===stage)&&(!hiring||(hiring==='hiring'&&((s.hiring||'unknown')==='hiring'))||(hiring==='freshers'&&js.some(j=>j.freshers)))}),[query,area,sector,stage,hiring])
 const clear=()=>{setQuery('');setArea('');setSector('');setStage('');setHiring('');setJobMode('');setJobType('')}
 const visibleJobs=useMemo(()=>jobs.filter(j=>(!jobMode||j.mode===jobMode)&&(!jobType||j.type===jobType)),[jobMode,jobType])
 useEffect(()=>{const onKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.querySelector('.search input')?.focus()}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
 const submitStartup=async e=>{
   e.preventDefault();setSubmitState('sending')
   const f=new FormData(e.currentTarget);const payload=Object.fromEntries(f.entries())
   try{
     const res=await fetch('https://rkzkpwaexadlwxqdfjlm.supabase.co/functions/v1/submit-startup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
     const data=await res.json()
     if(!res.ok)throw new Error(data.error||'Could not submit')
     setSubmitState('success');e.currentTarget.reset()
   }catch(err){setSubmitState(err.message||'Could not submit')}
 }
 return <div className="app">
  <header className="topbar"><div className="brand"><span className="brand-mark">K</span><div><b>Kolkata Startup Map</b></div></div><nav><button onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?'☀':'◐'}</button><button onClick={()=>setShowSubmit(true)} className="add">Add startup <b>+</b></button><a href="#jobs">Jobs <strong>{jobs.length}</strong></a></nav></header>
  <main>
   <section className="hero"><div className="hero-copy"><div className="eyebrow"><i/> KOLKATA · STARTUP & COMPANY ECOSYSTEM</div><h1>Find what’s being built<br/><em>in Kolkata.</em></h1><p>Startups, companies, agencies, sectors and live hiring signals — in one map.</p>{dataSource==='live'&&<small className="live-badge">LIVE DIRECTORY</small>}</div><div className="stats"><div><b>{startups.length}</b><span>listings</span></div><div><b>{jobs.length}</b><span>open roles</span></div><div><b>{sectors.length}</b><span>sectors</span></div></div></section>
   {dataError&&<div className="data-notice" role="status"><b>Using cached directory data.</b> Live company/job updates are temporarily unavailable. <button onClick={()=>window.location.reload()}>Retry</button></div>}{newsError&&<div className="data-notice" role="status"><b>News feed temporarily unavailable.</b> Showing the last available news set.</div>}
   <section className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search companies, sectors, founders…"/><kbd>⌘ K</kbd></div><div className="toggle"><button className={view==='map'?'active':''} onClick={()=>setView('map')}>Map</button><button className={view==='grid'?'active':''} onClick={()=>setView('grid')}>Grid</button></div><select value={area} onChange={e=>setArea(e.target.value)}><option value="">All areas</option>{areas.map(x=><option key={x}>{x}</option>)}</select><select value={sector} onChange={e=>setSector(e.target.value)}><option value="">All sectors</option>{sectors.map(x=><option key={x}>{x}</option>)}</select><select value={stage} onChange={e=>setStage(e.target.value)}><option value="">All stages</option>{stages.map(x=><option key={x}>{x}</option>)}</select><select value={hiring} onChange={e=>setHiring(e.target.value)}><option value="">Hiring status</option><option value="hiring">Hiring now</option><option value="freshers">Fresher friendly</option></select></section>
   <section className="content">{view==='map'?<><MapContainer center={center} zoom={12} minZoom={11} maxZoom={18} maxBounds={bounds} maxBoundsViscosity={1} scrollWheelZoom zoomControl={false} className="map"><TileLayer url={mapTileUrl} attribution={mapAttribution} maxZoom={20} subdomains="abcd"/>{filtered.map(s=><Marker key={s.name} position={[Number(s.lat)||22.5726,Number(s.lng)||88.3639]} icon={companyIcon(s)} eventHandlers={{click:()=>setSelected(s)}}><Popup><b>{s.name}</b><br/>{s.sector} · {s.area}<br/><span>{s.desc}</span><br/>{isOfficialUrl(s.url)?<a href={s.url} target="_blank" rel="noreferrer">Open official website →</a>:<span>No verified website link</span>}</Popup></Marker>)}<ThemeMap/></MapContainer>
{view==='map'&&<aside className="news-panel">
 <div className="news-head"><div><b>Latest news</b><span>Kolkata startup ecosystem</span></div><button onClick={()=>setNewsPage(0)} aria-label="Reset news">×</button></div>
 <div className="news-list">{news.slice(newsPage*5,newsPage*5+5).map(item=><a className="news-item" key={item.title} href={item.url} target="_blank" rel="noreferrer"><h4>{item.title}</h4>{item.summary&&<p>{item.summary}</p>}<div><span className="news-source">{item.source}</span><span>{item.date}</span><span className="news-cat">{item.cat}</span></div></a>)}</div>
 <div className="news-foot"><span>{newsPage*5+1}–{Math.min(newsPage*5+5,news.length)} of {news.length}</span><button disabled={newsPage===0} onClick={()=>setNewsPage(p=>p-1)}>Prev</button><button disabled={(newsPage+1)*5>=news.length} onClick={()=>setNewsPage(p=>p+1)}>Next</button></div>
</aside>}<aside className="side"><div className="side-head"><b>{filtered.length}</b> listings <button onClick={clear}>Clear</button></div>{dataLoading?<div className="empty-state"><b>Loading the directory…</b><span>Pulling the latest company and hiring data.</span></div>:filtered.length===0?<div className="empty-state"><b>No companies match these filters.</b><span>Try clearing a filter or searching for another company.</span><button onClick={clear}>Reset filters</button></div>:filtered.map(s=><article className="card" key={s.name} onClick={()=>setSelected(s)}><h3>{s.name}{s.verified&&<span className="verified-mark" title="Verified from public sources" aria-label="Verified">✓</span>}</h3>{s.hiring==='hiring'&&<div className="company-status status-hiring"><span>✓</span> HIRING NOW</div>}{s.hiring==='not_hiring'&&<div className="company-status status-not-hiring"><span>✓</span> NOT HIRING</div>}<p>{s.desc}</p><div className="company-meta">{s.sector} · {s.area} · {s.stage}</div><div className="company-links">{s.url&&s.url!=='#'&&<a href={s.url} target="_blank" rel="noreferrer">Website</a>}{s.linkedin&&<a href={s.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}{s.email&&<a href={'mailto:'+s.email}>Email</a>}</div>{s.address&&<div className="company-address">{s.address}</div>}{s.lastChecked&&<div className="company-address">Source checked {new Date(s.lastChecked).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>}</article>)}</aside></>:<div className="grid">{dataLoading?<div className="empty-state"><b>Loading the directory…</b><span>Pulling the latest company and hiring data.</span></div>:filtered.length===0?<div className="empty-state"><b>No companies match these filters.</b><span>Try clearing a filter or searching for another company.</span><button onClick={clear}>Reset filters</button></div>:filtered.map(s=><article className="grid-card" key={s.name} onClick={()=>setSelected(s)}><h3>{s.name}</h3><p>{s.desc}</p><small>{s.sector} · {s.area} · {s.stage}</small></article>)}</div>}</section>
   <section id="jobs" className="jobs"><div className="jobs-head"><div><h2>Hiring in the ecosystem</h2><p>Public-source job signals attached to the directory.</p></div><div className="job-filters"><select value={jobMode} onChange={e=>setJobMode(e.target.value)}><option value="">All work modes</option>{[...new Set(jobs.map(j=>j.mode))].map(x=><option key={x}>{x}</option>)}</select><select value={jobType} onChange={e=>setJobType(e.target.value)}><option value="">All job types</option>{[...new Set(jobs.map(j=>j.type))].map(x=><option key={x}>{x}</option>)}</select></div></div><div className="job-list">{visibleJobs.map(j=>j.url&&j.url!=='#'?<a className="job" key={j.company+j.title} href={j.url} target="_blank" rel="noreferrer"><div><b>{j.title}</b><span>{j.company} · {j.mode}</span></div><em>{j.freshers?'Fresher':'Open'} →</em></a>:<div className="job job-disabled" key={j.company+j.title}><div><b>{j.title}</b><span>{j.company} · {j.mode}</span></div><em>Source unavailable</em></div>)}</div></section>

   <section id="ecosystem" className="ecosystem">
    <div className="ecosystem-head">
      <div><div className="eyebrow"><i/> KOLKATA STARTUP PULSE</div><h2>News, funding, cohorts & events</h2><p>Curated public-source signals from Kolkata and the wider West Bengal startup ecosystem.</p></div>
      <a href="https://iimcip.org/news-event/news/" target="_blank" rel="noreferrer">Follow ecosystem sources →</a>
    </div>
    <div className="ecosystem-grid">
      {ecosystemItems.map(item=><a className="ecosystem-card" key={item.title} href={item.url} target="_blank" rel="noreferrer">
        <div className="ecosystem-meta"><span>{item.category}</span><time>{item.date}</time></div>
        <h3>{item.title}</h3><p>{item.text}</p><small>{item.source} ↗</small>
      </a>)}
    </div>
    <div className="ecosystem-note"><b>This is a curated pulse, not an exhaustive news feed.</b><span>We’ll keep expanding it across funding, accelerators, grants, demo days, meetups, founder programmes and startup policy.</span></div>
   </section>

   <footer className="site-footer"><div><b>Kolkata Startup Map</b><span>Public-source directory of Kolkata companies, startups and hiring signals.</span></div><div className="footer-links"><a href="#jobs">Jobs</a><a href="/kolkata-startup-map/startups/">Directory</a><a href="#ecosystem">Ecosystem</a><a href="/kolkata-startup-map/privacy.html">Privacy</a></div><small>Company and job information can change. Verify details at the linked source before relying on them.</small><div className="creator-credit"><span>Built and maintained by</span><a href="https://www.linkedin.com/in/heysiddhartha/" target="_blank" rel="noreferrer">Siddhartha Sarkar ↗</a><button type="button" className="support-link" onClick={async()=>{try{await navigator.clipboard.writeText('7047731824@superyes');setCopiedUpi(true);setTimeout(()=>setCopiedUpi(false),2200)}catch{setCopiedUpi(false)}}}>{copiedUpi?'UPI ID copied ✓':'Support via UPI'}</button></div></footer>
  </main>
  {selected&&<div className="detail-backdrop" onClick={()=>setSelected(null)}><div className="detail" onClick={e=>e.stopPropagation()}><button onClick={()=>setSelected(null)}>×</button><div className="eyebrow">STARTUP PROFILE</div><h2>{selected.name}</h2><p>{selected.desc}</p><div className="detail-tags"><span>{selected.sector}</span><span>{selected.area}</span><span>{selected.stage}</span><span>{selected.locationType==='headquarters'?'Kolkata HQ':selected.locationType==='registered_office'?'Registered office':selected.locationType==='kolkata_office'?'Kolkata office':'Kolkata roots'}</span></div><div className="detail-status"><b>{selected.hiring==='hiring'?'✓':selected.hiring==='not_hiring'?'✓':'?'}</b> {selected.hiring==='hiring'?'HIRING':selected.hiring==='not_hiring'?'NOT HIRING':'HIRING STATUS UNKNOWN'}</div>{selected.founder&&<p><b>Founder:</b> {selected.founder}</p>}{selected.address&&<p><b>Address:</b> {selected.address}</p>}{selected.email&&<p><b>Public email:</b> {selected.email}</p>}{selected.lastChecked&&<p className="detail-freshness">Source checked {new Date(selected.lastChecked).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>}<div className="detail-links">{isOfficialUrl(selected.url)?<a href={selected.url} target="_blank" rel="noreferrer" className="source">Official website →</a>:<div className="source source-disabled">Official website not verified yet</div>}{selected.linkedin&&<a href={selected.linkedin} target="_blank" rel="noreferrer" className="source secondary">LinkedIn →</a>}{selected.careers&&isOfficialUrl(selected.careers)&&<a href={selected.careers} target="_blank" rel="noreferrer" className="source secondary">Careers →</a>}</div></div></div>}
  {showSubmit&&<div className="detail-backdrop" onClick={()=>setShowSubmit(false)}><div className="detail" onClick={e=>e.stopPropagation()}><button onClick={()=>setShowSubmit(false)}>×</button><div className="eyebrow">ADD TO THE MAP</div><h2>What are you building?</h2>{submitState==='success'?<><p className="submit-success">Submitted. We’ll review it before it appears on the map.</p><button className="primary" onClick={()=>{setSubmitState('idle');setShowSubmit(false)}}>Done</button></>:<form className="submit-form" onSubmit={submitStartup}><input name="startup_name" required placeholder="Startup name"/><input name="website" required type="url" placeholder="Website"/><div className="form-grid"><input name="founder" placeholder="Founder(s)"/><input name="email" type="email" placeholder="Contact email"/><input name="sector" placeholder="Sector"/><input name="locality" placeholder="Kolkata locality"/></div><input name="linkedin_url" type="url" placeholder="LinkedIn URL"/><input name="careers_url" type="url" placeholder="Careers URL"/><textarea name="description" rows="4" placeholder="What does the startup build?"></textarea>{submitState!=='idle'&&submitState!=='sending'&&<p className="submit-error">{submitState}</p>}<button className="primary" disabled={submitState==='sending'}>{submitState==='sending'?'Submitting…':'Submit startup'}</button></form>}</div></div>}
 </div>
}

class AppErrorBoundary extends Component{
 constructor(props){super(props);this.state={hasError:false}}
 static getDerivedStateFromError(){return {hasError:true}}
 componentDidCatch(error){console.error('Kolkata Startup Map error',error)}
 render(){return this.state.hasError?<div className="app-error"><div><b>Something went wrong.</b><p>The map could not finish loading. Refresh the page to try again.</p><button onClick={()=>window.location.reload()}>Refresh</button></div></div>:this.props.children}
}
export default function AppRoot(){return <AppErrorBoundary><App/></AppErrorBoundary>}