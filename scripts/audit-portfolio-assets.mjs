import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
const source=await readFile('src/components/PortfolioSection.js','utf8');
const section=source.split('const PHOTOS = [')[1]?.split('];')[0];
if (!section) throw new Error('Cannot locate PHOTOS catalogue');
const items=[...section.matchAll(/\{\s*id:\s*"([^"]+)"\s*,\s*tags:\s*\[([^\]]*)\]/g)]
 .map(([,id,tags],i)=>({index:i+1,id,tags:[...tags.matchAll(/"([^"]+)"/g)].map(m=>m[1])}));
if(items.length!==42) throw new Error('Expected 42 images, found '+items.length);
const dest='portfolio-media-audit';
const base='https://res.cloudinary.com/dpc1noikx/image/upload/';
await mkdir(join(dest,'images'),{recursive:true});
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
async function download(item){
 const urls=[base+'w_640,c_limit,f_jpg,q_72/'+encodeURIComponent(item.id),base+encodeURIComponent(item.id)];
 let reason='';
 for(let p=0;p<urls.length;p++) for(let attempt=0;attempt<2;attempt++){
  try{
   const res=await fetch(urls[p],{headers:{'User-Agent':'SeraphicSightMediaAudit/1.0'},signal:AbortSignal.timeout(15000)});
   const type=res.headers.get('content-type')||'';
   if(!res.ok||!type.startsWith('image/')) throw new Error('HTTP '+res.status+' '+type);
   const bytes=Buffer.from(await res.arrayBuffer());
   if(bytes.length<1024||bytes.length>35e6) throw new Error('Invalid response length '+bytes.length);
   const ext=type.includes('png')?'png':type.includes('webp')?'webp':'jpg';
   const file='images/'+String(item.index).padStart(2,'0')+'.'+ext;
   await writeFile(join(dest,file),bytes);
   return {...item,status:'available',file,bytes:bytes.length,source:p===0?'transformed':'original'};
  }catch(e){reason=String(e.message||e);if(attempt===0)await sleep(400);}
 }
 return {...item,status:'unavailable',reason};
}
const results=[];
for(let i=0;i<items.length;i+=4){
 const batch=await Promise.all(items.slice(i,i+4).map(download));
 results.push(...batch);
 for(const x of batch) console.log(String(x.index).padStart(2,'0'),x.id,x.status,x.reason||x.bytes);
}
const available=results.filter(x=>x.status==='available').length;
const manifest={checkedAt:new Date().toISOString(),total:items.length,available,unavailable:items.length-available,items:results};
await writeFile(join(dest,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const safe=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Seraphic Sight Media Audit</title><style>body{background:#16231b;color:#f0f0e8;font:15px system-ui;margin:0;padding:28px}h1{font-weight:500;letter-spacing:-.035em}p{color:#c3d0c4}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:18px}.item{border:1px solid #506455;background:#202e24;min-width:0}.item img{width:100%;aspect-ratio:4/3;object-fit:contain;background:#090f0b}.info{padding:15px}.id{font-size:12px;overflow-wrap:anywhere}.tag{font-size:11px;color:#bbd1bf}.missing{height:200px;display:grid;place-items:center;color:#e8b0a7}</style></head><body>';
html+='<h1>Seraphic Sight | 42 original media records</h1><p>Audited '+safe(manifest.checkedAt)+'. Images are bundled, not hotlinked; category labels are provisional. '+available+' available, '+(42-available)+' unavailable.</p><main>';
for(const item of results){
 html+='<article class="item">';
 html+=item.status==='available'?'<img loading="lazy" src="'+safe(item.file)+'" alt="Photo '+item.index+'">':'<div class="missing">UNAVAILABLE AT AUDIT TIME</div>';
 html+='<div class="info"><div class="tag">'+item.index+' / 42 · '+safe(item.tags.join(', ')||'Unclassified')+'</div><h3 class="id">'+safe(item.id)+'</h3>';
 if(item.reason)html+='<small>'+safe(item.reason)+'</small>';
 html+='</div></article>';
}
html+='</main></body></html>';
await writeFile(join(dest,'index.html'),html);
await writeFile(join(dest,'summary.txt'),'Portfolio media: '+available+'/'+items.length+' available\n'+results.filter(x=>x.reason).map(x=>x.id+': '+x.reason).join('\n')+'\n');
console.log('AUDIT TOTAL '+available+'/'+items.length);
