/* ═══════════════════════════════════════════════════
   utils.js — DOM helpers, formatting, data accessors
═══════════════════════════════════════════════════ */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
const escapeAttr = escapeHtml;

/* Add Pexels compression params for lighter loads */
function imgUrl(url, w = 600) {
  if (!url) return '';
  if (url.includes('pexels.com') && !url.includes('?')) {
    return url + '?auto=compress&cs=tinysrgb&w=' + w;
  }
  return url;
}

function formatPrice(min, max) { return min + '–' + max + ' ₴'; }

function getEffectivePrice(item) {
  const u = state.userPrices[item.id];
  if (u) return { priceMin: u.priceMin, priceMax: u.priceMax };
  return { priceMin: item.priceMin, priceMax: item.priceMax };
}

function getSeasonLabel(seasons) {
  if (!seasons || seasons.length === 0) return '—';
  if (seasons.length === 12) return 'Круглый год';
  const sorted = [...seasons].sort((a, b) => a - b);
  let isRange = true;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) { isRange = false; break; }
  }
  if (isRange && sorted.length > 1) {
    return MONTH_SHORT[sorted[0] - 1] + '–' + MONTH_SHORT[sorted[sorted.length - 1] - 1];
  }
  return sorted.map(m => MONTH_SHORT[m - 1]).join(', ');
}

/* Combined seed + user data */
function getAllFlowers()      { return [...FLOWERS_DATA, ...state.customFlowers]; }
function getAllBouquets()     { return [...BOUQUETS_DATA, ...state.customBouquets]; }
function getAllArrangements() { return [...ARRANGEMENTS_DATA, ...state.customArrangements]; }

function findItem(type, id) {
  if (type === 'flower')   return getAllFlowers().find(x => x.id === id);
  if (type === 'bouquet')  return getAllBouquets().find(x => x.id === id);
  return getAllArrangements().find(x => x.id === id);
}

/* Favourites */
function isFavorite(type, id) { return state.favorites.some(f => f.type === type && f.id === id); }
function toggleFavorite(type, id) {
  const idx = state.favorites.findIndex(f => f.type === type && f.id === id);
  if (idx >= 0) state.favorites.splice(idx, 1);
  else state.favorites.push({ type, id });
  saveState();
  updateFavCount();
  renderAllSections();
  renderFavoritesPanel();
}
function updateFavCount() {
  const el = $('#favCount');
  if (state.favorites.length > 0) {
    el.textContent = state.favorites.length;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

/* Toast notifications */
let _toastTimer;
function showToast(msg, isError = false) {
  const t = $('#toast');
  t.querySelector('.toast-text').textContent = msg;
  t.classList.toggle('error', isError);
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* Fisher–Yates shuffle (returns a new array) */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
