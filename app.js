const selector = document.getElementById('selectorCiudad');
const boton = document.getElementById('btnConsultar');
const resultado = document.getElementById('resultado');
const mensajeError = document.getElementById('mensajeError');

const CIUDADES = {
  lima:     { lat: -12.04, lon: -77.03, nombre: 'Lima' },
  cusco:    { lat: -13.53, lon: -71.97, nombre: 'Cusco' },
  arequipa: { lat: -16.41, lon: -71.54, nombre: 'Arequipa' },
  trujillo: { lat: -8.11, lon: -79.03, nombre: 'Trujillo' },
  piura:    { lat: -5.19, lon: -80.63, nombre: 'Piura' },
  iquitos:  { lat: -3.75, lon: -73.25, nombre: 'Iquitos' },
  puno:     { lat: -15.84, lon: -70.02, nombre: 'Puno' },
  huancayo: { lat: -12.07, lon: -75.21, nombre: 'Huancayo' }
};

const URL_BASE = 'https://api.open-meteo.com/v1/forecast';

async function consultarClima() {
  const clave = selector.value;
  const ciudad = CIUDADES[clave];

  if (!ciudad) {
    mostrarError('Selecciona una ciudad antes de consultar el clima.');
    return;
  }

  ocultarError();
  boton.disabled = true;
  boton.textContent = 'Consultando...';
  resultado.innerHTML = '<div class="estado-carga" role="status">Obteniendo datos meteorológicos...</div>';

  try {
    const parametros = new URLSearchParams({
      latitude: ciudad.lat,
      longitude: ciudad.lon,
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
      timezone: 'America/Lima'
    });

    const response = await fetch(`${URL_BASE}?${parametros}`);
    if (!response.ok) {
      throw new Error(`La API respondió con el estado ${response.status}.`);
    }

    const data = await response.json();

    if (!data.current) {
      throw new Error('La respuesta no contiene los datos meteorológicos actuales.');
    }

    renderizarClima(data, ciudad.nombre);
  } catch (error) {
    console.error('Error al consultar el clima:', error);
    resultado.innerHTML = '';
    mostrarError('No se pudo consultar el clima. Revisa tu conexión e inténtalo nuevamente.');
  } finally {
    boton.disabled = false;
    boton.textContent = 'Ver clima';
  }
}

function renderizarClima(data, nombreCiudad) {
  
  const temperatura = data.current.temperature_2m;
  const humedad = data.current.relative_humidity_2m;
  const viento = data.current.wind_speed_10m;
  const altitud = Number.isFinite(data.elevation) ? data.elevation.toFixed(0) : 'No disponible';
  const hora = data.current.time ? data.current.time.slice(11, 16) : 'No disponible';

  const html = `
    <article class="tarjeta-clima">
      <h2>${nombreCiudad}</h2>
      <p class="altitud">Altitud: ${altitud} m s. n. m.</p>
      <p class="temperatura">${temperatura} °C</p>
      <div class="detalles">
        <div class="detalle-item">
          <span class="etiqueta-dato">Humedad</span>
          <span class="valor">${humedad} %</span>
        </div>
        <div class="detalle-item">
          <span class="etiqueta-dato">Viento</span>
          <span class="valor">${viento} km/h</span>
        </div>
        <div class="detalle-item">
          <span class="etiqueta-dato">Actualizado</span>
          <span class="valor">${hora}</span>
        </div>
      </div>
    </article>
  `;

  resultado.innerHTML = html;
}

function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.style.display = 'block';
}

function ocultarError() {
  mensajeError.textContent = '';
  mensajeError.style.display = 'none';
}

boton.addEventListener('click', consultarClima);
selector.addEventListener('change', ocultarError);
