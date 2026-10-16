import sharp from 'sharp';
import fs from 'node:fs/promises';
import {recordOrigin} from './provenance.mjs';
for(const lang of ['ru','en']){
 const files=(await fs.readdir('exports/cards-'+lang)).filter(f=>f.endsWith('.png')).sort();
 const tiles=await Promise.all(files.map(async(f,i)=>({input:await sharp('exports/cards-'+lang+'/'+f).resize(360,640).toBuffer(),left:i%3*372+12,top:Math.floor(i/3)*652+12})));
 const file='exports/contact-sheet-'+lang+'.png';
 await sharp({create:{width:1128,height:1968,channels:3,background:'#29232f'}}).composite(tiles).png().toFile(file);
 await recordOrigin(file,'Sharp contact sheet of final '+lang+' Chromium-rendered phone cards; no image generation.');
 if(lang==='ru'){
  await sharp(file).jpeg({quality:92}).toFile('exports/preview-contact-sheet.jpg');
  await sharp({create:{width:1128,height:664,channels:3,background:'#29232f'}}).composite(tiles.slice(0,3)).jpeg({quality:92}).toFile('exports/preview-key-cards.jpg');
  for(const alias of ['exports/preview-contact-sheet.jpg','exports/preview-key-cards.jpg'])await recordOrigin(alias,'Current Russian deck preview composed from final PNG cards with Sharp; no image generation.');
 }
 console.log(file);
}

