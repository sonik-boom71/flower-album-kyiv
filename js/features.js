/* ═══════════════════════════════════════════════════
   features.js — extras that make the album fun:
   · Bouquet calculator
   · Command palette (⌘K / Ctrl+K)
   · "What to gift today" suggestion
   · Compare mode (up to 3 items side by side)
   · Settings: export / import / reset + stats
   · Keyboard shortcuts + help
═══════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────
   1. BOUQUET CALCULATOR
─────────────────────────────────────────────────── */
const calc = {
  items: {},   // { flowerId: qty }
  search: '',

  open() {
    $('#calcModal').classList.add('open');
    this.render();
    setTimeout(() => { const s = $('#calcSearch'); if (s) s.focus(); }, 80);
  },
  close() { $('#calcModal').classList.remove('open'); },

  add(id) { this.items[id] = (this.items[id] || 0) + 1; this.render(); },
  dec(id) {
    if (!this.items[id]) return;
    this.items[id]--; if (this.items[id] <= 0) delete this.items[id];
    this.render();
  },
  clear() { this.items = {}; this.render(); },

  total() {
    let min = 0, max = 0, count = 0;
    for (const id in this.items) {
      const fl = getAllFlowers().find(f => f.id === id);
      if (!fl) continue;
      const ep = getEffectivePrice(fl);
      min += ep.priceMin * this.items[id];
      max += ep.priceMax * this.items[id];
      count += this.items[id];
    }
    return { min, max, count };
  },

  render() {
    // available flowers (filtered by search)
    const q = this.search.toLowerCase();
    const pool = getAllFlowers().filter(f => !q || f.name.toLowerCase().includes(q));
    $('#calcResults').innerHTML = pool.map(f => {
      const ep = getEffectivePrice(f);
      return `
        <div class="calc-pick" data-calc-add="${f.id}" title="Добавить">
          <img src="${imgUrl(f.img, 160)}" alt="" loading="lazy">
          <div class="calc-pick-name">${escapeHtml(f.name)}</div>
          <div class="calc-pick-price">${ep.priceMin}–${ep.priceMax} ₴</div>
        </div>`;
    }).join('') || '<div class="calc-cart-empty">Ничего не найдено</div>';

    // cart
    const ids = Object.keys(this.items);
    const cart = $('#calcCart');
    if (ids.length === 0) {
      cart.innerHTML = '<div class="calc-cart-empty">Букет пуст — добавь цветы сверху ↑</div>';
    } else {
      cart.innerHTML = ids.map(id => {
        const fl = getAllFlowers().find(f => f.id === id);
        if (!fl) return '';
        const ep = getEffectivePrice(fl);
        const qty = this.items[id];
        return `
          <div class="calc-row">
            <img src="${imgUrl(fl.img, 120)}" alt="">
            <div>
              <div class="calc-row-name">${escapeHtml(fl.name)}</div>
              <div class="calc-row-unit">${ep.priceMin}–${ep.priceMax} ₴ / шт</div>
            </div>
            <div class="calc-stepper">
              <button class="calc-step-btn" data-calc-dec="${id}">−</button>
              <span class="calc-qty">${qty}</span>
              <button class="calc-step-btn" data-calc-inc="${id}">+</button>
            </div>
            <div class="calc-row-sum">${ep.priceMin * qty}–${ep.priceMax * qty} ₴</div>
          </div>`;
      }).join('');
    }

    const t = this.total();
    $('#calcTotalVal').textContent = t.count ? `${t.min}–${t.max} ₴` : '0 ₴';
    $('#calcTotalCount').textContent = t.count
      ? `${t.count} ${pluralStems(t.count)}` : 'добавь цветы';
    $('#calcSaveBtn').disabled = t.count === 0;
    $('#calcSaveBtn').style.opacity = t.count === 0 ? '0.4' : '1';
  },

  saveAsBouquet() {
    const ids = Object.keys(this.items);
    if (ids.length === 0) return;
    const t = this.total();
    const names = ids.map(id => {
      const fl = getAllFlowers().find(f => f.id === id);
      return fl ? `${fl.name}×${this.items[id]}` : '';
    }).filter(Boolean);
    const data = {
      id: `a_calc_${Date.now()}`,
      plate: '★',
      name: 'Мой букет',
      flowers: names,
      img: 'https://images.pexels.com/photos/1488310/pexels-photo-1488310.jpeg',
      priceMin: t.min, priceMax: t.max,
      seasons: [1,2,3,4,5,6,7,8,9,10,11,12],
      colors: ['разноцветный'],
      note: `Собран в калькуляторе: ${names.join(', ')}. Итого ${t.min}–${t.max} ₴.`,
    };
    state.customArrangements.push(data);
    saveState();
    renderAllSections();
    this.clear();
    this.close();
    showToast('Букет сохранён в «Сборы»');
  },
};
function pluralStems(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'стебель';
  if ([2,3,4].includes(m10) && ![12,13,14].includes(m100)) return 'стебля';
  return 'стеблей';
}

