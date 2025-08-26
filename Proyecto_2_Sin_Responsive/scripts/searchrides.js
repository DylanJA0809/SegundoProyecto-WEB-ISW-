
let MAP = null;
let MAP_MARKERS = [];
let MAP_LINE = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1) Mapa
  initMap();

  // 2) Llenar combos
  populatePlacesCombos();

  const fromSel = document.getElementById('from');
  if (fromSel) {
    fromSel.addEventListener('change', () => {
      populateToByFrom(fromSel.value);
    });
  }

  // 4) Capturar submit del form (Find rides)
  const form = document.querySelector('.search-box form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      filterAndRenderRides();
    });
  }

  // 5) Primer render
  filterAndRenderRides();
});

// ---------- Mapa (Leaflet) ----------
function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) {
    console.warn('[map] no existe #map');
    return;
  }
  if (typeof L === 'undefined') {
    console.error('[map] Leaflet no cargó. Revisa <script src="leaflet.js"> en el <head>.');
    return;
  }

  MAP = L.map('map', { zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(MAP);

  // Centro inicial: Costa Rica
  MAP.setView([9.936, -84.09], 7);
  setTimeout(() => MAP.invalidateSize(), 0);
}

function clearMap() {
  if (!MAP) return;
  MAP_MARKERS.forEach(m => MAP.removeLayer(m));
  MAP_MARKERS = [];
  if (MAP_LINE) {
    MAP.removeLayer(MAP_LINE);
    MAP_LINE = null;
  }
}

async function showRideOnMap(ride) {
  if (!MAP || !ride) return;

  clearMap();

  // Ayuda a geocodificar mejor agregando país
  const fromPt = await geocodePlace(`${ride.from}, Costa Rica`);
  const toPt   = await geocodePlace(`${ride.to}, Costa Rica`);

  if (!fromPt || !toPt) {
    alert('No fue posible ubicar las direcciones en el mapa.');
    return;
  }

  const m1 = L.marker([fromPt.lat, fromPt.lon]).bindPopup(`<b>From:</b> ${escapeHtml(ride.from)}`);
  const m2 = L.marker([toPt.lat, toPt.lon]).bindPopup(`<b>To:</b> ${escapeHtml(ride.to)}`);
  m1.addTo(MAP); m2.addTo(MAP);
  MAP_MARKERS.push(m1, m2);

  MAP_LINE = L.polyline([[fromPt.lat, fromPt.lon], [toPt.lat, toPt.lon]], { weight: 4 }).addTo(MAP);

  const group = L.featureGroup([m1, m2]);
  MAP.fitBounds(group.getBounds().pad(0.25));
}

async function geocodePlace(text) {
  const q = String(text || '').trim();
  if (!q) return null;

  const key = `geocache:${q.toLowerCase()}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached) return cached;
  } catch {}

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      const pt = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      localStorage.setItem(key, JSON.stringify(pt));
      return pt;
    }
  } catch (e) {
    console.warn('Geocode error:', e);
  }
  return null;
}

// ---------- llenar combos ----------
function populatePlacesCombos() {
  const rides = safeParse(localStorage.getItem('rides')) || [];
  const placesSet = new Set();

  rides.forEach(r => {
    if (r?.from) placesSet.add(String(r.from).trim());
    if (r?.to)   placesSet.add(String(r.to).trim());
  });

  const places = Array.from(placesSet)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const fromSel = document.getElementById('from');
  const toSel   = document.getElementById('to');
  if (fromSel) buildOptions(fromSel, places, true);
  if (toSel)   buildOptions(toSel,   places, true);
}

function populateToByFrom(fromValue) {
  const toSel = document.getElementById('to');
  if (!toSel) return;

  const rides = safeParse(localStorage.getItem('rides')) || [];
  if (!fromValue) return populatePlacesCombos();

  const toSet = new Set(
    rides
      .filter(r => String(r.from).trim() === String(fromValue).trim())
      .map(r => String(r.to).trim())
  );

  let items = Array.from(toSet).filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  if (items.length === 0) {
    const all = safeParse(localStorage.getItem('rides')) || [];
    const allSet = new Set();
    all.forEach(r => { if (r?.to) allSet.add(String(r.to).trim()); });
    items = Array.from(allSet).filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }

  buildOptions(toSel, items, true);
}

function buildOptions(selectEl, items, includeAny = true) {
  selectEl.innerHTML = '';
  if (includeAny) {
    const anyOpt = document.createElement('option');
    anyOpt.value = '';
    anyOpt.textContent = 'Any';
    selectEl.appendChild(anyOpt);
  }
  items.forEach(txt => {
    const opt = document.createElement('option');
    opt.value = txt;
    opt.textContent = txt;
    selectEl.appendChild(opt);
  });
}

// ---------- Filtrar + Tabla ----------
function filterAndRenderRides() {
  const fromVal = (document.getElementById('from')?.value || '').trim();
  const toVal   = (document.getElementById('to')?.value   || '').trim();

  // Días marcados
  const checkedDays = Array.from(
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')
  ).map(cb => (cb.value || '').trim());

  const rides = safeParse(localStorage.getItem('rides')) || [];

  const fromNorm = normalize(fromVal);
  const toNorm   = normalize(toVal);

  const filtered = rides.filter(r => {
    const rFrom = normalize(r.from);
    const rTo   = normalize(r.to);

    const fromOk = !fromNorm || rFrom.includes(fromNorm);
    const toOk   = !toNorm   || rTo.includes(toNorm);

    let daysOk = true;
    if (checkedDays.length > 0) {
      const rideDays = (r.days || []).map(normalize);
      const wanted   = checkedDays.map(normalize);
      daysOk = wanted.some(d => rideDays.includes(d));
    }
    return fromOk && toOk && daysOk;
  });

  // Label de resultados
  const resultsInfo = document.querySelector('.results-info');
  if (resultsInfo) {
    const fromText = fromVal || 'anywhere';
    const toText   = toVal   || 'anywhere';
    resultsInfo.innerHTML = `Rides found from <strong>${escapeHtml(fromText)}</strong> to <strong>${escapeHtml(toText)}</strong>`;
  }

  // Tabla
  const tbody = document.getElementById('ridesTableBody') ||
                document.querySelector('.booking-table tbody');
  if (!tbody) {
    console.warn('No se encontró el tbody para la tabla de rides.');
    return;
  }
  tbody.innerHTML = '';

  if (rides.length === 0) {
    tbody.appendChild(rowMsg('No rides saved yet.'));
    return;
  }
  if (filtered.length === 0) {
    tbody.appendChild(rowMsg('No rides found with the selected filters.'));
    return;
  }

  const users = safeParse(localStorage.getItem('users')) || [];

  filtered.forEach(r => {
    const driver = users.find(u => u.email === r.driverEmail) || {};
    const driverName =
      (driver.fname && driver.lname) ? `${driver.fname} ${driver.lname}` :
      driver.fname || driver.email || 'driver';

    const car = [r?.vehicle?.brand, r?.vehicle?.model, r?.vehicle?.year]
      .filter(Boolean).join(' ');

    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td class="user-cell">
        <img src="imagenes/user-icon.png" alt="user"
            style="width:24px; height:24px; border-radius:50%; object-fit:cover; margin-right:6px;" />
        <a href="#" class="driver-link" data-ride-id="${r.id}">
        ${escapeHtml(driverName)}
        </a>
    </td>
    <td>${escapeHtml(r.from)}</td>
    <td>${escapeHtml(r.to)}</td>
    <td>${Number(r.seats ?? 0)}</td>
    <td>${escapeHtml(car)}</td>
    <td>$${Number(r.fee ?? 0)}</td>
    <td><a href="#" class="action-link" data-ride-id="${r.id}">Request</a></td>
    `;
    tbody.appendChild(tr);
  });

  // Click en nombre del driver actualiza el mapa
  tbody.querySelectorAll('a.driver-link[data-ride-id]').forEach(a => {
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = a.getAttribute('data-ride-id');
      const rides = safeParse(localStorage.getItem('rides')) || [];
      const ride = rides.find(rr => String(rr.id) === String(id));
      if (ride) await showRideOnMap(ride);
    });
  });

  // Click en Request abre los detalles
  tbody.querySelectorAll('a.action-link[data-ride-id]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('data-ride-id');
      sessionStorage.setItem('currentRideId', id);
      sessionStorage.setItem('rideDetailsOrigin', 'searchrides');
      window.location.href = 'ridedetails.html';
    });
  });
}

// ---------- Helpers ----------
function rowMsg(text) {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = 7;
  td.textContent = text;
  tr.appendChild(td);
  return tr;
}
function safeParse(json) { try { return JSON.parse(json); } catch { return null; } }
function normalize(s) { return String(s || '').toLowerCase().trim(); }
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}
