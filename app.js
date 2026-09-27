let startups = [
  {name:'Arohan Financial Services',area:'Salt Lake',sector:'Fintech',stage:'Growth',lat:22.5746,lng:88.4312,verified:true,desc:'NBFC-microfinance institution headquartered in Kolkata.',url:'https://www.arohan.in/'},
  {name:'Assessli',area:'Salt Lake',sector:'AI / Edtech',stage:'Early',lat:22.5798,lng:88.4178,verified:true,desc:'Kolkata-based AI company building adaptive intelligence and personalized AI products.',url:'https://assessli.com/',linkedin:'https://www.linkedin.com/company/assessli',address:'ERGO Tower, Office 1704, Salt Lake Sector V, Kolkata 700091',email:'info@assessli.com'},
  {name:'Data Sutram',area:'Jodhpur Park',sector:'AI',stage:'Growth',lat:22.5118,lng:88.3594,verified:true,desc:'AI and alternative-data platform for risk, site selection and analytics.',url:'#'},
  {name:'Mihup',area:'Rajarhat',sector:'AI',stage:'Growth',lat:22.6208,lng:88.4522,verified:true,desc:'Conversational intelligence and voice-AI platform.',url:'https://mihup.com/'},
  {name:'Nestasia',area:'New Town',sector:'D2C',stage:'Growth',lat:22.5859,lng:88.4791,verified:true,desc:'Home decor and lifestyle commerce brand headquartered in Kolkata.',url:'https://www.nestasia.in/'},
  {name:'StockEdge',area:'Ballygunge',sector:'Fintech',stage:'Growth',lat:22.5267,lng:88.3665,verified:true,desc:'Financial-market analytics and research platform.',url:'https://stockedge.com/'},
  {name:'KloudMate',area:'Salt Lake',sector:'SaaS',stage:'Early',lat:22.5842,lng:88.4175,verified:true,desc:'Cloud observability platform for developers.',url:'https://www.kloudmate.com/'},
  {name:'Asanify',area:'Ballygunge',sector:'Enterprise Tech',stage:'Early',lat:22.5207,lng:88.3625,verified:true,desc:'HR, payroll and compliance technology for growing businesses.',url:'https://asanify.com/'},
  {name:'TagMango',area:'Salt Lake',sector:'Media',stage:'Early',lat:22.5811,lng:88.4239,verified:true,desc:'Creator economy and community platform.',url:'https://tagmango.com/'},
  {name:'SastaSundar',area:'New Town',sector:'Healthtech',stage:'Growth',lat:22.5936,lng:88.4761,verified:true,desc:'Digital health and pharmacy platform.',url:'https://www.sastasundar.com/'},
  {name:'Taxmantra',area:'Salt Lake',sector:'Fintech',stage:'Growth',lat:22.5865,lng:88.4178,verified:true,desc:'Tax, legal, compliance and fundraising advisory platform.',url:'#'},
  {name:'Nandi Mechatronics',area:'Salt Lake',sector:'Deeptech',stage:'Early',lat:22.5805,lng:88.4205,verified:true,desc:'Robotics simulation and mechatronics technology.',url:'#'},
  {name:'Senrysa Technologies',area:'Salt Lake',sector:'Fintech',stage:'Early',lat:22.5831,lng:88.4210,verified:true,desc:'B2B fintech and retail-tech solutions.',url:'#'},
  {name:'TABLT Pharmacy',area:'New Town',sector:'Healthtech',stage:'Growth',lat:22.5985,lng:88.4742,verified:true,desc:'Omnichannel pharmacy platform with an Eastern India footprint.',url:'#'},
  {name:'Teabox',area:'Salt Lake',sector:'Ecommerce',stage:'Growth',lat:22.5850,lng:88.4200,verified:true,desc:'Premium tea commerce brand with West Bengal roots.',url:'#'},
  {name:'The Gift Studio',area:'Ballygunge',sector:'Ecommerce',stage:'Growth',lat:22.5275,lng:88.3650,verified:true,desc:'Customized gifting and corporate gifting brand.',url:'#'},
  {name:'Truckhall',area:'Salt Lake',sector:'Logistics',stage:'Early',lat:22.5758,lng:88.4315,verified:true,desc:'Logistics marketplace connecting transporters and fleet owners.',url:'#'},
  {name:'Sumosave',area:'Salt Lake',sector:'Foodtech',stage:'Early',lat:22.5790,lng:88.4250,verified:true,desc:'Food retail and value retail venture.',url:'#'},
  {name:'KLiKK',area:'Park Street',sector:'Media',stage:'Growth',lat:22.5530,lng:88.3510,verified:true,desc:'Bengali-language OTT streaming platform.',url:'#'},
  {name:'SVF Entertainment',area:'Park Street',sector:'Media',stage:'Established',lat:22.5532,lng:88.3516,verified:true,desc:'Bengali film, entertainment and new-media company.',url:'#'},
  {name:'Miss Chase',area:'Ballygunge',sector:'D2C',stage:'Growth',lat:22.5280,lng:88.3660,verified:true,desc:'Women’s fashion brand headquartered in Kolkata.',url:'#'},
  {name:'Mio Amore',area:'Park Street',sector:'Foodtech',stage:'Established',lat:22.5520,lng:88.3520,verified:true,desc:'Bakery and confectionery brand headquartered in Kolkata.',url:'#'},
  {name:'Delta Autocorp',area:'New Town',sector:'Logistics',stage:'Growth',lat:22.5850,lng:88.4780,verified:true,desc:'Electric mobility manufacturer behind Deltic vehicles.',url:'#'},
  {name:'Babsa',area:'Salt Lake',sector:'SaaS',stage:'Early',lat:22.5818,lng:88.4190,verified:true,desc:'SaaS product targeting Indian small businesses.',url:'#'},
  {name:'Little Laureates',area:'Ballygunge',sector:'Edtech',stage:'Growth',lat:22.5260,lng:88.3660,verified:true,desc:'Early-childhood education platform and preschool network.',url:'#'},
  {name:'Scoopski',area:'South Kolkata',sector:'Foodtech',stage:'Early',lat:22.5155,lng:88.3620,verified:true,desc:'Artisanal ice-cream and dessert brand.',url:'#'},
  {name:'Xempla',area:'New Town',sector:'SaaS',stage:'Early',lat:22.5768,lng:88.4755,verified:false,desc:'Decision-support software for enterprise asset management.',url:'https://www.xempla.io/'},
  {name:'Wow! Momo',area:'Park Street',sector:'Foodtech',stage:'Growth',lat:22.5533,lng:88.3518,verified:false,desc:'Indian QSR and food brand.',url:'https://www.wowmomo.com/'},
  {name:'Indus Net Technologies',area:'Sector V',sector:'Enterprise Tech',stage:'Established',lat:22.5740,lng:88.4337,verified:false,desc:'Digital transformation and technology services.',url:'https://www.indusnet.co.in/'}
];

