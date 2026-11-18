(() => {
'use strict';
const P = window.POEMS, N = P.length;
const $ = id => document.getElementById(id);
const PAL = ['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa'];
const PRESETS = [['ROSA','#ff77a8','#000000'],['CARTUCHO','#1d2b53','#fff1e8'],['NOITE','#000000','#ff77a8'],['SOL','#ffec27','#000000'],['PAPEL','#fff1e8','#7e2553'],['LCD','#b9c9a3','#27331f']];
const SITE = (/^(localhost|127\.|\d)/.test(location.host) || !location.host) ? 'picopoetry.vercel.app' : location.host;
let cur = 0, bg = '#ff77a8', ink = '#000000';
const hist = []; let bag = [];
const store = { get(k){ try{ return localStorage.getItem(k) }catch(e){ return null } }, set(k,v){ try{ localStorage.setItem(k,v) }catch(e){} } };
try { const c = JSON.parse(store.get('pp-colors')||'null'); if (c && c.bg && c.ink) { bg = c.bg; ink = c.ink; } } catch(e){}

const pad = n => String(n).padStart(3,'0');
const byN = n => P[n-1];

function show(n, push = true) {
  if (n < 1 || n > N) n = 1;
  if (push && cur) hist.push(cur);
  cur = n;
  const p = byN(n);
  $('num').textContent = pad(n) + '/' + pad(N);
  const t = $('title'); t.textContent = p.t; t.hidden = !p.h;
  const b = $('body'); b.textContent = p.b; b.classList.toggle('long', p.b.length > 260); b.classList.toggle('pre', /(^|\n) {3,}\S/.test(p.b));
  $('poem').scrollTop = 0; fit();
  document.title = (p.h ? p.t + ' · ' : '') + 'Pico Poetry';
  try { history.replaceState(null, '', '#' + n); } catch(e){}
  document.querySelectorAll('#list li').forEach(li => li.classList.toggle('cur', +li.dataset.n === n));
}
function random() {
  if (!bag.length) { bag = Array.from({length:N}, (_, i) => i+1); for (let i = bag.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [bag[i],bag[j]] = [bag[j],bag[i]]; } if (bag[bag.length-1] === cur) bag.unshift(bag.pop()); }
  show(bag.pop());
}
function back() { if (hist.length) show(hist.pop(), false); }

function fit() {
  const b = $('body'), box = $('poem'); b.style.fontSize = '';
  const base = parseFloat(getComputedStyle(b).fontSize); let f = base;
  while ((box.scrollHeight > box.clientHeight + 1 || (b.classList.contains('pre') && b.scrollWidth > b.clientWidth + 1)) && f > 14) { f -= 2; b.style.fontSize = f + 'px'; }
}
addEventListener('resize', fit);
document.fonts && document.fonts.ready.then(fit);

/* index */
const list = $('list');
P.forEach(p => { const li = document.createElement('li'); li.dataset.n = p.n; const lab = p.h ? p.t : ((p.b||'').split('\n').find(x=>x.trim())||p.t).trim(); li.dataset.t = lab.toLowerCase(); li.innerHTML = '<button type="button"><span>' + pad(p.n) + '</span><span></span></button>'; li.querySelector('span:last-child').textContent = lab; li.firstChild.addEventListener('click', () => { show(p.n); closeIdx(); }); list.appendChild(li); });
const isDesk = () => matchMedia('(min-width:900px)').matches;
function openIdx() { $('index').hidden = false; }
function closeIdx() { if (!isDesk()) $('index').hidden = true; }
$('btnIdx').onclick = () => { $('index').hidden ? openIdx() : closeIdx(); };
$('closeIdx').onclick = closeIdx;
$('filter').addEventListener('input', e => { const q = e.target.value.trim().toLowerCase(); list.querySelectorAll('li').forEach(li => li.hidden = q && !(li.dataset.t.includes(q) || pad(li.dataset.n).includes(q))); });
matchMedia('(min-width:900px)').addEventListener('change', e => { $('index').hidden = !e.matches; });
$('index').hidden = !isDesk();
$('btnRand').onclick = random;

/* card */
const card = $('card'), cx = card.getContext('2d');
function wrap(text, font, maxW) {
  cx.font = font; const out = [];
  text.split('\n').forEach(line => {
    if (!line.trim()) { out.push(''); return; }
    if (cx.measureText(line).width <= maxW) { out.push(line); return; }
    let l = ''; const lead = line.match(/^ */)[0], tk = line.trimStart().split(' '); tk[0] = lead + tk[0]; tk.forEach(w => { const t = l ? l + ' ' + w : w; if (cx.measureText(t).width > maxW && l) { out.push(l); l = w; } else l = t; }); if (l) out.push(l);
  });
  return out;
}
function star(x, y, s, c) { cx.fillStyle = c; cx.fillRect(x-s/2, y-s/2, s, s); cx.fillRect(x-s*1.5, y-s/2, s, s); cx.fillRect(x+s/2, y-s/2, s, s); cx.fillRect(x-s/2, y-s*1.5, s, s); cx.fillRect(x-s/2, y+s/2, s, s); }
function draw() {
  const W = 1080, H = 1350, M = 96, p = byN(cur);
  cx.imageSmoothingEnabled = false;
  cx.fillStyle = bg; cx.fillRect(0, 0, W, H);
  cx.fillStyle = ink; cx.globalAlpha = .9;
  cx.fillRect(36, 36, W-72, 8); cx.fillRect(36, H-44, W-72, 8); cx.fillRect(36, 36, 8, H-72); cx.fillRect(W-44, 36, 8, H-72);
  cx.globalAlpha = 1;
  star(W-130, 130, 10, ink); star(W-150, H-200, 8, ink);
  cx.textBaseline = 'top';
  let y = M + 10;
  if (p.h) {
    cx.font = '34px "Press Start 2P"'; const tw = cx.measureText(p.t).width;
    let t = p.t, fs = 34;
    while (tw * fs/34 > W-2*M-40 && fs > 18) fs -= 2; cx.font = fs + 'px "Press Start 2P"';
    const w = cx.measureText(t).width + 40;
    cx.fillStyle = ink; cx.fillRect(M, y, w, fs + 34);
    cx.fillStyle = bg; cx.fillText(t, M+20, y+17);
    y += fs + 34 + 54;
  } else y += 20;
  const availH = H - y - 250, maxW = W - 2*M;
  const srcLines = p.b.split('\n').length;
  let size = 150, lines, lh, found = false;
  for (; size >= 40; size -= 2) { lines = wrap(p.b, size + 'px VT323', maxW); lh = Math.round(size * .98); if (lines.length === srcLines && lines.length * lh <= availH) { found = true; break; } }
  if (!found) for (size = 150; size >= 24; size -= 2) { lines = wrap(p.b, size + 'px VT323', maxW); lh = Math.round(size * .98); if (lines.length * lh <= availH) break; }
  cx.font = size + 'px VT323'; cx.fillStyle = ink;
  const total = lines.length * lh; let ty = y + Math.max(0, (availH - total) / 2);
  lines.forEach(l => { cx.fillText(l, M, ty); ty += lh; });
  cx.font = '46px VT323'; cx.globalAlpha = .8; cx.fillText('— Peter Mac', M, H - 190); cx.globalAlpha = 1;
  cx.font = '17px "Press Start 2P"'; cx.textAlign = 'center'; cx.globalAlpha = .85; cx.fillStyle = ink;
  cx.fillText(SITE, W/2, H - 112); cx.globalAlpha = 1; cx.textAlign = 'left';
}
async function ready() { try { await Promise.all([document.fonts.load('40px VT323'), document.fonts.load('20px "Press Start 2P"')]); } catch(e){} }
const sw = (id, key) => { const el = $(id); el.innerHTML = ''; PAL.forEach(c => { const b = document.createElement('button'); b.style.background = c; b.setAttribute('aria-label', c); b.className = (key==='bg'?bg:ink) === c ? 'on' : ''; b.onclick = () => { if (key==='bg') bg = c; else ink = c; colorsChanged(); }; el.appendChild(b); }); };
function colorsChanged() { store.set('pp-colors', JSON.stringify({bg, ink})); sw('swBg','bg'); sw('swInk','ink'); draw(); }
const pr = $('presets'); PRESETS.forEach(([n, b, i]) => { const x = document.createElement('button'); x.textContent = n; x.style.background = b; x.style.color = i; x.onclick = () => { bg = b; ink = i; colorsChanged(); }; pr.appendChild(x); });
async function openSheet() { await ready(); colorsChanged(); $('hint').textContent = ''; $('sheet').hidden = false; document.body.style.overflow = 'hidden'; }
function closeSheet() { $('sheet').hidden = true; document.body.style.overflow = ''; }
$('btnShare').onclick = openSheet; $('closeSheet').onclick = closeSheet;
$('sheet').addEventListener('click', e => { if (e.target === $('sheet')) closeSheet(); });
$('toggleColors').onclick = () => { const o = $('colors').hidden; $('colors').hidden = !o; $('toggleColors').textContent = o ? 'CORES ▴' : 'CORES ▾'; $('toggleColors').setAttribute('aria-expanded', o); };
const blob = () => new Promise(r => card.toBlob(r, 'image/png'));
const fname = () => 'pico-poetry-' + pad(cur) + '.png';
async function save() { const b = await blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fname(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); $('hint').textContent = 'imagem salva!'; }
$('btnSave').onclick = save;
$('btnSend').onclick = async () => {
  const b = await blob(); const file = new File([b], fname(), { type: 'image/png' });
  const data = { files: [file], title: 'Pico Poetry', text: 'Pico Poetry · ' + SITE };
  try { if (navigator.canShare && navigator.canShare(data)) { await navigator.share(data); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { if (navigator.share) { await navigator.share({ title: 'Pico Poetry', url: location.href.split('#')[0] + '#' + cur }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  await save();
};

/* keys */
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'Escape') { closeSheet(); closeIdx(); }
  else if (!$('sheet').hidden) return;
  else if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); random(); }
  else if (e.key === 'ArrowLeft') back();
});

const h = parseInt((location.hash || '').slice(1), 10);
if (h >= 1 && h <= N) show(h, false); else random();
})();
