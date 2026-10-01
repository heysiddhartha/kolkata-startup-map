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
  title:'Kolkata Startup Ecosystem — Funding, Jobs & Founders',
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
  title:'Kolkata Startup Map Methodology — Data & Verification',
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
  'Anooshka Soham Bathwal': {linkedin:'https://in.linkedin.com/in/anooshkasohambathwal', company:'Dhanvesttor', role:'Founder & CEO', sector:'Fintech', bio:'Founder & CEO of Dhanvesttor, a Kolkata-based wealth-management firm focused on making women more confident in finance.', image:'https://dhanvesttor.com/wp-content/uploads/2025/02/Anooshka-Soham-Bathwal-CEO-Founder-of-Dhanvesttor.jpg'},
  'Gaurav Jalan': {linkedin:'https://in.linkedin.com/in/gauravjalan', company:'mPokket', role:'Founder & CEO', sector:'Fintech', bio:'Founder & CEO of mPokket, a Kolkata-based fintech platform.', image:'https://cdn.mpokket.in/leadership_2_3d8f843f31.png'},
  'Prabir Sarkar': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Prabir%20Sarkar%20DSMenu', company:'DSMenu', role:'Founder', sector:'SaaS & Software', bio:'Founder of DSMenu, a Kolkata-based digital-menu and signage SaaS platform.', image:'https://www.dsmenu.com/images/img-probir-hamburger.jpg'},
  'Ranodeep Saha': {linkedin:'https://in.linkedin.com/in/ranodeep-saha-rareplanet', company:'Rare Planet', role:'Co-founder', sector:'Consumer & D2C', bio:'Co-founder of Rare Planet, building a retail and D2C business around Indian handicrafts.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk2MzIsInB1ciI6ImJsb2JfaWQifX0%3D--974a2d34653a958b2975a48dd8868e3a285abc1b/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGVnIiwiY3JvcCI6WzAsMCw4MDAsODAwXSwicmVzaXplX3RvX2xpbWl0IjpbNjQwLDY0MF19LCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--c891a9d5dd03dbf09321e28da945d51834d93c3d/Ranodeep.jpeg'},
  'Sagar J Daryani': {linkedin:'https://in.linkedin.com/in/sagar-j-daryani-950085b7', company:'Wow! Momo', role:'Co-founder & CEO', sector:'Food & Consumer', bio:'Co-founder & CEO of Wow! Momo, building a Kolkata-born food and consumer brand.', image:'https://etimg.etb2bimg.com/authorthumb/479263700.cms?height=250&imgsize=26386&width=250'},
  'Sujay Santra': {linkedin:'https://in.linkedin.com/in/sujay-santra-ikure', company:'iKure', role:'Founder & CEO', sector:'Healthtech & Healthcare', bio:'Founder & CEO of iKure, focused on technology-enabled primary healthcare.', image:'https://images.yourstory.com/cs/wordpress/2013/10/sujay_santra_20130831.jpg?auto=format&fm=png'},
  'Tinku Acharya': {linkedin:'https://in.linkedin.com/in/tinkuacharya', company:'Videonetics', role:'Founder & Chairman', sector:'AI & Deeptech', bio:'Founder of Videonetics and a technologist working across AI and video intelligence.', image:'https://commons.wikimedia.org/wiki/Special:FilePath/Tinku_Acharya_-_Kolkata_2015-03-27_4650.JPG'},
  'Vineet Patawari': {linkedin:'https://in.linkedin.com/in/vineet-patawari', company:'Elearnmarkets / StockEdge', role:'Co-founder', sector:'Fintech', bio:'Co-founder of Elearnmarkets and StockEdge, focused on financial-market education and technology.', image:'https://d24uab5gycr2uz.cloudfront.net/uploads/white_theme/images/about_us/founder_img2.webp'},
  'Vivek Bajaj': {linkedin:'https://in.linkedin.com/in/vbajaj', company:'Elearnmarkets / StockEdge', role:'Founder', sector:'Fintech', bio:'Entrepreneur behind Elearnmarkets and StockEdge, focused on financial education and market technology.', image:'https://d24uab5gycr2uz.cloudfront.net/uploads/white_theme/images/about_us/founder_img1.webp'},
  'Soumita Basu': {linkedin:'https://in.linkedin.com/in/soumita-basu', company:'Zyenika Inclusive Fashion', role:'Founder & CEO', sector:'Consumer brands', bio:'Founder & CEO of Zyenika Inclusive Fashion, a Kolkata-based inclusive fashion venture.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MjAwNjcsInB1ciI6ImJsb2JfaWQifX0%3D--05a2c79b38dd496c4003e9ef6c8a2d4c27ba4225/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMCw1NjAsNTYwXSwicmVzaXplX3RvX2xpbWl0IjpbMzIwLDMyMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--57639a4dbcd95e113094723ce598266a4a7abb52/Soumita.jpeg'},
  'Sujata Chatterjee': {linkedin:'https://in.linkedin.com/in/sujata-chatterjee-03a055162', company:'Twirl.store', role:'Founder & MD', sector:'Consumer brands', bio:'Founder and MD of Twirl.store, a Kolkata social-enterprise and circular-fashion platform.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MjAwNTEsInB1ciI6ImJsb2JfaWQifX0%3D--f5082f4f74eb08655ad09d99d22fcae78e553f73/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMCwxMDgwLDEwODBdLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdfX0%3D--4f83644ea7ca76b147d824dfc4f25663d4531f7a/Sujata%20Kolkata.png'},
  'Pauline Laravoire': {linkedin:'https://in.linkedin.com/in/paulinelaravoire', company:'Y-East', role:'Co-Founder', sector:'Climate & Social Impact', bio:'Co-founder of Y-East, working on sustainability and social-impact initiatives connected to Kolkata.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk3NTgsInB1ciI6ImJsb2JfaWQifX0%3D--e1e424404aa71d964c1940105f0d583d4c46b1b2/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMCw4MDAsODAwXSwicmVzaXplX3RvX2xpbWl0IjpbMzIwLDMyMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--f480e6c30aa7b4398060376ae6512050900f93b1/Pauline.jpeg'},
  'Sukriti Agarwal': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Sukriti%20Agarwal%20Outbox', company:'Outbox', role:'Co-Founder', sector:'Consumer & Experiences', bio:'Co-founder of Outbox, a Kolkata-based surprise and experience company.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk2NDQsInB1ciI6ImJsb2JfaWQifX0%3D--dfe1294153332c00c5bc8b5c9e0a868b840adb81/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMCwxNTk5LDE1OTldLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdfX0%3D--fd756300d1601d66fed20596f80854cdfbed9edf/Sukriti%20Outbox.jpeg'},
  'Aishwarya Biswas': {linkedin:'https://in.linkedin.com/in/ashbiswas', company:'Auli Lifestyle', role:'Founder', sector:'Beauty & Consumer', bio:'Founder of Auli Lifestyle, a Kolkata-based beauty and wellness brand.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk2MTEsInB1ciI6ImJsb2JfaWQifX0%3D--2b62bd78ff976381484d7ad5434c636c03628cd7/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMCw4MDAsODAwXSwicmVzaXplX3RvX2xpbWl0IjpbMzIwLDMyMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--f480e6c30aa7b4398060376ae6512050900f93b1/Aishwarya%20Biswas.jpeg'},
  'Nihal Singh': {linkedin:'https://in.linkedin.com/in/nihal-singh-b29687237', company:'spliceAI', role:'Founder', sector:'AI', bio:'Founder of spliceAI, an early-stage AI venture connected to Kolkata.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTAxMTg2LCJwdXIiOiJibG9iX2lkIn19--b8513c8fccc745f6ed020a42ba9ef4750135f721/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMCw2NjAsNjYwXSwicmVzaXplX3RvX2xpbWl0IjpbMzIwLDMyMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--f4107d7f7d6fe4283295b8d1beb0a5e96ff11423/WhatsApp%20Image%202026-07-20%20at%2000.18.14.jpg'},
  'Santanu Kabi': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Santanu%20Kabi%20LossToProfit%20AI', company:'LossToProfit AI', role:'Founder', sector:'AI & Fintech', bio:'Founder of LossToProfit AI, an AI-powered profit-intelligence product being built in Kolkata.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6ODc3MjQsInB1ciI6ImJsb2JfaWQifX0%3D--83e1d32e4d7df03514953a14972daad182af1c65/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzE1MSwwLDc2OCw3NjhdLCJyZXNpemVfdG9fbGltaXQiOlszMjAsMzIwXX0sInB1ciI6InZhcmlhdGlvbiJ9fQ%3D%3D--ee7b4f544a07c1b42a2a6dd03b9a159afe2525b1/20171216_172737.jpg'},
  'Samya Mukherjee': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Samya%20Mukherjee%20DESK%20Kolkata', company:'DESK Analytical Research and Consulting Foundation', role:'Founder', sector:'Research & Consulting', bio:'Founder of DESK Analytical Research and Consulting Foundation, based in Kolkata.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6ODc2ODksInB1ciI6ImJsb2JfaWQifX0%3D--d6792e3d0f709206cf48946aaa437e41fd0a055d/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMywzNTAsMzUwXSwicmVzaXplX3RvX2xpbWl0IjpbMzIwLDMyMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--604ceeed5f5a6c39be846643438afef5fe4366bbc/Samya%20Mukherjee%20Photograph676.jpg'},
  'Subhodeep Moitra': {linkedin:'https://in.linkedin.com/in/subhodeep-moitra-b17749181', company:'ShadowSyn Research', role:'Co-Founder', sector:'AI & Deeptech', bio:'Co-founder of ShadowSyn Research, focused on robust and trustworthy AI systems.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6ODcwMTAsInB1ciI6ImJsb2JfaWQifX0%3D--dd33b5539b69e816a413f3a446259c7fb5f1c324/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzIyLDk5LDU4MCw1ODBdLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdfX0%3D--b96ca4ba4a0b08580eb2184ae15e65c2e34343a3/IMG_20260827_143056068_HDR.jpg'},
  'Ananya Shrivastava': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Ananya%20Shrivastava%20Jagriq', company:'Jagriq', role:'Co-Founder', sector:'AI', bio:'Co-founder of Jagriq, an AI venture connected to Kolkata.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6ODAxNzUsInB1ciI6ImJsb2JfaWQifX0%3D--6baa9d8a975b54e6fec4e8fb1b3e2f68bec2f1e5/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMTMsMjc3LDI3N10sInJlc2l6ZV90b19saW1pdCI6WzMyMCwzMjBdfSwicHVyIjoidmFyaWF0aW9uIn19--327c3b0dd3e53985e223c39ca2ca59a54ab0ba30/ananya-pic-aadhar.jpg'},
  'Siddhartha Dey': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Siddhartha%20Dey%20Finrashi', company:'Finrashi', role:'Founder', sector:'Fintech', bio:'Founder of Finrashi, a Kolkata-linked fintech venture.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NDYxMTEsInB1ciI6ImJsb2JfaWQifX0%3D--3db77648a6b14cb3bfee71e21e95baad2ae6c0bb/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMCwxMDI0LDEwMjRdLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdLCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--800597ff0d7ee12c6f3615aa874ffd6d02087791/Profile%20pic.jpg'},
  'Abhijit Sarkar': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Abhijit%20Sarkar%20Edutapxr', company:'Edutapxr', role:'Co-Founder', sector:'Edtech', bio:'Co-founder of Edutapxr, an education-technology venture connected to Kolkata.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTAwNDYwLCJwdXIiOiJibG9iX2lkIn19--ddc3b4130d18cec05c6f521db6a9c144537d4947/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMCwxMDI0LDEwMjRdLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdfX0%3D--800597ff0d7ee12c6f3615aa874ffd6d02087791/Teamspace%20One.jpg'},
  'Sourendro Banerjee': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Sourendro%20Banerjee%20WEBSTEP', company:'WEBSTEP Technologies', role:'Founder', sector:'SaaS & Software', bio:'Founder of WEBSTEP Technologies, a Kolkata-based technology company.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6OTc0NTMsInB1ciI6ImJsb2JfaWQifX0%3D--7c4d981946eac8f62545c7ff3cc51a4cf26d5a72/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMjQsMjE0LDIxNF0sInJlc2l6ZV90b19saW1pdCI6WzMyMCwzMjBdfSwicHVyIjoidmFyaWF0aW9uIn19--cf6ff6b60bd9b0cf516e0cb5a66147b991d6b8d3/Sourendro_Banerjee.jpg'},
  'Sanchari Sarkar': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Sanchari%20Sarkar%20Digital%20Platform%20271', company:'Digital Platform 271', role:'Founder', sector:'SaaS & Software', bio:'Founder of Digital Platform 271, listed in the Kolkata founder community.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NjUwMjAsInB1ciI6ImJsb2JfaWQifX0%3D--e345f0adab3f1809d2bb3d750042abaee096bb24/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMTE1LDc5NSw3OTVdLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdfX0%3D--6bc4768c7be92a3f252b38fa6af7e1e57e61bbf5/3AD504E7-833D-4D0F-98B4-F07443132CBE.jpg'},
  'Suman Mondal': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Suman%20Mondal%20KIDFACTORY', company:'KIDFACTORY', role:'Founder', sector:'Edtech', bio:'Founder of KIDFACTORY, a Kolkata education venture.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NjM5OTgsInB1ciI6ImJsb2JfaWQifX0%3D--0b433ba9e3c7b490309c0ee46234180670125f17/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMTI4LDc2OCw3NjhdLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdfX0%3D--7e55d1a44cd8d10f87a05dcc901e8c404040399f/1000101636.jpg'},
  'Rahul Pandey': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Rahul%20Pandey%20Anteratic%20Labs', company:'Anteratic Labs', role:'Founder', sector:'AI & Software', bio:'Founder of Anteratic Labs, an early-stage technology company connected to Kolkata.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NjI1MTgsInB1ciI6ImJsb2JfaWQifX0%3D--676923b641749217259cbe16a28a5d718912167b/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsNCw1NzYsNTc2XSwicmVzaXplX3RvX2xpbWl0IjpbMzIwLDMyMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--9a4b03ae767132f359b294a4f3bd38b0de128e0d/1000277298.jpg'},
  'Bapon Biswas': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Bapon%20Biswas%20minti%20jemun', company:'minti jemun', role:'Founder & CEO', sector:'Consumer & D2C', bio:'Founder & CEO of minti jemun, a Kolkata startup listed in the local founder ecosystem.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MzQ4NDksInB1ciI6ImJsb2JfaWQifX0%3D--3ee09e1061e83b851773346a388523eedd880440/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMjU4LDU3OSw1NzldLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdfX0%3D--4452cb686e4027af7f3f76d898e23ce638194aff/Screenshot_20260103-010512_1.jpg'},
  'Biswarup Das': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Biswarup%20Das%20Hexical%20AI', company:'Hexical AI', role:'Founder', sector:'AI', bio:'Founder of Hexical AI, an AI startup listed in the Kolkata founder ecosystem.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MzQxMzgsInB1ciI6ImJsb2JfaWQifX0%3D--02ddc325beb0c8140775de810e37324062901722/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzEsMCw4NjYsODY2XSwicmVzaXplX3RvX2xpbWl0IjpbMzIwLDMyMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0%3D--f8123c27b1f56860a2492f4362b0d4a0f9a46e02/Screenshot%202026-01-29%20102502.jpg'},
  'Mehul Joisar': {linkedin:'https://www.linkedin.com/search/results/people/?keywords=Mehul%20Joisar%20Digicians', company:'Digicians', role:'Founder', sector:'Marketing & Software', bio:'Founder of Digicians, a Kolkata-based digital and marketing venture.', image:'https://echai.ventures/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NDQ4MCwicHVyIjoiYmxvYl9pZCJ9fQ%3D%3D--5dd341dc4f3fdce46270bc3ce8e12a0c14d7cc5d/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwiY3JvcCI6WzAsMTAwLDQwMCw0MDBdLCJyZXNpemVfdG9fbGltaXQiWzMyMCwzMjBdfX0%3D--4b7d77d40e57ac8c622fae0c81fb57974b3a5fa3/Profile%20pic%20400x600.jpg'},
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
for (const [name,data] of Object.entries(founderProfiles)) {
  const key=name.toLowerCase()
  const p=founderMap.get(key)||{name,companies:[],sectors:[]}
  if(data.company && !p.companies.some(x=>x.name===data.company))p.companies.push({name:data.company,sector:data.sector,stage:'Public founder profile'})
  if(data.sector&&!p.sectors.includes(data.sector))p.sectors.push(data.sector)
  founderMap.set(key,p)
}
const founderEntries=[...founderMap.values()].sort((a,b)=>a.name.localeCompare(b.name))
const founderCards=founderEntries.map(f=>{
  const profile=founderProfiles[f.name]
  const linkedin=profile?.linkedin || 'https://www.linkedin.com/search/results/people/?keywords='+encodeURIComponent(f.name)
  const bio=profile?.bio || f.name+' is listed as a founder in the Kolkata startup ecosystem. Profile enrichment is in progress.'
  const companies=f.companies.map(x=>x.name).slice(0,2).join(' · ')
  const image=profile?.image || 'https://api.dicebear.com/9.x/initials/svg?seed='+encodeURIComponent(f.name)
  const href=site+'/founders/'+slug(f.name)+'/'
  return '<a class="founder-static-card" href="'+href+'"><div class="founder-static-image"><img src="'+image+'" alt="Portrait of '+esc(f.name)+'" loading="lazy" onerror="this.onerror=null;this.src=&#39;https://api.dicebear.com/9.x/initials/svg?seed='+encodeURIComponent(f.name)+'&#39;"><span class="founder-static-brand">KOLKATA<br>STARTUP<br>MAP</span><span class="founder-static-label">FOUNDERS & CEOs<br><b>TOP PROFILE</b></span><div class="founder-static-gradient"></div><div class="founder-static-caption"><small>'+esc(companies)+'</small><h2>'+esc(f.name)+'</h2><p>'+esc(bio)+'</p></div></div></a>'
}).join('')
fs.mkdirSync(path.join(root,'founders'),{recursive:true})
fs.mkdirSync(path.join(root,'foundersandceos'),{recursive:true})
const foundersIndexHtml=pageHtml({
  title:'Kolkata Startup Founders — Founders & CEOs Directory',
  description:'Meet the founders and CEOs building companies connected to Kolkata. Browse public founder profiles, companies and professional links.',
  url:site+'/founders',eyebrow:'Kolkata founders & CEOs',heading:'Meet the people building Kolkata',
  stats:[{value:founderEntries.length,label:'founder profiles'},{value:new Set(founderEntries.flatMap(f=>f.companies.map(x=>x.name))).size,label:'companies represented'},{value:'Public source',label:'profile standard'}],
  body:'<style>.founder-static-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin:30px 0}.founder-static-card{display:block;text-decoration:none;color:#fff;background:#050505;min-height:420px;overflow:hidden}.founder-static-image{position:relative;height:420px;background:#111;overflow:hidden}.founder-static-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;filter:grayscale(100%);opacity:.9;transition:transform .4s ease}.founder-static-image img[src*="Tinku_Acharya"]{object-position:50% 42%}.founder-static-card:hover img{transform:scale(1.04)}.founder-static-gradient{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.16),rgba(0,0,0,.04) 40%,rgba(0,0,0,.9))}.founder-static-brand,.founder-static-label{position:absolute;z-index:2;top:17px;font-size:7px;line-height:1.15;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.founder-static-brand{left:17px;color:#ffd400}.founder-static-label{right:17px;color:#fff;text-align:right}.founder-static-label b{display:block;color:#ffd400;margin-top:4px}.founder-static-caption{position:absolute;z-index:2;left:17px;right:17px;bottom:18px}.founder-static-caption small{display:block;color:#ddd;font-size:7px;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.founder-static-caption h2{font-size:22px;line-height:1;margin:6px 0;color:#ffd400;text-transform:uppercase;letter-spacing:-.035em}.founder-static-caption p{font-size:9px;line-height:1.45;color:#ddd;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}@media(max-width:1050px){.founder-static-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:800px){.founder-static-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.founder-static-grid{grid-template-columns:1fr 1fr;gap:10px}.founder-static-image{height:300px}.founder-static-caption h2{font-size:15px}.founder-static-caption p{font-size:8px}}</style><p class="seo-lead">A public-source founder directory connected to companies currently listed in the Kolkata Startup Map. Click any founder to open a dedicated profile with their company, bio and public professional links.</p><div class="founder-static-grid">'+founderCards+'</div><p class="seo-freshness">Founder information can change. Check the linked professional profile and company source for current details.</p>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startup Founders',url:site+'/founders',mainEntity:{'@type':'ItemList',numberOfItems:founderEntries.length,itemListElement:founderEntries.map((f,i)=>({'@type':'ListItem',position:i+1,name:f.name,url:site+'/founders/'+slug(f.name)}))}}
})
fs.writeFileSync(path.join(root,'founders','index.html'),foundersIndexHtml)
fs.writeFileSync(path.join(root,'foundersandceos','index.html'),foundersIndexHtml)
for(const f of founderEntries){
  const profile=founderProfiles[f.name]
  const linkedin=profile?.linkedin || 'https://www.linkedin.com/search/results/people/?keywords='+encodeURIComponent(f.name)
  const bio=profile?.bio || f.name+' is listed as a founder in the Kolkata startup ecosystem. Profile enrichment is in progress.'
  const image=profile?.image || 'https://api.dicebear.com/9.x/initials/svg?seed='+encodeURIComponent(f.name)
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
  title:'Kolkata Startup Resources — Incubators, Jobs & Events',
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
  fs.writeFileSync(path.join(root,'location',slug(area),'index.html'),pageHtml({title:'Startups & Companies in '+area+(area.toLowerCase()==='kolkata'?'':' , Kolkata').replace(' ,',' '),description:'Explore '+matches.length+' startups and companies listed in '+area+(area.toLowerCase()==='kolkata'?'':' , Kolkata').replace(' ,',' ')+', including sectors, hiring signals and public company profiles.',url,eyebrow:'Kolkata locality',heading:'Startups & companies in '+area,stats:[{value:matches.length,label:'listed organisations'},{value:area,label:'locality'},{value:'Public source',label:'data approach'}],body,schema}))
}

