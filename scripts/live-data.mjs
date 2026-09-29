import { startups as seedStartups, jobs as seedJobs } from '../src/data.js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkzkpwaexadlwxqdfjlm.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function fetchJson(path) {
  const headers = { apikey: SUPABASE_KEY, Authorization: 'Bearer '+SUPABASE_KEY }
  const res = await fetch(SUPABASE_URL+'/rest/v1/'+path, { headers })
  if (!res.ok) throw new Error('Supabase request failed: '+res.status)
  return res.json()
}

export async function loadDirectoryData() {
  if (!SUPABASE_KEY) {
    console.log('SUPABASE_SERVICE_ROLE_KEY not set; using seed SEO data.')
    return { startups: seedStartups, jobs: seedJobs, live: false }
  }

  try {
    const [rows, jobRows] = await Promise.all([
      fetchJson('startups?select=name,area,sector,stage,description,website,linkedin_url,founder,address,careers_url,last_checked_at,status&status=eq.approved&order=name'),
      fetchJson('jobs?select=title,location,mode,employment_type,fresher,apply_url,source_url,status,startups(name)&status=eq.live&order=created_at.desc')
    ])

    const startups = (rows || []).map(x => ({
      name: x.name || 'Unnamed company',
      area: x.area || 'Kolkata',
      sector: x.sector || 'Other',
      stage: x.stage || 'Unknown',
      desc: x.description || '',
      url: x.website || '#',
      linkedin: x.linkedin_url || '',
      founder: x.founder || '',
      address: x.address || '',
      careers: x.careers_url || '',
      lastChecked: x.last_checked_at || ''
    }))

    const jobs = (jobRows || []).map(x => ({
      company: x.startups?.name || 'Kolkata startup',
      title: x.title || 'Open role',
      mode: x.mode || x.location || 'Kolkata',
      source: x.source_url || x.apply_url || '',
      freshers: !!x.fresher,
      url: x.apply_url || x.source_url || '#'
    }))

    if (!startups.length) throw new Error('Live startup dataset returned no approved rows')
    console.log('Loaded '+startups.length+' live startups and '+jobs.length+' live jobs for SEO generation.')
    return { startups, jobs, live: true }
  } catch (error) {
    console.warn('Live SEO data unavailable; using seed data:', error.message)
    return { startups: seedStartups, jobs: seedJobs, live: false }
  }
}
