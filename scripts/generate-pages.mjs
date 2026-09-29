import fs from 'node:fs'
import path from 'node:path'
import { loadDirectoryData } from './live-data.mjs'

const { startups, jobs, live: liveData } = await loadDirectoryData()

const root = path.resolve('dist')
const site = 'https://heysiddhartha.github.io/kolkata-startup-map'
const slug = s => String(s).toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const json = x => JSON.stringify(x).replace(/</g,'\\u003c')
const template = fs.readFileSync(path.join(root,'index.html'),'utf8')

function pageHtml({title,description,url,eyebrow,heading,body,schema}) {
  const content = '<main style="max-width:920px;margin:0 auto;padding:48px 22px;font-family:Inter,system-ui,sans-serif;line-height:1.6">'+
    '<p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.7">'+esc(eyebrow)+'</p>'+
    '<h1 style="font-size:clamp(32px,6vw,58px);line-height:1.05;margin:8px 0 18px">'+esc(heading)+'</h1>'+
    body+
    '<p style="margin-top:36px"><a href="'+site+'/">← Explore the Kolkata Startup Map</a></p></main>'
  let html = template
    .replace(/<title>[^<]*<\/title>/, '<title>'+esc(title)+'</title>')
    .replace(/<meta name="description" content="[^"]*"\/>/, '<meta name="description" content="'+esc(description)+'"/>')
    .replace(/<link rel="canonical" href="[^"]*"\/>/, '<link rel="canonical" href="'+url+'"/>')
    .replace(/<body>[\s\S]*?<\/body>/, '<body>'+content+'</body>')
  const injectedStyle = `<style>
:root{--bg:#f6efe3;--surface:#fffdf8;--text:#201a17;--muted:#756b62;--line:#ded2c0;--red:#b33a32;--saffron:#e5a51c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:"DM Sans",system-ui,sans-serif}.seo-page{min-height:100vh;padding:26px 18px 70px;background:radial-gradient(circle at 90% 10%,rgba(229,165,28,.12),transparent 280px)}.seo-shell{max-width:980px;margin:auto}.seo-brand{display:flex;align-items:center;gap:9px;padding:5px 0 46px}.seo-brand span{width:32px;height:32px;display:grid;place-items:center;border-radius:10px;background:var(--text);color:var(--bg);font-weight:800}.seo-brand a{font-weight:800;text-decoration:none}.seo-brand small{margin-left:5px;color:var(--muted);font-size:8px;letter-spacing:.12em}.seo-eyebrow{color:var(--red);font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.seo-page h1{font:700 clamp(38px,6vw,66px)/.95 "Space Grotesk",system-ui;margin:12px 0 18px;letter-spacing:-.055em}.seo-rule{height:1px;background:var(--line);margin-bottom:25px}.seo-page p{font-size:13px;line-height:1.7;color:var(--muted)}.seo-lead{max-width:760px;font-size:15px!important}.seo-callouts,.seo-facts{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface);margin:22px 0}.seo-callouts>div,.seo-facts>div{padding:15px;border-left:1px solid var(--line)}.seo-callouts>div:first-child,.seo-facts>div:first-child{border-left:0}.seo-callouts b,.seo-facts small{display:block;color:var(--red);font-size:8px;letter-spacing:.1em}.seo-callouts span{display:block;margin-top:7px;color:var(--muted);font-size:10px;line-height:1.5}.seo-list{columns:2;column-gap:30px;padding-left:20px}.seo-list li{break-inside:avoid;margin:0 0 9px;font-size:11px}.seo-list a{color:var(--text);font-weight:650}.seo-list a:hover{color:var(--red)}.breadcrumbs{font-size:10px!important;color:var(--muted)}.breadcrumbs a{color:var(--red)}.seo-facts{grid-template-columns:repeat(4,1fr)}.seo-facts b{display:block;margin-top:6px;font-size:11px}.seo-actions{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.seo-actions a{display:inline-block;padding:10px 13px;border:1px solid var(--line);border-radius:9px;text-decoration:none;color:var(--text);font-size:10px;font-weight:750;background:var(--surface)}.seo-actions .seo-primary{background:var(--text);color:var(--bg);border-color:var(--text)}.seo-back{margin-top:45px!important}.seo-back a{color:var(--red);font-weight:750}@media(max-width:650px){.seo-callouts,.seo-facts{grid-template-columns:1fr}.seo-callouts>div,.seo-facts>div{border-left:0;border-top:1px solid var(--line)}.seo-callouts>div:first-child,.seo-facts>div:first-child{border-top:0}.seo-list{columns:1}.seo-brand small{display:none}}
</style>`;
  return html.replace('</head>', injectedStyle+'<script type="application/ld+json">'+json(schema)+'</script></head>')
}

