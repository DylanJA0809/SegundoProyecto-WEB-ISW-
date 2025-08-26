
document.addEventListener('DOMContentLoaded', () => {
  const rideId = sessionStorage.getItem('currentRideId')
              ?? new URLSearchParams(location.search).get('id');

  if (!rideId) return renderError('No ride selected.');

  const rides = safeParse(localStorage.getItem('rides')) || [];
  const rideIndex = rides.findIndex(r => String(r.id) === String(rideId));
  if (rideIndex === -1) return renderError('Ride not found.');
  const ride = rides[rideIndex];

  // Solo el conductor puede editar
  const cu = safeParse(sessionStorage.getItem('currentUser'));
  const isOwner = cu && cu.email &&
    String(cu.email).toLowerCase() === String(ride.driverEmail || '').toLowerCase();
  if (!isOwner) {
    alert('Solo el conductor creador puede editar este ride.');
    window.location.href = 'myrides.html';
    return;
  }

  // Referencias a campos
  const $from = document.querySelector('.ride-form > .row:first-of-type .input-group:nth-child(1) input');
  const $to   = document.querySelector('.ride-form > .row:first-of-type .input-group:nth-child(2) input');

  const $daysGroup = document.querySelector('.ride-form .row.days .checkbox-group');

  const $time  = document.querySelector('.ride-form .time-seats-fee .input-group:nth-child(1) select');
  const $seats = document.querySelector('.ride-form .time-seats-fee .input-group:nth-child(2) input[type="number"]');
  const $fee   = document.querySelector('.ride-form .time-seats-fee .input-group:nth-child(3) input[type="number"]');

  const $brand = document.querySelector('.vehicle-section .row .input-group:nth-child(1) select');
  const $model = document.querySelector('.vehicle-section .row .input-group:nth-child(2) input[type="text"]');
  const $year  = document.querySelector('.vehicle-section .row .input-group:nth-child(3) select');

  // Prefil
  if ($from)  $from.value  = ride.from || '';
  if ($to)    $to.value    = ride.to   || '';

  // Días: marcar solo los del ride
  if ($daysGroup) {
    const wanted = (ride.days || []).map(normalize);
    $daysGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      // Si no hay value en el HTML, se usa el texto del label
      const val = (cb.getAttribute('value') || cb.parentElement.textContent || '').trim();
      cb.checked = wanted.includes(normalize(val));
    });
  }

  if ($time)  setSelectValue($time, ride.time || '');
  if ($seats) $seats.value = Number(ride.seats ?? 0);
  if ($fee)   $fee.value   = (ride.fee ?? '') === '' ? '' : Number(ride.fee);

  if ($brand) setSelectValue($brand, ride?.vehicle?.brand || '');
  if ($model) $model.value = ride?.vehicle?.model || '';
  if ($year)  setSelectValue($year,  ride?.vehicle?.year  || '');

  // Botón Save
  const saveBtn = document.querySelector('.form-actions .create-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const updated = readFormToRide(ride); // construye objeto actualizado
      rides[rideIndex] = updated;
      localStorage.setItem('rides', JSON.stringify(rides));

      // Mantener selección y origen
      sessionStorage.setItem('currentRideId', String(updated.id));
      sessionStorage.setItem('rideDetailsOrigin', 'myrides');
      window.location.href = 'myrides.html';
    });
  }

});

// ---------------- Helpers ----------------

function readFormToRide(originalRide) {
  const $from = document.querySelector('.ride-form > .row:first-of-type .input-group:nth-child(1) input');
  const $to   = document.querySelector('.ride-form > .row:first-of-type .input-group:nth-child(2) input');

  const $daysGroup = document.querySelector('.ride-form .row.days .checkbox-group');

  const $time  = document.querySelector('.ride-form .time-seats-fee .input-group:nth-child(1) select');
  const $seats = document.querySelector('.ride-form .time-seats-fee .input-group:nth-child(2) input[type="number"]');
  const $fee   = document.querySelector('.ride-form .time-seats-fee .input-group:nth-child(3) input[type="number"]');

  const $brand = document.querySelector('.vehicle-section .row .input-group:nth-child(1) select');
  const $model = document.querySelector('.vehicle-section .row .input-group:nth-child(2) input[type="text"]');
  const $year  = document.querySelector('.vehicle-section .row .input-group:nth-child(3) select');

  // Recolectar días chequeados
  const days = $daysGroup ? Array.from(
    $daysGroup.querySelectorAll('input[type="checkbox"]:checked')
  ).map(cb => {
    const raw = (cb.getAttribute('value') || '').trim();
    return raw || (cb.parentElement?.textContent || '').trim();
  }) : (originalRide.days || []);

  // Sanitizar
  const from = ($from?.value || '').trim();
  const to   = ($to?.value   || '').trim();
  const time = ($time?.value || '').trim();

  const seats = $seats ? Math.max(0, parseInt($seats.value, 10) || 0) : (originalRide.seats || 0);
  const fee   = $fee ? Number($fee.value) : originalRide.fee;

  const brand = ($brand?.value || '').trim();
  const model = ($model?.value || '').trim();
  const year  = ($year?.value  || '').trim();

  return {
    ...originalRide, // preserva id, driverEmail, etc.
    from,
    to,
    days,
    time,
    seats,
    fee,
    vehicle: {
      brand,
      model,
      year
    }
  };
}

function setSelectValue(selectEl, value) {
  if (!selectEl) return;
  const v = String(value ?? '').trim();
  // Si la opción no existe, se agrega (para no perder datos)
  const has = Array.from(selectEl.options).some(o => String(o.value).trim() === v || o.textContent.trim() === v);
  if (!has && v) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  }
  selectEl.value = v;
}

function renderError(msg) {
  const main = document.querySelector('main') || document.body;
  main.innerHTML = `<p style="color:#b00;font-weight:600">${escapeHtml(msg)}</p>`;
}

function safeParse(json) { try { return JSON.parse(json); } catch { return null; } }
function normalize(s) { return String(s || '').toLowerCase().trim(); }
function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}
