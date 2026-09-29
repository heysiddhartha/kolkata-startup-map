import fs from 'node:fs'
import path from 'node:path'
import { loadDirectoryData } from './live-data.mjs'

const { startups, jobs, news = [], resources = [], live: liveData } = await loadDirectoryData()

const root = path.resolve('dist')
const site = 'https://heysiddhartha.github.io/kolkata-startup-map'
const slug = s => String(s ?? '').toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const json = x => JSON.stringify(x).replace(/</g,'\\u003c')
const template = fs.readFileSync(path.join(root,'index.html'),'utf8')

const cleanArea = value => {
  const area = String(value || '').trim()
  return /area not specified/i.test(area) ? 'Kolkata' : area || 'Kolkata'
}
const cleanSector = value => String(value || 'Other').trim() || 'Other'
const cleanStartups = startups.map(s => ({...s, area:cleanArea(s.area), sector:cleanSector(s.sector)}))
const sectorNames = [...new Set(cleanStartups.map(s => s.sector))].sort()
const areaNames = [...new Set(cleanStartups.map(s => s.area))].sort()

const nav = [
  ['Directory','/startups'],
  ['Founders','/founders'],
  ['Jobs','/jobs'],
  ['Sectors','/sectors'],
  ['Locations','/locations'],
  ['News','/news'],
  ['Ecosystem','/ecosystem'],
  ['Resources','/resources'],
  ['Methodology','/methodology']
]

function pageHtml({title,description,url,eyebrow,heading,body,schema,stats=[],robots='index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',type='website'}) {
  const navHtml = nav.map(([label,path]) => '<a href="'+site+path+'">'+label+'</a>').join('')
  const statHtml = stats.length ? '<div class="seo-stats">'+stats.map(x => '<div><strong>'+esc(x.value)+'</strong><span>'+esc(x.label)+'</span></div>').join('')+'</div>' : ''
  const content = '<div class="seo-page"><div class="seo-shell">'+
    '<header class="seo-header"><a class="seo-brand" href="'+site+'"><span>K</span><b>Kolkata Startup Map</b></a><nav aria-label="Directory">'+navHtml+'</nav></header>'+
    '<main><div class="seo-eyebrow">'+esc(eyebrow)+'</div><h1>'+esc(heading)+'</h1><div class="seo-rule"></div>'+statHtml+body+'</main>'+
    '<footer><div><b>Kolkata Startup Map</b><span>A public-source directory of Kolkata startup and company ecosystem.</span></div><div class="footer-links">'+navHtml+'</div><small>Built and maintained by Siddhartha Sarkar · Data is sourced from public information and should be checked at the original source.</small></footer>'+
    '</div></div>'
  const meta =
    '<meta name="robots" content="'+robots+'"/>'+
    '<meta property="og:type" content="'+type+'"/><meta property="og:title" content="'+esc(title)+'"/><meta property="og:description" content="'+esc(description)+'"/><meta property="og:url" content="'+url+'"/><meta property="og:site_name" content="Kolkata Startup Map"/><meta property="og:locale" content="en_IN"/><meta property="og:image" content="'+site+'/og-card.svg"/><meta property="og:image:alt" content="'+esc(title)+'"/>'+
    '<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="'+esc(title)+'"/><meta name="twitter:description" content="'+esc(description)+'"/><meta name="twitter:image" content="'+site+'/og-card.svg"/><meta name="twitter:image:alt" content="'+esc(title)+'"/>'+
    '<meta name="author" content="Siddhartha Sarkar"/><meta name="theme-color" content="#10131a"/>';
  let html = template
    .replace(/<title>[^<]*<\/title>/, '<title>'+esc(title)+'</title>')
    .replace(/<meta name="description" content="[^"]*"\/>/, '<meta name="description" content="'+esc(description)+'"/>')
    .replace(/<link rel="canonical" href="[^"]*"\/>/, '<link rel="canonical" href="'+url+'"/>')
    .replace(/<meta name="robots" content="[^"]*"\/>/g, '')
    .replace(/<meta property="og:[^"]*"[^>]*>/g, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>/g, '')
    .replace(/<body>[\s\S]*?<\/body>/, '<body>'+content+'</body>')
    .replace('</head>', meta+'</head>')
  const injectedStyle = `<style>
:root{--bg:#f5f0e7;--panel:rgba(251,248,241,.72);--panel2:#e8dfcf;--text:#20201d;--muted:#6f6d64;--line:#d8d0c2;--accent:#d8ad35;--accent2:#385a49}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:'Courier Prime','Courier New',Courier,monospace}.seo-page{min-height:100vh;position:relative;overflow:hidden;background:linear-gradient(135deg,#f5f0e7,#fbf8f1 55%,#f1eadf)}.seo-page:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,#000,transparent 85%)}.seo-shell{position:relative;max-width:1120px;margin:auto;padding:24px 22px 60px}.seo-header{display:flex;align-items:center;justify-content:space-between;gap:22px;padding:4px 0 56px}.seo-brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none}.seo-brand span{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#17100b;font-weight:900;box-shadow:0 10px 35px rgba(255,150,70,.18)}.seo-brand b{font-size:14px;letter-spacing:-.02em}.seo-header nav{display:flex;gap:4px;flex-wrap:wrap;padding:5px;border:1px solid var(--line);border-radius:16px;background:rgba(251,248,241,.62);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 8px 30px rgba(45,35,20,.07)}.seo-header nav a{display:inline-flex;align-items:center;padding:9px 12px;border-radius:11px;color:var(--text);text-decoration:none;font-size:10px;letter-spacing:.14em;text-transform:lowercase;transition:.2s ease}.seo-header nav a:hover{background:rgba(255,255,255,.42);color:#8b3b32;box-shadow:0 5px 18px rgba(45,35,20,.06)}.footer-links{display:flex;gap:18px;flex-wrap:wrap}.footer-links a{color:var(--muted);text-decoration:none;font-size:12px}.footer-links a:hover{color:var(--text)}main{max-width:1040px}.seo-eyebrow{display:inline-flex;padding:7px 10px;border:1px solid rgba(255,180,84,.25);border-radius:999px;background:rgba(255,180,84,.06);color:var(--accent);font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.seo-page h1{max-width:900px;font-size:clamp(42px,7vw,78px);line-height:.94;letter-spacing:-.065em;margin:18px 0 22px}.seo-rule{height:1px;background:linear-gradient(90deg,var(--line),transparent);margin-bottom:28px}.seo-stats{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 30px}.seo-stats div{min-width:130px;padding:14px 16px;border:1px solid var(--line);background:var(--panel);backdrop-filter:blur(16px);border-radius:16px}.seo-stats strong{display:block;font-size:22px}.seo-stats span{display:block;color:var(--muted);font-size:10px;margin-top:3px}.seo-lead{max-width:850px!important;font-size:18px!important;line-height:1.65!important;color:var(--text)!important}.seo-page p{max-width:850px;color:var(--muted);font-size:14px;line-height:1.75}.seo-callouts,.seo-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:28px 0}.seo-callouts>div,.seo-facts>div{padding:18px;border:1px solid var(--line);border-radius:18px;background:var(--panel);backdrop-filter:blur(16px)}.seo-callouts b,.seo-facts small{display:block;color:var(--accent);font-size:9px;letter-spacing:.12em}.seo-callouts span{display:block;color:var(--muted);font-size:12px;line-height:1.5;margin-top:8px}.seo-facts{grid-template-columns:repeat(4,1fr)}.seo-facts b{display:block;margin-top:7px;font-size:13px;line-height:1.4}.seo-list{list-style:none;padding:0;margin:28px 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.seo-list li{min-width:0}.seo-list a{display:block;padding:14px 16px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.035);color:var(--text);text-decoration:none;font-size:13px;line-height:1.45;transition:.18s ease}.seo-list a:hover{transform:translateY(-2px);border-color:rgba(255,180,84,.38);background:rgba(255,180,84,.06)}.breadcrumbs{font-size:11px!important;color:var(--muted)!important;margin-bottom:24px}.breadcrumbs a{color:var(--accent)}.seo-actions{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0}.seo-actions a{display:inline-flex;align-items:center;padding:12px 15px;border:1px solid var(--line);border-radius:12px;text-decoration:none;color:var(--text);font-size:12px;font-weight:750;background:var(--panel)}.seo-actions .seo-primary{background:linear-gradient(135deg,var(--accent),#ffd17c);color:#17100b;border-color:transparent}.seo-freshness{font-size:11px!important;color:var(--muted)!important}footer{margin-top:80px;padding-top:28px;border-top:1px solid var(--line);display:grid;gap:18px}footer>div:first-child{display:grid;gap:5px}footer b{font-size:14px}footer span,footer small{color:var(--muted);font-size:11px;line-height:1.6}@media(max-width:760px){.seo-header{align-items:flex-start;flex-direction:column;padding-bottom:38px}.seo-header nav{gap:12px}.seo-list{grid-template-columns:1fr}.seo-callouts,.seo-facts{grid-template-columns:1fr}.seo-shell{padding-inline:16px}.seo-page h1{font-size:clamp(40px,13vw,64px)}}
</style>`;
  return html.replace('</head>', injectedStyle+'<script type="application/ld+json">'+json(schema)+'</script></head>')
}


