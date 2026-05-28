/* ═══════════════════════════════════════════════════
   modals.js — detail view + add-item form
═══════════════════════════════════════════════════ */

/* ── DETAIL MODAL ─────────────────────────────────── */
function openDetailModal(type, id) {
  const item = findItem(type, id);
  if (!item) return;
  const kind = type === 'flower' ? 'Flora · Specimen' : type === 'bouquet' ? 'Bouquet' : 'Mixed Arrangement';
  const ep = getEffectivePrice(item);
  const fav = isFavorite(type, id);
  const plateNum = item.plate || '';

  let fields = '';
  if (type === 'flower') {
    fields = `
      <div class="book-grid">
        <div class="book-field"><label>Аромат</label><div class="book-field-val">${escapeHtml(item.scent || '—')}</div></div>
        <div class="book-field"><label>Сухоцвет</label><div class="book-field-val">${item.isDried ? 'Да' : 'Нет'}</div></div>
        <div class="book-field" style="grid-column:1/-1"><label>Символика</label><div class="book-field-val"><em>${escapeHtml(item.meaning || '—')}</em></div></div>
        <div class="book-field" style="grid-column:1/-1"><label>Цвета</label><div class="book-field-val">${(item.colors || []).join(' · ')}</div></div>
      </div>`;
  } else if (type === 'bouquet') {
    fields = `
      <div class="book-grid">
        <div class="book-field"><label>Категория</label><div class="book-field-val">${CATEGORY_LABELS[item.category] || item.category}</div></div>
        <div class="book-field"><label>Цвета</label><div class="book-field-val">${(item.colors || []).join(', ')}</div></div>
        <div class="book-field" style="grid-column:1/-1"><label>Символика</label><div class="book-field-val"><em>${escapeHtml(item.meaning || '—')}</em></div></div>
      </div>`;
  } else {
    fields = `
      <div class="book-grid">
        <div class="book-field" style="grid-column:1/-1"><label>Состав</label><div class="book-field-val">${(item.flowers || []).join(' · ')}</div></div>
      </div>`;
  }

  let seasonsBlock = '';
  if (item.seasons) {
    seasonsBlock = `
      <div class="book-field" style="margin-bottom:24px">
        <label>Сезон</label>
        <div class="book-seasons">
          ${MONTH_SHORT.map((m, i) => `<div class="season-cell ${item.seasons.includes(i + 1) ? 'active' : ''}">${m}</div>`).join('')}
        </div>
      </div>`;
  }

  $('#bookHeadMarker').textContent = `${kind} · N° ${plateNum}`;
  $('#detailBody').innerHTML = `
    <div class="book-photo"><img src="${imgUrl(item.img, 1200)}" alt="${escapeAttr(item.name)}"></div>
    <h2 class="book-name">${escapeHtml(item.name)}</h2>
    ${item.nameLat ? `<div class="book-latin">${escapeHtml(item.nameLat)}</div>` : ''}
    <div class="book-price">${formatPrice(ep.priceMin, ep.priceMax)}${type === 'flower' ? ' / шт' : ''}</div>
    ${fields}
    ${seasonsBlock}
    ${item.note ? `<div class="book-note">${escapeHtml(item.note)}</div>` : ''}
    <div class="book-actions">
      <button class="btn-book ghost" data-modal-fav="${type}:${id}">${fav ? '♥ В избранном' : '♡ В избранное'}</button>
      <button class="btn-book" id="detailCloseBtn">Закрыть</button>
    </div>`;
  $('#detailModal').classList.add('open');
}
function closeDetailModal() { $('#detailModal').classList.remove('open'); }

/* ── ADD MODAL ────────────────────────────────────── */
function openAddModal(type) {
  const labels = { flower: 'New Specimen · Цветок', bouquet: 'New Specimen · Букет', arrangement: 'New Specimen · Сбор' };
  $('#addHeadMarker').textContent = labels[type];
  $('#addBody').innerHTML = buildAddForm(type);
  $('#addModal').classList.add('open');

  const picker = $('#monthsPicker');
  if (picker) picker.addEventListener('click', e => {
    const btn = e.target.closest('.month-pick');
    if (btn) btn.classList.toggle('active');
  });
  $('#addCancel').addEventListener('click', closeAddModal);
  $('#addForm').addEventListener('submit', handleAddSubmit);
}
function closeAddModal() { $('#addModal').classList.remove('open'); }

