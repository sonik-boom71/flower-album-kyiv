/* ═══════════════════════════════════════════════════
   app.js — theme, edit mode, events & bootstrap
═══════════════════════════════════════════════════ */

/* ── THEME ────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#themeBtn').textContent = theme === 'dark' ? '◑' : '◐';
  $('#themeBtn').title = theme === 'dark' ? 'Светлый режим' : 'Тёмный режим';
}
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(state.theme);
  saveState();
}

/* ── EDIT MODE ────────────────────────────────────── */
function toggleEditMode() {
  state.editMode = !state.editMode;
  document.body.classList.toggle('edit-mode', state.editMode);
  $('#editBanner').classList.toggle('show', state.editMode);
  $('#editBtn').classList.toggle('active', state.editMode);
  $$('[data-edit-price]').forEach(el => el.setAttribute('contenteditable', state.editMode ? 'true' : 'false'));
  saveState();
}

/* ── FAVOURITES PANEL ─────────────────────────────── */
function openFavPanel() { $('#favPanel').classList.add('open'); $('#favBackdrop').classList.add('open'); renderFavoritesPanel(); }
function closeFavPanel() { $('#favPanel').classList.remove('open'); $('#favBackdrop').classList.remove('open'); }

/* ── SCROLL REVEAL ────────────────────────────────── */
function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
  $$('.fade-up').forEach(el => obs.observe(el));
}