/* Ecosystem intelligence page: combines our directory with clearly attributed external context. */
fs.mkdirSync(path.join(root,'ecosystem'),{recursive:true})
const ecosystemWebsiteCount=cleanStartups.filter(s=>s.url).length
const ecosystemLinkedInCount=cleanStartups.filter(s=>s.linkedin).length
const ecosystemHiringCount=cleanStartups.filter(s=>String(s.hiring||'').toLowerCase()==='hiring').length
const ecosystemMappedCount=cleanStartups.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng)).length
const ecosystemSectorCounts=[...new Map(cleanStartups.map(s=>[cleanSector(s.sector),cleanStartups.filter(x=>cleanSector(x.sector)===cleanSector(s.sector)).length])).entries()].sort((a,b)=>b[1]-a[1])
const ecosystemAreaCounts=[...new Map(cleanStartups.map(s=>[cleanArea(s.area),cleanStartups.filter(x=>cleanArea(x.area)===cleanArea(s.area)).length])).entries()].sort((a,b)=>b[1]-a[1])
const sectorContext=ecosystemSectorCounts.slice(0,10).map(([name,count])=>'<li><a href="'+site+'/sector/'+slug(name)+'"><b>'+esc(name)+'</b> · '+count+' in our directory</a></li>').join('')
const areaContext=ecosystemAreaCounts.slice(0,12).map(([name,count])=>'<li><a href="'+site+'/location/'+slug(name)+'"><b>'+esc(name)+'</b> · '+count+' in our directory</a></li>').join('')
fs.writeFileSync(path.join(root,'ecosystem','index.html'), pageHtml({
  title:'Kolkata Startup Ecosystem — Founders, Funding, Jobs, Incubators & Events',
  description:'Kolkata startup ecosystem guide covering startups, founders, sectors, funding, investors, incubators, accelerators, jobs, events, universities and ecosystem resources.',
  url:site+'/ecosystem',eyebrow:'Kolkata startup ecosystem intelligence',heading:'Everything around what Kolkata is building',
  stats:[
    {value:cleanStartups.length,label:'directory listings'},
    {value:ecosystemMappedCount,label:'mapped in our directory'},
    {value:ecosystemWebsiteCount,label:'with website'},
    {value:jobs.length,label:'live public jobs'}
  ],
  body:
    '<p class="seo-lead">The map is only one layer. This page connects the companies we track with the wider ecosystem around them: founders, sectors, capital, incubators, accelerators, jobs, universities, events, government programmes and public research sources.</p>'+
    '<div class="seo-actions"><a class="seo-primary" href="'+site+'/startups">Browse the directory →</a><a href="'+site+'/jobs">See startup jobs →</a><a href="'+site+'/resources">Open ecosystem resources →</a></div>'+
    '<div class="seo-callouts">'+
      '<div><b>OUR DIRECTORY</b><span>'+cleanStartups.length+' approved public-source listings, with '+ecosystemWebsiteCount+' websites and '+ecosystemLinkedInCount+' LinkedIn profiles currently attached. Missing fields are enriched progressively rather than invented.</span></div>'+
      '<div><b>LOCATION LAYER</b><span>'+ecosystemMappedCount+' of our current listings have map coordinates. Location confidence is kept separate from company verification so an approximate point is not presented as an exact office.</span></div>'+
      '<div><b>HIRING LAYER</b><span>'+jobs.length+' live public job records are currently connected to the directory. Hiring is treated as a time-sensitive signal and the original application source remains authoritative.</span></div>'+
    '</div>'+
    '<h2>The size of Kolkata depends on what you count</h2>'+
    '<p>Different ecosystem databases measure different populations. An August 2026 Indian Startup Map snapshot counts <b>11,455 companies on the Startup India register</b> for Kolkata, including 5,414 DPIIT-recognised companies, 1,330 with a funding signal and 3,804 placed to a street. StartupBlink currently shows a much smaller technology/startup universe, while Seedtable tracks 138 Kolkata companies. These numbers should not be added together: they use different inclusion rules and purposes.</p>'+
    '<div class="seo-facts">'+
      '<div><small>STARTUP INDIA REGISTER SNAPSHOT</small><b>11,455</b><span>Kolkata registrations in Indian Startup Map\'s Aug 2026 snapshot.</span></div>'+
      '<div><small>DPIIT RECOGNISED</small><b>5,414</b><span>Within that same external register snapshot.</span></div>'+
      '<div><small>FUNDING SIGNAL</small><b>1,330</b><span>Any funding signal in that external snapshot; not equivalent to verified funding.</span></div>'+
      '<div><small>STREET-LEVEL</small><b>3,804</b><span>External records placed to a street; the rest are less precise.</span></div>'+
    '</div>'+
    '<p class="seo-freshness">External context source: Indian Startup Map, August 2026 snapshot. Its authors explicitly note that registration is not an operating signal. <a href="https://indianstartupmap.com/cities/kolkata">Inspect the underlying Kolkata dataset →</a></p>'+
    '<h2>What is being built</h2>'+
    '<p>Our own directory currently spans multiple parts of the economy rather than treating “startup” as synonymous with software. The live taxonomy includes technology and SaaS, AI and deeptech, fintech, consumer and D2C, healthcare, manufacturing, mobility, food, travel, education, media, marketing, professional services, real estate, agritech and climate/sustainability.</p>'+
    '<ul class="seo-list">'+sectorContext+'</ul>'+
    '<h2>Where the ecosystem is concentrated</h2>'+
    '<p>The locality layer is deliberately separate from the citywide count. The same company can have a registered office, operating office or other Kolkata connection, and those are not interchangeable. Use locality pages to explore the organisations currently mapped to each area.</p>'+
    '<ul class="seo-list">'+areaContext+'</ul>'+
    '<h2>Capital, incubation & acceleration</h2>'+
    '<div class="seo-callouts">'+
      '<div><b>IIM CALCUTTA INNOVATION PARK</b><span>IIMCIP describes its work across pre-incubation, incubation and acceleration. It reports supporting more than 2,000 startups, seed-funding 152 ventures and building programmes with government, academia, investors and corporates. <a href="https://iimcip.org/">IIMCIP →</a></span></div>'+
      '<div><b>BENGAL BUSINESS ACCELERATOR</b><span>The Government of West Bengal programme implemented with IIMCIP provides business-model support, fundraising guidance, mentoring and investor pitch opportunities. <a href="https://iimcip.com/msmebengal/">Programme →</a></span></div>'+
      '<div><b>CAPITAL NETWORK</b><span>RPSG Capital Ventures is an early-stage consumer VC with a Kolkata connection, while Navam Capital is a Kolkata-based early-stage investor focused on frontier technology and science-driven innovation. <a href="https://rpsgcapital.vc/">RPSG →</a> <a href="https://www.navamcapital.com/">Navam →</a></span></div>'+
    '</div>'+
    '<h2>Universities & the innovation pipeline</h2>'+
    '<p>Startup activity is also connected to academic and research infrastructure. Jadavpur University’s Innovation & Startup initiative describes incubation, seed-grant support, hackathons, startup registration guidance and industry-academia links. IIM Calcutta’s entrepreneurship ecosystem includes the Centre for Entrepreneurship and Innovation and IIMCIP.</p>'+
    '<div class="seo-actions"><a href="https://juinnovationstartup.jdvu.ac.in/">Jadavpur University Innovation & Startup →</a><a href="https://www.iim.ac.in/faculty/centers-of-excellence/CEI">IIM Calcutta CEI →</a><a href="https://www.iim.ac.in/faculty/centers-of-excellence/centre-for-entrepreneurship-innovation/iim-calcutta-innovation-park">IIMCIP at IIM Calcutta →</a></div>'+
    '<h2>What is happening right now</h2>'+
    '<p>Recent public signals include IIMCIP’s September 2026 partnership with Army Institute of Management Kolkata to develop incubation and entrepreneurship infrastructure, its August 2026 ₹2 crore national incubation programme with IDFC FIRST Bank for sustainable and circular-economy startups, and the third Bengal Business Accelerator cohort’s July 2026 Demo Day with 22 startups.</p>'+
    '<ul class="seo-list">'+
      '<li><a href="https://iimcip.org/topic/iim-calcutta-innovation-park-partners-with-army-institute-of-management-kolkata-to-build-next-generation-startup-ecosystem-in-west-bengal/"><b>Academia + incubation</b> · IIMCIP × Army Institute of Management Kolkata</a></li>'+
      '<li><a href="https://iimcip.org/news-event/news/"><b>₹2 crore incubation programme</b> · IIMCIP × IDFC FIRST Bank</a></li>'+
      '<li><a href="https://iimcip.org/news-event/events/?y=2022"><b>BBAP Cohort 3</b> · 22 startups at the July 2026 Demo Day</a></li>'+
    '</ul>'+
    '<h2>Jobs are another map of the ecosystem</h2>'+
    '<p>External job platforms expose a different view of Kolkata. Wellfound currently reports 93 tech/startup job results for Kolkata, while CutShort lists 715+ startup jobs for Kolkata. These platform counts are not a census and may include remote or multi-city roles, but they show why a startup map should connect companies to live hiring signals rather than stop at company names.</p>'+
    '<div class="seo-actions"><a href="https://wellfound.com/location/kolkata-wb">Wellfound Kolkata jobs →</a><a href="https://cutshort.io/jobs/startup-jobs-in-kolkata">CutShort Kolkata startup jobs →</a><a href="'+site+'/jobs">Our public job feed →</a></div>'+
    '<h2>What this map adds</h2>'+
    '<div class="seo-callouts">'+
      '<div><b>ONE SEARCH LAYER</b><span>Company, founder, sector, locality, stage and hiring signals can be discovered together.</span></div>'+
      '<div><b>EVIDENCE, NOT DECORATION</b><span>Official websites, LinkedIn, careers links, verification and location confidence are separate fields.</span></div>'+
      '<div><b>ECOSYSTEM, NOT JUST STARTUPS</b><span>Resources extend to jobs, incubators, accelerators, funding programmes, communities, events and data sources.</span></div>'+
      '<div><b>FRESHNESS</b><span>Automated checks and source timestamps are used for time-sensitive fields such as jobs and ecosystem resources.</span></div>'+
      '<div><b>CORRECTIONS</b><span>Founders and teams can submit missing companies or corrections; public verification is performed separately.</span></div>'+
      '<div><b>LOCAL CONTEXT</b><span>Sector and locality pages create indexable paths around the questions people actually search for.</span></div>'+
    '</div>'+
    '<h2>Important distinction</h2>'+
    '<p>There is no single authoritative “number of Kolkata startups”. Government registration, venture databases, job platforms and community maps answer different questions. Kolkata Startup Map therefore avoids merging external counts into one headline and instead keeps each source, definition and freshness visible.</p>'+
    '<div class="seo-actions"><a class="seo-primary" href="'+site+'/methodology">Read our methodology →</a><a href="'+site+'/news">Follow the ecosystem news →</a><a href="'+site+'/resources">Find resources →</a></div>',
  schema:{'@context':'https://schema.org','@type':'AboutPage',name:'Kolkata Startup Ecosystem',url:site+'/ecosystem',description:'Kolkata startup ecosystem guide covering companies, founders, sectors, funding, incubators, accelerators, jobs, universities and events',isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'},about:{'@type':'City',name:'Kolkata'}}
}))

fs.mkdirSync(path.join(root,'methodology'),{recursive:true})
fs.writeFileSync(path.join(root,'methodology','index.html'), pageHtml({
  title:'Kolkata Startup Map Methodology — Data, Verification & Hiring Signals',
  description:'How Kolkata Startup Map collects, verifies and updates company, location, hiring and ecosystem information.',
  url:site+'/methodology',eyebrow:'How the map works',heading:'Data, verification & methodology',
  stats:[{value:cleanStartups.length,label:'approved listings'},{value:cleanStartups.filter(s=>s.verified).length,label:'independently verified'},{value:jobs.length,label:'live public jobs'}],
  body:'<p class="seo-lead">Kolkata Startup Map is a public-source directory, not an official government register. We separate discovery, verification, location confidence and hiring status so a listing is not presented as more certain than its evidence.</p><div class="seo-callouts"><div><b>COMPANY DATA</b><span>Listings can come from public company information, reliable ecosystem sources and direct submissions. The original company source remains the reference point.</span></div><div><b>LOCATION</b><span>Exact coordinates are only presented as exact when the evidence supports them. Approximate points are labelled separately.</span></div><div><b>HIRING</b><span>Hiring is a time-sensitive signal. Unknown means we do not have a reliable current signal; a public application source is the final authority.</span></div><div><b>NEWS</b><span>Ecosystem updates are curated from public sources with source names, dates and links so readers can inspect the original item.</span></div><div><b>UPDATES</b><span>Automated checks refresh public hiring and ecosystem signals. Company information is enriched progressively rather than inventing missing facts.</span></div><div><b>CORRECTIONS</b><span>Founders and teams can submit missing companies or corrections from the map. Public verification and map placement remain separate.</span></div></div><h2>What the labels mean</h2><ul class="seo-list"><li><a href="${site}/startups"><b>Verified</b> — independently checked from a public source.</a></li><li><a href="${site}/startups"><b>Hiring now</b> — a current public hiring signal was found.</a></li><li><a href="${site}/startups"><b>Unknown hiring</b> — no reliable current signal was found.</a></li><li><a href="${site}/locations"><b>Approximate location</b> — the point is not presented as an exact office.</a></li></ul><p>Registration in a startup database does not necessarily mean a company is currently operating. The directory therefore avoids describing the map as an exhaustive census and keeps evidence and freshness visible.</p>',
  schema:{'@context':'https://schema.org','@type':'AboutPage',name:'Kolkata Startup Map Methodology',url:site+'/methodology',description:'Data and verification methodology for Kolkata Startup Map',isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'}}
}))

const directoryLinks = cleanStartups.map(s => '<li><a href="'+site+'/startup/'+slug(s.name)+'"><b>'+esc(s.name)+'</b> · '+esc(s.sector)+' · '+esc(s.area)+'</a></li>').join('')
fs.mkdirSync(path.join(root,'startups'),{recursive:true})
fs.writeFileSync(path.join(root,'startups','index.html'), pageHtml({
  title:'Kolkata Startups & Companies — Directory',
  description:'Explore Kolkata startups, companies and ecosystem organisations by sector and locality. Browse public profiles and source links.',
  url:site+'/startups',eyebrow:'Kolkata startup directory',heading:'The Kolkata startup & company directory',
  stats:[{value:cleanStartups.length,label:'listed organisations'},{value:sectorNames.length,label:'sectors'},{value:areaNames.length,label:'localities'}],
  body:'<p class="seo-lead">A searchable public-source directory for discovering what companies and startups are building in Kolkata. Browse individual profiles, then verify important information at the linked source.</p><div class="seo-callouts"><div><b>DISCOVER</b><span>Explore companies by sector, locality and stage.</span></div><div><b>HIRING</b><span>See public hiring signals and job references where available.</span></div><div><b>DATA</b><span>Listings are curated from public information and can be corrected or added.</span></div></div><ul class="seo-list">'+directoryLinks+'</ul>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startups & Companies',url:site+'/startups',description:'Kolkata startup and company directory',isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'},mainEntity:{'@type':'ItemList',numberOfItems:cleanStartups.length,itemListElement:cleanStartups.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:site+'/startup/'+slug(s.name)}))}}
}))

const founderProfiles = {
  'Sagar J Daryani': ['https://in.linkedin.com/in/sagar-j-daryani-950085b7','Co-founder & CEO of Wow! Momo, building a Kolkata-born food and consumer brand.'],
  'Gaurav Jalan': ['https://in.linkedin.com/in/gauravjalan','Founder & CEO of mPokket, a Kolkata-based fintech platform.'],
  'Sujay Santra': ['https://in.linkedin.com/in/sujay-santra-ikure','Founder & CEO of iKure, focused on technology-enabled primary healthcare.'],
  'Ranodeep Saha': ['https://in.linkedin.com/in/ranodeep-saha-rareplanet','Co-founder of Rare Planet, building a retail and D2C business around Indian handicrafts.'],
  'Vineet Patawari': ['https://in.linkedin.com/in/vineet-patawari','CEO and Co-Founder of StockEdge, focused on financial-market education and technology.'],
  'Vivek Bajaj': ['https://in.linkedin.com/in/vbajaj','Entrepreneur behind Elearnmarkets and StockEdge, focused on financial education and market technology.'],
  'Tinku Acharya': ['https://in.linkedin.com/in/tinkuacharya','Founder of Videonetics and a researcher, inventor and technologist working across AI and video intelligence.']
}
const founderMap = new Map()
for (const s of cleanStartups) {
  const names = String(s.founder || '').split(/\s*,\s*|\s+and\s+|\s*\+\s*co-?founders?/i).map(x=>x.replace(/\s*\([^)]*\)/g,'').trim()).filter(x=>x&&x.length>2&&!/^(unknown|co-founder|founder)$/i.test(x))
  for (const name of names) {
    const key=name.toLowerCase()
    const p=founderMap.get(key)||{name,companies:[],sectors:[]}
    if(!p.companies.some(x=>x.name===s.name))p.companies.push(s)
    if(s.sector&&!p.sectors.includes(s.sector))p.sectors.push(s.sector)
    founderMap.set(key,p)
  }
}
const founderEntries=[...founderMap.values()].sort((a,b)=>a.name.localeCompare(b.name))
const founderCards=founderEntries.map(f=>{
  const profile=founderProfiles[f.name]
  const linkedin=profile?.[0] || 'https://www.linkedin.com/search/results/people/?keywords='+encodeURIComponent(f.name)
  const bio=profile?.[1] || f.name+' is listed as a founder in the Kolkata startup ecosystem. Profile enrichment is in progress.'
  const companies=f.companies.map(x=>x.name).slice(0,2).join(' · ')
  const image=profile?.[0] ? 'https://unavatar.io/'+encodeURIComponent(profile[0]) : 'https://api.dicebear.com/9.x/initials/svg?seed='+encodeURIComponent(f.name)
  const href=site+'/founders/'+slug(f.name)+'/'
  return '<a class="founder-static-card" href="'+href+'"><div class="founder-static-image"><img src="'+image+'" alt="" loading="lazy"><span class="founder-static-brand">KOLKATA<br>STARTUP<br>MAP</span><span class="founder-static-label">FOUNDERS & CEOs<br><b>TOP PROFILE</b></span><div class="founder-static-gradient"></div><div class="founder-static-caption"><small>'+esc(companies)+'</small><h2>'+esc(f.name)+'</h2><p>'+esc(bio)+'</p></div></div></a>'
}).join('')
fs.mkdirSync(path.join(root,'founders'),{recursive:true})
fs.writeFileSync(path.join(root,'founders','index.html'),pageHtml({
  title:'Kolkata Startup Founders — Founders & CEOs Directory',
  description:'Meet the founders and CEOs building companies connected to Kolkata. Browse public founder profiles, companies and professional links.',
  url:site+'/founders',eyebrow:'Kolkata founders & CEOs',heading:'Meet the people building Kolkata',
  stats:[{value:founderEntries.length,label:'founder profiles'},{value:new Set(founderEntries.flatMap(f=>f.companies.map(x=>x.name))).size,label:'companies represented'},{value:'Public source',label:'profile standard'}],
  body:'<style>.founder-static-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin:30px 0}.founder-static-card{display:block;text-decoration:none;color:#fff;background:#050505;min-height:420px;overflow:hidden}.founder-static-image{position:relative;height:420px;background:#111;overflow:hidden}.founder-static-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(100%);opacity:.9;transition:transform .4s ease}.founder-static-card:hover img{transform:scale(1.04)}.founder-static-gradient{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.16),rgba(0,0,0,.04) 40%,rgba(0,0,0,.9))}.founder-static-brand,.founder-static-label{position:absolute;z-index:2;top:17px;font-size:7px;line-height:1.15;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.founder-static-brand{left:17px;color:#ffd400}.founder-static-label{right:17px;color:#fff;text-align:right}.founder-static-label b{display:block;color:#ffd400;margin-top:4px}.founder-static-caption{position:absolute;z-index:2;left:17px;right:17px;bottom:18px}.founder-static-caption small{display:block;color:#ddd;font-size:7px;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.founder-static-caption h2{font-size:22px;line-height:1;margin:6px 0;color:#ffd400;text-transform:uppercase;letter-spacing:-.035em}.founder-static-caption p{font-size:9px;line-height:1.45;color:#ddd;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}@media(max-width:1050px){.founder-static-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:800px){.founder-static-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.founder-static-grid{grid-template-columns:1fr 1fr;gap:10px}.founder-static-image{height:300px}.founder-static-caption h2{font-size:15px}.founder-static-caption p{font-size:8px}}</style><p class="seo-lead">A public-source founder directory connected to companies currently listed in the Kolkata Startup Map. Click any founder to open a dedicated profile with their company, bio and public professional links.</p><div class="founder-static-grid">'+founderCards+'</div><p class="seo-freshness">Founder information can change. Check the linked professional profile and company source for current details.</p>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startup Founders',url:site+'/founders',mainEntity:{'@type':'ItemList',numberOfItems:founderEntries.length,itemListElement:founderEntries.map((f,i)=>({'@type':'ListItem',position:i+1,name:f.name,url:site+'/founders/'+slug(f.name)}))}}
}))
for(const f of founderEntries){
  const profile=founderProfiles[f.name]
  const linkedin=profile?.[0] || 'https://www.linkedin.com/search/results/people/?keywords='+encodeURIComponent(f.name)
  const bio=profile?.[1] || f.name+' is listed as a founder in the Kolkata startup ecosystem. Profile enrichment is in progress.'
  const image=profile?.[0] ? 'https://unavatar.io/'+encodeURIComponent(profile[0]) : 'https://api.dicebear.com/9.x/initials/svg?seed='+encodeURIComponent(f.name)
  const companyRows=f.companies.map(x=>'<div class="founder-company-row"><b>'+esc(x.name)+'</b><span>'+esc(x.sector||'Startup')+'</span></div>').join('')
  fs.mkdirSync(path.join(root,'founders',slug(f.name)),{recursive:true})
  fs.writeFileSync(path.join(root,'founders',slug(f.name),'index.html'),pageHtml({
    title:f.name+' — Kolkata Founder Profile',
    description:bio,
    url:site+'/founders/'+slug(f.name),
    eyebrow:'Founders & CEOs',
    heading:f.name,
    stats:[{value:f.companies.length,label:'company'+(f.companies.length===1?'':'ies')},{value:f.sectors.length,label:'sector'+(f.sectors.length===1?'':'s')},{value:'Kolkata',label:'ecosystem'}],
    body:'<style>.founder-profile{display:grid;grid-template-columns:1fr 1fr;min-height:600px;background:#050505;color:#fff}.founder-profile-image{min-height:600px;position:relative}.founder-profile-image img{width:100%;height:100%;object-fit:cover;filter:grayscale(100%)}.founder-profile-copy{padding:72px 7vw 60px 55px;background:#fff;color:#111}.founder-profile-copy .eyebrow{color:#777}.founder-profile-copy h1{font-size:clamp(48px,6vw,88px);line-height:.9;letter-spacing:-.06em;margin:10px 0 10px}.founder-profile-copy .location{font-weight:800;font-size:12px;margin:0 0 30px}.founder-profile-copy p{font-size:15px;line-height:1.75;max-width:560px}.founder-company-list{margin-top:30px}.founder-company-row{display:flex;justify-content:space-between;border-top:1px solid #ddd;padding:10px 0;font-size:11px}.founder-company-row span{color:#777}.founder-socials{display:flex;gap:24px;border-top:1px solid #ddd;margin-top:28px;padding-top:20px}.founder-socials a{color:#111;font-size:10px;font-weight:900;text-decoration:none}.founder-socials a:hover{color:#a27b00}@media(max-width:800px){.founder-profile{grid-template-columns:1fr}.founder-profile-image{min-height:420px;height:420px}.founder-profile-copy{padding:45px 28px 55px}}</style><div class="founder-profile"><div class="founder-profile-image"><img src="'+image+'" alt="'+esc(f.name)+'"></div><div class="founder-profile-copy"><div class="eyebrow">KOLKATA FOUNDER</div><h1>'+esc(f.name)+'</h1><div class="location">Based in Kolkata · Founder / CEO profile</div><p>'+esc(bio)+'</p><h3>Building</h3><div class="founder-company-list">'+companyRows+'</div><div class="founder-socials"><a href="'+esc(linkedin)+'" rel="nofollow noopener">LinkedIn ↗</a><a href="'+site+'/founders/">Founders & CEOs</a></div></div></div>',
    schema:{'@context':'https://schema.org','@type':'ProfilePage',name:f.name,url:site+'/founders/'+slug(f.name),mainEntity:{'@type':'Person',name:f.name,sameAs:[linkedin],description:bio}}
  }))
}