let jobs = [
  {company:'Dot & Key Skincare',title:'Growth Manager',mode:'Kolkata',freshers:false,source:'LinkedIn',url:'https://in.linkedin.com/jobs/startup-marketing-jobs-greater-kolkata-area'},
  {company:'Turnip Innovations',title:'Lead Generation Specialist',mode:'Greater Kolkata',freshers:false,source:'LinkedIn',url:'https://in.linkedin.com/jobs/startup-marketing-jobs-greater-kolkata-area'},
  {company:'Web Spiders',title:'Marketing Manager – AI Products & Digital Growth',mode:'Kolkata',freshers:false,source:'LinkedIn',url:'https://in.linkedin.com/jobs/startup-marketing-jobs-greater-kolkata-area'},
  {company:'Qynko',title:'Influencer Marketing Manager',mode:'Kolkata',freshers:false,source:'LinkedIn',url:'https://in.linkedin.com/jobs/startup-marketing-jobs-greater-kolkata-area'},
  {company:'Kisah',title:'Chief of Staff',mode:'Kolkata',freshers:false,source:'LinkedIn',url:'https://in.linkedin.com/jobs/startup-marketing-jobs-greater-kolkata-area'},
  {company:'GameGenesis',title:'Business Development Executive Intern',mode:'Greater Kolkata',freshers:true,source:'LinkedIn',url:'https://in.linkedin.com/jobs/startup-marketing-jobs-greater-kolkata-area'},
  {company:'YouFindGo',title:'Content & Operations Intern',mode:'New Town / Remote',freshers:true,source:'LinkedIn',url:'https://in.linkedin.com/jobs/view/%F0%9F%9A%80-we%E2%80%99re-hiring-content-operations-intern-part-time-at-youfindgo-4357445437'},
  {company:'Instainker',title:'Growth & Operations Intern',mode:'Kolkata / Remote',freshers:true,source:'LinkedIn',url:'https://in.linkedin.com/jobs/view/growth-operations-intern-at-instainker-4445533748'},
  {company:'Wazo Pulse',title:'GTM & Growth Intern',mode:'Greater Kolkata',freshers:true,source:'LinkedIn',url:'https://in.linkedin.com/jobs/view/gtm-growth-intern-at-wazo-pulse-4446255110'},
  {company:'Azymant Systems',title:'Sales & Operations Executive Intern',mode:'Greater Kolkata',freshers:true,source:'LinkedIn',url:'https://in.linkedin.com/jobs/startup-jobs-kolkata-area-india?f_EA=true'},
  {company:'Qubrid AI',title:'Junior AI Engineer',mode:'Kolkata / WFH',freshers:true,source:'LinkedIn',url:'https://in.linkedin.com/jobs/jobs-at-startup-jobs-greater-kolkata-area'},
  {company:'Portcast',title:'Data Analyst',mode:'Greater Kolkata',freshers:false,source:'LinkedIn',url:'https://in.linkedin.com/jobs/startup-marketing-jobs-greater-kolkata-area'}
];

