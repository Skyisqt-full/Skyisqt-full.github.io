import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import QRCode from 'qrcode';
import sharp from 'sharp';
import {profile,PUBLIC_PORTFOLIO_URL} from '../src/config/profile.mjs';
import {slides,projects,details} from '../src/content.mjs';
import {recordOrigin,origins} from './provenance.mjs';
const root=path.resolve('.');
const dist=path.resolve('dist');
if(path.dirname(dist)!==root||path.basename(dist)!=='dist')throw Error('Unsafe build output path');
await fs.rm(dist,{recursive:true,force:true});
for(const dest of ['dist','exports/qr','exports/offline','public/qr','public/icons'])await fs.mkdir(dest,{recursive:true});
for(const [name,target] of [['telegram',profile.telegram],['github',profile.github]]){
 const url=new URL(target);if(url.protocol!=='https:'||/localhost|127\.|\.invalid/.test(url.hostname))throw Error('Invalid QR destination');
 await QRCode.toFile('exports/qr/'+name+'.png',target,{width:768,margin:4,errorCorrectionLevel:'M',color:{dark:'#17131f',light:'#ffffff'}});
 await recordOrigin('exports/qr/'+name+'.png','QR generated with qrcode from verified profile URL '+target+'; four-module quiet zone; M error correction.');
 await fs.copyFile('exports/qr/'+name+'.png','public/qr/'+name+'.png');
 await recordOrigin('public/qr/'+name+'.png','Generated QR for '+target+'; identical to export.');
}
for(const size of [192,512]){
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 512 512"><rect width="512" height="512" fill="#101014"/><path d="M133 370 210 142h58l77 228h-55l-16-49h-70l-15 49zm85-94h42l-21-81z" fill="#f4f3f7"/><path d="M360 180h32l-30 92h-32z" fill="#ab8bfa"/></svg>';
 await sharp(Buffer.from(svg)).png().toFile('public/icons/icon-'+size+'.png');
 await recordOrigin('public/icons/icon-'+size+'.png','Authored ARTEM geometric monogram in build.mjs, SVG rendered with Sharp.');
}
const assets={};
for(const f of (await fs.readdir('public/images')).filter(f=>f.endsWith('.webp'))){
 const key=path.parse(f).name;assets[key]='images/'+f;
 await recordOrigin('public/images/'+f,origins[key]||'Actual source product screenshot, isolated local demo; cropped by optimize-images.mjs, no generated UI.');
}
for(const key of ['telegram','github'])assets['qr-'+key]='qr/'+key+'.png';
for(const required of [...Object.values(details).flatMap(d=>d.images),...projects.map(p=>p.image)])if(!assets[required])throw Error('Missing screenshot: '+required);
await fs.cp('public','dist',{recursive:true});
const read=async file=>(await fs.readFile(file,'utf8')).replace(/\r\n/g,'\n');
const css=await read('src/styles.css'),app=await read('src/app.js'),template=await read('src/template.html');
const data=assets=>'window.DECK='+JSON.stringify({profile,slides,projects,details,assets}).replace(/</g,'\\u003c')+';';
const hash=s=>crypto.createHash('sha256').update(s).digest('base64');
function html(css,data,pwa){
 const url=new URL(PUBLIC_PORTFOLIO_URL);
 if(url.protocol!=='https:'||url.search||url.hash||!url.pathname.endsWith('/'))throw Error('Invalid public portfolio URL');
 const image=new URL('social-preview.png',url).href;
 const social='<link rel="canonical" href="'+url.href+'"><meta property="og:type" content="website"><meta property="og:site_name" content="ARTEM"><meta property="og:title" content="Artem — Product / Full-stack Developer"><meta property="og:description" content="Industrial systems built from scratch through production. WEB SCADA, industrial marking and selected product prototypes."><meta property="og:url" content="'+url.href+'"><meta property="og:image" content="'+image+'"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="ARTEM — Product / Full-stack. Industrial systems to production."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Artem — Product / Full-stack Developer"><meta name="twitter:description" content="Industrial systems built from scratch through production."><meta name="twitter:image" content="'+image+'">';
 const csp="default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; font-src 'self' data:; script-src 'sha256-"+hash(data)+"' 'sha256-"+hash(app)+"'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'";
 return template.replace('<!--SOCIAL-->',pwa?social:'').replace('<!--PWA-->','<meta http-equiv="Content-Security-Policy" content="'+csp+'">'+(pwa?'<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icons/icon-192.png"><link rel="apple-touch-icon" href="icons/icon-192.png">':'')).replace('/*STYLES*/',css).replace('/*DATA*/',data).replace('/*APP*/',app);
}
const web=html(css,data(assets),true);
await fs.writeFile('dist/index.html',web);
await fs.writeFile('dist/manifest.webmanifest',JSON.stringify({id:'./',name:'ARTEM — Product Development',short_name:'ARTEM',lang:'ru',start_url:'./',scope:'./',display:'standalone',background_color:'#101014',theme_color:'#101014',icons:[192,512].map(s=>({src:'icons/icon-'+s+'.png',sizes:s+'x'+s,type:'image/png',purpose:'any maskable'}))},null,2));
async function allFiles(dir,prefix=''){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const n=prefix+e.name;if(e.isDirectory())out.push(...await allFiles(path.join(dir,e.name),n+'/'));else out.push(n)}return out}
const files=(await allFiles('dist')).filter(f=>f!=='sw.js'&&!f.endsWith('.json'));
const fingerprint=crypto.createHash('sha256').update(web);for(const f of files)fingerprint.update(await fs.readFile('dist/'+f));
const version=fingerprint.digest('hex').slice(0,12);
await fs.writeFile('dist/sw.js',"const CACHE='artem-expo-"+version+"';const FILES="+JSON.stringify(['./',...files.map(f=>'./'+f)])+";self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('artem-expo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())))});");
const embedded={};for(const [key,file]of Object.entries(assets))embedded[key]='data:image/'+(file.endsWith('.webp')?'webp':'png')+';base64,'+(await fs.readFile('public/'+file)).toString('base64');
let offlineCss=css;
for(const font of css.matchAll(/url\('([^']+)'\)/g))offlineCss=offlineCss.replaceAll(font[0],"url('data:font/woff2;base64,"+(await fs.readFile('public/'+font[1])).toString('base64')+"')");
await fs.writeFile('exports/offline/portfolio-offline.html',html(offlineCss,data(embedded),false));
await fs.writeFile('docs/ASSET_PROVENANCE.json',JSON.stringify(origins,null,2));
console.log('Built website, case studies, pitch mode, PWA and standalone offline HTML.');