const jobLinks = jobs.map(j => '<li><a href="'+site+'/job/'+slug(j.company+'-'+j.title)+'"><b>'+esc(j.title)+'</b> at '+esc(j.company)+' · '+esc(j.mode)+(j.freshers?' · fresher-friendly':'')+'</a></li>').join('')
fs.mkdirSync(path.join(root,'jobs'),{recursive:true})
fs.writeFileSync(path.join(root,'jobs','index.html'), pageHtml({
  title:'Kolkata Startup Jobs — Jobs & Internships',
  description:'Find public startup jobs and internships connected to Kolkata, with work mode, fresher signals and application sources.',
  url:site+'/jobs',eyebrow:'Kolkata startup jobs',heading:'Startup jobs in Kolkata',
  stats:[{value:jobs.length,label:'current public listings'},{value:jobs.filter(j=>j.freshers).length,label:'marked fresher-friendly'},{value:new Set(jobs.map(j=>j.company)).size,label:'companies hiring'}],
  body:'<p class="seo-lead">A public-source collection of startup and ecosystem job listings. Availability changes quickly, so always verify the role on the original application source before applying.</p><ul class="seo-list">'+jobLinks+'</ul>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startup Jobs',url:site+'/jobs',mainEntity:{'@type':'ItemList',numberOfItems:jobs.length,itemListElement:jobs.map((j,i)=>({'@type':'ListItem',position:i+1,name:j.title+' at '+j.company,url:site+'/job/'+slug(j.company+'-'+j.title)}))}}
}))

