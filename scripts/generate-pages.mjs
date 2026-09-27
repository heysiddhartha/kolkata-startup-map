import fs from 'node:fs'
import path from 'node:path'
import { startups, jobs } from '../src/data.js'

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
  return html.replace('</head>', '<script type="application/ld+json">'+json(schema)+'</script></head>')
}

const startupLinks = startups.map(s => '<li><a href="'+site+'/startup/'+slug(s.name)+'">'+esc(s.name)+'</a> — '+esc(s.sector)+' · '+esc(s.area)+'</li>').join('')
fs.mkdirSync(path.join(root,'startups'),{recursive:true})
fs.writeFileSync(path.join(root,'startups','index.html'), pageHtml({
  title:'Kolkata Startups — Directory & Map',
  description:'Explore startups in Kolkata by sector and location, with individual startup profiles on the Kolkata Startup Map.',
  url:site+'/startups',eyebrow:'Kolkata Startup Map',heading:'Kolkata Startups',
  body:'<p>Browse the Kolkata startup ecosystem by company, sector and locality. Each profile links back to the interactive map.</p><ul>'+startupLinks+'</ul>',
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

for (const s of startups) {
  const url = site+'/startup/'+slug(s.name)
  const dir = path.join(root,'startup',slug(s.name))
  fs.mkdirSync(dir,{recursive:true})
  const body = '<nav aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/startups">Startups</a> / '+esc(s.name)+'</nav>'+
    '<p>'+esc(s.desc)+'</p><dl><dt><strong>Sector</strong></dt><dd>'+esc(s.sector)+'</dd><dt><strong>Area</strong></dt><dd>'+esc(s.area)+'</dd><dt><strong>Stage</strong></dt><dd>'+esc(s.stage)+'</dd></dl>'+
    '<p><a href="'+esc(s.url)+'" rel="nofollow noopener">Visit public company/source page</a></p>'
  const org={'@context':'https://schema.org','@type':'Organization',name:s.name,description:s.desc,url:s.url,areaServed:{'@type':'City',name:'Kolkata'},address:{'@type':'PostalAddress',addressLocality:'Kolkata',addressRegion:'West Bengal',addressCountry:'IN'}}
  const schema={'@context':'https://schema.org','@graph':[org,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'Startups',item:site+'/startups'},{'@type':'ListItem',position:3,name:s.name,item:url}]}]}
  fs.writeFileSync(path.join(dir,'index.html'), pageHtml({title:s.name+' — Kolkata Startup Map',description:s.name+' in Kolkata: sector, locality, stage and startup profile on Kolkata Startup Map.',url,eyebrow:'Startup profile',heading:s.name,body,schema}))
}

for (const j of jobs) {
  const slugName = slug(j.company+'-'+j.title), url = site+'/job/'+slugName, dir = path.join(root,'job',slugName)
  fs.mkdirSync(dir,{recursive:true})
  const body = '<nav aria-label="Breadcrumb"><a href="'+site+'/">Kolkata Startup Map</a> / <a href="'+site+'/jobs">Jobs</a> / '+esc(j.company)+'</nav>'+
    '<p><strong>'+esc(j.title)+'</strong> at <strong>'+esc(j.company)+'</strong>.</p><dl><dt><strong>Location / mode</strong></dt><dd>'+esc(j.mode)+'</dd><dt><strong>Source</strong></dt><dd>'+esc(j.source)+'</dd><dt><strong>Fresher friendly</strong></dt><dd>'+(j.freshers?'Yes':'Not marked as fresher-friendly')+'</dd></dl>'+
    '<p>This page is an indexed reference to the public listing source. Check the source before applying because job availability can change.</p><p><a href="'+esc(j.url)+'" rel="nofollow noopener">Open application source</a></p>'
  const schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:j.title+' at '+j.company,url,description:j.title+' at '+j.company+' in the Kolkata startup ecosystem.',isPartOf:{'@type':'WebSite',name:'Kolkata Startup Map',url:site+'/'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Kolkata Startup Map',item:site+'/'},{'@type':'ListItem',position:2,name:'Jobs',item:site+'/jobs'},{'@type':'ListItem',position:3,name:j.title+' at '+j.company,item:url}]}]}
  fs.writeFileSync(path.join(dir,'index.html'), pageHtml({title:j.title+' at '+j.company+' — Kolkata Startup Map',description:j.title+' at '+j.company+' in the Kolkata startup ecosystem. View the public application source.',url,eyebrow:'Job listing reference',heading:j.title+' · '+j.company,body,schema}))
}

console.log('Generated '+(startups.length+jobs.length+2)+' crawlable SEO pages')
