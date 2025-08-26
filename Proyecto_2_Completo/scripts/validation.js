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

// Detectar si es móvil
function isMobileDevice() {
  return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(
    navigator.userAgent
  );
}

document.addEventListener('DOMContentLoaded', () => {
  if (isMobileDevice()) {
    console.log("Modo móvil detectado → cambiando dropdown a click");

    document.querySelectorAll('.user-icon').forEach(icon => {
      const dropdown = icon.querySelector('.dropdown');
      if (!dropdown) return;

      // Ocultar por defecto
      dropdown.style.display = 'none';

      // Al hacer click en el icono alternar visibilidad
      icon.addEventListener('click', (e) => {
        e.stopPropagation(); // evitar burbujas
        const visible = dropdown.style.display === 'block';
        // cerrar todos antes
        document.querySelectorAll('.user-icon .dropdown')
          .forEach(d => d.style.display = 'none');
        dropdown.style.display = visible ? 'none' : 'block';
      });
    });

    // Cerrar si se toca fuera
    document.addEventListener('click', () => {
      document.querySelectorAll('.user-icon .dropdown')
        .forEach(d => d.style.display = 'none');
    });
  } else {
    console.log("Modo desktop detectado → se queda hover en CSS");
    // No hace nada, funciona con :hover
  }
});
