import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import https from 'node:https'

const root='dist'
const outDir=path.join(root,'founder-images')
fs.mkdirSync(outDir,{recursive:true})

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    const p=path.join(dir,e.name)
    return e.isDirectory()?walk(p):[p]
  })
}
function download(url,dest){
  return new Promise((resolve,reject)=>{
    const req=https.get(url,{headers:{'User-Agent':'Kolkata-Startup-Map/1.0'}},res=>{
      if(res.statusCode>=300&&res.statusCode<400&&res.headers.location){
        res.resume(); return download(new URL(res.headers.location,url).href,dest).then(resolve,reject)
      }
      if(res.statusCode!==200){res.resume();return reject(new Error('HTTP '+res.statusCode))}
      const f=fs.createWriteStream(dest); res.pipe(f)
      f.on('finish',()=>f.close(resolve)); f.on('error',reject)
    })
    req.on('error',reject)
  })
}

const htmlFiles=walk(root).filter(f=>f.endsWith('.html'))
const urls=new Set()
for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8')
  for(const m of html.matchAll(/https:\/\/echai\.ventures\/[^"'\s<>]+/g)) urls.add(m[0])
}

let count=0
for(const url of urls){
  const hash=crypto.createHash('sha1').update(url).digest('hex').slice(0,16)
  const ext=(new URL(url).pathname.match(/\.(jpe?g|png|webp)$/i)?.[1]||'jpg').toLowerCase().replace('jpeg','jpg')
  const filename=hash+'.'+ext
  const dest=path.join(outDir,filename)
  try{
    if(!fs.existsSync(dest)) await download(url,dest)
    const publicUrl='/kolkata-startup-map/founder-images/'+filename
    for(const file of htmlFiles){
      const html=fs.readFileSync(file,'utf8')
      if(html.includes(url)) fs.writeFileSync(file,html.split(url).join(publicUrl))
    }
    count++
  }catch(err){
    console.warn('Founder image download failed:',url,err.message)
  }
}
console.log('Bundled '+count+' founder images locally.')