/* ───────────────────────────────────────────────────
   2. COMMAND PALETTE (⌘K)
─────────────────────────────────────────────────── */
const palette = {
  open: false,
  active: 0,
  results: [],

  show() {
    this.open = true;
    $('#paletteOverlay').classList.add('open');
    const inp = $('#paletteInput');
    inp.value = ''; this.search('');
    setTimeout(() => inp.focus(), 60);
  },
  hide() { this.open = false; $('#paletteOverlay').classList.remove('open'); },

  search(q) {
    q = q.trim().toLowerCase();
    const all = [
      ...getAllFlowers().map(x => ({ ...x, _type: 'flower', _label: 'Flora' })),
      ...getAllBouquets().map(x => ({ ...x, _type: 'bouquet', _label: 'Bouquet' })),
      ...getAllArrangements().map(x => ({ ...x, _type: 'arrangement', _label: 'Mixed' })),
    ];
    this.results = (q
      ? all.filter(x => x.name.toLowerCase().includes(q) || (x.nameLat || '').toLowerCase().includes(q))
      : all
    ).slice(0, 8);
    this.active = 0;
    this.render();
  },

  render() {
    const box = $('#paletteResults');
    if (this.results.length === 0) {
      box.innerHTML = '<div class="palette-empty">Ничего не найдено</div>';
      return;
    }
    box.innerHTML = this.results.map((x, i) => {
      const ep = getEffectivePrice(x);
      return `
        <div class="palette-item ${i === this.active ? 'active' : ''}" data-pal-open="${x._type}:${x.id}" data-idx="${i}">
          <img src="${imgUrl(x.img, 100)}" alt="">
          <div>
            <div class="palette-item-name">${escapeHtml(x.name)}</div>
            <div class="palette-item-sub">${x._label}${x.nameLat ? ' · ' + escapeHtml(x.nameLat) : ''}</div>
          </div>
          <div class="palette-item-price">${formatPrice(ep.priceMin, ep.priceMax)}</div>
        </div>`;
    }).join('');
  },

  move(dir) {
    if (!this.results.length) return;
    this.active = (this.active + dir + this.results.length) % this.results.length;
    this.render();
    const el = $(`.palette-item[data-idx="${this.active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  },

  choose() {
    const r = this.results[this.active];
    if (!r) return;
    this.hide();
    setTimeout(() => openDetailModal(r._type, r.id), 120);
  },
};

/* ───────────────────────────────────────────────────
   3. "WHAT TO GIFT TODAY" SUGGESTION
─────────────────────────────────────────────────── */
function showSuggestion() {
  const month = new Date().getMonth() + 1;
  const inSeason = getAllFlowers().filter(f => (f.seasons || []).includes(month));
  const pool = inSeason.length >= 3 ? inSeason : getAllFlowers();
  const picks = shuffle(pool).slice(0, 3);
  const advice = SEASON_ADVICE[month] || 'Выбери то, что радует глаз — лучший букет тот, что от души.';

  $('#suggestSeasonLine').textContent = `${MONTH_NAMES[month - 1]} · сейчас в сезоне ${inSeason.length} видов`;
  $('#suggestPicks').innerHTML = picks.map(f => {
    const ep = getEffectivePrice(f);
    return `
      <div class="suggest-pick" data-jump="${f.id}">
        <img src="${imgUrl(f.img, 300)}" alt="${escapeAttr(f.name)}" loading="lazy">
        <div class="suggest-pick-meta">
          <div class="suggest-pick-name">${escapeHtml(f.name)}</div>
          <div class="suggest-pick-price">${formatPrice(ep.priceMin, ep.priceMax)}</div>
        </div>
      </div>`;
  }).join('');
  $('#suggestAdvice').innerHTML = `<strong>Совет сезона.</strong> ${escapeHtml(advice)}`;
  $('#suggestModal').classList.add('open');
}
function closeSuggestion() { $('#suggestModal').classList.remove('open'); }

/* ───────────────────────────────────────────────────
   4. COMPARE MODE
─────────────────────────────────────────────────── */
let compareMode = false;
let compareItems = [];   // [{type, id}]

function compareSelected(type, id) {
  return compareItems.some(c => c.type === type && c.id === id);
}
function toggleCompareMode() {
  compareMode = !compareMode;
  document.body.classList.toggle('compare-mode', compareMode);
  $('#compareBtn').classList.toggle('active', compareMode);
  if (!compareMode) { compareItems = []; renderAllSections(); }
  renderCompareTray();
  showToast(compareMode ? 'Режим сравнения: отметь до 3 карточек' : 'Сравнение выключено');
}
function toggleCompareItem(type, id) {
  const idx = compareItems.findIndex(c => c.type === type && c.id === id);
  if (idx >= 0) compareItems.splice(idx, 1);
  else {
    if (compareItems.length >= 3) { showToast('Можно сравнить максимум 3', true); return; }
    compareItems.push({ type, id });
  }
  renderAllSections();
  renderCompareTray();
}
function renderCompareTray() {
  const tray = $('#compareTray');
  if (!compareMode || compareItems.length === 0) { tray.classList.remove('show'); return; }
  $('#compareTrayThumbs').innerHTML = compareItems.map(c => {
    const it = findItem(c.type, c.id);
    return it ? `<img src="${imgUrl(it.img, 80)}" alt="">` : '';
  }).join('');
  $('#compareTrayCount').textContent = compareItems.length;
  tray.classList.add('show');
}
function openCompare() {
  if (compareItems.length < 2) { showToast('Отметь хотя бы 2 карточки', true); return; }
  const items = compareItems.map(c => ({ ...findItem(c.type, c.id), _type: c.type })).filter(Boolean);

  const row = (label, render) => `
    <tr>
      <td class="compare-row-label">${label}</td>
      ${items.map(it => `<td class="compare-val ${render.cls || ''}">${render.fn(it)}</td>`).join('')}
    </tr>`;

  const body = `
    <table class="compare-table">
      <thead>
        <tr>
          <th></th>
          ${items.map(it => `
            <th>
              <img class="compare-col-img" src="${imgUrl(it.img, 400)}" alt="">
              <div class="compare-col-name">${escapeHtml(it.name)}</div>
              ${it.nameLat ? `<div class="compare-col-lat">${escapeHtml(it.nameLat)}</div>` : ''}
            </th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${row('Цена', { cls: 'price', fn: it => { const ep = getEffectivePrice(it); return formatPrice(ep.priceMin, ep.priceMax); } })}
        ${row('Сезон', { fn: it => getSeasonLabel(it.seasons) })}
        ${row('Аромат', { fn: it => it.scent || '—' })}
        ${row('Символика', { fn: it => `<em>${escapeHtml(it.meaning || '—')}</em>` })}
        ${row('Цвета', { fn: it => (it.colors || []).join(', ') || '—' })}
        ${row('Сухоцвет', { fn: it => it.isDried ? 'Да' : (it._type === 'flower' ? 'Нет' : '—') })}
        ${row('Состав', { fn: it => (it.flowers || []).join(', ') || '—' })}
      </tbody>
    </table>`;

  $('#bookHeadMarker').textContent = `Сравнение · ${items.length} образца`;
  $('#detailBody').innerHTML = body;
  $('#detailModal').classList.add('open');
}

/* ───────────────────────────────────────────────────
   5. SETTINGS: export / import / reset + stats
─────────────────────────────────────────────────── */
function openSettings() {
  const verified = Object.values(state.verifiedPrices).filter(Boolean).length;
  const custom = state.customFlowers.length + state.customBouquets.length + state.customArrangements.length;
  const edited = Object.keys(state.userPrices).length;

  $('#settingsBody').innerHTML = `
    <div class="settings-stat-grid">
      <div class="settings-stat"><div class="settings-stat-num">${state.favorites.length}</div><div class="settings-stat-label">в избранном</div></div>
      <div class="settings-stat"><div class="settings-stat-num">${verified}</div><div class="settings-stat-label">цен проверено</div></div>
      <div class="settings-stat"><div class="settings-stat-num">${custom}</div><div class="settings-stat-label">своих карточек</div></div>
    </div>
    <div class="settings-row">
      <div><div class="settings-info-title">Экспорт данных</div><div class="settings-info-desc">Скачать весь альбом одним JSON-файлом (бэкап).</div></div>
      <button class="btn-book" id="exportBtn">Скачать .json</button>
    </div>
    <div class="settings-row">
      <div><div class="settings-info-title">Импорт данных</div><div class="settings-info-desc">Загрузить ранее сохранённый JSON-файл.</div></div>
      <button class="btn-book ghost" id="importBtn">Выбрать файл</button>
      <input type="file" id="importFile" accept="application/json" style="display:none">
    </div>
    <div class="settings-row">
      <div><div class="settings-info-title">Сбросить всё</div><div class="settings-info-desc">Вернуть альбом к исходному состоянию. Своих карточек, цен и заметок не будет.</div></div>
      <button class="btn-danger" id="resetBtn">Сбросить</button>
    </div>
    <div class="settings-row" style="opacity:0.7">
      <div><div class="settings-info-title">О проекте</div><div class="settings-info-desc">Kyiv Flora Atlas · версия ${VERSION} · цены от ${LAST_UPDATE}. Данные хранятся только в этом браузере (localStorage).</div></div>
    </div>`;
  $('#settingsModal').classList.add('open');

  $('#exportBtn').addEventListener('click', exportData);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); });
  $('#resetBtn').addEventListener('click', resetData);
}
function closeSettings() { $('#settingsModal').classList.remove('open'); }

function exportData() {
  const payload = { app: 'kyiv-flora-atlas', version: VERSION, exportedAt: new Date().toISOString(), state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flora-atlas-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast('Файл скачан');
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const incoming = data.state || data;
      if (!incoming || typeof incoming !== 'object') throw new Error('bad');
      state = { ...DEFAULT_STATE, ...incoming };
      saveState();
      showToast('Данные импортированы');
      setTimeout(() => location.reload(), 600);
    } catch (err) { showToast('Не удалось прочитать файл', true); }
  };
  reader.readAsText(file);
}
function resetData() {
  if (!confirm('Сбросить весь альбом к исходному состоянию? Это удалит твои карточки, цены, заметки и избранное.')) return;
  localStorage.removeItem(LS_KEY);
  showToast('Сброшено');
  setTimeout(() => location.reload(), 500);
}

