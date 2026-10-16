import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
export function serve(port=18726){
 const root=path.resolve('dist');
 return http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local').pathname)}catch{res.writeHead(400);res.end();return;}
  const filename=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  try{const data=await fs.readFile(filename);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'})[path.extname(filename)]||'application/octet-stream');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-cache');res.end(req.method==='HEAD'?undefined:data)}catch{res.writeHead(404);res.end('Not found')}
 }).listen(port,'127.0.0.1');
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve('scripts/serve.mjs')){serve(Number(process.env.PORT||18726));console.log('ARTEM: http://127.0.0.1:'+(process.env.PORT||18726));}
