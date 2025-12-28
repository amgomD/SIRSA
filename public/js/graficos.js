const tiposGraficos = ["bar", "line", "pie", "doughnut", "polarArea"];

async function cargarGraficos(id) {
  try {
    const res = await fetch('/api/graficos/respuestas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id })
    });
    const data = await res.json();

    if (!data.success) throw new Error('Error al obtener datos');
    renderGraficos(data.data);
  } catch (err) {
    console.error('Error cargando gráficos:', err);
  }
}

function renderGraficos(preguntas) {
  const container = document.getElementById('charts-container');
  container.innerHTML = '';

  Object.entries(preguntas).forEach(([pregunta, respuestas]) => {
    const card = document.createElement('div');
    card.className = 'chart-card';

    const header = document.createElement('div');
    header.className = 'chart-header';

    const title = document.createElement('h4');
    title.textContent = pregunta.trim();

    const select = document.createElement('select');
    select.className = 'chart-type';
    select.innerHTML = `
      <option value="doughnut">Dona</option>
      <option value="pie">Pie</option>
      <option value="bar">Barras</option>
      <option value="line">Línea</option>

      <option value="polarArea">Área polar</option>
    `;

    header.appendChild(title);
    header.appendChild(select);
    card.appendChild(header);

    const canvas = document.createElement('canvas');
    card.appendChild(canvas);
    container.appendChild(card);

    const labels = respuestas.map(r => r.respuesta);
    const totals = respuestas.map(r => r.total);
    const colors = labels.map(() => randomColor());

    // 🔹 Asignar tipo aleatorio al cargar
    const tipoAleatorio = tiposGraficos[Math.floor(Math.random() * tiposGraficos.length)];
    select.value = tipoAleatorio;

    let chart = crearGrafico(canvas, tipoAleatorio, labels, totals, colors);

    select.addEventListener('change', e => {
      chart.destroy();
      chart = crearGrafico(canvas, e.target.value, labels, totals, colors);
    });
  });
}

// Generar colores aleatorios
function randomColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

document.addEventListener('DOMContentLoaded', cargarCategorias());

function crearGrafico(canvas, tipo, labels, totals, colors) {
  const esLine = tipo === 'line';
  const esBar = tipo === 'bar';

  return new Chart(canvas, {
    type: tipo,
    data: {
      labels,
      datasets: [{
        label: '',
        data: totals,
        backgroundColor: esLine ? 'rgba(0,123,255,0.3)' : colors,
        borderColor: esLine ? 'rgba(0,123,255,1)' : colors,
        borderWidth: 2,
        fill: false,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: (esLine || esBar) ? {
        x: {
          beginAtZero: true,
          ticks: { color: '#555' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#555' },
        },
      } : {},
    }
  });
}



// Función para cargar y mostrar las categorías
async function cargarCategorias() {
  const container = document.getElementById("tabs");


  try {
    const response = await fetch(
      "/api/Categoria/wsListarCategoriastab"
    );
    const data = await response.json();

    if (data.success) {
      mostrarCategorias(data.categorias);

      const tabs = document.querySelectorAll(".tab");
      const saveBtns = document.querySelectorAll(
        ".save-btn, .left-panel .blue"
      );

      const leftPanel = document.getElementById("left-panel");

      tabs.forEach((tab) => {
        tab.addEventListener("click", async (event) => {
          // Remover clase active de todos los tabs
          tabs.forEach((x) => x.classList.remove("active"));
        
          tab.classList.add("active");
          const id = tab.dataset.id;
         cargarGraficos(id)
        });
      });

 



    } else {
      mostrarError("Error al cargar categorías: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarError("Error de conexión al servidor");
  }
}

// Función para mostrar las categorías en tarjetas
function mostrarCategorias(categorias) {
  const container = document.getElementById("tabs");

  if (categorias.length === 0) {
    container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #718096;">
                <div style="font-size: 18px; margin-bottom: 10px;">No hay categorías disponibles</div>
                <div style="font-size: 14px;">Crea tu primera categoría</div>
            </div>
        `;
    return;
  }

  let html = "";
  let bandera = 0;
  categorias.forEach((categoria) => {
    if(bandera === 0){
cargarGraficos(categoria.id)
    html += `<button  data-id="${categoria.id}"  class="tab active">${categoria.titulo}</button>`;
    }else{
    html += `<button  data-id="${categoria.id}"  class="tab ">${categoria.titulo}</button>`;
    }
  bandera += 1;
  });

  container.innerHTML += html 
}

// Función para mostrar errores
function mostrarError(mensaje) {
  const container = document.getElementById("tabs");
  container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e53e3e;">
            <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
            <div style="font-size: 18px; margin-bottom: 10px;">Error</div>
            <div style="font-size: 14px;">${mensaje}</div>
        </div>
    `;
}