# 🚗 Aventones

Plataforma web académica que simula un sistema de **carpooling** (compartir viajes) con dos tipos de usuarios: **conductores** y **pasajeros**.  
El proyecto está desarrollado en **HTML, CSS y JavaScript** utilizando `localStorage` y `sessionStorage` como base de datos local.

---

## 📌 Funcionalidades principales

- **Registro e inicio de sesión**  
  - Usuarios normales y conductores.  
  - Se valida correo único.  
  - El usuario en sesión se guarda en `sessionStorage`.

- **Gestión de Rides**  
  - Conductores pueden crear, editar y eliminar viajes.  
  - Los viajes se almacenan en `localStorage.rides`.  
  - Al eliminar un ride se eliminan también sus bookings asociados.

- **Búsqueda de Rides**  
  - Filtrar por origen, destino y días disponibles.  
  - Resultados dinámicos en tabla.  
  - Mapa integrado (Leaflet) para mostrar los lugares del ride seleccionado.

- **Bookings (Reservas)**  
  - Pasajeros pueden solicitar un viaje (`En Espera`).  
  - Conductores pueden aceptar o rechazar solicitudes.  
  - Vista diferenciada según rol (user / driver).

- **Perfil de usuario**  
  - Edición de datos básicos.  
  - Conductores pueden editar también datos de su vehículo (placa, modelo, año, marca).  
  - Configuración de nombre público y bio en `configuration.html`.

- **Validaciones**  
  - Protección de páginas según tipo de usuario (drivers tienen acceso a todo, usuarios normales tienen acceso limitado).  
  - Manejo de logout global.  
  - Detección de dispositivo móvil para cambiar los menús de hover a click.

---

## ⚙️ Tecnologías usadas

- **Frontend:** HTML5, CSS3, JavaScript ES6  
- **Base de datos:** `localStorage` / `sessionStorage`  
- **Mapas:** [Leaflet.js](https://leafletjs.com/)  

---

## 🚀 Cómo probar

1. Clona este repositorio o descarga los archivos.  
2. Abre `index.html` en tu navegador.  
3. Registra un usuario o conductor.  
4. Inicia sesión para acceder al resto de páginas.  
5. Explora las funcionalidades (crear rides, buscarlos, reservar, editar perfil, etc.).

---

### Proyecto académico de la carrera de **Ingeniería en Software (UTN)**.  
