// Product data transcribed from https://dopeera.com/products.json on 2026-10-18, re-checked 2026-11-24 (read-only).
// Names, prices and size availability are as listed on the official store on the re-check. Listings that no longer
// exist (the reflective puff jacket and the Red, Royal Blue and Grey Signature sweatsuits) were removed here; the
// puffer now appears through the Nov 22 shoot photography (data/shoot.js) without a store link.
// Every purchase link goes to the official product page; this concept has no cart.
export const SNAPSHOT = 'Nov 24, 2026';
const STORE = 'https://dopeera.com/products/';
const SIZES7 = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const sizes = (list, out = []) => list.map((s) => ({ size: s, available: !out.includes(s) }));

// Color Block Sweat Suit colorways. Panel colors are sampled from each official product photo.
export const COLORWAYS = [
  {
    id: 'red', label: 'Red Black Yellow Green', short: 'Red',
    handle: 'dope-era-color-block-sweat-suit-red-black-yellow-green',
    img: 'img/cb-red.webp', w: 1200, h: 1137,
    panels: ['#ec1f2e', '#f4b41a', '#0b8b86', '#121212'], ink: '#fff',
  },
  {
    id: 'blue', label: 'Powder Blue Black White', short: 'Powder Blue',
    handle: 'dope-era-color-block-sweat-suit-blue-black-white',
    img: 'img/cb-blue.webp', w: 1200, h: 1148,
    panels: ['#73ade6', '#10203f', '#ecebe7', '#0b0b12'], ink: '#fff',
  },
  {
    id: 'pink', label: 'Pink Black White', short: 'Pink',
    handle: 'dope-era-color-block-sweat-suit-pink-black-white',
    img: 'img/cb-pink.webp', w: 1200, h: 1152,
    panels: ['#f48cbd', '#ecebe7', '#df6aa5', '#0b0b0b'], ink: '#fff',
  },
  {
    id: 'tan', label: 'Tan Brown Black White', short: 'Tan',
    handle: 'dope-era-color-block-sweat-suit-tan-brown-white',
    img: 'img/cb-tan.webp', w: 1200, h: 1224,
    panels: ['#d3ab83', '#4b2621', '#ece3d1', '#111111'], ink: '#fff',
  },
].map((c) => ({
  ...c,
  title: `Color Block Sweat Suit — ${c.label}`,
  price: 220,
  sizes: sizes(SIZES7, ['3XL']),
  url: STORE + c.handle,
}));

// V3 (2026-11-24): the rail and the rack now show the Nov 22 shoot (data/shoot.js). The pre-shoot store items that
// used to fill them (cap, mystery box, Signature) are no longer displayed, so their data is removed here.
export const FITS = [];

export const BOOKS = [
  { handle: 't-h-u-g-therapy-journal', title: 'T.H.U.G. Therapy Journal', price: 39.99, img: 'img/book-thug-therapy.webp', by: 'Stanley “Mistah FAB” Cox' },
  { handle: 'stan-can-book', title: 'Stan Can', price: 20, img: 'img/book-stan-can.webp', by: 'Children’s book' },
  { handle: 'if-you-got-air-you-got-action-book', title: 'If You Got Air, You Got Action', price: 40, img: 'img/book-air.webp', by: 'Stanley Cox & Dr. Zenda Johnson, PhD' },
  { handle: 'thug-tears-book', title: 'Thug Tears', price: 45, img: 'img/book-thug-tears.webp', by: 'Transcribed lyrics, albums 1–4' },
].map((b) => ({ ...b, url: STORE + b.handle }));

// From https://dopeera.com/pages/events (Motion Detected Tour). Only future dates render.
export const SHOWS = [
  { date: '2026-10-23', city: 'Sacramento', venue: 'The Rink Studios', url: 'https://www.eventbrite.com/e/mistah-fab-philthy-rich-live-in-sacramento-tickets-1998865649967' },
  { date: '2026-10-24', city: 'Oakland', venue: 'Crybaby', url: 'https://www.eventbrite.com/e/mistah-fab-philthy-rich-live-in-oakland-tickets-1998865710147' },
];

// Signature colors pictured in the rack photo, left to right, per the official listing.
// x/y are loupe targets as fractions of the rack image.
export const RACK = []; // V3: rack positions come from data/shoot.js