fs.mkdirSync(path.join(root,'sectors'),{recursive:true})
fs.writeFileSync(path.join(root,'sectors','index.html'), pageHtml({
  title:'Kolkata Startup Sectors — Companies by Industry',
  description:'Explore Kolkata startups and companies by sector, including technology, AI, fintech, D2C, creative, marketing and more.',
  url:site+'/sectors',eyebrow:'Kolkata ecosystem',heading:'What is Kolkata building?',
  stats:[{value:sectorNames.length,label:'sectors represented'},{value:cleanStartups.length,label:'listed organisations'},{value:'Public source',label:'data approach'}],
  body:'<p class="seo-lead">Explore the Kolkata ecosystem by industry. Each sector page connects the organisations currently listed in that category with their individual public profiles.</p><ul class="seo-list">'+sectorNames.map(x=>'<li><a href="'+site+'/sector/'+slug(x)+'"><b>'+esc(x)+'</b> · '+cleanStartups.filter(s=>s.sector===x).length+' listed</a></li>').join('')+'</ul>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startup Sectors',url:site+'/sectors',mainEntity:{'@type':'ItemList',itemListElement:sectorNames.map((x,i)=>({'@type':'ListItem',position:i+1,name:x,url:site+'/sector/'+slug(x)}))}}
}))

