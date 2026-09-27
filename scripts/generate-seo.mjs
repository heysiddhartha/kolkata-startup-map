import fs from 'node:fs'
import path from 'node:path'
import { startups, jobs } from '../src/data.js'

const base = 'https://heysiddhartha.github.io/kolkata-startup-map'
const slug = s => String(s).toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const urls = new Map([
  ['/', ['daily','1.0']],
  ['/startups', ['daily','0.9']],
  ['/jobs', ['hourly','0.9']]
])
for (const s of startups) urls.set('/startup/'+slug(s.name), ['weekly','0.8'])
for (const j of jobs) urls.set('/job/'+slug(j.company+'-'+j.title), ['daily','0.7'])
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
const body = [...urls].map(([u,m]) => '<url><loc>'+esc(base+u)+'</loc><changefreq>'+m[0]+'</changefreq><priority>'+m[1]+'</priority></url>').join('')
fs.mkdirSync(path.resolve('public'), {recursive:true})
fs.writeFileSync(path.resolve('public/sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+body+'</urlset>')
console.log('Generated sitemap with '+urls.size+' URLs')