/* ───────────────────────────────────────────────────
   6. SHORTCUTS HELP
─────────────────────────────────────────────────── */
const SHORTCUTS = [
  { keys: ['/'], desc: 'Открыть поиск (палитру)' },
  { keys: ['⌘', 'K'], desc: 'Командная палитра' },
  { keys: ['C'], desc: 'Калькулятор букета' },
  { keys: ['R'], desc: 'Что подарить сегодня' },
  { keys: ['F'], desc: 'Избранное' },
  { keys: ['T'], desc: 'Светлая / тёмная тема' },
  { keys: ['E'], desc: 'Режим редактирования цен' },
  { keys: ['V'], desc: 'Режим сравнения' },
  { keys: ['?'], desc: 'Эта справка' },
  { keys: ['Esc'], desc: 'Закрыть окно' },
];
function showShortcuts() {
  $('#shortcutsBody').innerHTML = `
    <div class="shortcuts-grid">
      ${SHORTCUTS.map(s => `
        <div class="shortcut-row">
          <span class="shortcut-desc">${s.desc}</span>
          <span class="shortcut-keys">${s.keys.map(k => `<kbd>${k}</kbd>`).join('')}</span>
        </div>`).join('')}
    </div>`;
  $('#shortcutsModal').classList.add('open');
}
function closeShortcuts() { $('#shortcutsModal').classList.remove('open'); }

/* Are any overlays open? (used by keyboard handler) */
function anyOverlayOpen() {
  return !!document.querySelector('.overlay.open, .palette-overlay.open, .fav-side.open');
}
