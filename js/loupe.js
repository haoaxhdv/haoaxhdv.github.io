// Loupe helper shared by the rack (home) and the mural / crew photo (Our Story). Unchanged V3 behaviour:
// lens coordinates are fractions of the PHOTO, so object-fit: cover crops map correctly.
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function makeLoupe(frame, loupe, src, zoom, nameEl) {
  let lens = { x: 0.5, y: 0.5 }, loaded = false;
  const geom = () => {
    const img = frame.querySelector('img');
    const w = img.clientWidth, h = img.clientHeight, nw = img.naturalWidth || w, nh = img.naturalHeight || h;
    const sc = Math.max(w / nw, h / nh), dw = nw * sc, dh = nh * sc;
    const op = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    return { img, dw, dh, ox: (w - dw) * (isNaN(op[0]) ? 0.5 : op[0]), oy: (h - dh) * (isNaN(op[1]) ? 0.5 : op[1]) };
  };
  const place = (fx, fy, name = '') => {
    if (!loaded) { loupe.style.backgroundImage = `url(${src})`; loaded = true; }
    lens = { x: clamp(fx), y: clamp(fy) };
    const g = geom(), size = loupe.offsetWidth;
    const x = g.ox + lens.x * g.dw, y = g.oy + lens.y * g.dh;
    loupe.style.setProperty('--lxp', x - frame.scrollLeft + 'px'); loupe.style.setProperty('--lyp', y + 'px');
    loupe.style.backgroundSize = `${g.dw * zoom}px ${g.dh * zoom}px`;
    loupe.style.backgroundPosition = `${-(lens.x * g.dw * zoom - size / 2)}px ${-(lens.y * g.dh * zoom - size / 2)}px`;
    loupe.classList.add('is-on');
    if (nameEl) nameEl.textContent = name;
  };
  const from = (e) => { const g = geom(), r = g.img.getBoundingClientRect(); return [(e.clientX - r.left - g.ox) / g.dw, (e.clientY - r.top - g.oy) / g.dh]; };
  frame.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') { const [x, y] = from(e); place(x, y, frame._name ? frame._name(x, y) : ''); } });
  frame.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') loupe.classList.remove('is-on'); });
  frame.addEventListener('click', (e) => { const [x, y] = from(e); place(x, y, frame._name ? frame._name(x, y) : ''); frame._pick && frame._pick(x, y); });
  frame.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: [-0.03, 0], ArrowRight: [0.03, 0], ArrowUp: [0, -0.05], ArrowDown: [0, 0.05] }[e.key];
    if (!d) return; e.preventDefault(); place(lens.x + d[0], lens.y + d[1], frame._name ? frame._name(lens.x + d[0], lens.y + d[1]) : '');
  });
  return { place, hide: () => loupe.classList.remove('is-on'), get lens() { return lens; } };
}
