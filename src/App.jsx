import {useEffect,useMemo,useState} from 'react'
import {MapContainer,TileLayer,Marker,Popup,useMap} from 'react-leaflet'
import L from 'leaflet'
import {startups as seedStartups,jobs as seedJobs} from './data'

const bounds=[[22.43,88.20],[22.75,88.62]]
const center=[22.5726,88.3639]

const markerIcon=L.divIcon({className:'',html:'<div class="startup-marker">•</div>',iconSize:[28,28],iconAnchor:[14,14]})
const taxiIcon=L.icon({
  iconUrl:'https://p1.hiclipart.com/preview/443/706/508/classic-car-hindustan-ambassador-kolkata-taxi-motor-vehicle-model-car-transport-automotive-design-png-clipart.jpg',
  iconSize:[48,34],
  iconAnchor:[24,17],
  className:'map-vehicle-image map-taxi-image'
})
const tramIcon=L.icon({
  iconUrl:'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTExL3Jhd3BpeGVsX29mZmljZV8zMV9waG90b19vZl9hX3RyYW1fc2lkZV92aWV3X2lzb2xhdGVkX3N1YmplY3RzX18wOTVhNzg1Ni05MjFkLTRiODctOWI2Zi1hYWIzYTQ0YTkwZjYucG5n.png',
  iconSize:[68,42],
  iconAnchor:[34,21],
  className:'map-vehicle-image map-tram-image'
})

const routes=[
{type:'taxi',duration:18000,route:[[22.5668,88.3512],[22.5625,88.3560],[22.5578,88.3625],[22.5525,88.3690],[22.5488,88.3755],[22.5452,88.3820]]},
{type:'taxi',duration:22000,route:[[22.5752,88.3650],[22.5792,88.3728],[22.5825,88.3815],[22.5858,88.3915],[22.5890,88.4025],[22.5922,88.4140]]},
{type:'taxi',duration:20000,route:[[22.5560,88.3485],[22.5598,88.3420],[22.5640,88.3360],[22.5690,88.3310],[22.5740,88.3260]]},
{type:'tram',duration:26000,route:[[22.5697,88.3500],[22.5718,88.3550],[22.5744,88.3608],[22.5778,88.3665],[22.5810,88.3720],[22.5840,88.3780]]}
]

function ThemeMap(){const map=useMap();useEffect(()=>{setTimeout(()=>map.invalidateSize(),50)},[]);return null}

function VehicleLayer(){
 const [vehicles,setVehicles]=useState(routes.map(r=>({lat:r.route[0][0],lng:r.route[0][1]})))
 useEffect(()=>{
   let frame
   const started=performance.now()
   const distances=routes.map(r=>{
     const pts=r.route.map(p=>L.latLng(p))
     const ds=[];let total=0
     for(let i=1;i<pts.length;i++){const d=pts[i-1].distanceTo(pts[i]);ds.push(d);total+=d}
     return {pts,ds,total}
   })
   const point=(spec,t)=>{
     const d=distances[routes.indexOf(spec)]
     let target=(t%d.total)
     for(let i=0;i<d.ds.length;i++){if(target<=d.ds[i]){const a=d.pts[i],b=d.pts[i+1],q=target/d.ds[i];return [a.lat+(b.lat-a.lat)*q,a.lng+(b.lng-a.lng)*q]}target-=d.ds[i]}
     return d.pts.at(-1)
   }
   const dists=r=>distances[routes.indexOf(r)].total
   const tick=now=>{
     setVehicles(routes.map((r,i)=>{const delay=i*4300;const elapsed=Math.max(0,now-started-delay);const p=point(r,elapsed%r.duration/r.duration*dists(r));return Array.isArray(p)?{lat:p[0],lng:p[1]}:{lat:p.lat,lng:p.lng}}))
     frame=requestAnimationFrame(tick)
   }
   frame=requestAnimationFrame(tick)
   return()=>cancelAnimationFrame(frame)
 },[])
 return <>{vehicles.map((v,i)=><Marker key={i} position={[v.lat,v.lng]} icon={routes[i].type==='tram'?tramIcon:taxiIcon} interactive={false}/>)}</>
}

