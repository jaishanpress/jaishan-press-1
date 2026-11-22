export default async function handler(req, res) {
  let id = req.query.id;
  const site = "https://jaishan-press-1.vercel.app/";
  if (!id) return res.redirect(site);
  id = String(id).split('&')[0].split('?')[0].trim();
  if (!id) return res.redirect(site);
  try {
    const r = await fetch(`https://jaishan-press-4349a-default-rtdb.firebaseio.com/news/${id}.json`);
    const n = await r.json();
    if (!n || !n.title) return res.redirect(site);
    const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const title = esc(n.title || "جيشان برس");
    const desc = esc((n.text || "").substring(0, 160).replace(/\n/g, " ").trim() || "جيشان برس - صوت الجنوب يصل للعالم");
    const author = esc(n.author || "أبوبكر المنصوري");
    let rawImage = (n.image || "").trim();
    const fallback = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
    if (!rawImage) rawImage = fallback;
    if (rawImage.startsWith('//')) rawImage = 'https:' + rawImage;
    if (rawImage.startsWith('/')) rawImage = site + rawImage.replace(/^\/+/, '');
    if (!rawImage.startsWith('http') || rawImage.startsWith('gs://') || rawImage.startsWith('data:')) {
      rawImage = fallback;
    }
    if (rawImage.includes('images.unsplash.com')) {
      rawImage = rawImage.split('?')[0] + '?auto=format&fit=crop&w=1200&q=80';
    }
    const imageEsc = esc(rawImage);
    const shareUrl = `${site}api/preview?id=${id}`;
    const mainSite = `${site}?id=${id}`;
    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>${title} - جيشان برس</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${mainSite}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="جيشان برس">
<meta property="og:locale" content="ar_AR">
<meta property="og:title" content="${title} - جيشان برس | ✍️ ${author}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${shareUrl}">
<meta property="og:image" content="${imageEsc}">
<meta property="og:image:secure_url" content="${imageEsc}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${title}">
<meta property="article:author" content="${author}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${imageEsc}">
<meta name="twitter:image:alt" content="${title}">
<meta http-equiv="refresh" content="2;url=${mainSite}">
</head><body style="font-family:sans-serif;text-align:center;padding:40px" dir="rtl"><h2>${title}</h2><p>${desc}</p><img src="${imageEsc}" style="max-width:100%;border-radius:10px" onerror="this.style.display='none'"><p>جاري فتح الخبر... <a href="${mainSite}">اضغط هنا</a></p><script>setTimeout(()=>{window.location.href="${mainSite}";},1500);</script></body></html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    return res.status(200).send(html);
  } catch (e) {
    return res.redirect(site);
  }
}
