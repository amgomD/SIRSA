
    const permisos = JSON.parse(window.permisos);

// Crear variables individuales
const PermCreForm      = permisos.PermCreForm;
const PerElForm        = permisos.PerElForm;
const PerRespEn        = permisos.PerRespEn;
const PerRespIna       = permisos.PerRespIna;
const PerRespImpEx     = permisos.PerRespImpEx;
const PerRespImpFoto   = permisos.PerRespImpFoto;
const PerRespDes       = permisos.PerRespDes;
const PermConfSis      = permisos.PermConfSis;



if(PerRespImpEx == "S"){

}else{
       alert("No tiene permiso para importar excel")
    window.history.back();
}
  const fileInput = document.getElementById('fileInput');
 
    const fileNameSpan = document.getElementById('fileName');
       const responseBox = document.getElementById("response");

      fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      fileNameSpan.textContent = file ? file.name : "Ningún archivo seleccionado";


      if (!fileInput.files[0]) return alert('Selecciona un archivo Excel');

      const formData = new FormData();
      formData.append('archivo', fileInput.files[0]);

      const res = await fetch('/api/plantilla/leerExcel', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (!result.success) return alert('Error al leer el Excel');

      const data = result.data;
      renderTable(data);




    });



    function renderTable(data) {
      if (!data.length) {
        document.getElementById('tablaContainer').innerHTML = '<p>No hay datos</p>';
        return;
      }

      const headers = Object.keys(data[0]);
      let html = '<table><thead><tr>';
      headers.forEach(h => html += `<th>${h}</th>`);
      html += '</tr></thead><tbody>';

      data.forEach(row => {
        html += '<tr>';
        headers.forEach(h => html += `<td>${row[h] ?? ''}</td>`);
        html += '</tr>';
      });

      html += '</tbody></table>';
      document.getElementById('tablaContainer').innerHTML = html;
    }


    document.getElementById('btnImport').addEventListener('click', async () => {

      try {
          const formData = new FormData();
      formData.append('archivo', fileInput.files[0]);

    const loader = document.getElementById("loader");
        loader.classList.remove("hidden"); // 🔄 mostrar spinner
        const res = await fetch("/api/plantilla/importar", {
          method: "POST",
          body: formData
        });
    

        const data = await res.json();
             mostrarResultado(data);

      } catch (err) {
        responseBox.textContent = "❌ Error: " + err.message;
      }finally {
  loader.classList.add("hidden"); // ✅ ocultar spinner siempre
}
  });


  document.getElementById('btnPlantilla').addEventListener('click', async () => {

   

      try {
    const btn = document.getElementById("btnPlantilla");
    btn.disabled = true;
    btn.textContent = "Generando...";

    const response = await fetch("/api/plantilla/generar", {
      method: "POST"
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData);
      alert((errorData.message || "Error al generar el archivo"));
      btn.disabled = false;
      btn.textContent = "Generar plantilla Excel";
      return;
    }

    // Convertir la respuesta en blob (archivo binario)
    const blob = await response.blob();

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Intentar recuperar el nombre de archivo del header
    const contentDisposition = response.headers.get("Content-Disposition");
    let fileName = "plantilla_encuestas.xlsx";
    if (contentDisposition && contentDisposition.includes("filename=")) {
      fileName = contentDisposition.split("filename=")[1].replace(/"/g, "");
    }

    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Limpieza
    a.remove();
    window.URL.revokeObjectURL(url);

    btn.innerHTML = `<i class="fa-solid fa-circle-down"></i>  Plantilla generada`;
    setTimeout(() => {
      btn.textContent = "Generar plantilla Excel";
      btn.disabled = false;
    }, 2000);

  } catch (error) {
    console.error("Error al generar:", error);
    alert("❌ Error inesperado al generar la plantilla.");
    const btn = document.getElementById("btnPlantilla");
    btn.disabled = false;
    btn.textContent = "Generar plantilla Excel";
  }


  });









    function mostrarResultado(data) {
      //  Caso exitoso
      if (data.success) {
        const { archivo, resultados, message } = data;
        const { personasInsertadas, respuestasInsertadas, estadisticas } = resultados;

        responseBox.innerHTML = `
          <div class="success-box">
            <h3> ${message}</h3>
          </div>
          <div class="file-info">
            <p><strong>Archivo:</strong> ${archivo.nombre}</p>
            <p><strong>Tamaño:</strong> ${(archivo.tamaño / 1024).toFixed(1)} KB</p>
          </div>

          <table>
            <thead>
              <tr><th>Indicador</th><th>Valor</th></tr>
            </thead>
            <tbody>
              <tr><td>Personas insertadas</td><td>${personasInsertadas}</td></tr>
              <tr><td>Respuestas insertadas</td><td>${respuestasInsertadas}</td></tr>
              <tr><td>Total personas</td><td>${estadisticas.totalPersonas}</td></tr>
              <tr><td>Total respuestas</td><td>${estadisticas.totalRespuestas}</td></tr>
              <tr><td>Total formularios</td><td>${estadisticas.totalFormularios}</td></tr>
            </tbody>
          </table>
        `;
        return;
      }

      //  Caso con errores de validación (array)
      if (Array.isArray(data.errores)) {
        const erroresList = data.errores
          .map(err => `<li>${err}</li>`)
          .join("");

        responseBox.innerHTML = `
          <div class="error-box">
            <h3>${data.message}</h3>
            <p>Se encontraron los siguientes errores:</p>
            <ul>${erroresList}</ul>
          </div>

          <table>
            <thead><tr><th>Indicador</th><th>Valor</th></tr></thead>
            <tbody>
              <tr><td>Total personas</td><td>${data.estadisticas.totalPersonas}</td></tr>
              <tr><td>Total respuestas</td><td>${data.estadisticas.totalRespuestas}</td></tr>
              <tr><td>Total formularios</td><td>${data.estadisticas.totalFormularios}</td></tr>
            </tbody>
          </table>
        `;
        return;
      }

      // Caso de error general
      responseBox.innerHTML = `
        <div class="error-box">
          <h3>${data.message || 'Error desconocido'}</h3>
          <p><strong>Detalle:</strong> ${data.error || 'No se proporcionó detalle'}</p>
        </div>
      `;
    }


    const btnInfo = document.getElementById("btnInfo");
const modal = document.getElementById("infoModal");
const closeBtn = modal.querySelector(".close");

btnInfo.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Cerrar al hacer clic fuera del contenido
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});
