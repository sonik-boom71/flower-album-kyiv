/* ═══════════════════════════════════════════════════
   filters.js — filtering logic for each section
═══════════════════════════════════════════════════ */

function getFilteredBouquets() {
  const f = filters.bouquets;
  return getAllBouquets().filter(b => {
    if (f.search && !b.name.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.category !== 'all' && b.category !== f.category) return false;
    if (getEffectivePrice(b).priceMin > f.priceMax) return false;
    return true;
  });
}

function getFilteredArrangements() {
  const f = filters.arrangements;
  return getAllArrangements().filter(a => {
    if (f.search && !a.name.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (getEffectivePrice(a).priceMin > f.priceMax) return false;
    if (f.season !== 'all') {
      const months = SEASON_GROUPS[f.season];
      if (!months.some(m => (a.seasons || []).includes(m))) return false;
    }
    return true;
  });
}

function getFilteredFlowers() {
  const f = filters.flowers;
  return getAllFlowers().filter(fl => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!fl.name.toLowerCase().includes(q) && !(fl.nameLat || '').toLowerCase().includes(q)) return false;
    }
    if (f.season !== 'all' && !(fl.seasons || []).includes(parseInt(f.season, 10))) return false;
    if (f.color !== 'all' && !(fl.colors || []).includes(f.color)) return false;
    if (getEffectivePrice(fl).priceMin > f.priceMax) return false;
    if (f.dried && !fl.isDried) return false;
    return true;
  });
}

function getFilteredPrices() {
  const f = filters.prices;
  return getAllFlowers().filter(fl => {
    if (f.search && !fl.name.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (getEffectivePrice(fl).priceMin > f.priceMax) return false;
    if (f.season !== 'all') {
      if (f.season === 'year') { if (fl.seasons.length !== 12) return false; }
      else {
        const months = SEASON_GROUPS[f.season];
        if (!months.some(m => fl.seasons.includes(m))) return false;
      }
    }
    return true;
  });
}
