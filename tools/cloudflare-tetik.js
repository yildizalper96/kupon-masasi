// Cloudflare Worker "simuleto-tetik" (26 Kas 2026): 5 dk'da bir GitHub'daki bulut veri cekimini (bulut-veri.yml) baslatir.
// Kurulum: Cloudflare > Workers > Create > bu kod; Settings > Triggers > Cron "*/5 * * * *";
// Settings > Variables > Secret "GH_TOKEN" (GitHub fine-grained token: yalnizca kupon-masasi deposu, Actions: Read and write).
// Anahtar bu dosyaya YAZILMAZ.
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(tetikle(env));
  },
  // elle deneme: Worker adresine GET -> son tetik sonucu
  async fetch(req, env) {
    const r = await tetikle(env);
    return new Response(r, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};

async function tetikle(env) {
  const r = await fetch('https://api.github.com/repos/yildizalper96/kupon-masasi/actions/workflows/bulut-veri.yml/dispatches', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.GH_TOKEN,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'simuleto-tetik',
    },
    body: JSON.stringify({ ref: 'main', inputs: { mode: 'tetik' } }),
  });
  return r.status === 204 ? 'tetiklendi' : 'hata ' + r.status + ': ' + (await r.text()).slice(0, 200);
}
