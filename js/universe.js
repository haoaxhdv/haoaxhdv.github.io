// Dope Era Universe — interactions. Vanilla, no dependencies.
import { COLORWAYS, FITS, BOOKS, SHOWS, RACK, SNAPSHOT } from '../data/catalog.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const money = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

$$('[data-snapshot]').forEach((el) => (el.textContent = SNAPSHOT));

/* ---------- Nav ---------- */
const nav = $('[data-nav]');
const toggle = $('.nav__toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
});
$$('.nav__links a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
});
const chapterLinks = new Map($$('.nav__links a').map((a) => [a.getAttribute('href').slice(1), a]));
const chapterObserver = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    const link = chapterLinks.get(en.target.id);
    if (link && en.isIntersecting) { chapterLinks.forEach((l) => l.removeAttribute('aria-current')); link.setAttribute('aria-current', 'true'); }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
chapterLinks.forEach((_, id) => { const el = document.getElementById(id); if (el) chapterObserver.observe(el); });

/* ---------- Hero: depth, light, colorways ---------- */
const hero = $('.hero');
const patch = $('.hero__patch');
const quilt = $('.hero__quilt');
let target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, raf = 0;

function paintHero() {
  cur.x += (target.x - cur.x) * 0.12;
  cur.y += (target.y - cur.y) * 0.12;
  hero.style.setProperty('--px', cur.x.toFixed(3));
  hero.style.setProperty('--py', cur.y.toFixed(3));
  hero.style.setProperty('--sx', (55 + cur.x * 30).toFixed(1));
  // Studio light gliding across the embroidered patch.
  patch.style.setProperty('--gx', (40 + cur.x * 42).toFixed(1) + '%');
  patch.style.setProperty('--gy', (30 + cur.y * 40).toFixed(1) + '%');
  quilt.style.setProperty('--lx', (28 + cur.x * 22).toFixed(1) + '%');
  quilt.style.setProperty('--ly', (30 + cur.y * 25).toFixed(1) + '%');
  raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.002 ? requestAnimationFrame(paintHero) : 0;
}
const kick = () => { if (!raf) raf = requestAnimationFrame(paintHero); };

if (!reduced) {
  if (finePointer) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      kick();
    });
    hero.addEventListener('pointerleave', () => { target = { x: 0, y: 0 }; kick(); });
  }
}

let ticking = false;
function onScroll() {
  ticking = false;
  const y = scrollY, h = hero.offsetHeight;
  nav.classList.toggle('is-solid', y > h - 90);
  if (y < h * 0.6) chapterLinks.forEach((l) => l.removeAttribute('aria-current'));
  if (!reduced) {
    const sp = Math.min(1, Math.max(0, y / h));
    hero.style.setProperty('--sp', sp.toFixed(3));
    // On touch screens the light follows the scroll instead of a cursor.
    if (!finePointer && y < h) { target.x = -0.6 + sp * 1.6; target.y = -0.4 + sp; kick(); }
  }
  updateZip();
  pill.classList.toggle('is-hidden', y + innerHeight > document.body.scrollHeight - 220);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

const suit = $('[data-suit]');
const wayLabel = $('[data-way]');
const buy = $('[data-buy]');
const swatches = $$('.tag__swatches [role="radio"]');
let swapToken = 0;
function setColorway(id, focus = false) {
  const cw = COLORWAYS.find((c) => c.id === id);
  if (!cw) return;
  hero.dataset.colorway = id;
  ['--p1', '--p2', '--p3', '--p4'].forEach((v, i) => hero.style.setProperty(v, cw.panels[i]));
  swatches.forEach((b) => {
    const on = b.dataset.cw === id;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  });
  wayLabel.textContent = cw.label;
  buy.href = cw.url;
  if (suit.getAttribute('src') !== cw.img) {
    const token = (swapToken += 1);
    const next = new Image();
    next.src = cw.img;
    suit.classList.add('is-swapping');
    const swap = () => {
      if (token !== swapToken) return; // a newer colorway was picked meanwhile
      suit.src = cw.img;
      suit.alt = `Dope Era Color Block Sweat Suit, ${cw.label} colorway: jacket and pants`;
      setTimeout(() => suit.classList.remove('is-swapping'), 30);
    };
    const decoded = Promise.race([next.decode().catch(() => {}), new Promise((r) => setTimeout(r, 700))]);
    Promise.all([decoded, new Promise((r) => setTimeout(r, reduced ? 0 : 260))]).then(swap);
  }
}
swatches.forEach((b, i) => {
  b.addEventListener('click', () => setColorway(b.dataset.cw));
  b.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    setColorway(swatches[(i + step + swatches.length) % swatches.length].dataset.cw, true);
  });
});
// ?cw=blue|pink|tan opens the hero on that colorway (handy for sharing a specific look).
const startCw = new URLSearchParams(location.search).get('cw');
if (startCw && startCw !== 'red') setColorway(startCw);
// Warm the other colorways once the page is idle.
(window.requestIdleCallback || setTimeout)(() => COLORWAYS.forEach((c) => { new Image().src = c.img; }));

