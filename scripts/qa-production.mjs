import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import sharp from 'sharp';
import jsQR from 'jsqr';
import {profile,PUBLIC_PORTFOLIO_URL} from '../src/config/profile.mjs';

const base=new URL(process.argv[2]||PUBLIC_PORTFOLIO_URL);
assert(base.protocol==='https:','Production checks require HTTPS');
assert(base.pathname.endsWith('/')&&!base.search&&!base.hash,'Supply the site base URL');
const errors=[],requests=new Set(),checks=[];
const check=(name,pass)=>{checks.push({name,pass:!!pass});assert(pass,name)};
const browser=await chromium.launch();
await fs.mkdir('output/production',{recursive:true});
function watch(page){
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('request',r=>{const url=new URL(r.url());if(/^https?:$/.test(url.protocol)){requests.add(url.href);if(url.origin!==base.origin)errors.push('Unexpected network destination: '+url.origin)}});
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 page.on('requestfailed',r=>{if(!/ERR_ABORTED/.test(r.failure()?.errorText||''))errors.push(r.failure()?.errorText+' '+r.url())});
}
async function ready(page){
 await page.waitForFunction(()=>window.deckReady);
 await page.evaluate(async()=>{
  for(const image of document.images)if(image.getAttribute('src'))image.loading='eager';
  await document.fonts.ready;
  await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode()));
 });
}
async function decode(buffer){
 const {data,info}=await sharp(buffer).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 return jsQR(new Uint8ClampedArray(data),info.width,info.height)?.data;
}
try{
 for(const [width,height]of[[390,844],[393,852],[412,915],[430,932],[1440,900],[1920,1080]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'});
  const page=await context.newPage();watch(page);
  for(const lang of ['ru','en']){
   for(const route of ['home','case/scada','case/pak']){
    const response=await page.goto(new URL('?lang='+lang+'#'+route,base).href,{waitUntil:'networkidle'})||await page.reload({waitUntil:'networkidle'});await ready(page);
    const label=width+'x'+height+' '+lang+' '+route;
    check('HTTPS document '+label,response.status()===200);
    check('Language '+label,await page.locator('html').getAttribute('lang')===lang);
    check('Layout '+label,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('Images '+label,await page.locator('main img').evaluateAll(es=>es.every(i=>i.complete&&i.naturalWidth>0)));
    check('Onest '+label,await page.evaluate(()=>document.fonts.check('500 18px Onest')&&getComputedStyle(document.body).fontFamily.includes('Onest')));
    check('Contacts '+label,await page.locator('#contact a[href="'+profile.telegram+'"]').count()>0&&await page.locator('#contact a[href="'+profile.github+'"]').count()>0);
    if(route==='home'){
     check('Five prototypes '+label,await page.locator('.portfolio-project').count()===5);
     await page.locator('.language').click();check('Toggle '+label,await page.locator('html').getAttribute('lang')===(lang==='ru'?'en':'ru'));
     await page.locator('.language').click();await ready(page);
     await page.locator('.hero-actions a[href="#work"]').click();check('Work navigation '+label,new URL(page.url()).hash==='#work');
     await page.locator('#contact').scrollIntoViewIfNeeded();
     for(const [i,image]of(await page.locator('#contact .qr-item img').all()).entries())check('Visible QR '+label+' '+i,await decode(await image.screenshot())===profile[i?'github':'telegram']);
     await page.locator('.case-link[href="#case/scada"]').click();await ready(page);check('Case navigation '+label,new URL(page.url()).hash==='#case/scada');
     await page.locator('.case-back').click();check('Return navigation '+label,new URL(page.url()).hash==='#work');
    }else{
     await page.reload({waitUntil:'networkidle'});await ready(page);check('Direct reload '+label,new URL(page.url()).hash==='#'+route);
     for(const shot of await page.locator('.case-gallery .shot').all()){
      await shot.click();check('Gallery '+label,await page.locator('#zoom').isVisible());
      await page.locator('#zoom-image').evaluate(i=>i.decode());await page.keyboard.press('Escape');
      check('Zoom close '+label,await shot.evaluate(e=>e===document.activeElement));
     }
    }
    if((width===390||width===1440)&&lang==='ru'){
     await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'output/production/'+width+'-'+route.replace('/','-')+'.png',fullPage:true,animations:'disabled'});
    }
   }
   await page.goto(new URL('?lang='+lang+'#pitch/1',base).href,{waitUntil:'networkidle'});await ready(page);
   await page.locator('#next').click();check('Pitch next '+width+' '+lang,new URL(page.url()).hash==='#pitch/2');
   await page.locator('#to-contact').click();check('Pitch contact '+width+' '+lang,new URL(page.url()).hash==='#pitch/9');
  }
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:393,height:852},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();watch(page);
 await page.goto(base.href,{waitUntil:'networkidle'});await ready(page);
 await page.locator('.copy-link').click();check('Copy Telegram',await page.evaluate(()=>navigator.clipboard.readText())===profile.telegram);
 check('Canonical',await page.locator('link[rel=canonical]').getAttribute('href')===PUBLIC_PORTFOLIO_URL);
 const manifestURL=await page.locator('link[rel=manifest]').evaluate(e=>e.href);
 const manifest=await (await context.request.get(manifestURL)).json();
 check('Manifest scope',new URL(manifest.scope,manifestURL).href===base.href&&new URL(manifest.start_url,manifestURL).href===base.href);
 check('Manifest icons',manifest.icons.some(i=>i.sizes==='512x512'));
 for(const icon of manifest.icons)check('Icon '+icon.sizes,(await context.request.get(new URL(icon.src,manifestURL).href)).ok());
 const imageURL=await page.locator('meta[property="og:image"]').getAttribute('content');
 const imageResponse=await context.request.get(imageURL);const meta=await sharp(await imageResponse.body()).metadata();
 check('Social image',imageResponse.ok()&&meta.width===1200&&meta.height===630);
 const registration=await page.evaluate(async()=>{
  const r=await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  return {scope:r.scope,script:r.active.scriptURL};
 });
 check('Service worker scope',registration.scope===base.href&&registration.script===new URL('sw.js',base).href);
 const cdp=await context.newCDPSession(page);const install=await cdp.send('Page.getInstallabilityErrors');
 check('Chromium installability',install.installabilityErrors.length===0);
 await context.setOffline(true);
 for(const lang of ['ru','en'])for(const route of ['home','case/scada','case/pak','pitch/1']){
  await page.goto(new URL('?lang='+lang+'#'+route,base).href,{waitUntil:'networkidle'});await ready(page);
  await page.reload({waitUntil:'networkidle'});await ready(page);
  check('Offline reload '+lang+' '+route,await page.locator('main').count()===1);
 }
 await context.close();
 check('No console or network errors',errors.length===0);
 console.log(checks.length+' production checks passed; '+requests.size+' same-origin URLs; offline RU/EN reloads passed.');
}finally{
 await browser.close();
 await fs.writeFile('output/production/results.json',JSON.stringify({base:base.href,date:new Date().toISOString(),checks,errors,requests:[...requests]},null,2));
}
