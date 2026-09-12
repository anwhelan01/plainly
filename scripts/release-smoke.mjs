import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';
import { chromium } from 'playwright';
const server=spawn(process.execPath,['.output/server/index.mjs'],{env:{...process.env,NITRO_HOST:'127.0.0.1',NITRO_PORT:'8185',PLAINLY_REWRITE_ENABLED:'false'},stdio:['ignore','pipe','pipe']});
let log='';server.stdout.on('data',x=>log+=x);server.stderr.on('data',x=>log+=x);
let browser;
try{
 let ready=false;
 for(let i=0;i<80;i++){try{const r=await fetch('http://127.0.0.1:8185/healthz');if(r.ok){ready=true;break;}}catch{}await pause(100);}
 assert.ok(ready,'Server did not start: '+log);
 const response=await fetch('http://127.0.0.1:8185/');
 assert.equal(response.status,200);assert.equal(response.headers.get('x-content-type-options'),'nosniff');
 const html=await response.text();assert.doesNotMatch(html,/grok-app-builder\/extensions|auth\/get-session/);
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--no-zygote','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8185/');
 const draft=page.getByRole('textbox',{name:'Draft to lint'});
 await draft.fill('A robust seamless tapestry.');
 await page.getByRole('tab',{name:'Google',exact:true}).click();
 await page.waitForTimeout(100);
 await page.reload();await page.waitForFunction(()=>document.querySelector('textarea')?.value==='A robust seamless tapestry.');assert.equal(await draft.inputValue(),'A robust seamless tapestry.');
 await page.getByRole('button',{name:'Clear',exact:true}).click();
 await page.reload();await page.waitForFunction(()=>document.querySelector('textarea')?.value==='');assert.equal(await draft.inputValue(),'');
 assert.equal(await page.getByRole('button',{name:/AI rewrite off/}).isDisabled(),true);
 await page.getByRole('link',{name:'Skill',exact:true}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download',exact:true}).click();
 assert.match((await download).suggestedFilename(),/SKILL\.md$/);
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8185/');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'/tmp/plainly_release_mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS: production HTTP and headers; no builder script; draft persistence; Clear persistence; rewrite disabled; skill download; mobile overflow; no browser exceptions.');
} finally {if(browser)await browser.close();server.kill('SIGTERM');}