/* ---------- Zipper seam ---------- */
const zip = $('[data-zip]');
function updateZip() {
  const r = zip.getBoundingClientRect();
  const p = reduced ? 1 : Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.85)));
  zip.style.setProperty('--zp', p.toFixed(3));
}

/* ---------- 02 Rail ---------- */
const track = $('[data-track]');
const rackItems = [...COLORWAYS.map((c) => ({
  title: c.title, kind: 'Sweat Suit', price: c.price, img: c.img, w: c.w, h: c.h, cutout: true,
  panel: c.panels[0], tone: c.panels[1], sizes: c.sizes, url: c.url, available: true, badge: 'New colorway',
})), ...FITS];
track.innerHTML = rackItems.map((p) => {
  const photo = !p.cutout;
  const badge = !p.available ? 'Sold out' : p.badge || (p.priceFrom ? 'From $100' : '');
  const sizes = p.sizes.length
    ? `<div class="card__sizes" aria-label="Sizes">${p.sizes.map((s) => `<span class="${s.available ? '' : 'out'}">${s.size}${s.available ? '' : '<span class="sr"> sold out</span>'}</span>`).join('')}</div>`
    : '';
  return `<li><a class="card${photo ? ' card--photo' : ''}${p.available ? '' : ' card--out'}" href="${p.url}" rel="noopener" style="--panel:${p.panel};--tone:${p.tone}">
    <div class="card__stage">${badge ? `<span class="card__badge">${esc(badge)}</span>` : ''}<img class="card__img" src="${p.img}" width="${p.w}" height="${p.h}" alt="" loading="lazy" decoding="async"></div>
    <div class="card__meta"><span class="card__name">${esc(p.title)}</span>
      <span class="card__row"><span>${esc(p.kind)}</span><strong>${p.priceFrom ? 'from ' : ''}${money(p.price)}</strong></span>
      ${sizes}<span class="card__go">${p.available ? 'View on dopeera.com ↗' : 'See listing ↗'}</span></div></a></li>`;
}).join('');
$('[data-count]').textContent = `· ${rackItems.length} pieces`;
const prev = $('[data-prev]'), next = $('[data-next]');
const page = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
prev.addEventListener('click', () => page(-1));
next.addEventListener('click', () => page(1));
const railState = () => {
  prev.disabled = track.scrollLeft < 8;
  next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
};
track.addEventListener('scroll', railState, { passive: true });
addEventListener('resize', railState);
railState();
// Drag to scroll with a mouse; touch uses native scrolling.
let drag = null;
track.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') return;
  drag = { x: e.clientX, left: track.scrollLeft, moved: false };
});
addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 4) { drag.moved = true; track.style.scrollSnapType = 'none'; }
  track.scrollLeft = drag.left - dx;
});
addEventListener('pointerup', () => {
  if (!drag) return;
  const moved = drag.moved;
  drag = null;
  track.style.scrollSnapType = '';
  if (moved) track.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true });
});

// Feature: the reflective sweep fires on tap for touch screens.
const stage = $('[data-sheen]');
stage.addEventListener('click', () => { stage.classList.add('is-lit'); setTimeout(() => stage.classList.remove('is-lit'), 1300); });

/* ---------- 03 Material tabs ---------- */
const tabs = $$('[role="tab"]');
function selectTab(tab, focus) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !on;
    if (on) { panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in'); }
  });
  if (focus) tab.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
    if (e.key === 'End') { e.preventDefault(); selectTab(tabs.at(-1), true); }
    if (!step) return;
    e.preventDefault();
    selectTab(tabs[(i + step + tabs.length) % tabs.length], true);
  });
});