const startupLinks = startups.map(s => '<li><a href="'+site+'/startup/'+slug(s.name)+'">'+esc(s.name)+'</a> — '+esc(s.sector)+' · '+esc(s.area)+'</li>').join('')
fs.mkdirSync(path.join(root,'startups'),{recursive:true})
fs.writeFileSync(path.join(root,'startups','index.html'), pageHtml({
  title:'Kolkata Startups & Companies — Directory & Map',
  description:'Explore Kolkata startups, companies, branding studios, marketing agencies and other ecosystem organisations by sector and location.',
  url:site+'/startups',eyebrow:'Kolkata Startup Map',heading:'Kolkata Startups & Companies',
  body:'<p class="seo-lead">Browse the Kolkata ecosystem by organisation, sector and locality. Profiles can include public source links, hiring signals, founders and freshness information.</p><div class="seo-callouts"><div><b>STARTUPS</b><span>Technology, D2C, fintech, AI and growth-stage companies.</span></div><div><b>CREATIVE</b><span>Branding, marketing, advertising, design and media organisations.</span></div><div><b>ECOSYSTEM</b><span>Companies, communities and other public ecosystem listings.</span></div></div><ul class="seo-list">'+startupLinks+'</ul>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startups',url:site+'/startups',isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'},mainEntity:{'@type':'ItemList',itemListElement:startups.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:site+'/startup/'+slug(s.name)}))}}
}))

const jobLinks = jobs.map(j => '<li><a href="'+site+'/job/'+slug(j.company+'-'+j.title)+'">'+esc(j.title)+' at '+esc(j.company)+'</a> — '+esc(j.mode)+(j.freshers?' · fresher-friendly':'')+'</li>').join('')
fs.mkdirSync(path.join(root,'jobs'),{recursive:true})
fs.writeFileSync(path.join(root,'jobs','index.html'), pageHtml({
  title:'Kolkata Startup Jobs — Current Listings',
  description:'Browse startup jobs and internships connected to the Kolkata ecosystem, with public application sources.',
  url:site+'/jobs',eyebrow:'Kolkata Startup Map',heading:'Kolkata Startup Jobs',
  body:'<p>Browse the current seeded job listings and internships. Application links open the public source provided for each listing.</p><ul>'+jobLinks+'</ul><p>Listings are informational and should be checked at the application source for current availability.</p>',
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata Startup Jobs',url:site+'/jobs',isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'},mainEntity:{'@type':'ItemList',itemListElement:jobs.map((j,i)=>({'@type':'ListItem',position:i+1,name:j.title+' at '+j.company,url:site+'/job/'+slug(j.company+'-'+j.title)}))}}
}))

const sectors = [...new Set(startups.map(s => s.sector).filter(Boolean))].sort()
const areas = [...new Set(startups.map(s => s.area).filter(Boolean))].sort()

