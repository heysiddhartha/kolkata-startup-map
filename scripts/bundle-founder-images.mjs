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

function decodeHtml(value){
  return value
    .replace(/&amp;/g,'&')
    .replace(/&#39;/g,"'")
    .replace(/&quot;/g,'"')
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>')
}

function htmlEscape(value){
  return value.replace(/&/g,'&amp;').replace(/"/g,'&quot;')
}

function download(url,dest){
  return new Promise((resolve,reject)=>{
    const req=https.get(url,{headers:{'User-Agent':'Kolkata-Startup-Map/1.0','Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}},res=>{
      if(res.statusCode>=300&&res.statusCode<400&&res.headers.location){
        res.resume()
        return download(new URL(res.headers.location,url).href,dest).then(resolve,reject)
      }
      if(res.statusCode!==200){
        res.resume()
        return reject(new Error('HTTP '+res.statusCode))
      }
      const f=fs.createWriteStream(dest)
      res.pipe(f)
      f.on('finish',()=>f.close(resolve))
      f.on('error',reject)
    })
    req.on('error',reject)
    req.setTimeout(20000,()=>req.destroy(new Error('timeout')))
  })
}

const htmlFiles=walk(root).filter(f=>f.endsWith('.html'))
const urls=new Map()

for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8')
  for(const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)){
    const raw=m[1]
    const url=decodeHtml(raw)
    if(/^https?:\/\//i.test(url)) urls.set(url,raw)
  }
}

let count=0
let failed=0

for(const [url,rawHtmlValue] of urls){
  const hash=crypto.createHash('sha1').update(url).digest('hex').slice(0,16)
  let ext=(new URL(url).pathname.match(/\.(jpe?g|png|webp|gif|avif|svg)$/i)?.[1]||'jpg').toLowerCase()
  if(ext==='jpeg') ext='jpg'
  const filename=hash+'.'+ext
  const dest=path.join(outDir,filename)

  try{
    if(!fs.existsSync(dest)) await download(url,dest)

    const publicUrl='/kolkata-startup-map/founder-images/'+filename

    for(const file of htmlFiles){
      let html=fs.readFileSync(file,'utf8')
      const escaped=htmlEscape(url)
      if(html.includes(escaped)){
        html=html.split(escaped).join(publicUrl)
        fs.writeFileSync(file,html)
      }else if(html.includes(rawHtmlValue)){
        html=html.split(rawHtmlValue).join(publicUrl)
        fs.writeFileSync(file,html)
      }
    }
    count++
  }catch(err){
    failed++
    console.warn('Founder image download failed:',url,err.message)
  }
}

console.log('Bundled '+count+' founder images locally; '+failed+' failed.')
