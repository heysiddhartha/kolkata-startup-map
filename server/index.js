import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app=express()
app.use(cors())
app.use(express.json({limit:'1mb'}))

const supabase=process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

app.get('/api/health',(_,res)=>res.json({ok:true,service:'kolkata-startup-map-api'}))

app.get('/api/startups',async(_,res)=>{
  if(!supabase)return res.json({source:'static',startups:[]})
  const {data,error}=await supabase.from('startups').select('*').eq('status','approved').order('name')
  if(error)return res.status(500).json({error:error.message})
  res.json({source:'supabase',startups:data||[]})
})

app.get('/api/jobs',async(_,res)=>{
  if(!supabase)return res.json({source:'static',jobs:[]})
  const {data,error}=await supabase.from('jobs').select('*').eq('status','live').order('created_at',{ascending:false})
  if(error)return res.status(500).json({error:error.message})
  res.json({source:'supabase',jobs:data||[]})
})

app.post('/api/submissions',async(req,res)=>{
  if(!supabase)return res.status(503).json({error:'Submission API is not configured yet.'})
  const allowed=['startup_name','website','founder','email','sector','locality','description','linkedin_url','careers_url']
  const payload=Object.fromEntries(allowed.filter(k=>req.body?.[k]!==undefined).map(k=>[k,req.body[k]]))
  if(!payload.startup_name||!payload.website)return res.status(400).json({error:'startup_name and website are required'})
  const {error}=await supabase.from('submissions').insert({...payload,status:'pending'})
  if(error)return res.status(500).json({error:error.message})
  res.status(201).json({ok:true})
})

app.listen(process.env.PORT||8787,()=>console.log('Kolkata Startup Map API ready'))