// Merged site: shared behaviour for the shop, product, lookbook and story pages.
// The visitor's colorway (chosen on the homepage lining) still dresses every page; there is no floating badge.
import { initNav } from './site-nav.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

try { if (new URLSearchParams(location.search).has('review') || sessionStorage.getItem('de-review') === '1') { root.classList.add('review'); sessionStorage.setItem('de-review', '1'); } } catch (e) {}

initNav();

// rails (more pieces)
$$('[data-rail]').forEach((rail) => {
  const track = $('[data-track]', rail), prev = $('[data-prev]', rail), next = $('[data-next]', rail);
  if (!track) return;
  const state = () => { if (prev) prev.disabled = track.scrollLeft < 8; if (next) next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8; };
  const page = (d) => track.scrollBy({ left: d * track.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
  prev && prev.addEventListener('click', () => page(-1));
  next && next.addEventListener('click', () => page(1));
  track.addEventListener('scroll', state, { passive: true });
  addEventListener('resize', state);
  state();
});

// product gallery: one photo per view (scroll-snap), prev/next, counter, compact thumbnail strip, arrow keys
$$('[data-gal]').forEach((g) => {
  const track = $('[data-gtrack]', g), figs = $$('figure', track), thumbs = $$('.galx__thumb', g), count = $('[data-gcount]', g);
  const prev = $('[data-gprev]', g), next = $('[data-gnext]', g), strip = $('.galx__thumbs', g);
  let cur = 0;
  const show = (i) => {
    cur = i;
    thumbs.forEach((b, j) => b.setAttribute('aria-current', String(i === j)));
    if (count) count.textContent = `${i + 1} / ${figs.length}`;
    prev.disabled = i === 0; next.disabled = i === figs.length - 1;
    const t = thumbs[i];
    if (t && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
  };
  const go = (i) => { i = Math.max(0, Math.min(figs.length - 1, i)); track.scrollTo({ left: figs[i].offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' }); show(i); };
  thumbs.forEach((b, i) => b.addEventListener('click', () => go(i)));
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  let raf;
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const i = Math.round(track.scrollLeft / track.clientWidth); if (i !== cur) show(i); }); }, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    if (e.key === 'Home') { e.preventDefault(); go(0); }
    if (e.key === 'End') { e.preventDefault(); go(figs.length - 1); }
  });
  show(0);
});
