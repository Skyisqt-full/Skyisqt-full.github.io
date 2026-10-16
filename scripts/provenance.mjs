import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';

export async function recordOrigin(file,origin){
 await fs.writeFile(file+'.json',JSON.stringify({origin},null,2));
 const engine=process.env.IMPECCABLE_BIN||path.join(os.homedir(),'.impeccable','bin','0.1.5',process.platform==='win32'?'impeccable.exe':'impeccable');
 try{await fs.access(engine)}catch{return}
 const r=spawnSync(engine,['embed-prompt',file,'--prompt','Origin: '+origin],{windowsHide:true,encoding:'utf8'});
 if(r.status!==0)throw Error('Raster provenance: '+(r.stderr||r.stdout));
}
export const origins={
 'scada-inspect':'Actual current WEB SCADA source built in an isolated copied context, native equipment inspector and synthetic tags. Cropped, no generated UI.',
 'pak-orders':'Actual local PAK product UI; synthetic training orders. Failure fixture changed to completed only in the isolated Expo database. Cropped, no generated UI.',
 'scada-process':'Actual local WEB SCADA product UI; native synthetic SVG process scene; isolated demo build. Cropped by scripts/optimize-images.mjs; no generated UI.',
 'scada-dashboard':'Actual local WEB SCADA product UI; six synthetic measurement tags and live updates; isolated demo build. Cropped; no generated UI.',
 'scada-tags':'Actual local WEB SCADA tag configuration screen; synthetic demo tags. Cropped; no generated UI.',
 'pak-dashboard':'Actual local PAK product UI; native training data; isolated demo build. Cropped; no generated UI.',
 'pak-detail':'Actual local PAK product UI; native completed training order. Seeded GTIN masked. Cropped; no generated UI.',
 'pak-warehouse':'Actual local PAK product UI; native training warehouse. Seeded GTIN cells masked. Cropped; no generated UI.',
 route:'Public committed RouteOps screenshot: https://github.com/Skyisqt-full/route-ops/blob/main/screenshots/routeops-dashboard.png ; demo person banner cropped away.',
 inspector:'Public committed Inspector screenshot: https://github.com/Skyisqt-full/inspector-mobile/blob/main/screenshots/dashboard.png ; prototype data; address row masked.',
 pos:'Public committed POS Lite screenshot: https://github.com/Skyisqt-full/pos-lite/blob/main/docs/screenshots/02-cart-with-items.png ; prototype data.',
 crm:'Public committed CRM Pipeline screenshot: https://github.com/Skyisqt-full/crm-pipeline/blob/main/screenshots/pipeline-board.png ; demo sandbox.',
 webhook:'Public committed Webhook Hub screenshot: https://github.com/Skyisqt-full/webhook-hub/blob/main/screenshots/dashboard.png ; mock providers.'
};
