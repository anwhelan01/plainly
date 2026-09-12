export type RewriteResult = { ok: true; rewritten: string; notes: string[] } | { ok: false; error: string };
export async function requestRewrite(
  apiKey: string, model: string, system: string, text: string,
  fetcher: typeof fetch = fetch,
): Promise<RewriteResult> {
  try {
    const response = await fetcher('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({ model, temperature: 0.2, max_tokens: 3500,
        response_format: { type: 'json_object' }, messages: [
          { role: 'system', content: system }, { role: 'user', content: text },
        ] }),
    });
    if (!response.ok) return {ok:false, error:'The writing service is unavailable. Your draft has not changed.'};
    // Enforce a response byte limit even when Content-Length is absent.
    const reader=response.body?.getReader();
    if (!reader) throw new Error('Empty response');
    const chunks: Uint8Array[]=[]; let size=0;
    try {
      while (true) {
        const {done,value}=await reader.read(); if(done) break;
        size+=value.byteLength;
        if(size>128_000) { await reader.cancel(); throw new Error('Response too large'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes=new Uint8Array(size); let offset=0;
    for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    const body=JSON.parse(new TextDecoder().decode(bytes));
    const content=body?.choices?.[0]?.message?.content;
    if(typeof content!=='string') throw new Error('Missing content');
    const parsed=JSON.parse(content);
    if(typeof parsed.rewritten!=='string' || !parsed.rewritten.trim() || parsed.rewritten.length>16000 || !Array.isArray(parsed.notes) || parsed.notes.length>8 || parsed.notes.some((n:unknown)=>typeof n!=='string'||n.length>500)) throw new Error('Invalid rewrite');
    return {ok:true, rewritten:parsed.rewritten.trim(), notes:parsed.notes};
  } catch { return {ok:false, error:'The writing service could not finish. Your draft has not changed.'}; }
}
