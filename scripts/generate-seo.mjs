import fs from 'node:fs'
import path from 'node:path'
import { loadDirectoryData } from './live-data.mjs'

const { startups, jobs, news = [], resources = [] } = await loadDirectoryData()

const base = 'https://heysiddhartha.github.io/kolkata-startup-map'
const slug = s => String(s ?? '').toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const cleanArea = value => /area not specified/i.test(String(value||'')) ? 'Kolkata' : String(value||'Kolkata').trim() || 'Kolkata'
const cleanSector = value => String(value||'Other').trim() || 'Other'
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const iso = value => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0,10) : d.toISOString().slice(0,10)
}
const latestDate = values => {
  const valid = values.map(v => new Date(v)).filter(d => !Number.isNaN(d.getTime()))
  return iso(valid.length ? new Date(Math.max(...valid.map(d => d.getTime()))) : new Date())
}
const siteLastmod = latestDate([
  ...startups.map(s => s.lastChecked),
  ...jobs.map(j => j.lastSeenAt || j.datePosted),
  ...news.map(n => n.updatedAt || n.publishedAt)
])

const urls = new Map([
  ['/', [siteLastmod, 'daily']],
  ['/startups', [latestDate(startups.map(s => s.lastChecked)), 'daily']],
  ['/jobs', [latestDate(jobs.map(j => j.lastSeenAt || j.datePosted)), 'daily']],
  ['/sectors', [latestDate(startups.map(s => s.lastChecked)), 'weekly']],
  ['/locations', [latestDate(startups.map(s => s.lastChecked)), 'weekly']],
  ['/news', [latestDate(news.map(n => n.updatedAt || n.publishedAt)), 'daily']],
  ['/resources', [latestDate(resources.map(r => r.lastCheckedAt)), 'weekly']],
  ['/ecosystem', [siteLastmod, 'weekly']],
  ['/methodology', [siteLastmod, 'monthly']]
])

for (const s of startups) {
  const thin = !s.desc || s.desc.trim().length < 40 || (/profile verification pending/i.test(s.desc) && !s.url && !s.founder && !s.linkedin)
  if (!thin) urls.set('/startup/'+slug(s.name), [iso(s.lastChecked || new Date()), 'weekly'])
}
for (const j of jobs) urls.set('/job/'+slug(j.company+'-'+j.title), [iso(j.lastSeenAt || j.datePosted || new Date()), 'daily'])
for (const n of news) if (n.slug) urls.set('/news/'+n.slug, [iso(n.updatedAt || n.publishedAt || new Date()), 'daily'])

const sectors = [...new Set(startups.map(s => cleanSector(s.sector)).filter(Boolean))].sort()
for (const sector of sectors) urls.set('/sector/'+slug(sector), [latestDate(startups.filter(s => cleanSector(s.sector) === sector).map(s => s.lastChecked)), 'weekly'])

const areas = [...new Set(startups.map(s => cleanArea(s.area)).filter(Boolean))].sort()
for (const area of areas) urls.set('/location/'+slug(area), [latestDate(startups.filter(s => cleanArea(s.area) === area).map(s => s.lastChecked)), 'weekly'])

const body = [...urls].map(([u,[lastmod,freq]]) =>
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
