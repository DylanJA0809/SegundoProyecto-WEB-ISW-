
document.addEventListener('DOMContentLoaded', () => {
  renderMyRides();
});

function renderMyRides() {
  const cu = safeParse(sessionStorage.getItem('currentUser'));
  if (!cu || !cu.email) {
    showEmpty('Debes iniciar sesión como conductor para ver tus rides.');
    return;
  }

  const rides = safeParse(localStorage.getItem('rides')) || [];

  // Rides del conductor actual
  const mine = rides.filter(r =>
    String(r.driverEmail || '').toLowerCase() === String(cu.email).toLowerCase()
  );

  const tbody = document.querySelector('.table-container table tbody');
  if (!tbody) {
    console.warn('No se encontró el tbody de la tabla en My Rides.');
    return;
  }
  tbody.innerHTML = '';

  if (mine.length === 0) {
    tbody.appendChild(rowMsg('No has creado rides todavía.'));
    return;
  }

  mine.forEach(r => {
    const car = [r?.vehicle?.brand, r?.vehicle?.model, r?.vehicle?.year]
      .filter(Boolean).join(' ') || '—';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="#" class="view-ride" data-ride-id="${r.id}">${escapeHtml(r.from)}</a></td>
      <td>${escapeHtml(r.to)}</td>
      <td>${Number(r.seats ?? 0)}</td>
      <td>${escapeHtml(car)}</td>
      <td>${r.fee != null ? `$${Number(r.fee)}` : '—'}</td>
      <td>
        <a href="#" class="edit-ride" data-ride-id="${r.id}">Edit</a> |
        <a href="#" class="delete-ride" data-ride-id="${r.id}">Delete</a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // abre ridedetails sin botón Request
  tbody.querySelectorAll('a.view-ride[data-ride-id]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('data-ride-id');
      sessionStorage.setItem('currentRideId', id);
      sessionStorage.setItem('rideDetailsOrigin', 'myrides');
      window.location.href = 'ridedetails.html';
    });
  });

  // Editar
  tbody.querySelectorAll('a.edit-ride[data-ride-id]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('data-ride-id');
      sessionStorage.setItem('currentRideId', id);
      sessionStorage.setItem('rideDetailsOrigin', 'myrides');
      window.location.href = 'editride.html';
    });
  });

  // Eliminar (también borra bookings asociados)
  tbody.querySelectorAll('a.delete-ride[data-ride-id]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('data-ride-id');
      confirmAndDeleteRide(id);
    });
  });
}

function confirmAndDeleteRide(rideId) {
  if (!rideId) return;
  if (!confirm('¿Eliminar este ride? También se eliminarán las reservas asociadas.')) {
    return;
  }

  const rides = safeParse(localStorage.getItem('rides')) || [];
  const newRides = rides.filter(r => String(r.id) !== String(rideId));
  localStorage.setItem('rides', JSON.stringify(newRides));

  // eliminar bookings asociados a este ride
  const bookings = safeParse(localStorage.getItem('bookings')) || [];
  const newBookings = bookings.filter(b => String(b.rideId) !== String(rideId));
  localStorage.setItem('bookings', JSON.stringify(newBookings));

  alert('Ride eliminado correctamente.');
  renderMyRides();
}

// ---- helpers ----
function rowMsg(text) {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = 6;
  td.textContent = text;
  tr.appendChild(td);
  return tr;
}
function safeParse(json) { try { return JSON.parse(json); } catch { return null; } }
function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}
