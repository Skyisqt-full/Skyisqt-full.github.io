import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import jsQR from 'jsqr';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {serve} from './serve.mjs';
import {profile} from '../src/config/profile.mjs';
import {slides} from '../src/content.mjs';
const report={date:new Date().toISOString(),checks:[],issues:[]};
const check=(name,pass,detail)=>{report.checks.push({name,pass:!!pass,...(detail?{detail}:{})});if(!pass){report.issues.push(name);console.log('FAIL',name,JSON.stringify(detail||''))}};
for(const dir of ['output/playwright','.impeccable/review'])await fs.mkdir(dir,{recursive:true});
const server=serve(0);await new Promise(r=>server.once('listening',r));
const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
const errors=[];
async function ready(p){await p.waitForFunction(()=>window.deckReady);await p.evaluate(async()=>{for(const i of document.images)if(i.getAttribute('src'))i.loading='eager';await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode()))})}
async function decode(file){const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});return jsQR(new Uint8ClampedArray(data),info.width,info.height)?.data}
async function geometry(p){return p.evaluate(()=>{
 const issues=[],slide=document.querySelector('.slide:not([hidden])');
 if(!slide)return {scroll:document.documentElement.scrollWidth>innerWidth,issues};
 const rail=slide.querySelector('.card-rail').getBoundingClientRect(),stage=slide.getBoundingClientRect(),caption=slide.querySelector('.demo-capture-note');const textLimit=caption?caption.getBoundingClientRect().top-4:rail.top-3;
 const walker=document.createTreeWalker(slide.querySelector('.card-body'),NodeFilter.SHOW_TEXT);
 let n;while(n=walker.nextNode()){if(!n.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(n);for(const r of range.getClientRects())if(r.width&&r.height&&(r.left<stage.left-1||r.right>stage.right+1||r.bottom>textLimit||r.top<stage.top+14))issues.push({text:n.textContent.slice(0,80),rect:{left:r.left,right:r.right,bottom:r.bottom},rail:rail.top})}
 return {scroll:document.documentElement.scrollWidth>innerWidth,issues};
})}
async function capture(p,name,full=false){await p.screenshot({path:'.impeccable/review/'+name+'.png',fullPage:full,animations:'disabled'})}
try{
 for(const [w,h]of[[390,844],[393,852],[412,915],[430,932],[1440,1000]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/Content Security Policy/.test(m.text()))errors.push(m.text())});
  for(const lang of ['ru','en']){
   for(const route of ['home','case/scada','case/pak']){
    await p.goto(base+'/?lang='+lang+'#'+route,{waitUntil:'networkidle'});await ready(p);
    const g=await geometry(p);check('website layout '+w+' '+lang+' '+route,!g.scroll,g);
    check('website images '+w+' '+lang+' '+route,await p.locator('main img').evaluateAll(es=>es.every(i=>i.complete&&i.naturalWidth)));
    if(lang==='ru'&&(w===390||w===1440)){
     await capture(p,(route==='home'?(w===390?'mobile':'desktop'):'case-'+route.split('/')[1]+'-'+w),true);
     if(route==='home')for(const id of ['work','about','projects','contact']){await p.locator('#'+id).scrollIntoViewIfNeeded();await capture(p,id+'-'+w)}
     if(route!=='home'){await p.locator('.technical-section').scrollIntoViewIfNeeded();await capture(p,route.split('/')[1]+'-technical-'+w)}
    }
    if(lang==='ru'&&w!==390&&w!==1440&&route==='home'){await p.evaluate(()=>scrollTo(0,0));await capture(p,'user-'+w)}
   }
   await p.goto(base+'/?lang='+lang+'#pitch/1',{waitUntil:'networkidle'});await ready(p);
   for(let i=0;i<9;i++){const g=await geometry(p);check('pitch layout '+w+' '+lang+' '+(i+1),!g.scroll&&!g.issues.length,g);if((w===390||w===1440)&&lang==='ru')await p.screenshot({path:'output/playwright/pitch-'+w+'-'+(i+1)+'.png'});if(i<8)await p.locator('#next').click()}
   check('last card boundary '+w+' '+lang,await p.locator('#next').isDisabled());
   await p.keyboard.press('Home');check('first card boundary '+w+' '+lang,await p.locator('#prev').isDisabled());
  }
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true,isMobile:true,permissions:['clipboard-read','clipboard-write']});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 for(const lang of ['ru','en']){
  for(const route of ['home','case/scada','case/pak','pitch/1']){
   await p.goto(base+'/?lang='+lang+'#'+route,{waitUntil:'networkidle'});await ready(p);
   const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   check('axe '+lang+' '+route,!axe.violations.length,axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  }
  for(let i=1;i<9;i++){await p.locator('#next').click();const a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();check('axe '+lang+' card '+(i+1),!a.violations.length,a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))}
 }
 await p.locator('.copy-link').filter({visible:true}).click();check('copy Telegram',await p.evaluate(()=>navigator.clipboard.readText())===profile.telegram);
 await p.locator('.share-link').filter({visible:true}).click();check('share fallback',await p.evaluate(()=>navigator.clipboard.readText())===profile.telegram);
 await p.keyboard.press('Home');await p.keyboard.press('ArrowRight');check('pitch keyboard',(await p.locator('#counter').innerText()).startsWith('02'));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:320,y:370}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:372}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check('horizontal swipe',(await p.locator('#counter').innerText()).startsWith('03'));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:400}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:182,y:220}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check('vertical gesture ignored',(await p.locator('#counter').innerText()).startsWith('03'));
 await p.goto(base+'/#case/scada',{waitUntil:'networkidle'});await ready(p);
 const opener=p.locator('.case-cover .shot');await opener.click();check('native image inspection',await p.locator('#zoom').isVisible());await p.keyboard.press('Escape');check('zoom Escape restores focus',await opener.evaluate(e=>e===document.activeElement));
 await p.locator('.language').click();check('language toggle',await p.locator('html').getAttribute('lang')==='en');
 await p.locator('.case-back').click();await p.locator('#work').waitFor();check('case back to work',await p.locator('#work').isVisible()&&p.url().endsWith('#work'));
 await p.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}))});
 const manifest=await p.evaluate(()=>fetch('manifest.webmanifest').then(r=>r.json()));check('manifest standalone',manifest.display==='standalone'&&manifest.icons.some(i=>i.sizes==='512x512'));
 const install=await cdp.send('Page.getInstallabilityErrors');check('Chromium installability',!install.installabilityErrors.length,install.installabilityErrors);
 await ctx.setOffline(true);
 for(const route of ['home','case/scada','case/pak','pitch/1']){
  await p.goto(base+'/#'+route,{waitUntil:'networkidle'});await ready(p);check('PWA cached offline '+route,true);
 }
 await ctx.close();
 const fc=await browser.newContext({viewport:{width:390,height:844}});const outgoing=[];
 await fc.route(/^https?:/,r=>{outgoing.push(r.request().url());return r.abort()});
 const fp=await fc.newPage();
 await fp.goto(pathToFileURL(path.resolve('exports/offline/portfolio-offline.html')).href);await ready(fp);
 for(const route of ['case/scada','case/pak','pitch/1','home']){await fp.evaluate(h=>location.hash=h,'#'+route);await ready(fp);check('file offline '+route,await fp.locator('main').count()===1)}
 check('standalone HTML needs no network',!outgoing.length,outgoing);await fc.close();
 for(const id of ['telegram','github'])check('QR asset '+id,await decode('exports/qr/'+id+'.png')===profile[id]);
 const ep=await browser.newPage({viewport:{width:1080,height:1920},reducedMotion:'reduce'});
 for(const lang of ['ru','en'])for(let i=0;i<9;i++){
  const file='exports/cards-'+lang+'/'+String(i+1).padStart(2,'0')+'-'+slides[i].id+'.png',meta=await sharp(file).metadata();
  check('PNG dimensions '+lang+' '+(i+1),meta.width===1080&&meta.height===1920);
  await ep.goto(base+'/?export&lang='+lang+'&slide='+(i+1),{waitUntil:'networkidle'});await ready(ep);
  const g=await geometry(ep);check('export bounds '+lang+' '+(i+1),!g.scroll&&!g.issues.length,g);
  const rects=await ep.locator('.slide:not([hidden]) .qr-item img').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}));
  for(const [q,r]of rects.entries()){
   const extract={left:Math.round(r.x),top:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)};
   const code=await sharp(file).extract(extract).png().toBuffer();
   check('export QR '+lang+' '+(i+1)+' '+q,await decode(code)===profile[q?'github':'telegram']);
  }
  await ep.setViewportSize({width:390,height:844});await ep.goto(base+'/?lang='+lang+'#pitch/'+(i+1),{waitUntil:'networkidle'});await ready(ep);
  for(const [q,el]of(await ep.locator('.slide:not([hidden]) .qr-item img').all()).entries()){
   const shot=await el.screenshot();check('phone-size QR '+lang+' '+(i+1)+' '+q,await decode(shot)===profile[q?'github':'telegram']);
  }
  await ep.setViewportSize({width:1080,height:1920});
 }
 await ep.close();check('no browser errors',!errors.length,errors);
}finally{await browser.close();server.close();await fs.writeFile('docs/QA_RESULTS.json',JSON.stringify(report,null,2))}
console.log(report.checks.length+' checks; '+report.issues.length+' failures');
if(report.issues.length)process.exitCode=1;

