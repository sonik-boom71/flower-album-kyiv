/* ═══════════════════════════════════════════════════
   render.js — all section renderers
═══════════════════════════════════════════════════ */

/* ── BOUQUETS ─────────────────────────────────────── */
function renderBouquets() {
  const grid = $('#bouquetsGrid');
  const all = getFilteredBouquets();
  const visible = all.slice(0, visibleCounts.bouquets);
  if (all.length === 0) {
    grid.innerHTML = `<div class="empty-state"><span class="mono">Nothing found</span>попробуй сбросить фильтры или добавить свой букет</div>`;
    grid.appendChild(addPlateCard('bouquet'));
    $('#bouquetsLoadMore').style.display = 'none';
    return;
  }
  grid.innerHTML = visible.map(renderBouquetCard).join('');
  grid.appendChild(addPlateCard('bouquet'));
  $('#bouquetsLoadMore').style.display = visible.length < all.length ? 'block' : 'none';
}
function renderBouquetCard(b) {
  const isCustom = state.customBouquets.some(x => x.id === b.id);
  const ep = getEffectivePrice(b);
  const fav = isFavorite('bouquet', b.id);
  const plateNum = b.plate || (b.id.replace(/\D/g, '') || '');
  const cmp = compareSelected('bouquet', b.id) ? 'active' : '';
  return `
  <article class="plate-card ${isCustom ? 'is-custom' : ''}" data-type="bouquet" data-id="${b.id}">
    <button class="plate-fav ${fav ? 'active' : ''}" data-fav="bouquet:${b.id}" title="В избранное">${fav ? '♥' : '♡'}</button>
    <button class="plate-compare ${cmp}" data-compare="bouquet:${b.id}" title="Сравнить">⇄</button>
    ${isCustom ? `<button class="plate-del" data-del="bouquet:${b.id}" title="Удалить">✕</button>` : ''}
    <div class="plate-photo"><img src="${imgUrl(b.img)}" alt="${escapeAttr(b.name)}" loading="lazy"></div>
    <div class="plate-meta">
      <div class="plate-num">N° ${plateNum} · Bouquet</div>
      <h3 class="plate-name">${escapeHtml(b.name)}</h3>
      <div class="plate-cat">${CATEGORY_LABELS[b.category] || b.category}</div>
      <div class="plate-divider-small"></div>
      <div class="plate-price"><span data-edit-price="${b.id}">${formatPrice(ep.priceMin, ep.priceMax)}</span></div>
    </div>
  </article>`;
}

/* ── ARRANGEMENTS ─────────────────────────────────── */
function renderArrangements() {
  const grid = $('#arrangementsGrid');
  const all = getFilteredArrangements();
  const visible = all.slice(0, visibleCounts.arrangements);
  if (all.length === 0) {
    grid.innerHTML = `<div class="empty-state"><span class="mono">Nothing found</span>попробуй другие фильтры или добавь свой сбор</div>`;
    grid.appendChild(addPlateCard('arrangement'));
    $('#arrangementsLoadMore').style.display = 'none';
    return;
  }
  grid.innerHTML = visible.map(renderArrangementCard).join('');
  grid.appendChild(addPlateCard('arrangement'));
  $('#arrangementsLoadMore').style.display = visible.length < all.length ? 'block' : 'none';
}
function renderArrangementCard(a) {
  const isCustom = state.customArrangements.some(x => x.id === a.id);
  const ep = getEffectivePrice(a);
  const fav = isFavorite('arrangement', a.id);
  const plateNum = a.plate || (a.id.replace(/\D/g, '') || '');
  const cmp = compareSelected('arrangement', a.id) ? 'active' : '';
  return `
  <article class="plate-card ${isCustom ? 'is-custom' : ''}" data-type="arrangement" data-id="${a.id}">
    <button class="plate-fav ${fav ? 'active' : ''}" data-fav="arrangement:${a.id}">${fav ? '♥' : '♡'}</button>
    <button class="plate-compare ${cmp}" data-compare="arrangement:${a.id}" title="Сравнить">⇄</button>
    ${isCustom ? `<button class="plate-del" data-del="arrangement:${a.id}">✕</button>` : ''}
    <div class="plate-photo"><img src="${imgUrl(a.img)}" alt="${escapeAttr(a.name)}" loading="lazy"></div>
    <div class="plate-meta">
      <div class="plate-num">N° ${plateNum} · Mixed</div>
      <h3 class="plate-name">${escapeHtml(a.name)}</h3>
      <div class="plate-latin">${(a.flowers || []).slice(0, 4).join(' · ')}</div>
      <div class="plate-divider-small"></div>
      <div class="plate-price"><span data-edit-price="${a.id}">${formatPrice(ep.priceMin, ep.priceMax)}</span></div>
      <div class="plate-tags"><span class="plate-tag">${getSeasonLabel(a.seasons)}</span></div>
    </div>
  </article>`;
}

