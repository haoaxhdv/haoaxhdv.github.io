// Merged site: one navigation for every page (Shop · Collections · Lookbook · Our Story + Visit Current Store).
// The mobile menu is an opaque, modal panel outside the header (no backdrop-filter containing block), it closes on
// every link (in-page anchors included), Escape and the close button, keeps focus inside while open and returns it.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function initNav() {
  const root = document.documentElement;
  const toggle = $('[data-menu-open]');
  const menu = $('#menu');
  let lastFocus = null;

  const focusables = () => $$('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);
  const openMenu = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    root.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => { menu.classList.add('is-open'); $('[data-menu-close]', menu).focus(); });
  };
  const closeMenu = ({ restore = true } = {}) => {
    if (menu.hidden) return;
    menu.classList.remove('is-open');
    menu.hidden = true;
    root.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (restore) (lastFocus && lastFocus.isConnected ? lastFocus : toggle).focus();
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
    $('[data-menu-close]', menu).addEventListener('click', () => closeMenu());
    // Any link closes the menu first, so in-page destinations (e.g. /#materials) never leave it expanded.
    menu.addEventListener('click', (e) => { if (e.target.closest('a[href]')) closeMenu({ restore: false }); });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key !== 'Tab') return;
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) closeMenu({ restore: false }); });
  }

  // Desktop "Collections" disclosure: opaque panel, Escape / outside click / focus leaving closes it.
  $$('[data-dd]').forEach((dd) => {
    const btn = $('button', dd), panel = $('[data-dd-panel]', dd);
    const set = (on) => { btn.setAttribute('aria-expanded', String(on)); panel.hidden = !on; dd.classList.toggle('is-open', on); };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    dd.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus(); } });
    dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', (e) => { if (!dd.contains(e.target)) set(false); });
    panel.addEventListener('click', (e) => { if (e.target.closest('a[href]')) set(false); });
  });

  return { closeMenu };
}