function buildAddForm(type) {
  const monthsPicker = `
    <div class="form-group">
      <label class="form-label">Сезон ${type === 'flower' ? 'цветения' : ''}</label>
      <div class="months-picker" id="monthsPicker">
        ${MONTH_SHORT.map((m, i) => `<button type="button" class="month-pick" data-month="${i + 1}">${m}</button>`).join('')}
      </div>
    </div>`;
  const priceRow = `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Цена от, ₴</label><input type="number" class="form-input" name="priceMin" required min="0" value="${type === 'flower' ? 50 : 500}"></div>
      <div class="form-group"><label class="form-label">Цена до, ₴</label><input type="number" class="form-input" name="priceMax" required min="0" value="${type === 'flower' ? 100 : type === 'bouquet' ? 1500 : 1000}"></div>
    </div>`;
  const imgField = `<div class="form-group"><label class="form-label">URL фотографии</label><input class="form-input" name="img" placeholder="https://images.pexels.com/photos/..."></div>`;
  const actions = `
    <div class="form-actions">
      <button type="button" class="btn-ghost" id="addCancel">Отмена</button>
      <button type="submit" class="btn-book">Сохранить</button>
    </div>`;

  if (type === 'flower') {
    return `
    <form id="addForm" data-type="flower">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Название</label><input class="form-input" name="name" required placeholder="Например, лилия"></div>
        <div class="form-group"><label class="form-label">Латинское</label><input class="form-input" name="nameLat" placeholder="Lilium"></div>
      </div>
      ${priceRow}
      <div class="form-row">
        <div class="form-group"><label class="form-label">Аромат</label>
          <select class="form-select" name="scent"><option value="сильный">Сильный</option><option value="средний" selected>Средний</option><option value="слабый">Слабый</option><option value="нет">Нет</option></select>
        </div>
        <div class="form-group"><label class="form-label">Цвет (через запятую)</label><input class="form-input" name="colors" placeholder="розовый, белый"></div>
      </div>
      ${monthsPicker}
      <div class="form-group"><label class="form-label">Символика</label><input class="form-input" name="meaning" placeholder="Любовь, чистота..."></div>
      <div class="form-group"><label class="form-check"><input type="checkbox" name="isDried"><span class="form-check-label">Это сухоцвет</span></label></div>
      ${imgField}
      <div class="form-group"><label class="form-label">Примечание</label><textarea class="form-textarea" name="note"></textarea></div>
      ${actions}
    </form>`;
  }
  if (type === 'bouquet') {
    return `
    <form id="addForm" data-type="bouquet">
      <div class="form-group"><label class="form-label">Название</label><input class="form-input" name="name" required></div>
      <div class="form-group"><label class="form-label">Категория</label>
        <select class="form-select" name="category"><option value="wedding">Свадебный</option><option value="holiday" selected>Праздничный</option><option value="mono">Монобукет</option><option value="box">Коробка</option><option value="basket">Корзина</option></select>
      </div>
      ${priceRow}
      <div class="form-group"><label class="form-label">Цвета (через запятую)</label><input class="form-input" name="colors" placeholder="розовый, белый"></div>
      <div class="form-group"><label class="form-label">Символика</label><input class="form-input" name="meaning"></div>
      ${imgField}
      <div class="form-group"><label class="form-label">Описание / состав</label><textarea class="form-textarea" name="note"></textarea></div>
      ${actions}
    </form>`;
  }
  return `
    <form id="addForm" data-type="arrangement">
      <div class="form-group"><label class="form-label">Название</label><input class="form-input" name="name" required></div>
      <div class="form-group"><label class="form-label">Цветы в составе (через запятую)</label><input class="form-input" name="flowers" required placeholder="Тюльпан, нарцисс, фрезия"></div>
      ${priceRow}
      ${monthsPicker}
      <div class="form-group"><label class="form-label">Цвета</label><input class="form-input" name="colors" placeholder="розовый, белый"></div>
      ${imgField}
      <div class="form-group"><label class="form-label">Примечание</label><textarea class="form-textarea" name="note"></textarea></div>
      ${actions}
    </form>`;
}

function handleAddSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const type = form.dataset.type;
  const fd = new FormData(form);
  const data = {};
  for (const [k, v] of fd.entries()) data[k] = v;
  data.id = `${type[0]}_user_${Date.now()}`;
  data.priceMin = parseInt(data.priceMin, 10) || 0;
  data.priceMax = parseInt(data.priceMax, 10) || 0;
  if (data.colors) data.colors = data.colors.split(',').map(s => s.trim()).filter(Boolean);
  data.isDried = !!data.isDried;
  if (data.flowers && type === 'arrangement') {
    data.flowers = data.flowers.split(',').map(s => s.trim()).filter(Boolean);
  }
  const picker = form.querySelector('#monthsPicker');
  if (picker) {
    const active = [...picker.querySelectorAll('.month-pick.active')].map(b => parseInt(b.dataset.month, 10));
    data.seasons = active.length > 0 ? active : [1,2,3,4,5,6,7,8,9,10,11,12];
  }
  if (!data.img) data.img = 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg';

  if (type === 'flower') state.customFlowers.push(data);
  else if (type === 'bouquet') state.customBouquets.push(data);
  else state.customArrangements.push(data);

  saveState();
  renderAllSections();
  closeAddModal();
  showToast(`Добавлено: ${data.name}`);
}