/* ── FLOWERS ──────────────────────────────────────── */
function renderFlowers() {
  const grid = $('#flowersGrid');
  const all = getFilteredFlowers();
  const visible = all.slice(0, visibleCounts.flowers);
  if (all.length === 0) {
    grid.innerHTML = `<div class="empty-state"><span class="mono">Nothing found</span>сбрось фильтры или добавь свой цветок</div>`;
    grid.appendChild(addPlateCard('flower'));
    $('#flowersLoadMore').style.display = 'none';
    return;
  }
  grid.innerHTML = visible.map(renderFlowerCard).join('');
  grid.appendChild(addPlateCard('flower'));
  $('#flowersLoadMore').style.display = visible.length < all.length ? 'block' : 'none';
}
function renderFlowerCard(fl) {
  const isCustom = state.customFlowers.some(x => x.id === fl.id);
  const ep = getEffectivePrice(fl);
  const fav = isFavorite('flower', fl.id);
  const plateNum = fl.plate || (fl.id.replace(/\D/g, '') || '');
  const scentCls = fl.scent === 'сильный' ? 'tag-strong' : '';
  const cmp = compareSelected('flower', fl.id) ? 'active' : '';
  return `
  <article class="plate-card ${isCustom ? 'is-custom' : ''}" data-type="flower" data-id="${fl.id}">
    <button class="plate-fav ${fav ? 'active' : ''}" data-fav="flower:${fl.id}">${fav ? '♥' : '♡'}</button>
    <button class="plate-compare ${cmp}" data-compare="flower:${fl.id}" title="Сравнить">⇄</button>
    ${isCustom ? `<button class="plate-del" data-del="flower:${fl.id}">✕</button>` : ''}
    <div class="plate-photo"><img src="${imgUrl(fl.img)}" alt="${escapeAttr(fl.name)}" loading="lazy"></div>
    <div class="plate-meta">
      <div class="plate-num">Plate N° ${plateNum}</div>
      <div class="plate-latin">${escapeHtml(fl.nameLat || '')}</div>
      <h3 class="plate-name">${escapeHtml(fl.name)}</h3>
      <div class="plate-divider-small"></div>
      <div class="plate-price"><span data-edit-price="${fl.id}">${formatPrice(ep.priceMin, ep.priceMax)}</span> <span style="color:var(--ink-faint);font-size:0.78rem">/ шт</span></div>
      <div class="plate-tags">
        <span class="plate-tag">${getSeasonLabel(fl.seasons)}</span>
        <span class="plate-tag ${scentCls}">${escapeHtml(fl.scent || '—')}</span>
        ${fl.isDried ? `<span class="plate-tag tag-dry">сухоцвет</span>` : ''}
      </div>
    </div>
  </article>`;
}

/* ── ADD-CARD BUTTON ──────────────────────────────── */
function addPlateCard(type) {
  const labels = { flower: 'Добавить цветок', bouquet: 'Добавить букет', arrangement: 'Добавить сбор' };
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'plate-add';
  btn.dataset.addType = type;
  btn.innerHTML = `<span class="plate-add-cross">+</span><span class="plate-add-label">${labels[type]}</span>`;
  return btn;
}

/* ── PRICE TABLE ──────────────────────────────────── */
function renderPriceTable() {
  const tbody = $('#priceTableBody');
  let rows = getFilteredPrices();
  const { by, dir } = priceSort;
  const sgn = dir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    if (by === 'name') return a.name.localeCompare(b.name, 'ru') * sgn;
    const eA = getEffectivePrice(a), eB = getEffectivePrice(b);
    if (by === 'priceMin') return (eA.priceMin - eB.priceMin) * sgn;
    if (by === 'priceMax') return (eA.priceMax - eB.priceMax) * sgn;
    if (by === 'season')   return (a.seasons[0] - b.seasons[0]) * sgn;
    return 0;
  });
  $$('.sort-arrow').forEach(el => {
    if (el.dataset.arrow === by) { el.textContent = dir === 'asc' ? '↑' : '↓'; el.classList.add('active'); }
    else { el.textContent = '↕'; el.classList.remove('active'); }
  });
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:60px; font-style:italic; color:var(--ink-soft)">Ничего не найдено</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(fl => {
    const ep = getEffectivePrice(fl);
    const verified = !!state.verifiedPrices[fl.id];
    return `
    <tr data-id="${fl.id}">
      <td>
        <div class="catalog-name">
          <img class="catalog-thumb" src="${imgUrl(fl.img, 120)}" alt="" loading="lazy">
          <div class="catalog-name-text">
            <span class="catalog-name-rus">${escapeHtml(fl.name)}</span>
            <span class="catalog-name-lat">${escapeHtml(fl.nameLat || '')}</span>
          </div>
        </div>
      </td>
      <td><input type="number" class="catalog-price-input" data-price-field="priceMin" data-id="${fl.id}" value="${ep.priceMin}" min="0" step="1"></td>
      <td><input type="number" class="catalog-price-input" data-price-field="priceMax" data-id="${fl.id}" value="${ep.priceMax}" min="0" step="1"></td>
      <td class="catalog-season">${getSeasonLabel(fl.seasons)}</td>
      <td class="catalog-note">${escapeHtml(fl.note || '—')}</td>
      <td>
        <label class="catalog-verify ${verified ? 'checked' : ''}">
          <input type="checkbox" data-verify="${fl.id}" ${verified ? 'checked' : ''}>
          <span class="catalog-verify-text">${verified ? '✓ Видела' : 'Отметить'}</span>
        </label>
      </td>
    </tr>`;
  }).join('');
}

