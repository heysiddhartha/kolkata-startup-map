const startups = [
  {name:'Arohan Financial Services',area:'Salt Lake',sector:'Fintech',stage:'Growth',lat:22.5746,lng:88.4312,verified:true,desc:'NBFC-microfinance institution headquartered in Kolkata.',url:'https://www.arohan.in/'},
  {name:'Assessli',area:'Salt Lake',sector:'Edtech',stage:'Early',lat:22.5798,lng:88.4178,verified:true,desc:'AI-driven assessment platform headquartered in Kolkata.',url:'https://echai.ventures/kolkata'},
  {name:'Data Sutram',area:'Jodhpur Park',sector:'AI',stage:'Growth',lat:22.5118,lng:88.3594,verified:true,desc:'AI and alternative-data platform for risk, site selection and analytics.',url:'https://echai.ventures/kolkata'},
  {name:'Mihup',area:'Rajarhat',sector:'AI',stage:'Growth',lat:22.6208,lng:88.4522,verified:true,desc:'Conversational intelligence and voice-AI platform.',url:'https://mihup.com/'},
  {name:'Nestasia',area:'New Town',sector:'D2C',stage:'Growth',lat:22.5859,lng:88.4791,verified:true,desc:'Home decor and lifestyle commerce brand headquartered in Kolkata.',url:'https://www.nestasia.in/'},
  {name:'StockEdge',area:'Ballygunge',sector:'Fintech',stage:'Growth',lat:22.5267,lng:88.3665,verified:true,desc:'Financial-market analytics and research platform.',url:'https://stockedge.com/'},
  {name:'KloudMate',area:'Salt Lake',sector:'SaaS',stage:'Early',lat:22.5842,lng:88.4175,verified:true,desc:'Cloud observability platform for developers.',url:'https://www.kloudmate.com/'},
  {name:'Asanify',area:'Ballygunge',sector:'Enterprise Tech',stage:'Early',lat:22.5207,lng:88.3625,verified:true,desc:'HR, payroll and compliance technology for growing businesses.',url:'https://asanify.com/'},
  {name:'TagMango',area:'Salt Lake',sector:'Media',stage:'Early',lat:22.5811,lng:88.4239,verified:true,desc:'Creator economy and community platform.',url:'https://tagmango.com/'},
  {name:'SastaSundar',area:'New Town',sector:'Healthtech',stage:'Growth',lat:22.5936,lng:88.4761,verified:true,desc:'Digital health and pharmacy platform.',url:'https://www.sastasundar.com/'},
  {name:'Taxmantra',area:'Salt Lake',sector:'Fintech',stage:'Growth',lat:22.5865,lng:88.4178,verified:true,desc:'Tax, legal, compliance and fundraising advisory platform.',url:'https://echai.ventures/kolkata'},
  {name:'Nandi Mechatronics',area:'Salt Lake',sector:'Deeptech',stage:'Early',lat:22.5805,lng:88.4205,verified:true,desc:'Robotics simulation and mechatronics technology.',url:'https://echai.ventures/kolkata'},
  {name:'Senrysa Technologies',area:'Salt Lake',sector:'Fintech',stage:'Early',lat:22.5831,lng:88.4210,verified:true,desc:'B2B fintech and retail-tech solutions.',url:'https://echai.ventures/kolkata'},
  {name:'TABLT Pharmacy',area:'New Town',sector:'Healthtech',stage:'Growth',lat:22.5985,lng:88.4742,verified:true,desc:'Omnichannel pharmacy platform with an Eastern India footprint.',url:'https://echai.ventures/kolkata'},
  {name:'Teabox',area:'Salt Lake',sector:'Ecommerce',stage:'Growth',lat:22.5850,lng:88.4200,verified:true,desc:'Premium tea commerce brand with West Bengal roots.',url:'https://echai.ventures/kolkata'},
  {name:'The Gift Studio',area:'Ballygunge',sector:'Ecommerce',stage:'Growth',lat:22.5275,lng:88.3650,verified:true,desc:'Customized gifting and corporate gifting brand.',url:'https://echai.ventures/kolkata'},
  {name:'Truckhall',area:'Salt Lake',sector:'Logistics',stage:'Early',lat:22.5758,lng:88.4315,verified:true,desc:'Logistics marketplace connecting transporters and fleet owners.',url:'https://echai.ventures/kolkata'},
  {name:'Sumosave',area:'Salt Lake',sector:'Foodtech',stage:'Early',lat:22.5790,lng:88.4250,verified:true,desc:'Food retail and value retail venture.',url:'https://echai.ventures/kolkata'},
  {name:'KLiKK',area:'Park Street',sector:'Media',stage:'Growth',lat:22.5530,lng:88.3510,verified:true,desc:'Bengali-language OTT streaming platform.',url:'https://echai.ventures/kolkata'},
  {name:'SVF Entertainment',area:'Park Street',sector:'Media',stage:'Established',lat:22.5532,lng:88.3516,verified:true,desc:'Bengali film, entertainment and new-media company.',url:'https://echai.ventures/kolkata'},
  {name:'Miss Chase',area:'Ballygunge',sector:'D2C',stage:'Growth',lat:22.5280,lng:88.3660,verified:true,desc:'Women’s fashion brand headquartered in Kolkata.',url:'https://echai.ventures/kolkata'},
  {name:'Mio Amore',area:'Park Street',sector:'Foodtech',stage:'Established',lat:22.5520,lng:88.3520,verified:true,desc:'Bakery and confectionery brand headquartered in Kolkata.',url:'https://echai.ventures/kolkata'},
  {name:'Delta Autocorp',area:'New Town',sector:'Logistics',stage:'Growth',lat:22.5850,lng:88.4780,verified:true,desc:'Electric mobility manufacturer behind Deltic vehicles.',url:'https://echai.ventures/kolkata'},
  {name:'Babsa',area:'Salt Lake',sector:'SaaS',stage:'Early',lat:22.5818,lng:88.4190,verified:true,desc:'SaaS product targeting Indian small businesses.',url:'https://echai.ventures/kolkata'},
  {name:'Little Laureates',area:'Ballygunge',sector:'Edtech',stage:'Growth',lat:22.5260,lng:88.3660,verified:true,desc:'Early-childhood education platform and preschool network.',url:'https://echai.ventures/kolkata'},
  {name:'Scoopski',area:'South Kolkata',sector:'Foodtech',stage:'Early',lat:22.5155,lng:88.3620,verified:true,desc:'Artisanal ice-cream and dessert brand.',url:'https://echai.ventures/kolkata'},
  {name:'Xempla',area:'New Town',sector:'SaaS',stage:'Early',lat:22.5768,lng:88.4755,verified:false,desc:'Decision-support software for enterprise asset management.',url:'https://www.xempla.io/'},
  {name:'Wow! Momo',area:'Park Street',sector:'Foodtech',stage:'Growth',lat:22.5533,lng:88.3518,verified:false,desc:'Indian QSR and food brand.',url:'https://www.wowmomo.com/'},
  {name:'Indus Net Technologies',area:'Sector V',sector:'Enterprise Tech',stage:'Established',lat:22.5740,lng:88.4337,verified:false,desc:'Digital transformation and technology services.',url:'https://www.indusnet.co.in/'}
];

const jobs = [
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

const map = L.map('map',{zoomControl:false}).setView([22.5726,88.3639],11);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(map);

const layer = L.layerGroup().addTo(map);
const markers = new Map();
const icon = () => L.divIcon({className:'',html:'<div class="marker" aria-hidden="true">•</div>',iconSize:[28,28],iconAnchor:[14,14]});
const escapeHtml = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

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
document.getElementById('submitForm').addEventListener('submit',e=>{
  e.preventDefault();
  e.currentTarget.classList.add('hidden');
  document.getElementById('thanks').classList.remove('hidden');
});
