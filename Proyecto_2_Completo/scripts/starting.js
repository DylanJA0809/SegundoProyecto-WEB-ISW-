document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registration_form');
  if (!form) return;

  // Detectar si es la pagina de registrar conductores o usuarios
  const isDriverPage = window.location.pathname.includes('registerdriver');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (isDriverPage) {
      guardarDrivers();
    } else {
      guardarUsuarios();
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      loginUser();
    });
  }
});


// Registro para usuarios normales
function guardarUsuarios() {
  const user = {
    fname: document.getElementById('fname').value.trim(),
    lname: document.getElementById('lname').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    password2: document.getElementById('repeatPassword').value,
    address: document.getElementById('address').value.trim(),
    country: document.getElementById('country').value,
    state: document.getElementById('state').value.trim(),
    city: document.getElementById('city').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    type: 'user'
  };

  if (user.password !== user.password2) {
    alert('Passwords do not match.');
    return;
  }

  // Eliminar password2 antes de guardar
  delete user.password2;

  let users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.some(u => u.email === user.email)) {
    alert("Email already registered.");
    return;
  }

  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  //alert('User registered successfully!');
  window.location.href = 'index.html';
}

// Registro para conductores
function guardarDrivers() {
  const driver = {
    fname: document.getElementById('fname').value.trim(),
    lname: document.getElementById('lname').value.trim(),
    idNumber: document.getElementById('idNumber').value.trim(),
    birthdate: document.getElementById('birthdate').value,
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    password: document.getElementById('password').value,
    password2: document.getElementById('repeatPassword').value,
    brand: document.getElementById('brand').value.trim(),
    model: document.getElementById('model').value.trim(),
    year: document.getElementById('year').value.trim(),
    plate: document.getElementById('plate').value.trim(),
    type: 'driver'
  };

  if (driver.password !== driver.password2) {
    alert('Passwords do not match.');
    return;
  }

  // Eliminar password2 antes de guardar
  delete driver.password2;

  let users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.some(u => u.email === driver.email)) {
    alert("Email already registered.");
    return;
  }

  users.push(driver);
  localStorage.setItem('users', JSON.stringify(users));
  //alert('Driver registered successfully!');
  window.location.href = 'index.html';
}

// Función para iniciar sesión
function loginUser() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Guarda solo lo necesario en la sesión actual
    const currentUser = {
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      type: user.type // 'user' o 'driver'
    };
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    //alert(`Welcome, ${user.name || user.fname}!`);

    // Redirección por tipo de usuario
    if (user.type === 'driver') {
      window.location.href = 'newride.html';
    } else {
      window.location.href = 'searchrides.html';
    }
  } else {
    alert('Invalid email or password. Please try again.');
  }
}