fs.mkdirSync(path.join(root,'locations'),{recursive:true})
fs.writeFileSync(path.join(root,'locations','index.html'), pageHtml({
  title:'Kolkata Startup Locations — Companies by Locality',
  description:'Explore Kolkata startups and companies by locality, including Salt Lake, New Town, Sector V and other business areas.',
  url:site+'/locations',eyebrow:'Kolkata locality directory',heading:'Where Kolkata is building',
  stats:[{value:areaNames.length,label:'localities represented'},{value:cleanStartups.length,label:'listed organisations'},{value:'Kolkata',label:'city focus'}],
  body:'<p class="seo-lead">Explore the ecosystem by locality and business district. Open a locality to see the organisations currently listed there.</p><ul class="seo-list">'+areaNames.map(x=>'<li><a href="'+site+'/location/'+slug(x)+'"><b>'+esc(x)+'</b> · '+cleanStartups.filter(s=>s.area===x).length+' listed</a></li>').join('')+'</ul>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startup Locations',url:site+'/locations',mainEntity:{'@type':'ItemList',itemListElement:areaNames.map((x,i)=>({'@type':'ListItem',position:i+1,name:x,url:site+'/location/'+slug(x)}))}}
}))

fs.mkdirSync(path.join(root,'news'),{recursive:true})
fs.writeFileSync(path.join(root,'news','index.html'), pageHtml({
  title:'Kolkata Startup News — Funding, Jobs, Events & Ecosystem',
  description:'Follow Kolkata startup ecosystem news, funding, jobs, events, cohorts and programmes with source links and dates.',
  url:site+'/news',eyebrow:'Kolkata startup pulse',heading:'What is happening in the ecosystem?',
  stats:[{value:news.length,label:'published updates'},{value:new Set(news.map(n=>n.sourceName)).size,label:'sources'},{value:'Public source',label:'news standard'}],
  body:'<p class="seo-lead">A curated public-source feed covering startup funding, launches, jobs, programmes, cohorts, grants, events and ecosystem activity around Kolkata and West Bengal.</p><ul class="seo-list">'+news.map(n=>'<li><a href="'+site+'/news/'+n.slug+'"><b>'+esc(n.title)+'</b> · '+esc(n.sourceName)+'</a></li>').join('')+'</ul>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startup News',url:site+'/news',mainEntity:{'@type':'ItemList',itemListElement:news.map((n,i)=>({'@type':'ListItem',position:i+1,name:n.title,url:site+'/news/'+n.slug}))}}
}))

