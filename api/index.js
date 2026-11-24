const DB = 'https://jaishan-press-4349a-default-rtdb.firebaseio.com';
const SITE = 'https://jaishan-press-1.vercel.app';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_AUTHOR = 'قسم الأخبار - جيشان برس';
const URGENT = 'عاجل';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const ts = (n) => new Date(n.createdAt || n.time || 0).getTime() || 0;
const byNewest = (a, b) => ts(b) - ts(a);

async function getJSON(path) {
  try {
    const r = await fetch(`${DB}/${path}`);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function cleanImage(raw) {
  let img = String(raw || '').trim();
  if (!img) return FALLBACK_IMG;
  if (img.startsWith('//')) img = 'https:' + img;
  if (img.startsWith('/')) img = SITE + img;
  if (!/^https?:\/\//.test(img)) return FALLBACK_IMG;
  return img;
}

function formatDate(n) {
  const t = ts(n);
  if (!t) return '';
  return new Date(t).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function videoEmbed(url) {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `<div class="video-wrap"><iframe src="https://www.youtube.com/embed/${esc(yt[1])}" title="فيديو الخبر" allowfullscreen loading="lazy"></iframe></div>`;
  return `<p><a class="btn dark" href="${esc(url)}" target="_blank" rel="noopener">شاهد الفيديو</a></p>`;
}

function tickerItems(list) {
  const sorted = [...list].sort(byNewest);
  const ordered = [...sorted.filter((n) => n.cat === URGENT), ...sorted.filter((n) => n.cat !== URGENT)].slice(0, 25);
  return ordered.map((n) => {
    const text = String(n.ticker || n.title || '').replace(/^(عاجل\s*[:\-–—|]\s*|عاجل\s+)/, '').trim();
    const urgent = n.cat === URGENT;
    return `<a href="/news/${encodeURIComponent(n.id)}"><i class="ticker-tag${urgent ? ' urgent' : ''}">${esc(n.cat || 'خبر')}</i>${esc(text)}</a>`;
  });
}

function sortCats(raw) {
  if (!raw) return [];
  return Object.entries(raw)
    .map(([key, c], i) => ({ key, name: c.name, order: c.order ?? i, nav: c.nav !== false }))
    .filter((c) => c.name)
    .sort((a, b) => a.order - b.order);
}

function page({ title, desc, image, url, body, cats, ticker, settings, status }) {
  const siteName = settings?.siteName || 'جيشان برس';
  const navLinks = cats.filter((c) => c.nav).map((c) => `<a href="/?cat=${encodeURIComponent(c.name)}">${esc(c.name)}</a>`).join('');
  const items = ticker.length ? ticker.join('') : '<a href="/">جيشان برس - صوت الجنوب يصل للعالم</a>';
  const duration = Math.max(30, ticker.length * 7);
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0B0B0B">
${url ? `<link rel="canonical" href="${esc(url)}">` : ''}
<meta property="og:site_name" content="${esc(siteName)}">
<meta property="og:locale" content="ar_AR">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}">
${url ? `<meta property="og:url" content="${esc(url)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Noto+Kufi+Arabic:wght@700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="topbar"><div class="wrap"><span>${esc(siteName)} - ${esc(settings?.siteDesc || 'صوت الجنوب يصل للعالم')}</span><div class="topbar-actions"><a class="tb-btn" href="/?view=login">دخول المراسلين</a></div></div></div>
<header class="site-header"><div class="wrap"><a class="brand" href="/" aria-label="${esc(siteName)} - الرئيسية"><img src="/logo.jpg" alt="${esc(siteName)}" width="182" height="58"></a>
<form class="search-form" action="/" method="get" role="search"><label for="q" class="sr-only">ابحث</label><input id="q" name="q" placeholder="ابحث عن خبر..."><button type="submit">بحث</button></form></div></header>
<nav class="main-nav" aria-label="الأقسام"><div class="wrap"><a href="/">الرئيسية</a>${navLinks}<a href="/?view=archive">الأرشيف</a><a href="/?view=authors">كُتابنا</a></div></nav>
<div class="ticker" aria-label="شريط الأخبار"><div class="ticker-label"><span class="dot" aria-hidden="true"></span>عاجل</div><div class="ticker-viewport"><div class="ticker-track" style="animation-duration:${duration}s">${items}${items}</div></div></div>
${body}
<footer class="site-footer"><div class="wrap"><div><h4>${esc(siteName)} | JAISHAN PRESS</h4><p>صوت الجنوب يصل للعالم - يومية مستقلة جامعة. رئيس التحرير: أبوبكر المنصوري</p></div><div><h4>الموقع</h4><a href="/">الرئيسية</a><a href="/?view=archive">الأرشيف</a><a href="/?view=about">من نحن</a><a href="/?view=contact">تواصل معنا</a></div><div><h4>تابعنا</h4><a href="https://whatsapp.com/channel/0029Vb8qqc3D38CMaMoMPf36" target="_blank" rel="noopener">واتساب</a><a href="https://www.facebook.com/profile.php?id=61593721652626" target="_blank" rel="noopener">فيسبوك</a><a href="https://x.com/JayshanNewsYE" target="_blank" rel="noopener">إكس</a></div></div><div class="copy">جميع الحقوق محفوظة © ${esc(siteName)} ${new Date().getFullYear()}</div></footer>
<div class="bottom-bar"><a style="background:#178a3a" href="https://whatsapp.com/channel/0029Vb8qqc3D38CMaMoMPf36" target="_blank" rel="noopener">واتساب</a><a style="background:#1877F2" href="https://www.facebook.com/profile.php?id=61593721652626" target="_blank" rel="noopener">فيسبوك</a><a style="background:#000" href="https://x.com/JayshanNewsYE" target="_blank" rel="noopener">إكس</a><a style="background:#D2001F" href="mailto:${esc(settings?.email || 'bkra7567@gmail.com')}">راسلنا</a></div>
</body>
</html>`;
}

export default async function handler(req, res) {
  const url = new URL(req.url, SITE);
  let id = url.searchParams.get('id') || '';
  if (!id && url.pathname.startsWith('/news/')) id = url.pathname.slice('/news/'.length);
  id = decodeURIComponent(id).split(/[/?&#]/)[0].trim();

  if (!id || !/^[\w-]+$/.test(id)) {
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }

  const [n, latestRaw, catsRaw, settings] = await Promise.all([
    getJSON(`news/${id}.json`),
    getJSON(`news.json?orderBy=${encodeURIComponent('"$key"')}&limitToLast=40`),
    getJSON('categories.json'),
    getJSON('settings.json'),
  ]);

  const latest = Object.entries(latestRaw || {}).map(([key, v]) => ({ ...v, id: key }));
  const cats = sortCats(catsRaw);
  const ticker = tickerItems(latest);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!n || !n.title) {
    res.statusCode = 404;
    res.setHeader('Cache-Control', 'no-store');
    return res.end(page({
      title: 'الخبر غير موجود | جيشان برس', desc: 'الخبر غير موجود', image: FALLBACK_IMG, url: '', cats, ticker, settings, status: 404,
      body: `<main class="article"><h1>الخبر غير موجود</h1><p>ربما تم حذف هذا الخبر أو أن الرابط غير صحيح.</p><p><a class="btn" href="/">العودة للرئيسية</a></p></main>`,
    }));
  }

  const author = n.author || DEFAULT_AUTHOR;
  const image = cleanImage(n.image);
  const shareUrl = `${SITE}/news/${id}`;
  const desc = String(n.text || '').replace(/\s+/g, ' ').trim().slice(0, 160) || 'جيشان برس - صوت الجنوب يصل للعالم';
  const paragraphs = String(n.text || '').split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
  const related = latest
    .filter((x) => x.id !== id)
    .sort((a, b) => (a.cat === n.cat ? 0 : 1) - (b.cat === n.cat ? 0 : 1) || byNewest(a, b))
    .slice(0, 4)
    .map((x) => `<a class="card" href="/news/${encodeURIComponent(x.id)}"><div class="thumb"><img src="${esc(cleanImage(x.image))}" alt="" loading="lazy"><span class="badge">${esc(x.cat || '')}</span></div><h3>${esc(x.title)}</h3><span class="meta">${esc(formatDate(x))}</span></a>`)
    .join('');

  const body = `<main>
<article class="article">
<div class="crumbs"><a href="/">الرئيسية</a> / <a href="/?cat=${encodeURIComponent(n.cat || '')}">${esc(n.cat || 'أخبار')}</a></div>
<span class="badge">${esc(n.cat || 'خبر')}</span>
<h1>${esc(n.title)}</h1>
<div class="byline"><span>بقلم: <b><a href="/?author=${encodeURIComponent(author)}">${esc(author)}</a></b></span><span>${esc(formatDate(n))}</span><span id="views">المشاهدات: ${Number(n.views) || 0}</span></div>
${n.video ? videoEmbed(n.video) : ''}
<figure><img src="${esc(image)}" alt="${esc(n.title)}"></figure>
<div class="body">${paragraphs}</div>
<div class="share">
<a style="background:#178a3a" href="https://wa.me/?text=${encodeURIComponent(n.title + '\n\n' + shareUrl)}" target="_blank" rel="noopener">مشاركة واتساب</a>
<a style="background:#1877F2" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener">فيسبوك</a>
<a style="background:#000" href="https://x.com/intent/tweet?text=${encodeURIComponent(n.title)}&url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener">إكس</a>
<button type="button" style="background:#D2001F" id="copyLink">نسخ الرابط</button>
</div>
</article>
${related ? `<section class="wrap"><div class="sec-head"><h2>أخبار ذات صلة</h2><a href="/">كل الأخبار</a></div><div class="grid">${related}</div></section>` : ''}
</main>
<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const app = initializeApp({ apiKey: "AIzaSyB5R0Ht53nNY9hRJYT7RhFv7xIV5MG4_XE", databaseURL: "${DB}", projectId: "jaishan-press-4349a" });
const id = ${JSON.stringify(id)};
const seenKey = 'jp_seen_' + id;
if (!sessionStorage.getItem(seenKey)) {
  sessionStorage.setItem(seenKey, '1');
  runTransaction(ref(getDatabase(app), 'news/' + id + '/views'), (c) => (c || 0) + 1)
    .then((r) => { document.getElementById('views').textContent = 'المشاهدات: ' + (r.snapshot.val() || 0); })
    .catch(() => {});
}
document.getElementById('copyLink').addEventListener('click', (e) => {
  navigator.clipboard?.writeText(${JSON.stringify(shareUrl)}).then(() => { e.target.textContent = 'تم النسخ'; });
});
</script>`;

  res.statusCode = 200;
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
  return res.end(page({ title: `${n.title} | جيشان برس`, desc, image, url: shareUrl, body, cats, ticker, settings, status: 200 }));
}