const kolkataBounds = L.latLngBounds([22.43,88.20],[22.75,88.62]);
const map = L.map('map',{
  zoomControl:false,
  scrollWheelZoom:true,
  doubleClickZoom:true,
  touchZoom:true,
  zoomAnimation:true,
  fadeAnimation:true,
  markerZoomAnimation:true,
  zoomSnap:.25,
  zoomDelta:.5,
  wheelDebounceTime:30,
  wheelPxPerZoomLevel:90,
  minZoom:11,
  maxZoom:18,
  maxBounds:kolkataBounds,
  maxBoundsViscosity:1
}).setView([22.5726,88.3639],12);
L.control.zoom({position:'bottomright'}).addTo(map);
map.options.zoomAnimation=true;
map.options.fadeAnimation=true;

const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap contributors',
  maxZoom:19
}).addTo(map);

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
  attribution:'© OpenStreetMap contributors © CARTO',
  maxZoom:19
});

function syncMapTiles(){
  const dark=document.documentElement.dataset.theme==='dark';
  if(dark){
    if(map.hasLayer(lightTiles)) map.removeLayer(lightTiles);
    if(!map.hasLayer(darkTiles)) darkTiles.addTo(map);
  }else{
    if(map.hasLayer(darkTiles)) map.removeLayer(darkTiles);
    if(!map.hasLayer(lightTiles)) lightTiles.addTo(map);
  }
}
syncMapTiles();

const layer = L.layerGroup().addTo(map);

const vehicleLayer = L.layerGroup().addTo(map);