fs.mkdirSync(path.join(root,'resources'),{recursive:true})
fs.writeFileSync(path.join(root,'resources','index.html'), pageHtml({
  title:'Kolkata Startup Resources — Communities, Incubators, Jobs & Events',
  description:'Useful Kolkata startup ecosystem resources: founder communities, Reddit, incubators, accelerators, funding programmes, jobs, data and events.',
  url:site+'/resources',eyebrow:'Kolkata ecosystem resources',heading:'Where to find the ecosystem',
  stats:[{value:resources.length,label:'resources'},{value:new Set(resources.map(r=>r.category)).size,label:'categories'},{value:new Set(resources.map(r=>r.sourceName)).size,label:'sources'}],
  body:'<p class="seo-lead">A public-source directory of communities, incubators, accelerators, funding programmes, job boards, data sources, events and local ecosystem media. Community discussions are discovery sources and are not treated as verified news.</p><ul class="seo-list">'+resources.map(r=>'<li><a href="'+esc(r.url)+'" rel="nofollow noopener"><b>'+esc(r.name)+'</b></a> · '+esc(r.category)+' · '+esc(r.location||'Kolkata')+'<br/><span>'+esc(r.description||'')+'</span></li>').join('')+'</ul>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startup Resources',url:site+'/resources',mainEntity:{'@type':'ItemList',numberOfItems:resources.length,itemListElement:resources.map((r,i)=>({'@type':'ListItem',position:i+1,name:r.name,url:r.url}))}}
}))

