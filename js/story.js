// Our Story page: V3's Town / Culture / Community chapters with their original behaviour
// (mural + crew loupes, crew hotspots, woven labels, official embeds, books, upcoming shows).
import { BOOKS, SHOWS } from '../data/catalog.js';
import { SHOOT } from '../data/shoot.js';
import { makeLoupe } from './loupe.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const mural = $('[data-mural]');
if (mural) makeLoupe(mural, $('[data-mloupe]'), '/img/mural.webp', 2.2);

const crew = $('[data-crew]');
if (crew) {
  const crewLoupe = makeLoupe(crew, $('[data-crewloupe]'), SHOOT.details.crew, 1.9);
  const cc = $('[data-crewchips]');
  cc.innerHTML = SHOOT.crew.map((c, i) => `<span class="crew__pair"><button type="button" class="chip" aria-pressed="false" data-i="${i}" style="--c:${c.dot}"><i></i>${esc(c.name)}</button><a class="crew__go" href="${c.url}" aria-label="${esc(c.name)}: see the piece">→</a></span>`).join('');
  $$('.chip', cc).forEach((b, i) => b.addEventListener('click', (e) => { e.stopPropagation(); $$('.chip', cc).forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); crewLoupe.place(SHOOT.crew[i].x, SHOOT.crew[i].y); }));
  cc.addEventListener('click', (e) => e.stopPropagation());
}

const labelEls = $$('[data-labels] .wl');
if (!reduced) {
  labelEls.forEach((l) => l.style.setProperty('--in', 0));
  const lo = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.style.setProperty('--in', 1); lo.unobserve(x.target); } }), { threshold: 0.35 });
  labelEls.forEach((l, i) => { l.style.transitionDelay = (i * 70) + 'ms'; lo.observe(l); });
}

let igLoaded = false;
const loadIG = () => {
  if (igLoaded) return; igLoaded = true;
  const s = document.createElement('script'); s.src = 'https://www.instagram.com/embed.js'; s.async = true;
  s.onload = () => window.instgrm && window.instgrm.Embeds.process();
  document.body.appendChild(s);
};
const igObs = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { loadIG(); igObs.disconnect(); } }, { rootMargin: '900px' });
$$('.instagram-media').forEach((b) => igObs.observe(b));

const books = $('[data-books]');
if (books) books.innerHTML = BOOKS.map((b) => `<li><a class="bk" href="${b.url}" rel="noopener">
  <span class="bk__obj"><img src="${b.img.replace(/^(?!\/|https?:)/, '/')}" alt="Cover of ${esc(b.title)}" loading="lazy" decoding="async"></span>
  <strong>${esc(b.title)}</strong><span>${esc(b.by)} · ${money(b.price)} ↗</span></a></li>`).join('');

const today = new Date(); today.setHours(0, 0, 0, 0);
const upcoming = SHOWS.filter((s) => new Date(s.date + 'T23:59:59') >= today);
const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const showList = $('[data-show-list]');
if (showList) showList.innerHTML = upcoming.length
  ? upcoming.map((s) => `<li><a href="${s.url}" rel="noopener"><b>${fmt.format(new Date(s.date + 'T12:00:00'))} · ${esc(s.city)}</b><span>${esc(s.venue)} ↗</span></a></li>`).join('')
  : '<li><a href="https://dopeera.com/pages/events" rel="noopener"><b>Events and updates</b><span>dopeera.com ↗</span></a></li>';

const route = $('.map__route');
if (route && !reduced) addEventListener('scroll', () => { route.style.strokeDashoffset = String(-scrollY * 0.25); }, { passive: true });
