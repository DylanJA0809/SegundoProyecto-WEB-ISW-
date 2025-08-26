document.addEventListener('DOMContentLoaded', () => {
  const cu = safeParse(sessionStorage.getItem('currentUser'));
  if (!cu) return;

  const users = safeParse(localStorage.getItem('users')) || [];
  const driver = users.find(u => u.email === cu.email && u.type === 'driver');
  if (!driver) return;

  const brandSelect = document.getElementById('brandSelect');
  const modelInput  = document.getElementById('modelInput');
  const yearSelect  = document.getElementById('yearSelect');

  if (brandSelect) setSelectValue(brandSelect, driver.brand);
  if (modelInput)  modelInput.value = (driver.model ?? '').trim();
  if (yearSelect)  setSelectValue(yearSelect, driver.year);
});

function setSelectValue(selectEl, value) {
  const val = String(value ?? '').trim();
  if (!val) return;

  // intenta seleccionar si ya existe
  const found = Array.from(selectEl.options).find(opt =>
    String(opt.value).trim() === val || String(opt.text).trim() === val
  );
  if (found) {
    selectEl.value = found.value;
    return;
  }
  // si no existe, la crea y la selecciona
  const opt = document.createElement('option');
  opt.value = val;
  opt.textContent = val;
  selectEl.appendChild(opt);
  selectEl.value = val;
}

function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.querySelector('.ride-form .create-btn');
  if (!createBtn) return;

  createBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const cu = safeParse(sessionStorage.getItem('currentUser'));

    const form = document.querySelector('.ride-form');
    if (!form) return;

    // Campos: From / To
    const departure = (form.querySelector('.row .input-group:nth-of-type(1) input')?.value || '').trim();
    const arriveTo  = (form.querySelector('.row .input-group:nth-of-type(2) input')?.value || '').trim();

    // Días
    const days = Array.from(form.querySelectorAll('.row.days .checkbox-group input[type="checkbox"]'))
      .filter(inp => inp.checked)
      .map(inp => (inp.parentElement.textContent || '').trim());

    // Time / Seats / Fee
    const time  = (form.querySelector('.time-seats-fee .input-group:nth-of-type(1) select')?.value || '').trim();
    const seats = Number(form.querySelector('.time-seats-fee .input-group:nth-of-type(2) input[type="number"]')?.value ?? 0);
    const fee   = Number(form.querySelector('.time-seats-fee .input-group:nth-of-type(3) input[type="number"]')?.value ?? 0);

    // Vehicle
    const brand = (document.getElementById('brandSelect')?.value || '').trim();
    const model = (document.getElementById('modelInput')?.value || '').trim();
    const year  = String(document.getElementById('yearSelect')?.value || '').trim();

    // Validaciones
    if (!departure || !arriveTo) {
      alert('Completa los campos "Departure from" y "Arrive To".');
      return;
    }
    if (!time) {
      alert('Selecciona una hora.');
      return;
    }

    // Obtener rides existentes
    const rides = safeParse(localStorage.getItem('rides')) || [];

    // Calcular nuevo id
    let newId = 1;
    if (rides.length > 0) {
      // tomar el máximo id actual y suma 1
      const ids = rides.map(r => parseInt(r.id, 10)).filter(n => !isNaN(n));
      newId = Math.max(...ids) + 1;
    }

    // Crear el ride
    const ride = {
      id: newId,
      createdAt: new Date().toISOString(),
      driverEmail: cu.email,
      from: departure,
      to: arriveTo,
      days,
      time,
      seats,
      fee,
      vehicle: { brand, model, year }
    };

    // Guardar
    rides.push(ride);
    localStorage.setItem('rides', JSON.stringify(rides));

    // Limpiar el formulario
    form.reset();
    form.querySelector('.time-seats-fee .input-group:nth-of-type(2) input[type="number"]').value = 2; // seats
    form.querySelector('.time-seats-fee .input-group:nth-of-type(3) input[type="number"]').value = 15; // fee
    form.querySelectorAll('.row.days .checkbox-group input[type="checkbox"]').forEach(inp => inp.checked = true);
  });
});

function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}