for (const sector of sectorNames) {
  const matches=cleanStartups.filter(s=>s.sector===sector)
  const url=site+'/sector/'+slug(sector)
  const links=matches.map(s=>'<li><a href="'+site+'/startup/'+slug(s.name)+'"><b>'+esc(s.name)+'</b> · '+esc(s.area)+'</a></li>').join('')
  const sectorJobs=jobs.filter(j=>matches.some(s=>s.name===j.company)).length
  const body='<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/sectors">Sectors</a> / '+esc(sector)+'</nav><h1>'+esc(sector)+' Startups &amp; Companies in Kolkata</h1><p class="seo-lead">Kolkata startups and companies currently classified under '+esc(sector)+'. Browse profiles, localities and available public-source information.</p><div class="seo-callouts"><div><b>SECTOR</b><span>'+esc(sector)+'</span></div><div><b>LISTED</b><span>'+matches.length+' organisations</span></div><div><b>PUBLIC JOBS</b><span>'+sectorJobs+' current roles</span></div><div><b>LOCATION</b><span>Kolkata, West Bengal</span></div></div><ul class="seo-list">'+links+'</ul><h2>Hiring in '+esc(sector)+'</h2><p>'+sectorJobs+' public job listings are currently attached to companies in this sector. Hiring signals are time-sensitive, so check the original application source before relying on them.</p>'
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
    '<h2>About '+esc(s.name)+'</h2><p>This public directory profile connects '+esc(s.name)+' with its Kolkata sector, locality and publicly available company sources. Information is enriched from public evidence and can change over time.</p>'+
    (s.founder?'<p><strong>Founder:</strong> '+esc(s.founder)+'</p>':'<p><strong>Founder:</strong> Not publicly listed in our current verified sources.</p>')+
    (s.address?'<p><strong>Public address:</strong> '+esc(s.address)+'</p>':'<p><strong>Location:</strong> '+esc(s.area)+'. Exact public address is not currently listed.</p>')+
    '<p><strong>Verification:</strong> '+esc(s.verified?'Verified listing':'Public-source listing; verification is still being enriched.')+(s.lastChecked?' · Last checked '+esc(new Date(s.lastChecked).toLocaleDateString('en-IN')):'')+'</p>'+
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
    '<p>This page is a public reference for a current job signal found through a company or public hiring source. Job availability can change quickly, so the original application source remains authoritative for requirements, eligibility and whether the role is still open.</p>'+
    (j.lastSeenAt?'<p><strong>Last checked:</strong> '+esc(new Date(j.lastSeenAt).toLocaleDateString('en-IN'))+'</p>':'')+
    '<div class="seo-actions"><a class="seo-primary" href="'+esc(j.url||'#')+'" rel="nofollow noopener">Open application source →</a><a href="'+site+'/startup/'+slug(j.company)+'">View '+esc(j.company)+' profile →</a></div>'
  const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:j.title+' at '+j.company,url,description:j.title+' at '+j.company+' in the Kolkata startup ecosystem.',dateModified:j.lastSeenAt||j.datePosted||undefined},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'Jobs',item:site+'/jobs'},{'@type':'ListItem',position:3,name:j.title+' at '+j.company,item:url}]}]}
  fs.mkdirSync(path.join(root,'job',slugName),{recursive:true})
  fs.writeFileSync(path.join(root,'job',slugName,'index.html'),pageHtml({title:j.title+' at '+j.company+' — Kolkata Startup Jobs',description:j.title+' at '+j.company+'. View work mode, fresher signal and the public application source.',url,eyebrow:'Kolkata startup job',heading:j.title+' · '+j.company,stats:[{value:j.mode,label:'work mode'},{value:j.freshers?'Fresher':'Open',label:'candidate signal'},{value:j.type||'Job',label:'employment type'}],body,schema}))
}

