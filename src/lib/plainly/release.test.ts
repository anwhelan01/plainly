import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lint } from './lint.ts';
import { diffWords } from './diff.ts';
import { reserveRewrite } from './quota.server.ts';
import { requestRewrite } from './rewrite-provider.server.ts';

test('Google dialect excludes Plainly-only rules', () => {
  assert.ok(lint('A robust seamless tapestry.').findings.length > lint('A robust seamless tapestry.', 'google').findings.length);
});
test('large diff preserves both documents without quadratic allocation', () => {
  const before='a '.repeat(10000), after='b '.repeat(10000);
  const tokens=diffWords(before,after);
  assert.equal(tokens.filter(x=>x.type!=='add').map(x=>x.value).join(''), before);
  assert.equal(tokens.filter(x=>x.type!=='remove').map(x=>x.value).join(''), after);
  assert.equal(tokens.length,2);
});
test('shared quota survives calls, caps bursts, rolls forward and fails closed on damage', () => {
  const dir=mkdtempSync(join(tmpdir(),'plainly-quota-'));
  try {
    const now=Date.parse('2026-09-12T12:00:00Z');
    for(let i=0;i<3;i++) assert.equal(reserveRewrite(dir,4,now),true);
    assert.equal(reserveRewrite(dir,4,now),false);
    assert.equal(reserveRewrite(dir,4,now+60000),true);
    assert.equal(reserveRewrite(dir,4,now+120000),false);
    assert.equal(reserveRewrite(dir,4,now+86400000),true);
    assert.equal(reserveRewrite(dir,4,now),false);
    writeFileSync(join(dir,'quota.json'),'corrupted');
    assert.equal(reserveRewrite(dir,4,now+86400000),false);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('provider accepts structured results, rejects malformed output and hides upstream errors',async()=>{
  const valid=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({rewritten:'Clear text.',notes:['Cut padding.']})}}]}));
  const result=await requestRewrite('test-secret','test-model','system','draft',valid as typeof fetch);
  assert.deepEqual(result,{ok:true,rewritten:'Clear text.',notes:['Cut padding.']});
  for(const content of ['not JSON',JSON.stringify({rewritten:123,notes:[]}),JSON.stringify({rewritten:'a',notes:[42]})]){
    const fake=async()=>new Response(JSON.stringify({choices:[{message:{content}}]}));
    assert.equal((await requestRewrite('test-secret','test-model','system','draft',fake as typeof fetch)).ok,false);
  }
  const error=async()=>new Response('private upstream details',{status:401});
  const response=await requestRewrite('test-secret','test-model','system','draft',error as typeof fetch);
  assert.equal(response.ok,false);
  assert.doesNotMatch(JSON.stringify(response),/test-secret|private upstream/);
});
