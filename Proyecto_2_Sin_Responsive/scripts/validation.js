(function () {
  // Este guard aplica solo a myrides.html
  var path = location.pathname.toLowerCase();
  var isMyrides = path.endsWith('/myrides.html') || path.endsWith('myrides.html');
  if (!isMyrides) return;

  try {
    var cu = JSON.parse(sessionStorage.getItem('currentUser'));
    var allowed = cu && cu.type === 'driver';
    if (!allowed) {
      alert('Esta sección es solo para conductores.');
      location.replace('searchrides.html');
    }
  } catch (e) {
    location.replace('index.html');
  }
})();

// Devuelve el usuario actual (o null si no hay)
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('currentUser')) || null;
  } catch {
    return null;
  }
}

// Cierra la sesión
function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'index.html'; // redirige al login
}

// Cierra la sesión
function logoutRegister() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'register.html'; // redirige al register
}