for (const n of news) {
  const url=site+'/news/'+n.slug, date=n.publishedAt?new Date(n.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):''
  const body='<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/news">News</a> / '+esc(n.title)+'</nav>'+
    '<p class="seo-lead">'+esc(n.summary)+'</p><div class="seo-facts"><div><small>CATEGORY</small><b>'+esc(n.category)+'</b></div><div><small>SOURCE</small><b>'+esc(n.sourceName)+'</b></div><div><small>PUBLISHED</small><b>'+esc(date)+'</b></div><div><small>STATUS</small><b>'+(n.verified?'Verified':'Source linked')+'</b></div></div>'+
    '<p>This page is a concise public-source record of the ecosystem update. The original publisher remains the authoritative source for the full announcement, dates, eligibility, event details or other changing information. Kolkata Startup Map does not replace the original report.</p>'+
    '<div class="seo-actions"><a class="seo-primary" href="'+esc(n.sourceUrl)+'" rel="nofollow noopener">Read original source →</a><a href="'+site+'/news">More ecosystem news →</a></div>'
  const schema={'@context':'https://schema.org','@graph':[{'@type':'NewsArticle',headline:n.title,url,datePublished:n.publishedAt||undefined,dateModified:n.updatedAt||n.publishedAt||undefined,description:n.summary||undefined,mainEntityOfPage:{'@type':'WebPage','@id':url},publisher:{'@type':'Organization',name:'Kolkata Startup Map',url:site,logo:{'@type':'ImageObject',url:site+'/k-icon.svg'}},isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'},citation:n.sourceUrl||undefined},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'News',item:site+'/news'},{'@type':'ListItem',position:3,name:n.title,item:url}]}]}
  fs.mkdirSync(path.join(root,'news',n.slug),{recursive:true})
  fs.writeFileSync(path.join(root,'news',n.slug,'index.html'),pageHtml({title:(n.title.length>50?n.title.slice(0,50).trim()+'…':n.title)+' | KSM',description:(n.summary||'Kolkata startup ecosystem news and update.').slice(0,155),url,eyebrow:'Kolkata ecosystem news',heading:n.title,stats:[{value:n.category,label:'category'},{value:n.sourceName,label:'source'},{value:date||'Public source',label:'published'}],body,schema}))
}

console.log('Generated '+(cleanStartups.length+jobs.length+news.length+resources.length+sectorNames.length+areaNames.length+6)+' crawlable SEO pages; live data: '+liveData)
