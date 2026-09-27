import fs from 'node:fs'
import path from 'node:path'
import { startups, jobs } from '../src/data.js'

const root = path.resolve('dist')
const base = '/kolkata-startup-map/'
const site = 'https://heysiddhartha.github.io/kolkata-startup-map'
const slug = s => String(s).toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

const template = fs.readFileSync(path.join(root,'index.html'),'utf8')
const makePage = (title, description, url, schema) => {
  let html = template
    .replace(/<title>[^<]*<\/title>/, '<title>'+esc(title)+'</title>')
    .replace(/<meta name="description" content="[^"]*"\/>/, '<meta name="description" content="'+esc(description)+'"/>')
    .replace(/<link rel="canonical" href="[^"]*"\/>/, '<link rel="canonical" href="'+url+'"/>')
    .replace('</head>', '<script type="application/ld+json">'+JSON.stringify(schema)+'</script></head>')
  return html
}

for (const s of startups) {
  const url = site+'/startup/'+slug(s.name)
  const dir = path.join(root,'startup',slug(s.name))
  fs.mkdirSync(dir,{recursive:true})
  const schema = {
    '@context':'https://schema.org',
    '@type':'Organization',
    name:s.name,
    description:s.desc,
    url:s.url,
    areaServed:'Kolkata, West Bengal, India'
  }
  fs.writeFileSync(path.join(dir,'index.html'), makePage(
    s.name+' — Kolkata Startup Map',
    s.name+' in Kolkata: sector, location, startup profile and ecosystem information on Kolkata Startup Map.',
    url,
    schema
  ))
}

for (const j of jobs) {
  const slugName = slug(j.company+'-'+j.title)
  const url = site+'/job/'+slugName
  const dir = path.join(root,'job',slugName)
  fs.mkdirSync(dir,{recursive:true})
  const schema = {
    '@context':'https://schema.org',
    '@type':'JobPosting',
    title:j.title,
    hiringOrganization:{'@type':'Organization',name:j.company},
    jobLocation:{'@type':'Place',address:{'@type':'PostalAddress',addressLocality:'Kolkata',addressRegion:'West Bengal',addressCountry:'IN'}},
    url:j.url
  }
  fs.writeFileSync(path.join(dir,'index.html'), makePage(
    j.title+' at '+j.company+' — Kolkata Startup Map',
    j.title+' at '+j.company+' in the Kolkata startup ecosystem. View the public application source on Kolkata Startup Map.',
    url,
    schema
  ))
}

console.log('Generated '+(startups.length+jobs.length)+' static SEO pages')
