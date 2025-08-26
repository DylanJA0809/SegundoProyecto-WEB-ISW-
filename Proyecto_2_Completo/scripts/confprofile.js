
document.addEventListener('DOMContentLoaded', () => {
  const cu = safeParse(sessionStorage.getItem('currentUser'));
  if (!cu || !cu.email) {
    alert('Debes iniciar sesión.');
    window.location.href = 'index.html';
    return;
  }

  const users = safeParse(localStorage.getItem('users')) || [];
  const idx = users.findIndex(u => eqCI(u?.email, cu.email));
  if (idx === -1) {
    alert('No se encontró tu usuario en la base local.');
    return;
  }
  const user = users[idx];

  const form = document.querySelector('.edit-form');
  if (!form) return;

  // Localiza campos por el texto del label
  const nameInput = getInputByLabel(form, 'Public Name');
  const bioArea   = getTextareaByLabel(form, 'Public Bio');

  // Prefil
  const fallbackName = buildFallbackName(user);
  if (nameInput) nameInput.value = (user.publicName || fallbackName || '').trim();
  if (bioArea)   bioArea.value   = (user.bio || '');

  // Cancel
  const cancel = form.querySelector('.cancel-link');
  cancel?.addEventListener('click', (e) => {
    e.preventDefault();
    history.back();
  });

  // Guardar
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newName = (nameInput?.value || '').trim();
    const newBio  = (bioArea?.value || '').trim();

    // Actualizar/crear
    users[idx] = {
      ...user,
      publicName: newName,
      bio: newBio 
    };

    localStorage.setItem('users', JSON.stringify(users));

    // Mantiene el currentUser y le agrego publicName para fácil acceso
    const newSession = { ...cu, publicName: newName };
    sessionStorage.setItem('currentUser', JSON.stringify(newSession));

    //alert('Configuración guardada.');
  });
});

/* ----------------- Helpers ----------------- */
function buildFallbackName(u = {}) {
  const firstLast = [u.fname, u.lname].filter(Boolean).join(' ').trim();
  if (firstLast) return firstLast;
  const email = String(u.email || '').trim();
  if (!email) return '';
  // parte antes de @
  return email.split('@')[0];
}

function getInputByLabel(form, labelText) {
  const group = findGroupByLabel(form, labelText);
  return group?.querySelector('input') || null;
}
function getTextareaByLabel(form, labelText) {
  const group = findGroupByLabel(form, labelText);
  return group?.querySelector('textarea') || null;
}
function findGroupByLabel(form, labelText) {
  const want = norm(labelText);
  const groups = form.querySelectorAll('.input-group');
  for (const g of groups) {
    const lb = g.querySelector('label');
    if (lb && norm(lb.textContent) === want) return g;
  }
  return null;
}
function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function eqCI(a, b) { return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase(); }
function safeParse(json) { try { return JSON.parse(json); } catch { return null; } }