const vehicleRoutes = [
  {
    type:'taxi',
    route:[[22.5668,88.3512],[22.5625,88.3560],[22.5578,88.3625],[22.5525,88.3690],[22.5488,88.3755],[22.5452,88.3820]],
    duration:18000,
    delay:0
  },
  {
    type:'taxi',
    route:[[22.5752,88.3650],[22.5792,88.3728],[22.5825,88.3815],[22.5858,88.3915],[22.5890,88.4025],[22.5922,88.4140]],
    duration:22000,
    delay:6000
  },
  {
    type:'taxi',
    route:[[22.5560,88.3485],[22.5598,88.3420],[22.5640,88.3360],[22.5690,88.3310],[22.5740,88.3260]],
    duration:20000,
    delay:11000
  },
  {
    type:'tram',
    route:[[22.5697,88.3500],[22.5718,88.3550],[22.5744,88.3608],[22.5778,88.3665],[22.5810,88.3720],[22.5840,88.3780]],
    duration:26000,
    delay:3000
  }
];

function vehicleIcon(type){
  return L.divIcon({
    className:'kolkata-vehicle-icon',
    html:type==='tram'
      ? '<div class="map-tram"><span>TRAM</span><i></i><b></b></div>'
      : '<div class="map-taxi"><span>TAXI</span><i></i><b></b></div>',
    iconSize:type==='tram'?[72,30]:[44,25],
    iconAnchor:type==='tram'?[36,15]:[22,12]
  });
}
function routePoint(route,t){
  const pts=route.map(p=>L.latLng(p[0],p[1]));
  let total=0;
  const lengths=[];
  for(let i=1;i<pts.length;i++){const d=pts[i-1].distanceTo(pts[i]);lengths.push(d);total+=d;}
  let target=((t%1)+1)%1*total;
  for(let i=0;i<lengths.length;i++){
    if(target<=lengths[i]){
      const ratio=target/lengths[i];
      const a=pts[i],b=pts[i+1];
      return {
        lat:a.lat+(b.lat-a.lat)*ratio,
        lng:a.lng+(b.lng-a.lng)*ratio,
        bearing:Math.atan2(b.lng-a.lng,b.lat-a.lat)*180/Math.PI
      };
    }
    target-=lengths[i];
  }
  return {lat:pts.at(-1).lat,lng:pts.at(-1).lng,bearing:0};
}
function animateVehicle(spec){
  const marker=L.marker(spec.route[0],{
    icon:vehicleIcon(spec.type),
    interactive:false,
    keyboard:false,
    zIndexOffset:900
  }).addTo(vehicleLayer);
  const startTime=performance.now()+spec.delay;
  function frame(now){
    if(now<startTime){requestAnimationFrame(frame);return;}
    const progress=((now-startTime)%spec.duration)/spec.duration;
    const p=routePoint(spec.route,progress);
    marker.setLatLng([p.lat,p.lng]);
    const el=marker.getElement();
    if(el){
      const body=el.querySelector(spec.type==='tram'?'.map-tram':'.map-taxi');
      if(body) body.style.transform='rotate('+Math.max(-12,Math.min(12,p.bearing-90))+'deg)';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
vehicleRoutes.forEach(animateVehicle);

const markers = new Map();
const icon = () => L.divIcon({className:'',html:'<div class="marker" aria-hidden="true">•</div>',iconSize:[28,28],iconAnchor:[14,14]});
const escapeHtml = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

const themeToggle=document.getElementById('themeToggle');
const root=document.documentElement;
const savedTheme=localStorage.getItem('ksm-theme');
if(savedTheme) root.dataset.theme=savedTheme;
function syncThemeButton(){
  const dark=root.dataset.theme==='dark';
  themeToggle.textContent=dark?'☀':'◐';
  themeToggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  themeToggle.title=dark?'Light mode':'Dark mode';
}
syncThemeButton();
themeToggle.addEventListener('click',()=>{
  root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
  localStorage.setItem('ksm-theme',root.dataset.theme);
  syncThemeButton();
  syncMapTiles();
  setTimeout(()=>map.invalidateSize(),50);
});

const els={
  search:document.getElementById('search'),
  area:document.getElementById('area'),
  sector:document.getElementById('sector'),
  stage:document.getElementById('stage'),
  hiring:document.getElementById('hiring'),
  cards:document.getElementById('cards'),
  grid:document.getElementById('grid'),
  count:document.getElementById('resultCount'),
  jobTotal:document.getElementById('jobTotal')
};

function companyJobs(name){
  const needle=name.trim().toLowerCase();
  return jobs.filter(j=>{
    const company=j.company.trim().toLowerCase();
    return company===needle || company.includes(needle) || needle.includes(company);
  });
}

function hasHiringJobs(name){
  return companyJobs(name).length>0;
}

function hasFresherJobs(name){
  return companyJobs(name).some(j=>j.freshers===true);
}

function populateFilters(){
  const unique = key => [...new Set(startups.map(s=>s[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const fill = (select, values, label) => {
    const current=select.value;
    select.innerHTML='<option value="">'+label+'</option>'+values.map(v=>'<option value="'+escapeHtml(v)+'">'+escapeHtml(v)+'</option>').join('');
    if(values.includes(current)) select.value=current;
  };
  fill(els.area,unique('area'),'All areas');
  fill(els.sector,unique('sector'),'All sectors');
  fill(els.stage,unique('stage'),'All stages');
}

startups.forEach(s => {
  markers.set(
    s.name,
    L.marker([s.lat,s.lng],{icon:icon()}).bindPopup(
      '<div class="popup"><h3>'+escapeHtml(s.name)+'</h3>'+
      '<p>'+escapeHtml(s.sector)+' · '+escapeHtml(s.area)+'</p>'+
      '<p>'+escapeHtml(s.desc)+'</p>'+
      '<p>'+(
        s.verified ? '<b>Directory verified</b>' : '<b>Seed record</b>'
      )+'</p>'+
      (hasHiringJobs(s.name) ? '<p><b>'+companyJobs(s.name).length+' sourced job'+(companyJobs(s.name).length>1?'s':'')+' available</b></p>' : '')+
      '<a href="'+s.url+'" target="_blank" rel="noopener noreferrer">Source / website →</a></div>'
    )
  );
});

function filtered(){
  const q=els.search.value.trim().toLowerCase();
  const area=els.area.value;
  const sector=els.sector.value;
  const stage=els.stage.value;
  const hiring=els.hiring.value;

  return startups.filter(s=>{
    const hay=(s.name+' '+s.sector+' '+s.area+' '+s.stage+' '+s.desc).toLowerCase();
    const matchesSearch=!q || hay.includes(q);
    const matchesArea=!area || s.area===area;
    const matchesSector=!sector || s.sector===sector;
    const matchesStage=!stage || s.stage===stage;
    const matchesHiring=!hiring ||
      (hiring==='hiring' && hasHiringJobs(s.name)) ||
      (hiring==='freshers' && hasFresherJobs(s.name));

    return matchesSearch && matchesArea && matchesSector && matchesStage && matchesHiring;
  });
}

function card(s){
  const matched=companyJobs(s.name);
  const fresher=matched.some(j=>j.freshers===true);
  return '<article class="card" data-name="'+escapeHtml(s.name)+'">'+
    '<h3>'+escapeHtml(s.name)+'</h3>'+
    '<div class="meta">'+escapeHtml(s.area)+' · '+escapeHtml(s.sector)+' · '+escapeHtml(s.stage)+'</div>'+
    '<div class="tags">'+
      '<span class="tag">'+(s.verified?'Directory verified':'Seed record')+'</span>'+
      (matched.length?'<span class="tag hiring">'+matched.length+' sourced job'+(matched.length>1?'s':'')+'</span>':'')+
      (fresher?'<span class="tag hiring">Fresher friendly</span>':'')+
    '</div>'+
    '<div class="card-footer"><span>'+escapeHtml(s.desc)+'</span><a href="'+s.url+'" target="_blank" rel="noopener noreferrer">Visit →</a></div>'+
  '</article>';
}

function attachCards(root){
  root.querySelectorAll('.card[data-name]').forEach(el=>{
    el.addEventListener('click',e=>{
      if(e.target.closest('a')) return;
      const s=startups.find(x=>x.name===el.dataset.name);
      if(!s) return;
      document.getElementById('map').classList.remove('hidden');
      document.querySelector('.side').classList.remove('hidden');
      els.grid.classList.add('hidden');
      document.getElementById('mapBtn').classList.add('active');
      document.getElementById('gridBtn').classList.remove('active');
      map.setView([s.lat,s.lng],14);
      markers.get(s.name).openPopup();
    });
  });
}

function render(){
  const data=filtered();
  document.getElementById('heroCount').textContent=startups.length;
  document.getElementById('heroJobs').textContent=jobs.length;
  document.getElementById('heroSectors').textContent=new Set(startups.map(s=>s.sector).filter(Boolean)).size;
  els.count.textContent=data.length;
  els.cards.innerHTML=data.length ? data.map(card).join('') : '<div class="empty">No startups match these filters.</div>';
  els.grid.innerHTML=data.length ? data.map(card).join('') : '<div class="empty">No startups match these filters.</div>';

  layer.clearLayers();
  data.forEach(s=>markers.get(s.name).addTo(layer));

  attachCards(els.cards);
  attachCards(els.grid);
}

populateFilters();
[els.search,els.area,els.sector,els.stage,els.hiring].forEach(el=>{
  el.addEventListener('input',render);
  el.addEventListener('change',render);
});
render();

const jobsPanel=document.createElement('section');
jobsPanel.id='jobs';
jobsPanel.className='jobs-panel';
jobsPanel.innerHTML=
  '<div class="jobs-head"><div><h2>Recently sourced openings</h2>'+
  '<p>Job records are linked to their public source and should be rechecked before applying.</p></div>'+
  '<span>'+jobs.length+' records</span></div>'+
  '<div class="jobs-list">'+
  jobs.map(j=>'<article class="job"><div><h3>'+escapeHtml(j.title)+'</h3><p>'+escapeHtml(j.company)+' · '+escapeHtml(j.mode)+'</p></div>'+
  '<a href="'+j.url+'" target="_blank" rel="noopener noreferrer">View source →</a></article>').join('')+
  '</div>';
document.querySelector('main').appendChild(jobsPanel);
els.jobTotal.textContent=jobs.length;

document.getElementById('gridBtn').addEventListener('click',()=>{
  document.getElementById('map').classList.add('hidden');
  document.querySelector('.side').classList.add('hidden');
  els.grid.classList.remove('hidden');
  document.getElementById('gridBtn').classList.add('active');
  document.getElementById('mapBtn').classList.remove('active');
});

document.getElementById('mapBtn').addEventListener('click',()=>{
  document.getElementById('map').classList.remove('hidden');
  document.querySelector('.side').classList.remove('hidden');
  els.grid.classList.add('hidden');
  document.getElementById('mapBtn').classList.add('active');
  document.getElementById('gridBtn').classList.remove('active');
  setTimeout(()=>map.invalidateSize(),50);
});

document.getElementById('closeSide').addEventListener('click',()=>{
  document.querySelector('.side').classList.toggle('hidden');
});

const modal=document.getElementById('modal');
document.getElementById('submitBtn').addEventListener('click',()=>modal.classList.remove('hidden'));
document.getElementById('modalClose').addEventListener('click',()=>modal.classList.add('hidden'));
document.getElementById('submitForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const button=form.querySelector('button[type="submit"]');
  const data=Object.fromEntries(new FormData(form).entries());
  const cfg=window.KSM_CONFIG||{};
  if(!cfg.SUBMIT_FUNCTION_URL){
    button.textContent='Backend not connected';
    return;
  }
  button.disabled=true;
  button.textContent='Submitting…';
  try{
    const response=await fetch(cfg.SUBMIT_FUNCTION_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    if(!response.ok) throw new Error('Submission failed');
    form.reset();
    form.classList.add('hidden');
    document.getElementById('thanks').textContent='Thanks — your startup has been submitted for review.';
    document.getElementById('thanks').classList.remove('hidden');
  }catch(err){
    button.disabled=false;
    button.textContent='Submit for review';
    alert('Could not submit right now. Please try again.');
  }
});

async function loadBackendData(){
  const cfg=window.KSM_CONFIG||{};
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY) return;
  const headers={apikey:cfg.SUPABASE_ANON_KEY,Authorization:'Bearer '+cfg.SUPABASE_ANON_KEY};
  try{
    const [startupRes,jobRes]=await Promise.all([
      fetch(cfg.SUPABASE_URL+'/rest/v1/startups?select=*&status=eq.approved&order=name',{headers}),
      fetch(cfg.SUPABASE_URL+'/rest/v1/jobs?select=*&status=eq.live&order=created_at.desc',{headers})
    ]);
    if(!startupRes.ok||!jobRes.ok) throw new Error('Backend request failed');
    const liveStartups=await startupRes.json();
    const liveJobs=await jobRes.json();
    if(Array.isArray(liveStartups)&&liveStartups.length){
      startups=liveStartups.map(s=>({
        id:s.id,name:s.name,area:s.area||'Kolkata',sector:s.sector||'Other',stage:s.stage||'Unknown',
        lat:Number(s.lat)||22.5726,lng:Number(s.lng)||88.3639,verified:!!s.verified,
        desc:s.description||'Kolkata startup',url:s.website||s.source_url||'#'
      }));
    }
    if(Array.isArray(liveJobs)){
      const byId=new Map(startups.map(s=>[s.name.toLowerCase(),s.name]));
      jobs=liveJobs.map(j=>{
        const startup=startups.find(s=>s.id===j.startup_id)||null;
        return {company:startup?startup.name:'',title:j.title,mode:j.location||j.mode||'Kolkata',
          freshers:!!j.fresher,source:'Official career page',url:j.apply_url};
      }).filter(j=>j.company);
    }
    markers.clear();
    layer.clearLayers();
    startups.forEach(s=>{
      markers.set(s.name,L.marker([s.lat,s.lng],{icon:icon()}).bindPopup(
        '<div class="popup"><h3>'+escapeHtml(s.name)+'</h3>'+
        '<p>'+escapeHtml(s.sector)+' · '+escapeHtml(s.area)+'</p>'+
        '<p>'+escapeHtml(s.desc)+'</p>'+
        '<p>'+(s.verified?'<b>Directory verified</b>':'<b>Seed record</b>')+'</p>'+
        (hasHiringJobs(s.name)?'<p><b>'+companyJobs(s.name).length+' live job'+(companyJobs(s.name).length>1?'s':'')+' found</b></p>':'')+
        '<a href="'+s.url+'" target="_blank" rel="noopener noreferrer">Website →</a></div>'
      ));
    });
    populateFilters();
    render();
    updateJobsPanel();
    document.getElementById('dataStatus').textContent='live database · jobs checked automatically';
  }catch(err){
    console.warn('Backend unavailable; using local seed data.',err);
  }
}

function updateJobsPanel(){
  jobsPanel.innerHTML=
    '<div class="jobs-head"><div><h2>Recently sourced openings</h2>'+
    '<p>Official-source jobs are rechecked automatically. Stale records are retained for history.</p></div>'+
    '<span>'+jobs.length+' live records</span></div>'+
    '<div class="jobs-list">'+
    jobs.map(j=>'<article class="job"><div><h3>'+escapeHtml(j.title)+'</h3><p>'+escapeHtml(j.company)+' · '+escapeHtml(j.mode)+'</p></div>'+
    '<a href="'+j.url+'" target="_blank" rel="noopener noreferrer">Apply / source →</a></article>').join('')+
    '</div>';
  els.jobTotal.textContent=jobs.length;
}

loadBackendData();
