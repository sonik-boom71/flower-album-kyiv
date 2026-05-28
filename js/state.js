/* ═══════════════════════════════════════════════════
   state.js — app state + localStorage persistence
═══════════════════════════════════════════════════ */

const DEFAULT_STATE = {
  theme: 'light',
  editMode: false,
  favorites: [],            // [{ type, id }]
  notes: '',
  links: [
    { name:'Flowerstore.ua', url:'https://flowerstore.ua' },
    { name:'UaFlowers Kyiv', url:'https://uaflowers.com' },
    { name:'Цветы.ua',       url:'https://tsvety.ua' },
  ],
  verifiedPrices: {},        // { flowerId: true }
  userPrices: {},            // { id: { priceMin, priceMax } }
  customFlowers: [],
  customBouquets: [],
  customArrangements: [],
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

/* Runtime-only (not persisted) */
let visibleCounts = { flowers: 12, bouquets: 12, arrangements: 12 };
let priceSort = { by: 'name', dir: 'asc' };
const filters = {
  bouquets:     { search:'', category:'all', priceMax:10000 },
  arrangements: { search:'', season:'all',   priceMax:5000 },
  flowers:      { search:'', season:'all', color:'all', priceMax:500, dried:false },
  prices:       { search:'', season:'all', priceMax:500 },
};

function loadState() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      state = { ...DEFAULT_STATE, ...data };
      state.favorites = state.favorites || [];
      state.links = state.links || DEFAULT_STATE.links;
      state.verifiedPrices = state.verifiedPrices || {};
      state.userPrices = state.userPrices || {};
      state.customFlowers = state.customFlowers || [];
      state.customBouquets = state.customBouquets || [];
      state.customArrangements = state.customArrangements || [];
    }
  } catch (e) { console.warn('loadState failed', e); }
}

function saveState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('saveState failed', e); }
}