for (const area of areaNames) {
  const matches=cleanStartups.filter(s=>s.area===area)
  const url=site+'/location/'+slug(area)
  const links=matches.map(s=>'<li><a href="'+site+'/startup/'+slug(s.name)+'"><b>'+esc(s.name)+'</b> · '+esc(s.sector)+'</a></li>').join('')
  const body='<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/locations">Locations</a> / '+esc(area)+'</nav><p class="seo-lead">Startups and companies currently listed in '+esc(area)+', Kolkata. Browse the public profiles below and check each source for the latest details.</p><div class="seo-callouts"><div><b>LOCALITY</b><span>'+esc(area)+'</span></div><div><b>LISTED</b><span>'+matches.length+' organisations</span></div><div><b>EXPLORE</b><span>Open company profiles for available public information.</span></div></div><ul class="seo-list">'+links+'</ul>'
  const schema={'@context':'https://schema.org','@type':'CollectionPage',name:'Startups and Companies in '+area+', Kolkata',url,mainEntity:{'@type':'ItemList',numberOfItems:matches.length,itemListElement:matches.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:site+'/startup/'+slug(s.name)}))}}
  fs.mkdirSync(path.join(root,'location',slug(area)),{recursive:true})
  fs.writeFileSync(path.join(root,'location',slug(area),'index.html'),pageHtml({title:'Startups & Companies in '+area+', Kolkata',description:'Explore startups and companies currently listed in '+area+', Kolkata.',url,eyebrow:'Kolkata locality',heading:'Startups & companies in '+area,stats:[{value:matches.length,label:'listed organisations'},{value:area,label:'locality'},{value:'Public source',label:'data approach'}],body,schema}))
}

for (const sector of sectorNames) {
  const matches=cleanStartups.filter(s=>s.sector===sector)
  const url=site+'/sector/'+slug(sector)
  const links=matches.map(s=>'<li><a href="'+site+'/startup/'+slug(s.name)+'"><b>'+esc(s.name)+'</b> · '+esc(s.area)+'</a></li>').join('')
  const body='<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/sectors">Sectors</a> / '+esc(sector)+'</nav><p class="seo-lead">Kolkata startups and companies currently classified under '+esc(sector)+'. Browse profiles, localities and available public-source information.</p><div class="seo-callouts"><div><b>SECTOR</b><span>'+esc(sector)+'</span></div><div><b>LISTED</b><span>'+matches.length+' organisations</span></div><div><b>LOCATION</b><span>Kolkata, West Bengal</span></div></div><ul class="seo-list">'+links+'</ul>'
  const schema={'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata '+sector+' Startups and Companies',url,mainEntity:{'@type':'ItemList',numberOfItems:matches.length,itemListElement:matches.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:site+'/startup/'+slug(s.name)}))}}
  fs.mkdirSync(path.join(root,'sector',slug(sector)),{recursive:true})
  fs.writeFileSync(path.join(root,'sector',slug(sector),'index.html'),pageHtml({title:'Kolkata '+sector+' Startups & Companies',description:'Explore Kolkata startups and companies in '+sector+'. Browse public profiles and ecosystem information.',url,eyebrow:'Kolkata sector',heading:'Kolkata '+sector+' startups & companies',stats:[{value:matches.length,label:'listed organisations'},{value:sector,label:'sector'},{value:'Kolkata',label:'city'}],body,schema}))
}

