
function byId(id){ return document.getElementById(id); }
const eqCI = (a,b)=> String(a||'').trim().toLowerCase() === String(b||'').trim().toLowerCase();

document.addEventListener('DOMContentLoaded', () => {
  // 1) Tomar email del currentUser en sesión
  const cu = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  if (!cu || !cu.email) {
    alert('Debes iniciar sesión.');
    location.href = 'index.html';
    return;
  }

  // 2) Buscar el registro real en users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const idx = users.findIndex(u => eqCI(u.email, cu.email));
  if (idx === -1) {
    alert('Tu usuario no existe en la base local.');
    return;
  }
  const user = users[idx];

  // 3) Mostrar campos extra si es driver
    if (String(user.type).toLowerCase() === 'driver') {
    document.querySelectorAll('.driver-fields').forEach(div => {
        div.style.display = 'flex';
    });
    }


  // 4) Prefil comunes
  setVal('profile-fname',  user.fname || '');
  setVal('profile-lname',  user.lname || '');
  setVal('profile-email',  user.email || '');
  setVal('profile-address',user.address || '');
  setVal('profile-state',  user.state || '');
  setVal('profile-city',   user.city || '');
  setVal('profile-phone',  user.phone || '');
  setSelect('profile-country', user.country || 'Costa Rica');

  // 5) Prefil driver-only
  if (String(user.type).toLowerCase() === 'driver') {
    setVal('profile-plate', user.plate || '');
    setVal('profile-year',  user.year  || '');
    setVal('profile-model', user.model || '');
    setVal('profile-brand', user.brand || '');
  }

  // 6) Passwords siempre vacías
  setVal('profile-pass',  '');
  setVal('profile-pass2', '');

  // 7) Guardar
  const form = document.querySelector('.edit-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const pass1 = getVal('profile-pass');
    const pass2 = getVal('profile-pass2');
    if ((pass1 || pass2) && pass1 !== pass2) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Construir actualizado
    const updated = {
      ...user,
      fname:   getVal('profile-fname'),
      lname:   getVal('profile-lname'),
      email:   getVal('profile-email'),
      address: getVal('profile-address'),
      country: getVal('profile-country') || 'Costa Rica',
      state:   getVal('profile-state'),
      city:    getVal('profile-city'),
      phone:   getVal('profile-phone'),
      password: pass1 ? pass1 : user.password
    };

    if (String(user.type).toLowerCase() === 'driver') {
      updated.plate = getVal('profile-plate');
      updated.year  = getVal('profile-year');
      updated.model = getVal('profile-model');
      updated.brand = getVal('profile-brand');
    }

    // Validar email duplicado si cambió
    const oldEmail = user.email;
    if (!eqCI(updated.email, oldEmail)) {
      const exists = users.some((u, i) => i !== idx && eqCI(u.email, updated.email));
      if (exists) {
        alert('Ese email ya está registrado por otro usuario.');
        return;
      }
    }

    // Persistir en users
    users[idx] = updated;
    localStorage.setItem('users', JSON.stringify(users));

    // Cascada si email cambió
    if (!eqCI(updated.email, oldEmail)) {
      cascadeEmail(oldEmail, updated.email);
    }

    // Actualizar sesión
    const newSessionUser = {
      email: updated.email,
      type: updated.type,
      fname: updated.fname,
      lname: updated.lname
    };
    sessionStorage.setItem('currentUser', JSON.stringify(newSessionUser));

    //alert('Perfil guardado correctamente.');
  });
});

// ---------- Helpers DOM ----------
function setVal(id, v){ const el = byId(id); if (el) el.value = v ?? ''; }
function getVal(id){ const el = byId(id); return (el?.value || '').trim(); }

function setSelect(id, value){
  const sel = byId(id); if (!sel) return;
  const val = String(value ?? '').trim() || 'Costa Rica';
  // agrega opción si no existe
  if (![...sel.options].some(o => eqCI(o.value, val) || eqCI(o.textContent, val))){
    const opt = document.createElement('option');
    opt.value = val; opt.textContent = val;
    sel.appendChild(opt);
  }
  sel.value = val;
}

// ---------- Cascada de email ----------
function cascadeEmail(oldEmail, newEmail){
  const rides = JSON.parse(localStorage.getItem('rides') || '[]');
  let chR = false;
  rides.forEach(r => { if (eqCI(r.driverEmail, oldEmail)) { r.driverEmail = newEmail; chR = true; }});
  if (chR) localStorage.setItem('rides', JSON.stringify(rides));

  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  let chB = false;
  bookings.forEach(b => {
    if (eqCI(b.userEmail, oldEmail))   { b.userEmail = newEmail; chB = true; }
    if (eqCI(b.driverEmail, oldEmail)) { b.driverEmail = newEmail; chB = true; }
  });
  if (chB) localStorage.setItem('bookings', JSON.stringify(bookings));
}