/* ── ALMANAC ──────────────────────────────────────── */
function renderAlmanac() {
  const grid = $('#almanacGrid');
  const allFlowers = getAllFlowers();
  const currentMonth = new Date().getMonth() + 1;
  grid.innerHTML = SEASON_DATA.map(season => {
    const hasCurrent = season.months.includes(currentMonth);
    const monthsHTML = season.months.map(m => {
      const monthFlowers = allFlowers.filter(f => (f.seasons || []).includes(m));
      const isCurrent = m === currentMonth;
      const shown = monthFlowers.slice(0, 10);
      return `
        <div class="almanac-month ${isCurrent ? 'current' : ''}">
          <div class="almanac-month-head">
            <div class="almanac-month-name">${MONTH_NAMES[m - 1]} ${isCurrent ? '<em>сейчас</em>' : ''}</div>
            <div class="almanac-count">${monthFlowers.length} видов</div>
          </div>
          <div class="almanac-flowers">
            ${shown.map((f, i) => `<span class="flower-tag" data-jump="${f.id}">${escapeHtml(f.name)}</span>${i < shown.length - 1 ? ' · ' : ''}`).join('')}
            ${monthFlowers.length > 10 ? ` <span style="color:var(--ink-faint)">+${monthFlowers.length - 10}</span>` : ''}
          </div>
        </div>`;
    }).join('');
    return `
      <div class="season-block ${hasCurrent ? 'current-season' : ''}">
        <div class="season-title">${season.ru} <em>${season.label}</em></div>
        <div class="season-mono">${season.months.map(m => MONTH_LAT[m - 1]).join(' · ')}</div>
        ${monthsHTML}
      </div>`;
  }).join('');
}

/* ── LINKS / BIBLIOGRAPHY ─────────────────────────── */
function renderLinks() {
  const list = $('#linksList');
  if (!state.links || state.links.length === 0) {
    list.innerHTML = '<div style="padding:40px 0; color:var(--ink-soft); font-style:italic; text-align:center">Список пуст — добавь свою первую ссылку ниже</div>';
    return;
  }
  list.innerHTML = state.links.map((l, i) => `
    <div class="biblio-item">
      <div class="biblio-num">№ ${String(i + 1).padStart(2, '0')}</div>
      <div class="biblio-content">
        <div class="biblio-name">${escapeHtml(l.name)}</div>
        <a class="biblio-url" href="${escapeAttr(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.url)}</a>
      </div>
      <button class="biblio-del" data-del-link="${i}" title="Удалить">✕</button>
    </div>`).join('');
}

/* ── FAVOURITES PANEL ─────────────────────────────── */
function renderFavoritesPanel() {
  const body = $('#favBody');
  if (state.favorites.length === 0) {
    body.innerHTML = `
      <div class="fav-empty">
        <div class="fav-empty-mark">♡</div>
        <div class="fav-empty-text">
          Здесь появятся карточки, которые вы добавите в избранное.
          <span class="mono">Нажмите ♡ на любой карточке</span>
        </div>
      </div>`;
    return;
  }
  body.innerHTML = state.favorites.map(f => {
    const item = findItem(f.type, f.id);
    if (!item) return '';
    const label = f.type === 'flower' ? 'Flora' : f.type === 'bouquet' ? 'Bouquet' : 'Mixed';
    const ep = getEffectivePrice(item);
    return `
    <div class="fav-clip" data-jump-card="${f.type}:${f.id}">
      <img class="fav-clip-img" src="${imgUrl(item.img, 200)}" alt="">
      <div class="fav-clip-info">
        <div class="fav-clip-type">${label}</div>
        <div class="fav-clip-name">${escapeHtml(item.name)}</div>
        <div class="fav-clip-price">${formatPrice(ep.priceMin, ep.priceMax)}</div>
      </div>
      <button class="fav-clip-rm" data-unfav="${f.type}:${f.id}" title="Убрать">✕</button>
    </div>`;
  }).join('');
}

/* ── ORCHESTRATION ────────────────────────────────── */
function renderAllSections() {
  renderBouquets();
  renderArrangements();
  renderFlowers();
  renderPriceTable();
  renderAlmanac();
  updateStats();
}
function updateStats() {
  $('#statFlowers').textContent = getAllFlowers().length;
  $('#statBouquets').textContent = getAllBouquets().length;
  $('#statArrangements').textContent = getAllArrangements().length;
}
