import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {profile,PUBLIC_PORTFOLIO_URL} from '../src/config/profile.mjs';
import {projects} from '../src/content.mjs';
const allowed=[PUBLIC_PORTFOLIO_URL,new URL('social-preview.png',PUBLIC_PORTFOLIO_URL).href,profile.telegram,profile.github,...projects.map(p=>profile.github+'/'+p.repo)];
for(const file of ['dist/index.html','exports/offline/portfolio-offline.html']){
 const html=await fs.readFile(file,'utf8');
 assert(!/src="https?:/.test(html),'Unexpected external asset');
 assert(!/\blocalhost\b|\b127(?:\.\d{1,3}){3}\b|\b192\.168(?:\.\d{1,3}){2}\b|\b10(?:\.\d{1,3}){3}\b|\b172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}\b|file:\/\/|\b[A-Za-z]:[\\/]/.test(html),'Local or internal address in output');
 assert(!/PRIVATE KEY|postgres(?:ql)?:\/\/|accessToken=eyJ|sk_live_|ghp_[a-zA-Z0-9]{20}|PUBLIC_PORTFOLIO_URL|Coming soon|Placeholder/.test(html),'Sensitive data or unfinished UI');
 for(const url of [...new Set(html.match(/https:\/\/[a-zA-Z0-9.-]+(?:\/[^\s"<>']*)?/g)||[])])assert(allowed.includes(url),'Unexpected destination: '+url);
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)){const hash=crypto.createHash('sha256').update(m[1].replace(/\r\n/g,'\n')).digest('base64');assert(html.includes('sha256-'+hash),'CSP mismatch')}
}
const web=await fs.readFile('dist/index.html','utf8');
assert(web.includes('<link rel="canonical" href="'+PUBLIC_PORTFOLIO_URL+'">'),'Canonical URL');
assert(web.includes('property="og:image"')&&web.includes('name="twitter:image"'),'Social metadata');
await fs.access('dist/social-preview.png');
console.log('Output audit passed: exact script CSP, no external assets, known secrets or visible placeholders; intended public destinations only.');