for (const area of areas) {
  const matches = startups.filter(s => s.area === area)
  const areaSlug = slug(area)
  const url = site+'/location/'+areaSlug
  const dir = path.join(root,'location',areaSlug)
  fs.mkdirSync(dir,{recursive:true})
  const links = matches.map(s => '<li><a href="'+site+'/startup/'+slug(s.name)+'">'+esc(s.name)+'</a> — '+esc(s.sector)+'</li>').join('')
  const body = '<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/startups">Directory</a> / '+esc(area)+'</nav>'+
    '<p class="seo-lead">Startups and companies listed in '+esc(area)+', Kolkata, with public profiles, sectors and ecosystem information.</p>'+
    '<div class="seo-callouts"><div><b>LOCALITY</b><span>'+esc(area)+'</span></div><div><b>LISTED</b><span>'+matches.length+' organisations currently listed</span></div><div><b>EXPLORE</b><span>Open individual profiles for available public details.</span></div></div>'+
    '<ul class="seo-list">'+links+'</ul>'
  const schema={'@context':'https://schema.org','@type':'CollectionPage',name:'Startups and Companies in '+area+', Kolkata',url,isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'},mainEntity:{'@type':'ItemList',itemListElement:matches.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:site+'/startup/'+slug(s.name)}))}}
  fs.writeFileSync(path.join(dir,'index.html'), pageHtml({title:'Startups & Companies in '+area+', Kolkata — Kolkata Startup Map',description:'Explore startups and companies in '+area+', Kolkata, with public profiles and ecosystem information.',url,eyebrow:'Kolkata locality directory',heading:'Startups & Companies in '+area,body,schema}))
}

const sectors = [...new Set(startups.map(s => s.sector).filter(Boolean))].sort()
for (const sector of sectors) {
  const matches = startups.filter(s => s.sector === sector)
  const sectorSlug = slug(sector)
  const url = site+'/sector/'+sectorSlug
  const dir = path.join(root,'sector',sectorSlug)
  fs.mkdirSync(dir,{recursive:true})
  const links = matches.map(s => '<li><a href="'+site+'/startup/'+slug(s.name)+'">'+esc(s.name)+'</a> — '+esc(s.area)+'</li>').join('')
  const body = '<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/startups">Directory</a> / '+esc(sector)+'</nav>'+
    '<p class="seo-lead">Kolkata companies and startups in the '+esc(sector)+' sector, with public profiles, locations and ecosystem information.</p>'+
    '<div class="seo-callouts"><div><b>SECTOR</b><span>'+esc(sector)+'</span></div><div><b>LISTED</b><span>'+matches.length+' organisations currently listed</span></div><div><b>EXPLORE</b><span>Open individual profiles for available public details.</span></div></div>'+
    '<ul class="seo-list">'+links+'</ul>'
  const schema={'@context':'https://schema.org','@type':'CollectionPage',name:'Kolkata '+sector+' Startups & Companies',url,isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'},mainEntity:{'@type':'ItemList',itemListElement:matches.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:site+'/startup/'+slug(s.name)}))}}
  fs.writeFileSync(path.join(dir,'index.html'), pageHtml({title:'Kolkata '+sector+' Startups & Companies — Kolkata Startup Map',description:'Explore Kolkata startups and companies in '+sector+', with public profiles and ecosystem information.',url,eyebrow:'Kolkata sector directory',heading:'Kolkata '+sector+' Startups & Companies',body,schema}))
}

for (const s of startups) {
  const url = site+'/startup/'+slug(s.name)
  const dir = path.join(root,'startup',slug(s.name))
  fs.mkdirSync(dir,{recursive:true})
  const body = '<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/startups">Directory</a> / '+esc(s.name)+'</nav>'+
    '<p class="seo-lead">'+esc(s.desc)+'</p><div class="seo-facts"><div><small>SECTOR</small><b>'+esc(s.sector)+'</b></div><div><small>AREA</small><b>'+esc(s.area)+'</b></div><div><small>STAGE</small><b>'+esc(s.stage)+'</b></div><div><small>TYPE</small><b>'+(/brand|advertis|marketing|creative|design|pr|media|social|production/i.test(s.sector)?'Creative & Branding':'Startup & Company')+'</b></div></div>'+
    (s.founder?'<p><strong>Founder:</strong> '+esc(s.founder)+'</p>':'')+
    (s.address?'<p><strong>Public location:</strong> '+esc(s.address)+'</p>':'')+
    '<div class="seo-actions"><a class="seo-primary" href="'+esc(s.url)+'" rel="nofollow noopener">Visit public company/source page →</a>'+(s.linkedin?'<a href="'+esc(s.linkedin)+'" rel="nofollow noopener">LinkedIn →</a>':'')+(s.careers?'<a href="'+esc(s.careers)+'" rel="nofollow noopener">Careers →</a>':'')+'</div>'+
    (s.lastChecked?'<p class="seo-freshness">Source checked '+esc(new Date(s.lastChecked).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}))+'</p>':'')
  const org={'@context':'https://schema.org','@type':'Organization',name:s.name,description:s.desc,url:s.url,areaServed:{'@type':'City',name:'Kolkata'},address:{'@type':'PostalAddress',addressLocality:'Kolkata',addressRegion:'West Bengal',addressCountry:'IN'}}
  const schema={'@context':'https://schema.org','@graph':[org,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'Startups',item:site+'/startups'},{'@type':'ListItem',position:3,name:s.name,item:url}]}]}
  fs.writeFileSync(path.join(dir,'index.html'), pageHtml({title:s.name+' — Kolkata Startup Map',description:s.name+' in Kolkata: sector, locality, stage and startup profile on Kolkata Startup Map.',url,eyebrow:'Startup profile',heading:s.name,body,schema}))
}

for (const j of jobs) {
  const slugName = slug(j.company+'-'+j.title), url = site+'/job/'+slugName, dir = path.join(root,'job',slugName)
  fs.mkdirSync(dir,{recursive:true})
  const body = '<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/jobs">Jobs</a> / '+esc(j.company)+'</nav>'+
    '<p class="seo-lead"><strong>'+esc(j.title)+'</strong> at <strong>'+esc(j.company)+'</strong>.</p><div class="seo-facts"><div><small>WORK MODE</small><b>'+esc(j.mode)+'</b></div><div><small>SOURCE</small><b>'+esc(j.source)+'</b></div><div><small>FRESHER</small><b>'+(j.freshers?'Yes':'Not marked')+'</b></div><div><small>TYPE</small><b>Job listing</b></div></div>'+
    '<p>These pages are indexed references to public listings. Job availability can change, so check the application source before applying.</p><div class="seo-actions"><a class="seo-primary" href="'+esc(j.url)+'" rel="nofollow noopener">Open application source →</a></div>'
  const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:j.title+' at '+j.company,url,description:j.title+' at '+j.company+' in the Kolkata startup ecosystem.',isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'Jobs',item:site+'/jobs'},{'@type':'ListItem',position:3,name:j.title+' at '+j.company,item:url}]}]}
  fs.writeFileSync(path.join(dir,'index.html'), pageHtml({title:j.title+' at '+j.company+' — Kolkata Startup Map',description:j.title+' at '+j.company+' in the Kolkata startup ecosystem. View the public application source.',url,eyebrow:'Job listing reference',heading:j.title+' · '+j.company,body,schema}))
}

console.log('Generated '+(startups.length+jobs.length+2)+' crawlable SEO pages')
