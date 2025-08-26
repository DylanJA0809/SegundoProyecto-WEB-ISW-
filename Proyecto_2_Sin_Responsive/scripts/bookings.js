
document.addEventListener('DOMContentLoaded', () => {
  renderBookings();
});

function renderBookings() {
  const cu = safeParse(sessionStorage.getItem('currentUser'));
  if (!cu || !cu.email) {
    renderEmpty('Debes iniciar sesión para ver tus bookings.');
    return;
  }
  const isDriver = String(cu.type).toLowerCase() === 'driver';

  // Ajustar encabezados según rol
  const ths = document.querySelectorAll('.booking-table thead th');
  if (ths.length >= 3) {
    ths[0].textContent = isDriver ? 'User' : 'Driver';
    ths[1].textContent = 'Ride';
    ths[2].textContent = isDriver ? 'Accept / Reject' : 'Status';
  }

  const tbody = document.querySelector('.booking-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const bookings = safeParse(localStorage.getItem('bookings')) || [];
  const rides    = safeParse(localStorage.getItem('rides'))    || [];
  const users    = safeParse(localStorage.getItem('users'))    || [];

  // Filtrar bookings según rol
  const myRows = bookings.filter(b =>
    isDriver
      ? String(b.driverEmail).toLowerCase() === String(cu.email).toLowerCase()
      : String(b.userEmail).toLowerCase()   === String(cu.email).toLowerCase()
  );

  if (myRows.length === 0) {
    renderEmpty('No hay reservas para mostrar.', tbody, 3);
    return;
  }

  myRows.forEach(b => {
    const ride   = rides.find(r => String(r.id) === String(b.rideId)) || {};
    const rider  = users.find(u => u.email === b.userEmail)  || {}; // quien solicita
    const driver = users.find(u => u.email === b.driverEmail) || {}; // conductor

    const userName = (u) =>
      (u.fname && u.lname) ? `${u.fname} ${u.lname}` : (u.fname || u.email || '—');

    const leftName = isDriver ? userName(rider) : userName(driver);
    const rideText = `${ride.from || ''} - ${ride.to || ''}`;

    const tr = document.createElement('tr');

    // Columna 1: avatar + nombre (User o Driver)
    const tdWho = document.createElement('td');
    tdWho.className = 'user-cell';
    tdWho.innerHTML = `
      <img src="imagenes/user-icon.png" alt="User" class="profile-pic" style="width:32px;height:32px;border-radius:50%;object-fit:cover;margin-right:6px;vertical-align:middle;"/>
      <span>${escapeHtml(leftName)}</span>
    `;

    // Columna 2: Ride (clic para ver detalles)
    const tdRide = document.createElement('td');
    const rideLink = document.createElement('a');
    rideLink.href = '#';
    rideLink.textContent = rideText;
    rideLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (!ride.id) return;
      sessionStorage.setItem('currentRideId', ride.id);
      sessionStorage.setItem('rideDetailsOrigin', 'bookings');
      window.location.href = 'ridedetails.html';
    });
    tdRide.appendChild(rideLink);

    // Columna 3: Acciones o Status
    const tdAct = document.createElement('td');

    if (isDriver) {
      // Driver: Accept / Reject
      const accept = document.createElement('a');
      accept.href = '#';
      accept.className = 'action-link';
      accept.textContent = 'Accept';

      const sep = document.createTextNode(' | ');

      const reject = document.createElement('a');
      reject.href = '#';
      reject.className = 'action-link';
      reject.textContent = 'Reject';

      accept.addEventListener('click', (e) => {
        e.preventDefault();
        updateBookingStatus(b, 'Aceptado');
      });
      reject.addEventListener('click', (e) => {
        e.preventDefault();
        updateBookingStatus(b, 'Rechazado');
      });

      tdAct.appendChild(accept);
      tdAct.appendChild(sep);
      tdAct.appendChild(reject);
    } else {
      // User normal: solo Status
      tdAct.textContent = formatStatus(b.status || 'En Espera');
    }

    tr.appendChild(tdWho);
    tr.appendChild(tdRide);
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
}

function updateBookingStatus(booking, newStatus) {
  const bookings = safeParse(localStorage.getItem('bookings')) || [];
  const idx = bookings.findIndex(b => String(b.id) === String(booking.id));
  if (idx === -1) return;

  bookings[idx].status = newStatus;
  bookings[idx].updatedAt = new Date().toISOString();
  localStorage.setItem('bookings', JSON.stringify(bookings));

  renderBookings(); // re-pintar
}

function formatStatus(s) {
  const v = String(s || '').toLowerCase();
  if (v.includes('acept')) return 'Aceptado';
  if (v.includes('rechaz')) return 'Rechazado';
  return 'En Espera';
}

function renderEmpty(text, tbody, colspan = 1) {
  if (tbody) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = colspan;
    td.textContent = text;
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    const main = document.querySelector('main') || document.body;
    const p = document.createElement('p');
    p.textContent = text;
    main.appendChild(p);
  }
}

function safeParse(json) { try { return JSON.parse(json); } catch { return null; } }
function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}
