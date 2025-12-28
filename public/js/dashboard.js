document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 DOM listo, cargando estadísticas...");
  cargarEstadisticas();
});

async function cargarEstadisticas() {
  try {
    const response = await fetch('/api/indicadores/principal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // puedes enviar filtros si lo deseas
    });

      const result = await response.json();
      console.log("📊 Estadísticas generales:", result);

      if (!result.success) throw new Error("Error en la respuesta del servidor");

      const data = result.data;

      // Referencias a los contenedores (asegúrate de que los IDs existan en tu HTML)
      const generoF = data.genero.find(g => g.Genero === "Femenino")?.Total || 0;
const generoM = data.genero.find(g => g.Genero === "Masculino")?.Total || 0;
const generoO = data.genero.find(
  g => !['Femenino', 'Masculino'].includes(g.Genero)
)?.Total || 0;

document.getElementById('generoF').innerHTML = generoF;
document.getElementById('generoM').innerHTML = generoM;
document.getElementById('generoO').innerHTML = generoO;
document.getElementById('Total').innerHTML = generoF+generoM+generoO;

      document.getElementById('habitantesCalle').innerHTML = data.habitantesCalle.length
        ? data.habitantesCalle.map(h => `${h.Total}`).join('<br>')
        : 'Sin datos';

      document.getElementById('discapacidad').innerHTML = data.discapacidad.length
        ? data.discapacidad.map(d => `${d.Total}`).join('<br>')
        : 'Sin datos';

 



const graphdata = {
  genero: [
    { Genero: "Masculino", Total: generoF },
    { Genero: "Femenino", Total: generoM },
    { Genero: "Otro", Total: generoO },
  ]
};




crearGraficaGenero(graphdata);
crearActividadgrafico(data)
crearedadgrafico(data)
crearLocalidadgrafico(data)
crearanoregistrografica(data)

    } catch (error) {
      console.error("❌ Error cargando estadísticas:", error);
      document.querySelectorAll('.info').forEach(el => el.innerHTML = 'Error al cargar');
    }
  
}


  function crearGraficaGenero(graphdata){

// Obtener los datos
const etiquetas = graphdata.genero.map(g => g.Genero);
const valores = graphdata.genero.map(g => g.Total);
  // Genera un color aleatorio para cada barra
  const colores = etiquetas.map(() => colorAleatorio());

// Crear el gráfico
const ctx = document.getElementById('graficoGenero').getContext('2d');
new Chart(ctx, {
  type: 'doughnut', // tipos: bar, pie, doughnut, line, polarArea, radar
  data: {
    labels: etiquetas,
    datasets: [{
      label: 'Cantidad por género',
      data: valores,
      backgroundColor:colores, // Colores de las barras
      borderColor: '#fff',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
        maintainAspectRatio: false, // 🔹 permite que el alto del div defina el tamaño
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false,
        text: 'Distribución por género'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
  }


  function crearActividadgrafico(data){

const ctx = document.getElementById('graficoRangoActividad');

// Suponiendo que ya tienes tu variable `data`:
if (data.rangoActividad && data.rangoActividad.length > 0) {
  const labels = data.rangoActividad.map(a => a.Rango_Actividad);
  const valores = data.rangoActividad.map(a => a.Total);
  // Genera un color aleatorio para cada barra
  const colores = labels.map(() => colorAleatorio());

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Personas por rango de actividad',
        data: valores,
        backgroundColor:colores,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false,  position: 'bottom' },
        title: {
          display: false,
          text: 'Distribución por Rango de Actividad'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
} else {
  document.getElementById('rangoActividad').innerHTML = 'Sin datos';
}
  }

  function crearedadgrafico(data){


// Crear gráfico con Chart.js si hay datos
if (data.rangoEdad && data.rangoEdad.length > 0) {
  const ctxEdad = document.getElementById('graficoRangoEdad');



  // Extraer etiquetas y valores
  const labelsEdad = data.rangoEdad.map(e => e.Rango_Edad);
  const valoresEdad = data.rangoEdad.map(e => e.Total);
  const coloresEdad = labelsEdad.map(() => colorAleatorio());



  new Chart(ctxEdad, {
  type: 'doughnut', // tipos: bar, pie, doughnut, line, polarArea, radar
  data: {
    labels: labelsEdad,
    datasets: [{
  label: 'Distribución por Rango de Edad',
        data: valoresEdad,
      backgroundColor:coloresEdad, // Colores de las barras
      borderColor: '#fff',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
        maintainAspectRatio: false, // 🔹 permite que el alto del div defina el tamaño
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false,
        text: 'Distribución por género'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});



}
  }

function crearLocalidadgrafico(data){
    
if (data.localidad && data.localidad.length > 0) {
  const ctxLocalidad = document.getElementById('graficoLocalidad');

  // Extraer etiquetas y valores
  const labelsLocalidad = data.localidad.map(l => `${l.Localidad}`);
  const valoresLocalidad = data.localidad.map(l => l.Total);
  const coloresLocalidad = labelsLocalidad.map(() => colorAleatorio());

  // Crear la gráfica
  new Chart(ctxLocalidad, {
    type: 'bar',
    data: {
      labels: labelsLocalidad,
      datasets: [{
        label: 'Cantidad por Localidad',
        data: valoresLocalidad,
        backgroundColor: coloresLocalidad,
        borderColor: '#3333',
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x', // 👈 Esto hace que sea horizontal
      plugins: {
        legend: { display: false },
        title: {
          display: false,
          text: 'Distribución por Localidad'
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

}

function crearanoregistrografica(data){

  if (!data.DiasLaborales || data.DiasLaborales.length === 0) return;

  const ctx = document.getElementById('graficoAnioRegistro');

  const labels = data.DiasLaborales.map(d => d.Dia);
  const dataAM = data.DiasLaborales.map(d => d.AM);
  const dataPM = data.DiasLaborales.map(d => d.PM);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Jornada AM',
          data: dataAM,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        },
        {
          label: 'Jornada PM',
          data: dataPM,
          backgroundColor: 'rgba(255, 99, 132, 0.7)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Días y jornadas en que trabajan los encuestados'
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          stacked: false   // barras agrupadas
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });

}
  
// Función para generar un color aleatorio en formato rgba
function colorAleatorio(opacidad = 0.7) {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
}
