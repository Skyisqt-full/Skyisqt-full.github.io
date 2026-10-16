import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {serve} from './serve.mjs';
import {slides} from '../src/content.mjs';
import {recordOrigin} from './provenance.mjs';
const server=serve(0);await new Promise(r=>server.once('listening',r));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1,reducedMotion:'reduce'});
const languages=process.argv.includes('--en')?['en']:process.argv.includes('--ru')?['ru']:['ru','en'];
try{
 for(const lang of languages){
  await fs.mkdir(`exports/cards-${lang}`,{recursive:true});
  for(const [i,slide] of slides.entries()){
   await page.goto(`http://127.0.0.1:${port}/?export&slide=${i+1}&lang=${lang}`,{waitUntil:'networkidle'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode()))});
   const filename=`${String(i+1).padStart(2,'0')}-${slide.id}.png`;
   await page.locator('.stage').screenshot({path:`exports/cards-${lang}/${filename}`,animations:'disabled'});
   await recordOrigin(`exports/cards-${lang}/${filename}`,`Reproducible Chromium render of authored ARTEM portfolio card ${i+1}, ${lang}; shared src/content.mjs/styles.css and authentic source screenshots. Not image generation.`);
   console.log(filename);
  }
 }
}finally{await browser.close();server.close()}