/* ---------- 03 Rack loupe ---------- */
const frame = $('[data-frame]');
const loupe = $('[data-loupe]');
const loupeName = $('[data-loupe-name]');
const chipsWrap = $('[data-chips]');
const ZOOM = 2.6;
const DOT = { 'Royal Blue': '#2346c5', 'Peach Rose': '#d9a59a', 'Dusty Blue': '#4f7a95', Sand: '#b59d7c', White: '#f4f4f2', Red: '#d0202a', Grey: '#9c9ca0', 'Off White': '#ece6d6', Black: '#121212' };
chipsWrap.innerHTML = RACK.map((r, i) => `<button type="button" class="chip" aria-pressed="false" data-i="${i}" style="--c:${DOT[r.name]}"><i></i>${r.name}${r.soldOut ? ' <small>(sold out)</small>' : ''}</button>`).join('');
const chips = $$('.chip', chipsWrap);
let lens = { x: 0.5, y: 0.45 };
let hiLoaded = false;
function loadHi() {
  if (hiLoaded) return;
  hiLoaded = true;
  loupe.style.backgroundImage = 'url(img/rack-hi.webp)';
}
function placeLoupe(fx, fy, name = '') {
  loadHi();
  lens = { x: Math.min(1, Math.max(0, fx)), y: Math.min(1, Math.max(0, fy)) };
  const w = frame.clientWidth, h = frame.clientHeight, size = loupe.offsetWidth;
  const x = lens.x * w, y = lens.y * h;
  loupe.style.setProperty('--lxp', x + 'px');
  loupe.style.setProperty('--lyp', y + 'px');
  loupe.style.backgroundSize = `${w * ZOOM}px ${h * ZOOM}px`;
  loupe.style.backgroundPosition = `${-(x * ZOOM - size / 2)}px ${-(y * ZOOM - size / 2)}px`;
  loupe.classList.add('is-on');
  loupeName.textContent = name;
}
function nearestName(fx) {
  const near = RACK.reduce((a, b) => (Math.abs(b.x - fx) < Math.abs(a.x - fx) ? b : a));
  return Math.abs(near.x - fx) < 0.05 && lens.y < 0.75 ? near.name : '';
}
function setChip(i) { chips.forEach((c, j) => c.setAttribute('aria-pressed', String(j === i))); }
const fromEvent = (e) => {
  const r = frame.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
};
frame.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  const [fx, fy] = fromEvent(e);
  lens.y = fy;
  placeLoupe(fx, fy, nearestName(fx));
  setChip(-1);
});
frame.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') loupe.classList.remove('is-on'); });
frame.addEventListener('click', (e) => {
  const [fx, fy] = fromEvent(e);
  lens.y = fy;
  placeLoupe(fx, fy, nearestName(fx));
});
frame.addEventListener('keydown', (e) => {
  const d = { ArrowLeft: [-0.03, 0], ArrowRight: [0.03, 0], ArrowUp: [0, -0.04], ArrowDown: [0, 0.04] }[e.key];
  if (!d) return;
  e.preventDefault();
  placeLoupe(lens.x + d[0], lens.y + d[1], '');
  loupeName.textContent = nearestName(lens.x);
});
frame.addEventListener('focus', () => placeLoupe(lens.x, lens.y, nearestName(lens.x)));
chips.forEach((c, i) => c.addEventListener('click', () => {
  const r = RACK[i];
  placeLoupe(r.x, r.y, r.name + (r.soldOut ? ' · sold out' : ''));
  setChip(i);
}));
addEventListener('resize', () => { if (loupe.classList.contains('is-on')) placeLoupe(lens.x, lens.y, loupeName.textContent); });
new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { loadHi(); o.disconnect(); } }, { rootMargin: '400px' }).observe(frame);

/* ---------- 06 Books ---------- */
$('[data-books]').innerHTML = BOOKS.map((b) => `<li><a class="book" href="${b.url}" rel="noopener">
  <span class="book__cover"><img src="${b.img}" alt="Cover of ${esc(b.title)}" loading="lazy" decoding="async"></span>
  <strong>${esc(b.title)}</strong><span>${esc(b.by)} · ${money(b.price)} ↗</span></a></li>`).join('');

/* ---------- 07 Shows: only future dates render ---------- */
const today = new Date(); today.setHours(0, 0, 0, 0);
const upcoming = SHOWS.filter((s) => new Date(s.date + 'T23:59:59') >= today);
const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const showList = $('[data-show-list]');
if (upcoming.length) {
  showList.innerHTML = upcoming.map((s) => `<li><a href="${s.url}" rel="noopener"><b>${fmt.format(new Date(s.date + 'T12:00:00'))} · ${esc(s.city)}</b><span>${esc(s.venue)} ↗</span></a></li>`).join('');
} else {
  showList.remove();
  $('[data-shows] strong').textContent = 'Events & updates';
}

/* ---------- Concept pill ---------- */
const pill = $('[data-concept]');
onScroll();
