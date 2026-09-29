import fs from 'node:fs'
import path from 'node:path'
import { loadDirectoryData } from './live-data.mjs'

const { startups, jobs, news = [] } = await loadDirectoryData()

const base = 'https://heysiddhartha.github.io/kolkata-startup-map'
const slug = s => String(s ?? '').toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const iso = value => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0,10) : d.toISOString().slice(0,10)
}

const urls = new Map([
  ['/', iso(new Date()), 'daily'],
  ['/startups', iso(new Date()), 'daily'],
  ['/jobs', iso(new Date()), 'daily'],
  ['/sectors', iso(new Date()), 'weekly'],
  ['/locations', iso(new Date()), 'weekly'],
  ['/news', iso(new Date()), 'daily']
])

for (const s of startups) urls.set('/startup/'+slug(s.name), iso(s.lastChecked || new Date()), 'weekly')
for (const j of jobs) urls.set('/job/'+slug(j.company+'-'+j.title), iso(j.lastChecked || new Date()), 'daily')
for (const n of news) if (n.slug) urls.set('/news/'+n.slug, iso(n.publishedAt || new Date()), 'daily')

const sectors = [...new Set(startups.map(s => s.sector).filter(Boolean))].sort()
for (const sector of sectors) urls.set('/sector/'+slug(sector), iso(new Date()), 'weekly')

const areas = [...new Set(startups.map(s => s.area).filter(Boolean))].sort()
for (const area of areas) urls.set('/location/'+slug(area), iso(new Date()), 'weekly')

const body = [...urls].map(([u,lastmod,freq]) =>
  '<url><loc>'+esc(base+u)+'</loc><lastmod>'+lastmod+'</lastmod><changefreq>'+freq+'</changefreq></url>'
).join('')

fs.mkdirSync(path.resolve('public'), {recursive:true})
fs.writeFileSync(path.resolve('public/sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+body+'</urlset>'
)
fs.writeFileSync(path.resolve('public/robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: '+base+'/sitemap.xml\n'
)
console.log('Generated sitemap with '+urls.size+' indexable URLs')
