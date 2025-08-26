
document.addEventListener('DOMContentLoaded', () => {
  // Origen de navegación
  const origin = sessionStorage.getItem('rideDetailsOrigin') || 'searchrides';

  const rideId = sessionStorage.getItem('currentRideId')
              ?? new URLSearchParams(location.search).get('id');

  if (!rideId) return renderError('No ride selected.');

  const rides  = safeParse(localStorage.getItem('rides')) || [];
  const users  = safeParse(localStorage.getItem('users')) || [];
  const ride   = rides.find(r => String(r.id) === String(rideId));

  if (!ride) return renderError('Ride not found.');

  const driver = users.find(u => u.email === ride.driverEmail) || {};
  const driverName = (driver.fname && driver.lname)
    ? `${driver.fname} ${driver.lname}`
    : (driver.fname || driver.email || 'Driver');

  // --- Rellenar UI ---
  setText('#driverName', driverName);
  setText('#depFrom', ride.from || '');
  setText('#arrTo', ride.to || '');

  setDays('#daysGroup', ride.days || []);

  setText('#rideTime', ride.time || '');
  setText('#rideSeats', Number(ride.seats ?? 0));
  setText('#rideFee', ride.fee != null ? `$${Number(ride.fee)}` : '—');

  setText('#carMake',  ride?.vehicle?.brand || '');
  setText('#carModel', ride?.vehicle?.model || '');
  setText('#carYear',  ride?.vehicle?.year  || '');

  // --- Mostrar / ocultar botón Request según origen y usuario ---
  const requestBtn = document.querySelector('.ride-form .create-btn');
  if (requestBtn) {
    const cu = safeParse(sessionStorage.getItem('currentUser'));

    const cameFromList = (origin === 'bookings' || origin === 'myrides');
    const isDriverOfRide = !!(cu && cu.email && String(cu.email).toLowerCase() === String(ride.driverEmail || '').toLowerCase());

    // Ocultar si viene de bookings/myrides o si es el conductor
    const mustHide = cameFromList || isDriverOfRide;
    requestBtn.style.display = mustHide ? 'none' : 'inline-block';
  }

  // --- Click en Request crear booking ---
  const form = document.querySelector('.ride-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      createBooking(ride);
    });
  }

});

// Crear booking
function createBooking(ride) {
  const cu = safeParse(sessionStorage.getItem('currentUser'));
  if (!cu || !cu.email) {
    alert('Debes iniciar sesión para solicitar este ride.');
    window.location.href = 'index.html';
    return;
  }

  // no dejar que el conductor se auto-reserve
  if (String(cu.email).trim().toLowerCase() === String(ride.driverEmail || '').trim().toLowerCase()) {
    alert('No puedes solicitar tu propio ride.');
    return;
  }

  const bookings = safeParse(localStorage.getItem('bookings')) || [];

  // evitar duplicado "En Espera" para este ride por este usuario
  const already = bookings.find(b =>
    String(b.rideId) === String(ride.id) &&
    String(b.userEmail).toLowerCase() === String(cu.email).toLowerCase() &&
    String(b.status).toLowerCase() === 'en espera'
  );
  if (already) {
    alert('Ya tienes una solicitud en espera para este ride.');
    return;
  }

  // id incremental
  let newId = 1;
  if (bookings.length > 0) {
    const ids = bookings.map(b => parseInt(b.id, 10)).filter(n => !isNaN(n));
    if (ids.length) newId = Math.max(...ids) + 1;
  }

  const booking = {
    id: newId,
    rideId: ride.id,
    driverEmail: ride.driverEmail,
    userEmail: cu.email,
    status: 'En Espera',
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  localStorage.setItem('bookings', JSON.stringify(bookings));

  alert('¡Solicitud enviada! Estado: En Espera.');
  window.location.href = 'bookings.html';
}

// Helpers UI / datos
function setText(sel, val) {
  const el = document.querySelector(sel);
  if (el) el.textContent = String(val ?? '');
}

function setDays(groupSelector, daysArr) {
  const group = document.querySelector(groupSelector);
  if (!group) return;

  const wanted = (daysArr || []).map(normalize);
  group.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const val = (cb.value || cb.parentElement.textContent || '').trim();
    cb.checked = wanted.includes(normalize(val));
  });
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
