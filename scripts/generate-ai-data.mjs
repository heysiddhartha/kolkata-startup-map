import fs from 'node:fs'
import path from 'node:path'
import { loadDirectoryData } from './live-data.mjs'

const { startups, jobs } = await loadDirectoryData()
const base = 'https://heysiddhartha.github.io/kolkata-startup-map'
const generatedAt = new Date().toISOString()

const safeUrl = value => {
  const raw = String(value || '').trim()
  if (!raw || raw === '#') return null
  try {
    const url = new URL(raw)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}
const dateOrNull = value => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
const slug = value => String(value || '').toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const publicCompanies = startups.map(company => {
  const status = String(company.hiringStatus || 'unknown').toLowerCase()
  return {
    name: company.name,
    description: company.desc || null,
    sector: company.sector || null,
    stage: company.stage || null,
    area: company.area || null,
    address: company.address || null,
    website: safeUrl(company.url),
    linkedin: safeUrl(company.linkedin),
    careersUrl: safeUrl(company.careers),
    hiringStatus: ['hiring', 'not_hiring', 'unknown'].includes(status) ? status : 'unknown',
    hiringCheckedAt: dateOrNull(company.hiringCheckedAt),
    locationType: company.locationType || null,
    locationConfidence: company.locationConfidence || null,
    verified: Boolean(company.verified),
    sourceUrl: safeUrl(company.verificationSourceUrl),
    sourceCheckedAt: dateOrNull(company.verificationCheckedAt),
    lastCheckedAt: dateOrNull(company.lastChecked),
    profileUrl: base + '/startup/' + slug(company.name)
  }
})

const publicJobs = jobs.map(job => ({
  company: job.company,
  title: job.title,
  locationOrMode: job.mode || null,
  fresherEligible: Boolean(job.freshers),
  applicationUrl: safeUrl(job.url),
  sourceUrl: safeUrl(job.source),
  firstSeenAt: dateOrNull(job.datePosted),
  lastSeenAt: dateOrNull(job.lastSeenAt)
})).filter(job => job.applicationUrl || job.sourceUrl)

const out = path.resolve('dist/data')
fs.mkdirSync(out, { recursive: true })
const writeJson = (name, payload) => fs.writeFileSync(path.join(out, name), JSON.stringify(payload, null, 2) + '\n')

writeJson('companies.json', {
  name: 'Kolkata Startup Map public company dataset',
  description: 'Approved public company records for Kolkata and the surrounding West Bengal startup ecosystem.',
  generatedAt,
  count: publicCompanies.length,
  sourcePolicy: 'Company identity and hiring signals should be checked against linked original sources. Hiring status may change.',
  companies: publicCompanies
})
writeJson('jobs.json', {
  name: 'Kolkata Startup Map public jobs dataset',
  description: 'Live job records with application or source links where available.',
  generatedAt,
  count: publicJobs.length,
  sourcePolicy: 'Job availability can change; the employer or application source is authoritative.',
  jobs: publicJobs
})

const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Public Data &amp; API Guide | Kolkata Startup Map</title>
<meta name="description" content="Public data feeds and source policy for Kolkata Startup Map, a directory of Kolkata startups, companies and jobs.">
<link rel="canonical" href="${base}/ai-data.html">
</head>
<body>
<main>
<h1>Kolkata Startup Map: Public Data</h1>
<p>Kolkata Startup Map publishes a public-source directory of companies and jobs related to Kolkata and West Bengal.</p>
<h2>Public datasets</h2>
<ul>
<li><a href="${base}/data/companies.json">Companies JSON feed</a></li>
<li><a href="${base}/data/jobs.json">Jobs JSON feed</a></li>
<li><a href="${base}/sitemap.xml">XML sitemap</a></li>
<li><a href="${base}/">Interactive directory</a></li>
</ul>
<h2>How to use the data</h2>
<p>Feeds are static JSON generated during the site build. Compatible AI agents and developers can fetch these public URLs. This does not create an automatic integration with any particular AI platform.</p>
<p>Company records are drawn from approved listings. Hiring information can become outdated; follow the original employer or application link before acting on it. A missing job listing does not prove a company is not hiring.</p>
<h2>Corrections and attribution</h2>
<p>Use linked company and source URLs to verify information. If a record is incorrect or missing, use the submission/correction options on the main site.</p>
<p>Maintained by Siddhartha Sarkar.</p>
</main>
</body>
</html>
`
fs.writeFileSync(path.resolve('dist/ai-data.html'), html)
console.log(`Generated public AI data feeds: ${publicCompanies.length} companies and ${publicJobs.length} jobs.`)
