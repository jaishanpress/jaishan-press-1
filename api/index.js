export default async function handler(req, res) {
  const url = new URL(req.url, 'https://jaishan-press-1.vercel.app');
  let id = url.searchParams.get('id') || '';
  if(!id && url.pathname.startsWith('/news/')) id = url.pathname.replace('/news/','').replace('/','');
  let title = 'جيشان برس | JAISHAN PRESS';
  let desc = 'صوت الجنوب يصل للعالم';
  let image = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200';
  if(id){
    try{
      const r = await fetch(`https://jaishan-press-4349a-default-rtdb.firebaseio.com/news/${id}.json`);
      const n = await r.json();
      if(n){ title = n.title || title; desc = (n.text || desc).substring(0,160); image = n.image || image; }
    }catch(e){}
  }
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${esc(title)}</title><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(image)}"><meta property="og:type" content="article"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${esc(image)}"><meta http-equiv="refresh" content="0; url=/?id=${id}"></head><body><script>location.href='/?id=${id}';</script></body></html>`;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.status(200).send(html);
}