function App(){
 const [startups,setStartups]=useState(seedStartups),[jobs,setJobs]=useState(seedJobs),[dataSource,setDataSource]=useState('seed')
 const [theme,setTheme]=useState(localStorage.getItem('ksm-theme')||'light')
 const [view,setView]=useState('map'),[query,setQuery]=useState(''),[area,setArea]=useState(''),[sector,setSector]=useState(''),[stage,setStage]=useState(''),[hiring,setHiring]=useState(''),[selected,setSelected]=useState(null)
 const [showSubmit,setShowSubmit]=useState(false),[submitState,setSubmitState]=useState('idle'),[jobMode,setJobMode]=useState(''),[jobType,setJobType]=useState('')
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('ksm-theme',theme)},[theme])
 useEffect(()=>{
   const SUPABASE_URL='https://rkzkpwaexadlwxqdfjlm.supabase.co'
   const SUPABASE_KEY='sb_publishable_V7WzcNGV2x4J1OlDrepTnw_1sMgFz43'
   const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}
   Promise.all([
     fetch(SUPABASE_URL+'/rest/v1/startups?select=name,area,sector,stage,lat,lng,verified,description,website,linkedin_url,public_email,address,founder,careers_url,hiring_status,hiring_source_url,location_type&status=eq.approved&order=name',{headers}).then(r=>r.ok?r.json():[]),
     fetch(SUPABASE_URL+'/rest/v1/jobs?select=title,location,mode,employment_type,fresher,apply_url,source_url,startups(name)&status=eq.live&order=created_at.desc',{headers}).then(r=>r.ok?r.json():[])
   ]).then(([s,j])=>{
     const normalizeStartup=x=>({name:x.name,area:x.area||'Kolkata',sector:x.sector||'Other',stage:x.stage||'Unknown',lat:x.lat||22.5726,lng:x.lng||88.3639,verified:!!x.verified,desc:x.description||'',url:safeUrl(x.website||''),linkedin:x.linkedin_url||'',email:x.public_email||'',address:x.address||'',founder:x.founder||'',careers:x.careers_url||'',hiring:x.hiring_status||'unknown',hiringSource:x.hiring_source_url||'',locationType:x.location_type||'headquarters'})
     const normalizeJob=x=>({company:x.startups?.name||'',title:x.title,mode:x.mode||x.location||'Kolkata',type:x.employment_type||'Full-time',freshers:!!x.fresher,url:safeUrl(x.apply_url||x.source_url||'#')})
     if(s?.length)setStartups(s.map(normalizeStartup))
     setJobs((j||[]).map(normalizeJob))
     if(s?.length||j?.length)setDataSource('live')
   }).catch(()=>{})
 },[])
 const sectors=[...new Set(startups.map(s=>s.sector))].sort(),areas=[...new Set(startups.map(s=>s.area))].sort(),stages=[...new Set(startups.map(s=>s.stage))].sort()
 const isOfficialUrl=url=>{if(!url||url==='#')return false;try{const h=new URL(url).hostname.toLowerCase();return !h.includes('echai.ventures')&&!h.includes('echai')&&!h.includes('crunchbase.com')&&!h.includes('tracxn.com')&&!h.includes('yourstory.com')&&!h.includes('inc42.com')}catch{return false}}
 const safeUrl=url=>isOfficialUrl(url)?url:'#'
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
   <section className="hero"><div className="hero-copy"><div className="eyebrow"><i/> KOLKATA · STARTUP ECOSYSTEM</div><h1>Find what’s being built<br/><em>in Kolkata.</em></h1><p>Startups, companies, agencies, sectors and live hiring signals — in one map.</p>{dataSource==='live'&&<small className="live-badge">LIVE DIRECTORY</small>}</div><div className="stats"><div><b>{startups.length}</b><span>listings</span></div><div><b>{jobs.length}</b><span>job signals</span></div><div><b>{sectors.length}</b><span>sectors</span></div></div></section>
   <section className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search startups, sectors, founders…"/><kbd>⌘ K</kbd></div><div className="toggle"><button className={view==='map'?'active':''} onClick={()=>setView('map')}>Map</button><button className={view==='grid'?'active':''} onClick={()=>setView('grid')}>Grid</button></div><select value={area} onChange={e=>setArea(e.target.value)}><option value="">All areas</option>{areas.map(x=><option key={x}>{x}</option>)}</select><select value={sector} onChange={e=>setSector(e.target.value)}><option value="">All sectors</option>{sectors.map(x=><option key={x}>{x}</option>)}</select><select value={stage} onChange={e=>setStage(e.target.value)}><option value="">All stages</option>{stages.map(x=><option key={x}>{x}</option>)}</select><select value={hiring} onChange={e=>setHiring(e.target.value)}><option value="">Hiring status</option><option value="hiring">Hiring now</option><option value="freshers">Fresher friendly</option></select></section>
   <section className="content">{view==='map'?<><MapContainer center={center} zoom={12} minZoom={11} maxZoom={18} maxBounds={bounds} maxBoundsViscosity={1} scrollWheelZoom zoomControl={false} className="map"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors"/>{filtered.map(s=><Marker key={s.name} position={[s.lat,s.lng]} icon={markerIcon} eventHandlers={{click:()=>setSelected(s)}}><Popup><b>{s.name}</b><br/>{s.sector} · {s.area}<br/><span>{s.desc}</span><br/>{isOfficialUrl(s.url)?<a href={s.url} target="_blank" rel="noreferrer">Open official website →</a>:<span>No verified website link</span>}</Popup></Marker>)}<VehicleLayer/><ThemeMap/></MapContainer><aside className="side"><div className="side-head"><b>{filtered.length}</b> listings <button onClick={clear}>Clear</button></div>{filtered.map(s=><article className="card" key={s.name} onClick={()=>setSelected(s)}><h3>{s.name}</h3>{s.hiring==='hiring'&&<div className="company-status status-hiring"><span>✓</span> HIRING NOW</div>}{s.hiring==='not_hiring'&&<div className="company-status status-not-hiring"><span>✓</span> NOT HIRING</div>}<p>{s.desc}</p><div className="company-meta">{s.sector} · {s.area} · {s.stage}</div><div className="company-links">{s.url&&s.url!=='#'&&<a href={s.url} target="_blank" rel="noreferrer">Website</a>}{s.linkedin&&<a href={s.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}{s.email&&<a href={'mailto:'+s.email}>Email</a>}</div>{s.address&&<div className="company-address">{s.address}</div>}</article>>)}</aside></>:<div className="grid">{filtered.map(s=><article className="grid-card" key={s.name} onClick={()=>setSelected(s)}><h3>{s.name}</h3><p>{s.desc}</p><small>{s.sector} · {s.area} · {s.stage}</small></article>)}</div>}</section>
   <section id="jobs" className="jobs"><div className="jobs-head"><div><h2>Hiring in the ecosystem</h2><p>Public-source job signals attached to the directory.</p></div><div className="job-filters"><select value={jobMode} onChange={e=>setJobMode(e.target.value)}><option value="">All work modes</option>{[...new Set(jobs.map(j=>j.mode))].map(x=><option key={x}>{x}</option>)}</select><select value={jobType} onChange={e=>setJobType(e.target.value)}><option value="">All job types</option>{[...new Set(jobs.map(j=>j.type))].map(x=><option key={x}>{x}</option>)}</select></div></div><div className="job-list">{visibleJobs.map(j=><a className="job" key={j.company+j.title} href={j.url} target="_blank" rel="noreferrer"><div><b>{j.title}</b><span>{j.company} · {j.mode}</span></div><em>{j.freshers?'Fresher':'Open'} →</em></a>)}</div></section>
  </main>
  {selected&&<div className="detail-backdrop" onClick={()=>setSelected(null)}><div className="detail" onClick={e=>e.stopPropagation()}><button onClick={()=>setSelected(null)}>×</button><div className="eyebrow">STARTUP PROFILE</div><h2>{selected.name}</h2><p>{selected.desc}</p><div className="detail-tags"><span>{selected.sector}</span><span>{selected.area}</span><span>{selected.stage}</span><span>{selected.locationType==='headquarters'?'Kolkata HQ':selected.locationType==='registered_office'?'Registered office':selected.locationType==='kolkata_office'?'Kolkata office':'Kolkata roots'}</span></div><div className="detail-status"><b>{selected.hiring==='hiring'?'✓':selected.hiring==='not_hiring'?'✓':'?'}</b> {selected.hiring==='hiring'?'HIRING':selected.hiring==='not_hiring'?'NOT HIRING':'HIRING STATUS UNKNOWN'}</div>{selected.founder&&<p><b>Founder:</b> {selected.founder}</p>}{selected.address&&<p><b>Address:</b> {selected.address}</p>}{selected.email&&<p><b>Public email:</b> {selected.email}</p>}<div className="detail-links">{isOfficialUrl(selected.url)?<a href={selected.url} target="_blank" rel="noreferrer" className="source">Official website →</a>:<div className="source source-disabled">Official website not verified yet</div>}{selected.linkedin&&<a href={selected.linkedin} target="_blank" rel="noreferrer" className="source secondary">LinkedIn →</a>}{selected.careers&&isOfficialUrl(selected.careers)&&<a href={selected.careers} target="_blank" rel="noreferrer" className="source secondary">Careers →</a>}</div></div></div>}
  {showSubmit&&<div className="detail-backdrop" onClick={()=>setShowSubmit(false)}><div className="detail" onClick={e=>e.stopPropagation()}><button onClick={()=>setShowSubmit(false)}>×</button><div className="eyebrow">ADD TO THE MAP</div><h2>What are you building?</h2>{submitState==='success'?<><p className="submit-success">Submitted. We’ll review it before it appears on the map.</p><button className="primary" onClick={()=>{setSubmitState('idle');setShowSubmit(false)}}>Done</button></>:<form className="submit-form" onSubmit={submitStartup}><input name="startup_name" required placeholder="Startup name"/><input name="website" required type="url" placeholder="Website"/><div className="form-grid"><input name="founder" placeholder="Founder(s)"/><input name="email" type="email" placeholder="Contact email"/><input name="sector" placeholder="Sector"/><input name="locality" placeholder="Kolkata locality"/></div><input name="linkedin_url" type="url" placeholder="LinkedIn URL"/><input name="careers_url" type="url" placeholder="Careers URL"/><textarea name="description" rows="4" placeholder="What does the startup build?"></textarea>{submitState!=='idle'&&submitState!=='sending'&&<p className="submit-error">{submitState}</p>}<button className="primary" disabled={submitState==='sending'}>{submitState==='sending'?'Submitting…':'Submit startup'}</button></form>}</div></div>}
 </div>
}
export default App