for (const s of cleanStartups) {
  const url=site+'/startup/'+slug(s.name)
  const companyJobs=jobs.filter(j=>String(j.company).toLowerCase()===String(s.name).toLowerCase())
  const body='<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/startups">Directory</a> / '+esc(s.name)+'</nav>'+
    '<p class="seo-lead">'+esc(s.desc || (s.name+' is listed in the Kolkata startup and company ecosystem.'))+'</p>'+
    '<div class="seo-facts"><div><small>SECTOR</small><b>'+esc(s.sector)+'</b></div><div><small>LOCALITY</small><b>'+esc(s.area)+'</b></div><div><small>STAGE</small><b>'+esc(s.stage)+'</b></div><div><small>HIRING</small><b>'+esc(companyJobs.length?'Public roles listed':'No current public role listed')+'</b></div></div>'+
    (s.founder?'<p><strong>Founder:</strong> '+esc(s.founder)+'</p>':'')+
    (s.address?'<p><strong>Public address:</strong> '+esc(s.address)+'</p>':'')+
    '<div class="seo-actions">'+(s.url&&s.url!=='#'?'<a class="seo-primary" href="'+esc(s.url)+'" rel="nofollow noopener">Official website →</a>':'')+(s.linkedin?'<a href="'+esc(s.linkedin)+'" rel="nofollow noopener">LinkedIn →</a>':'')+(s.careers?'<a href="'+esc(s.careers)+'" rel="nofollow noopener">Careers →</a>':'')+'</div>'+
    (companyJobs.length?'<h2>Public jobs from '+esc(s.name)+'</h2><ul class="seo-list">'+companyJobs.map(j=>'<li><a href="'+site+'/job/'+slug(j.company+'-'+j.title)+'"><b>'+esc(j.title)+'</b> · '+esc(j.mode)+'</a></li>').join('')+'</ul>':'')+
    '<div class="seo-actions"><a href="'+site+'/sector/'+slug(s.sector)+'">More '+esc(s.sector)+' companies →</a><a href="'+site+'/location/'+slug(s.area)+'">More companies in '+esc(s.area)+' →</a></div>'+
    (s.lastChecked?'<p class="seo-freshness">Public source checked '+esc(new Date(s.lastChecked).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}))+'.</p>':'')
  const thinProfile=!s.desc||s.desc.trim().length<40||/profile verification pending/i.test(s.desc)&&!s.url&& !s.founder && !s.linkedin
  const org={'@type':'Organization',name:s.name,description:s.desc||undefined,url:s.url&&s.url!=='#'?s.url:undefined,logo:s.logo||undefined,sameAs:s.linkedin?[s.linkedin]:undefined,areaServed:{'@type':'City',name:'Kolkata'},address:s.address?{'@type':'PostalAddress',streetAddress:s.address,addressLocality:'Kolkata',addressRegion:'West Bengal',addressCountry:'IN'}:undefined}
  const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:s.name+' — Kolkata Startup Map',url,description:s.desc||undefined,dateModified:s.lastChecked||undefined,about:{'@id':url+'#organization'}},{...org,'@id':url+'#organization'}, {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'Startups',item:site+'/startups'},{'@type':'ListItem',position:3,name:s.name,item:url}]}]}
  fs.mkdirSync(path.join(root,'startup',slug(s.name)),{recursive:true})
  fs.writeFileSync(path.join(root,'startup',slug(s.name),'index.html'),pageHtml({title:(s.name+' — '+(s.sector!=='Other'?s.sector+' company in Kolkata':'Kolkata company profile')+' | Kolkata Startup Map'),description:(s.name+' in '+s.area+', Kolkata — '+(s.sector!=='Other'?s.sector.toLowerCase()+' company':'company')+' with public-source profile, links and hiring information.'),url,eyebrow:'Kolkata company profile',heading:s.name,stats:[{value:s.sector,label:'sector'},{value:s.area,label:'locality'},{value:companyJobs.length,label:'public roles'}],robots:thinProfile?'noindex,follow':undefined,body,schema}))
}

for (const j of jobs) {
  const slugName=slug(j.company+'-'+j.title),url=site+'/job/'+slugName
  const body='<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/jobs">Jobs</a> / '+esc(j.company)+'</nav>'+
    '<p class="seo-lead"><strong>'+esc(j.title)+'</strong> at <strong>'+esc(j.company)+'</strong> — a public job reference connected to the Kolkata ecosystem.</p>'+
    '<div class="seo-facts"><div><small>WORK MODE</small><b>'+esc(j.mode)+'</b></div><div><small>TYPE</small><b>'+esc(j.type||'Job listing')+'</b></div><div><small>FRESHER</small><b>'+(j.freshers?'Marked yes':'Not marked')+'</b></div><div><small>SOURCE</small><b>'+esc(j.source||'Public source')+'</b></div></div>'+
    '<p>Job availability can change quickly. Check the original application source for the current status, requirements and application process.</p>'+
    '<div class="seo-actions"><a class="seo-primary" href="'+esc(j.url||'#')+'" rel="nofollow noopener">Open application source →</a><a href="'+site+'/startup/'+slug(j.company)+'">View '+esc(j.company)+' profile →</a></div>'
  const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:j.title+' at '+j.company,url,description:j.title+' at '+j.company+' in the Kolkata startup ecosystem.',dateModified:j.lastSeenAt||j.datePosted||undefined},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'Jobs',item:site+'/jobs'},{'@type':'ListItem',position:3,name:j.title+' at '+j.company,item:url}]}]}
  fs.mkdirSync(path.join(root,'job',slugName),{recursive:true})
  fs.writeFileSync(path.join(root,'job',slugName,'index.html'),pageHtml({title:j.title+' at '+j.company+' — Kolkata Startup Jobs',description:j.title+' at '+j.company+'. View work mode, fresher signal and the public application source.',url,eyebrow:'Kolkata startup job',heading:j.title+' · '+j.company,stats:[{value:j.mode,label:'work mode'},{value:j.freshers?'Fresher':'Open',label:'candidate signal'},{value:j.type||'Job',label:'employment type'}],body,schema}))
}

for (const n of news) {
  const url=site+'/news/'+n.slug, date=n.publishedAt?new Date(n.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):''
  const body='<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/news">News</a> / '+esc(n.title)+'</nav>'+
    '<p class="seo-lead">'+esc(n.summary)+'</p><div class="seo-facts"><div><small>CATEGORY</small><b>'+esc(n.category)+'</b></div><div><small>SOURCE</small><b>'+esc(n.sourceName)+'</b></div><div><small>PUBLISHED</small><b>'+esc(date)+'</b></div><div><small>STATUS</small><b>'+(n.verified?'Verified':'Source linked')+'</b></div></div>'+
    '<div class="seo-actions"><a class="seo-primary" href="'+esc(n.sourceUrl)+'" rel="nofollow noopener">Read original source →</a><a href="'+site+'/news">More ecosystem news →</a></div>'
  const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:n.title,url,description:n.summary||undefined,datePublished:n.publishedAt||undefined,dateModified:n.updatedAt||n.publishedAt||undefined,mainEntityOfPage:{'@type':'WebPage','@id':url},citation:n.sourceUrl||undefined},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'News',item:site+'/news'},{'@type':'ListItem',position:3,name:n.title,item:url}]}]}
  fs.mkdirSync(path.join(root,'news',n.slug),{recursive:true})
  fs.writeFileSync(path.join(root,'news',n.slug,'index.html'),pageHtml({title:n.title+' — Kolkata Startup Map',description:n.summary||'Kolkata startup ecosystem news and update.',url,eyebrow:'Kolkata ecosystem news',heading:n.title,stats:[{value:n.category,label:'category'},{value:n.sourceName,label:'source'},{value:date||'Public source',label:'published'}],body,schema}))
}

console.log('Generated '+(cleanStartups.length+jobs.length+news.length+resources.length+sectorNames.length+areaNames.length+6)+' crawlable SEO pages; live data: '+liveData)