/* ── NAV HIGHLIGHT ────────────────────────────────── */
function initNavHighlight() {
  const ids = ['bouquets','arrangements','flowers','prices','calendar','inspiration'];
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        $$('.masthead-nav a').forEach(a => a.classList.remove('active'));
        const link = $(`.masthead-nav a[href="#${en.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
}

/* ── GLOBAL CLICK DELEGATION ──────────────────────── */
function initClickDelegation() {
  document.body.addEventListener('click', e => {
    // compare checkbox
    const cmp = e.target.closest('[data-compare]');
    if (cmp) { e.stopPropagation(); const [t, id] = cmp.dataset.compare.split(':'); toggleCompareItem(t, id); return; }
    // favourite
    const fb = e.target.closest('[data-fav]');
    if (fb) { e.stopPropagation(); const [t, id] = fb.dataset.fav.split(':'); toggleFavorite(t, id); return; }
    // delete custom
    const db = e.target.closest('[data-del]');
    if (db) {
      e.stopPropagation();
      const [t, id] = db.dataset.del.split(':');
      if (confirm('Удалить эту карточку?')) {
        if (t === 'flower') state.customFlowers = state.customFlowers.filter(x => x.id !== id);
        else if (t === 'bouquet') state.customBouquets = state.customBouquets.filter(x => x.id !== id);
        else state.customArrangements = state.customArrangements.filter(x => x.id !== id);
        state.favorites = state.favorites.filter(f => !(f.type === t && f.id === id));
        compareItems = compareItems.filter(c => !(c.type === t && c.id === id));
        saveState(); renderAllSections(); renderFavoritesPanel(); updateFavCount(); renderCompareTray();
        showToast('Удалено');
      }
      return;
    }
    // inline price edit
    const pe = e.target.closest('[data-edit-price]');
    if (pe && state.editMode) {
      e.stopPropagation();
      pe.setAttribute('contenteditable', 'true'); pe.focus();
      const r = document.createRange(); r.selectNodeContents(pe);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      return;
    }
    // add-card button
    const ab = e.target.closest('[data-add-type]');
    if (ab) { openAddModal(ab.dataset.addType); return; }
    // jump from fav clip
    const jc = e.target.closest('[data-jump-card]');
    if (jc && !e.target.closest('.fav-clip-rm')) {
      const [t, id] = jc.dataset.jumpCard.split(':');
      closeFavPanel(); setTimeout(() => openDetailModal(t, id), 200); return;
    }
    // jump from almanac / suggestion tag
    const jt = e.target.closest('[data-jump]');
    if (jt) { closeSuggestion(); openDetailModal('flower', jt.dataset.jump); return; }
    // calc add/inc/dec
    const ca = e.target.closest('[data-calc-add]'); if (ca) { calc.add(ca.dataset.calcAdd); return; }
    const ci = e.target.closest('[data-calc-inc]'); if (ci) { calc.add(ci.dataset.calcInc); return; }
    const cd = e.target.closest('[data-calc-dec]'); if (cd) { calc.dec(cd.dataset.calcDec); return; }
    // palette item
    const po = e.target.closest('[data-pal-open]');
    if (po) { const [t, id] = po.dataset.palOpen.split(':'); palette.hide(); setTimeout(() => openDetailModal(t, id), 120); return; }
    // card → detail (ignore in compare mode)
    const card = e.target.closest('.plate-card');
    if (card) {
      if (compareMode) { const [t, id] = [card.dataset.type, card.dataset.id]; toggleCompareItem(t, id); }
      else openDetailModal(card.dataset.type, card.dataset.id);
    }
  });

  // inline price save on blur
  document.body.addEventListener('blur', e => {
    const pe = e.target.closest('[data-edit-price]');
    if (!pe) return;
    pe.setAttribute('contenteditable', 'false');
    const id = pe.dataset.editPrice;
    const txt = pe.textContent.replace(/\s+/g, '').replace('₴', '').replace('грн', '');
    const m = txt.match(/(\d+)[–-](\d+)/);
    if (m) {
      const min = parseInt(m[1], 10), max = parseInt(m[2], 10);
      if (min > 0 && max >= min) { state.userPrices[id] = { priceMin: min, priceMax: max }; saveState(); renderAllSections(); showToast('Цена обновлена'); return; }
    }
    renderAllSections();
  }, true);
  document.body.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const pe = e.target.closest('[data-edit-price]'); if (pe) { e.preventDefault(); pe.blur(); } }
  });
}

/* ── MODAL / OVERLAY WIRING ───────────────────────── */
function initModals() {
  $('#detailClose').addEventListener('click', closeDetailModal);
  $('#addClose').addEventListener('click', closeAddModal);
  $('#detailModal').addEventListener('click', e => {
    if (e.target.id === 'detailModal' || e.target.id === 'detailCloseBtn') closeDetailModal();
    const fb = e.target.closest('[data-modal-fav]');
    if (fb) { const [t, id] = fb.dataset.modalFav.split(':'); toggleFavorite(t, id); openDetailModal(t, id); }
  });
  $('#addModal').addEventListener('click', e => { if (e.target.id === 'addModal') closeAddModal(); });

  // feature modals
  $('#calcClose').addEventListener('click', () => calc.close());
  $('#calcModal').addEventListener('click', e => { if (e.target.id === 'calcModal') calc.close(); });
  $('#calcSearch').addEventListener('input', e => { calc.search = e.target.value; calc.render(); });
  $('#calcClearBtn').addEventListener('click', () => calc.clear());
  $('#calcSaveBtn').addEventListener('click', () => calc.saveAsBouquet());

  $('#suggestClose').addEventListener('click', closeSuggestion);
  $('#suggestModal').addEventListener('click', e => { if (e.target.id === 'suggestModal') closeSuggestion(); });
  $('#suggestAgain').addEventListener('click', showSuggestion);

  $('#settingsClose').addEventListener('click', closeSettings);
  $('#settingsModal').addEventListener('click', e => { if (e.target.id === 'settingsModal') closeSettings(); });

  $('#shortcutsClose').addEventListener('click', closeShortcuts);
  $('#shortcutsModal').addEventListener('click', e => { if (e.target.id === 'shortcutsModal') closeShortcuts(); });

  // command palette
  $('#paletteOverlay').addEventListener('click', e => { if (e.target.id === 'paletteOverlay') palette.hide(); });
  $('#paletteInput').addEventListener('input', e => palette.search(e.target.value));
  $('#paletteInput').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); palette.move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); palette.move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); palette.choose(); }
  });

  // compare tray
  $('#compareTrayOpen').addEventListener('click', openCompare);
  $('#compareTrayClear').addEventListener('click', () => { compareItems = []; renderAllSections(); renderCompareTray(); });
}

/* ── TOPBAR BUTTONS ───────────────────────────────── */
function initTopbar() {
  $('#themeBtn').addEventListener('click', toggleTheme);
  $('#editBtn').addEventListener('click', toggleEditMode);
  $('#editBannerOff').addEventListener('click', toggleEditMode);
  $('#favBtn').addEventListener('click', openFavPanel);
  $('#favClose').addEventListener('click', closeFavPanel);
  $('#favBackdrop').addEventListener('click', closeFavPanel);
  $('#calcBtn').addEventListener('click', () => calc.open());
  $('#suggestBtn').addEventListener('click', showSuggestion);
  $('#compareBtn').addEventListener('click', toggleCompareMode);
  $('#searchBtn').addEventListener('click', () => palette.show());
  $('#settingsBtn').addEventListener('click', openSettings);
}

/* ── FILTERS WIRING ───────────────────────────────── */
function initFilters() {
  // bouquets
  $('#bouquetSearch').addEventListener('input', e => { filters.bouquets.search = e.target.value; visibleCounts.bouquets = 12; renderBouquets(); });
  $('#bouquetCategory').addEventListener('change', e => { filters.bouquets.category = e.target.value; visibleCounts.bouquets = 12; renderBouquets(); });
  $('#bouquetPriceMax').addEventListener('input', e => { filters.bouquets.priceMax = +e.target.value; $('#bouquetPriceVal').textContent = (+e.target.value).toLocaleString('ru') + ' ₴'; visibleCounts.bouquets = 12; renderBouquets(); });
  $('#bouquetReset').addEventListener('click', () => { filters.bouquets = { search:'', category:'all', priceMax:10000 }; $('#bouquetSearch').value=''; $('#bouquetCategory').value='all'; $('#bouquetPriceMax').value=10000; $('#bouquetPriceVal').textContent='10 000 ₴'; visibleCounts.bouquets=12; renderBouquets(); });
  // arrangements
  $('#arrangSearch').addEventListener('input', e => { filters.arrangements.search = e.target.value; visibleCounts.arrangements = 12; renderArrangements(); });
  $('#arrangSeason').addEventListener('change', e => { filters.arrangements.season = e.target.value; visibleCounts.arrangements = 12; renderArrangements(); });
  $('#arrangPriceMax').addEventListener('input', e => { filters.arrangements.priceMax = +e.target.value; $('#arrangPriceVal').textContent = (+e.target.value).toLocaleString('ru') + ' ₴'; visibleCounts.arrangements = 12; renderArrangements(); });
  $('#arrangReset').addEventListener('click', () => { filters.arrangements = { search:'', season:'all', priceMax:5000 }; $('#arrangSearch').value=''; $('#arrangSeason').value='all'; $('#arrangPriceMax').value=5000; $('#arrangPriceVal').textContent='5 000 ₴'; visibleCounts.arrangements=12; renderArrangements(); });
  // flowers
  $('#flowerSearch').addEventListener('input', e => { filters.flowers.search = e.target.value; visibleCounts.flowers = 12; renderFlowers(); });
  $('#flowerSeason').addEventListener('change', e => { filters.flowers.season = e.target.value; visibleCounts.flowers = 12; renderFlowers(); });
  $('#flowerColor').addEventListener('change', e => { filters.flowers.color = e.target.value; visibleCounts.flowers = 12; renderFlowers(); });
  $('#flowerPriceMax').addEventListener('input', e => { filters.flowers.priceMax = +e.target.value; $('#flowerPriceVal').textContent = (+e.target.value) + ' ₴'; visibleCounts.flowers = 12; renderFlowers(); });
  $('#flowerDriedChip').addEventListener('click', () => { filters.flowers.dried = !filters.flowers.dried; $('#flowerDriedChip').classList.toggle('active', filters.flowers.dried); visibleCounts.flowers = 12; renderFlowers(); });
  $('#flowerReset').addEventListener('click', () => { filters.flowers = { search:'', season:'all', color:'all', priceMax:500, dried:false }; $('#flowerSearch').value=''; $('#flowerSeason').value='all'; $('#flowerColor').value='all'; $('#flowerPriceMax').value=500; $('#flowerPriceVal').textContent='500 ₴'; $('#flowerDriedChip').classList.remove('active'); visibleCounts.flowers=12; renderFlowers(); });
  // prices
  $('#priceSearch').addEventListener('input', e => { filters.prices.search = e.target.value; renderPriceTable(); });
  $('#priceSeason').addEventListener('change', e => { filters.prices.season = e.target.value; renderPriceTable(); });
  $('#pricePriceMax').addEventListener('input', e => { filters.prices.priceMax = +e.target.value; $('#pricePriceVal').textContent = (+e.target.value) + ' ₴'; renderPriceTable(); });
  $('#priceReset').addEventListener('click', () => { filters.prices = { search:'', season:'all', priceMax:500 }; $('#priceSearch').value=''; $('#priceSeason').value='all'; $('#pricePriceMax').value=500; $('#pricePriceVal').textContent='500 ₴'; renderPriceTable(); });

  // price table sort
  $$('.catalog-table th.sortable').forEach(th => th.addEventListener('click', () => {
    const by = th.dataset.sort;
    if (priceSort.by === by) priceSort.dir = priceSort.dir === 'asc' ? 'desc' : 'asc';
    else { priceSort.by = by; priceSort.dir = 'asc'; }
    renderPriceTable();
  }));
  // price table inputs
  $('#priceTableBody').addEventListener('input', e => {
    const inp = e.target.closest('[data-price-field]'); if (!inp) return;
    const id = inp.dataset.id, field = inp.dataset.priceField, val = parseInt(inp.value, 10);
    if (isNaN(val) || val < 0) return;
    const orig = getAllFlowers().find(f => f.id === id);
    const cur = state.userPrices[id] || { priceMin: orig.priceMin, priceMax: orig.priceMax };
    cur[field] = val; state.userPrices[id] = cur; saveState();
  });
  $('#priceTableBody').addEventListener('change', e => {
    const v = e.target.closest('[data-verify]'); if (!v) return;
    state.verifiedPrices[v.dataset.verify] = v.checked; saveState();
    const lbl = v.closest('.catalog-verify');
    lbl.classList.toggle('checked', v.checked);
    lbl.querySelector('.catalog-verify-text').textContent = v.checked ? '✓ Видела' : 'Отметить';
  });

  // load more
  $$('.load-more').forEach(btn => btn.addEventListener('click', () => {
    const sec = btn.dataset.section; visibleCounts[sec] += 12;
    if (sec === 'bouquets') renderBouquets(); else if (sec === 'arrangements') renderArrangements(); else renderFlowers();
  }));
}

/* ── INSPIRATION (notes + links) ──────────────────── */
function initInspiration() {
  let timer;
  $('#notesArea').addEventListener('input', e => {
    state.notes = e.target.value;
    clearTimeout(timer);
    const hint = $('#notesHint');
    hint.textContent = 'Печатаешь…'; hint.classList.remove('saved');
    timer = setTimeout(() => {
      saveState(); hint.textContent = '✓ Сохранено'; hint.classList.add('saved');
      setTimeout(() => { hint.textContent = 'Автосохранение в браузере'; hint.classList.remove('saved'); }, 1500);
    }, 400);
  });
  $('#addLinkForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#linkName').value.trim(), url = $('#linkUrl').value.trim();
    if (!name || !url) return;
    state.links.push({ name, url }); saveState(); renderLinks();
    $('#linkName').value = ''; $('#linkUrl').value = '';
    showToast('Ссылка добавлена');
  });
  $('#linksList').addEventListener('click', e => {
    const del = e.target.closest('[data-del-link]'); if (!del) return;
    state.links.splice(parseInt(del.dataset.delLink, 10), 1); saveState(); renderLinks(); showToast('Удалено');
  });
  $('#favBody').addEventListener('click', e => {
    const un = e.target.closest('[data-unfav]');
    if (un) { e.stopPropagation(); const [t, id] = un.dataset.unfav.split(':'); toggleFavorite(t, id); }
  });
}

/* ── KEYBOARD SHORTCUTS ───────────────────────────── */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    // ⌘K / Ctrl+K — palette (works even in inputs)
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.open ? palette.hide() : palette.show(); return; }

    // Escape closes the topmost overlay
    if (e.key === 'Escape') {
      if (palette.open) return palette.hide();
      closeDetailModal(); closeAddModal(); closeFavPanel();
      calc.close(); closeSuggestion(); closeSettings(); closeShortcuts();
      return;
    }

    // ignore single-key shortcuts while typing
    if (e.target.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case '/': e.preventDefault(); palette.show(); break;
      case 'c': case 'С': calc.open(); break;
      case 'r': case 'К': showSuggestion(); break;
      case 'f': case 'А': openFavPanel(); break;
      case 't': case 'Е': toggleTheme(); break;
      case 'e': case 'У': toggleEditMode(); break;
      case 'v': case 'М': toggleCompareMode(); break;
      case '?': showShortcuts(); break;
    }
  });
}

/* ── BOOTSTRAP ────────────────────────────────────── */
function init() {
  loadState();
  applyTheme(state.theme);
  $('#notesArea').value = state.notes || '';
  $('#lastUpdate').textContent = LAST_UPDATE;

  renderAllSections();
  renderLinks();
  renderFavoritesPanel();
  updateFavCount();

  initScrollAnimations();
  initNavHighlight();
  initTopbar();
  initModals();
  initFilters();
  initInspiration();
  initClickDelegation();
  initKeyboard();

  if (state.editMode) {
    document.body.classList.add('edit-mode');
    $('#editBanner').classList.add('show');
    $('#editBtn').classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', init);
