import {useEffect,useMemo,useState} from 'react'
import {MapContainer,TileLayer,Marker,Popup,useMap} from 'react-leaflet'
import L from 'leaflet'
import {startups,jobs} from './data'

const bounds=[[22.43,88.20],[22.75,88.62]]
const center=[22.5726,88.3639]

const markerIcon=L.divIcon({className:'',html:'<div class="startup-marker">•</div>',iconSize:[28,28],iconAnchor:[14,14]})
const taxiIcon=L.icon({
  iconUrl:'https://cdn.80.lv/api/upload/content/45/images/65b10493bcf73/widen_1840x0.jpeg',
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
 const [theme,setTheme]=useState(localStorage.getItem('ksm-theme')||'light')
 const [view,setView]=useState('map'),[query,setQuery]=useState(''),[area,setArea]=useState(''),[sector,setSector]=useState(''),[stage,setStage]=useState(''),[hiring,setHiring]=useState(''),[selected,setSelected]=useState(null)
 const [showSubmit,setShowSubmit]=useState(false)
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('ksm-theme',theme)},[theme])
 const sectors=[...new Set(startups.map(s=>s.sector))].sort(),areas=[...new Set(startups.map(s=>s.area))].sort(),stages=[...new Set(startups.map(s=>s.stage))].sort()
 const companyJobs=name=>jobs.filter(j=>j.company.toLowerCase()===name.toLowerCase())
 const filtered=useMemo(()=>startups.filter(s=>{const hay=(s.name+' '+s.sector+' '+s.area+' '+s.stage+' '+s.desc).toLowerCase();const js=companyJobs(s.name);return (!query||hay.includes(query.toLowerCase()))&&(!area||s.area===area)&&(!sector||s.sector===sector)&&(!stage||s.stage===stage)&&(!hiring||(hiring==='hiring'&&js.length)||(hiring==='freshers'&&js.some(j=>j.freshers)))}),[query,area,sector,stage,hiring])
 const clear=()=>{setQuery('');setArea('');setSector('');setStage('');setHiring('')}
 return <div className="app">
  <header className="topbar"><div className="brand"><span className="brand-mark">K</span><div><b>Kolkata Startup Map</b></div></div><nav><button onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?'☀':'◐'}</button><button onClick={()=>setShowSubmit(true)} className="add">Add startup <b>+</b></button><a href="#jobs">Jobs <strong>{jobs.length}</strong></a></nav></header>
  <main>
   <section className="hero"><div><div className="eyebrow"><i/> কলকাতা · KOLKATA · STARTUP ECOSYSTEM</div><h1>Find what’s being built<br/><em>in Kolkata.</em></h1><p>Startups, sectors, locations and live hiring signals — in one map.</p></div><div className="stats"><div><b>{startups.length}</b><span>startups</span></div><div><b>{jobs.length}</b><span>job signals</span></div><div><b>{sectors.length}</b><span>sectors</span></div></div></section>
   <section className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search startups, sectors, founders…"/><kbd>⌘ K</kbd></div><div className="toggle"><button className={view==='map'?'active':''} onClick={()=>setView('map')}>Map</button><button className={view==='grid'?'active':''} onClick={()=>setView('grid')}>Grid</button></div><select value={area} onChange={e=>setArea(e.target.value)}><option value="">All areas</option>{areas.map(x=><option key={x}>{x}</option>)}</select><select value={sector} onChange={e=>setSector(e.target.value)}><option value="">All sectors</option>{sectors.map(x=><option key={x}>{x}</option>)}</select><select value={stage} onChange={e=>setStage(e.target.value)}><option value="">All stages</option>{stages.map(x=><option key={x}>{x}</option>)}</select><select value={hiring} onChange={e=>setHiring(e.target.value)}><option value="">Hiring status</option><option value="hiring">Hiring now</option><option value="freshers">Fresher friendly</option></select></section>
   <section className="content">{view==='map'?<><MapContainer center={center} zoom={12} minZoom={11} maxZoom={18} maxBounds={bounds} maxBoundsViscosity={1} scrollWheelZoom zoomControl={false} className="map"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors"/>{filtered.map(s=><Marker key={s.name} position={[s.lat,s.lng]} icon={markerIcon} eventHandlers={{click:()=>setSelected(s)}}><Popup><b>{s.name}</b><br/>{s.sector} · {s.area}<br/><span>{s.desc}</span><br/><a href={s.url} target="_blank" rel="noreferrer">Source / website →</a></Popup></Marker>)}<VehicleLayer/><ThemeMap/></MapContainer><aside className="side"><div className="side-head"><b>{filtered.length}</b> startups <button onClick={clear}>Clear</button></div>{filtered.map(s=><article className="card" key={s.name} onClick={()=>setSelected(s)}><h3>{s.name}</h3><p>{s.sector} · {s.area} · {s.stage}</p><div><span>{s.verified?'Verified':'Seed record'}</span>{companyJobs(s.name).length>0&&<span className="hire">Hiring</span>}</div></article>)}</aside></>:<div className="grid">{filtered.map(s=><article className="grid-card" key={s.name} onClick={()=>setSelected(s)}><h3>{s.name}</h3><p>{s.desc}</p><small>{s.sector} · {s.area} · {s.stage}</small></article>)}</div>}</section>
   <section id="jobs" className="jobs"><div><h2>Hiring in the ecosystem</h2><p>Public-source job signals currently attached to the directory.</p></div><div className="job-list">{jobs.map(j=><a className="job" key={j.company+j.title} href={j.url} target="_blank" rel="noreferrer"><div><b>{j.title}</b><span>{j.company} · {j.mode}</span></div><em>{j.freshers?'Fresher':'Open'} →</em></a>)}</div></section>
  </main>
  {selected&&<div className="detail-backdrop" onClick={()=>setSelected(null)}><div className="detail" onClick={e=>e.stopPropagation()}><button onClick={()=>setSelected(null)}>×</button><div className="eyebrow">STARTUP PROFILE</div><h2>{selected.name}</h2><p>{selected.desc}</p><div className="detail-tags"><span>{selected.sector}</span><span>{selected.area}</span><span>{selected.stage}</span></div><a href={selected.url} target="_blank" rel="noreferrer" className="source">Open source / website →</a></div></div>}
  {showSubmit&&<div className="detail-backdrop" onClick={()=>setShowSubmit(false)}><div className="detail" onClick={e=>e.stopPropagation()}><button onClick={()=>setShowSubmit(false)}>×</button><div className="eyebrow">ADD TO THE MAP</div><h2>What are you building?</h2><p>We'll connect this form to the Node/Supabase submission API after the migration is live.</p><button className="primary" onClick={()=>setShowSubmit(false)}>Got it</button></div></div>}
 </div>
}
export default App