// Tabs behavior
const permisos = JSON.parse(window.permisos);

// Crear variables individuales
const PermCreForm = permisos.PermCreForm;
const PerElForm = permisos.PerElForm;
const PerRespEn = permisos.PerRespEn;
const PerRespIna = permisos.PerRespIna;
const PerRespImpEx = permisos.PerRespImpEx;
const PerRespImpFoto = permisos.PerRespImpFoto;
const PerRespDes = permisos.PerRespDes;
const PermConfSis = permisos.PermConfSis;

if (PerRespEn == "S") {
} else {
  alert("No tiene permiso para crear o editar encuestados");
  window.history.back();
}

// Variable global para almacenar las localidades
let localidadesCache = [];
let cacheLoaded = false;

let OrgCache = [];
let orcacheLoaded = false;

document.addEventListener("DOMContentLoaded", function () {
  cargarCategorias();
});

function generarForm() {
  let formPersonal = `    
         
     <div class="form-container">
                    <form id="encuestadoForm">
                        <div class="two-cols">
                            <div>
                                <label>Tipo de documento</label>
                                <select name="PerTipoDoc" required>
                                    <option name="PerTipoDoc" value="" disabled selected>Selecciona</option>
                                    <option value="C.C.">C.C.</option>
                                    <option value="C.E.">C.E.</option>
                                    <option value="PPT">PPT</option>

                                </select>
                            </div>
                                           <div>
                                <label>Tipo de sangre</label>

<select id="PerTipRH" name="PerTipRH" required>
        <option value="">Seleccione...</option>
  <option value="O+">O+</option>
  <option value="O-">O-</option>
  <option value="A+">A+</option>
  <option value="A-">A-</option>
  <option value="B+">B+</option>
  <option value="B-">B-</option>
  <option value="AB+">AB+</option>
  <option value="AB-">AB-</option>
                      </select>
                            </div>


                     
                        </div>
       <div>
                                <label>País de nacimiento</label>
                                <input name="PerPais" type="text" value="">
                            </div>
                        <div class="two-cols">
                            <div>
                                <label>Fecha nacimiento</label>
                                <input name="PerFechNa" type="date" value="">
                            </div>
                            <div>
                                <label>Género</label>
                                <select name="PerGen" required>
                                    <option value="" disabled selected>Selecciona</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        <div class="two-cols">
                            <div>
                                <label>Celular</label>
                                <input name="PerTel" required type="text" value="">
                            </div>
                            <div>
                                <label>Estado</label>
                                <select name="PerEstado">
                                    <option value="Vinculado">Vinculado</option>
                                    <option value="No vinculado">No vinculado</option>
                                </select>
                            </div>
                        </div>

                        <label>Dirección</label>
                        <input name="PerDir" required type="text" value="">
                    
                    

                                        <div class="two-cols">
                                    <div>
                                <label>Estrato</label>
                                <select name="PerEstrato">
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                            
                                </select>
                            </div>
 <div>
                      <label>Cabeza de hogar?</label>
                        <select name="PerHogar">
                            <option value="SI">SI</option>
                            <option value="NO">NO</option>
                        </select>
  </div>
                        
               
                    
                        </div>
                          <div>


                                <label>Estado civil</label>
                                <select name="PerEstCivil">
                                    <option value="Soltero">Soltero</option>
                                    <option value="Casado">Casado</option>
                                    <option value="Divorciado">Divorciado</option>
                                    <option value="Viudo">Viudo</option>
                                    <option value="Union libre" >Union libre</option>
                                  <option value="" >Ninguno</option>
                                </select>
                            </div>

                        <label>Libreta militar</label>
                        <select name="PerMilitar">
                            <option value="Primera clase">Primera clase</option>
                            <option value="Segunda clase">Segunda clase</option>
                            <option value="No aplica">No Aplica</option>
                            <option value="No tiene">No Tiene</option>
                            <option value="">Ninguno</option>
                          
                        </select>


             <div class="two-cols">
                            <div>
                                <label>Tiene discapacidad</label>
            <select name="PerDis" required>
                        <option value="NO">NO</option>
                        <option value="SI">SI</option>
                      </select>
                            </div>
            <div>



           <label>Es Habitante de calle?</label>

<select name="PerHabCa" required>
                   <option value="NO">NO</option>
                        <option value="SI">SI</option>
                      </select>
                            </div>
                        </div>


                                 <label>Comuna donde labora</label>
                        <select name="localSec" required id="comunas">
                         `;
  localidadesCache.forEach((localidad) => {
    const row = document.createElement("tr");
    formPersonal += `
            <option value="${localidad.llave}">${localidad.localidad}</option>
        `;
  });

  formPersonal += `
                        </select>
                      <label>Barrio</label>
                        <input name="PerBar" required type="text" value="">




                        
                        <label>Organización</label>
                        <select name="PerOrgSec" id="OrgSec" required>
`;
  OrgCache.forEach((organizacion) => {
    const row = document.createElement("tr");
    formPersonal += `
            <option value="${organizacion.llave}">${organizacion.nombre}</option>
        `;
  });

  formPersonal += ` </select>
  
  <label class="subtitulo-tema" >Tipo de vinculación </label>
<table>
  <tr>
    <th>Años</th>
    <th>Meses </th>

  </tr>
  <tr>
    <td><input name="PerTipVinAno" id="PerTipVinAno" type="number"></td>
    <td><input name="PerTipVinMes" id="PerTipVinMes" type="number"></td>
  </tr>
</table>

  <label class="subtitulo-tema" >Distribucion de horas en un dia </label>
    <label >Actividad que realiza</label>
  <textarea name="PerDisHorAct" id ="PerDisHorAct" rows="10" cols="10" placeholder = "Esscribe algo" ></textarea>
  <label ># de horas</label>
<input name="PerDisHorHor" id="PerDisHorHor" type="number">






  <label class="subtitulo-tema" >Jornada laboral</label>
              <div class="two-cols horizontal">
                           
                                <label>Jornada AM</label>
                                <input class="inputCheck"  type="checkbox" name="PerDiTraJorAm" id="PerDiTraJorAm">
  
           <label>Jornada PM</label>

     <input class="inputCheck" type="checkbox" name="PerDiTraJorPm" id="PerDiTraJorPm">
                            
                        </div>    
<table>
  <tr>
    <th>L</th>
    <th>M</th>
    <th>M</th>
    <th>J</th>
    <th>V</th>
    <th>S</th>
    <th>D</th>
  </tr>
  <tr>
    <td><input name="PerDiTraLu" id="PerDiTraLu" type="checkbox"></td>
    <td><input name="PerDiTraMar" id="PerDiTraMar" type="checkbox"></td>
    <td><input name="PerDiTraMie" id="PerDiTraMie" type="checkbox"></td>
    <td><input name="PerDiTraJue" id="PerDiTraJue" type="checkbox"></td>
    <td><input name="PerDiTraVie" id="PerDiTraVie"  type="checkbox"></td>
    <td><input name="PerDiTraSab" id="PerDiTraSab" type="checkbox"></td>
    <td><input name="PerDiTraDom" id="PerDiTraDom" type="checkbox"></td>
  </tr>
</table>


               

      
               



                        <button class="save-btn-large" type="submit">Guardar</button>
                        
                    </form>
                </div>
 `;

  return formPersonal;
}

async function obtenerLocalidades() {
  if (cacheLoaded) {
    console.log(
      "Devolviendo desde caché:",
      localidadesCache.length,
      "localidades"
    );
    return localidadesCache;
  }

  try {
    const response = await fetch("/api/Localidad/Localidad/obtener", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      localidadesCache = data.data;
      cacheLoaded = true;
      console.log("Localidades:", data.data);
      return localidadesCache;
    } else {
      console.error("Error:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error obteniendo localidades:", error);
    return [];
  }
}

async function obtenerOrganizaciones() {
  if (orcacheLoaded) {
    console.log("Devolviendo desde caché:", OrgCache.length, "localidades");
    return OrgCache;
  }

  try {
    const response = await fetch("/api/Organizacion/organizaciones/obtener", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      OrgCache = data.data;
      cacheLoaded = true;
      console.log("Localidades:", data.data);
      return OrgCache;
    } else {
      console.error("Error:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error obteniendo localidades:", error);
    return [];
  }
}

// Función auxiliar para encontrar tab por ID específico
function findTabById(id) {
  return document.querySelector(`.tab[data-id="${id}"]`);
}

// Función para obtener todos los tabs de BD (con data-id, excluyendo personal)
function getBDTabs() {
  return document.querySelectorAll('.tab[data-id]:not([data-id="personal"])');
}

// Función para cargar y mostrar las categorías
async function cargarCategorias() {
  const container = document.getElementById("tabs");
  const localidades = await obtenerLocalidades(); // ← Carga desde API
  const org = await obtenerOrganizaciones();
  try {
    const response = await fetch("/api/Categoria/wsListarCategoriastab");
    const data = await response.json();

    if (data.success) {
      mostrarCategorias(data.categorias);

      const tabs = document.querySelectorAll(".tab");
      const contentContainer = document.getElementById("content-container"); // El recuadro donde se mostrará el contenido
      const saveBtns = document.querySelectorAll(
        ".save-btn, .left-panel .blue"
      );

      const leftPanel = document.getElementById("left-panel");

      tabs.forEach((tab) => {
        tab.addEventListener("click", async (event) => {
          // Remover clase active de todos los tabs
          tabs.forEach((x) => x.classList.remove("active"));
          // Agregar clase active al tab clickeado
          tab.classList.add("active");

          // Obtener el nombre del tab
          const id = tab.dataset.id;

          let htmlContent = "";
          // Generar el HTML personalizado
          handleTabClick(tab);

          // Insertar en el contenedor
        });
      });

      leftPanel.innerHTML = generarForm();

      // Versión completa con manejo de contenido
      window.addEventListener("resize", async function () {
        const isMobile = window.innerWidth <= 768;
        const isDesktop = window.innerWidth > 768;

        if (isDesktop) {
          // Generar formulario en el panel izquierdo
          //leftPanel.innerHTML = generarForm();
          contentContainer.style.display = "flex";
          leftPanel.style.display = "flex";
          // Manejar tabs
          handleDesktopTabSwitch();
        } else if (isMobile) {
          // Opcional: restaurar tab Personal en móvil
          // restorePersonalTab();
        }
      });
      const form = document.getElementById("encuestadoForm");
      console.log("sdddddd");
      if (form) {
        form.addEventListener("submit", handleFormSubmit);
      }
      cargarDesdeURL();
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

  categorias.forEach((categoria) => {
    html += `<button data-id="${categoria.id}"  class="tab">${categoria.titulo}</button>`;
  });

  container.innerHTML += html;
}

// Función para mostrar errores
function mostrarError(mensaje) {
  const container = document.getElementById("left-panel");
  container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e53e3e;">
            <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
            <div style="font-size: 18px; margin-bottom: 10px;">Error</div>
            <div style="font-size: 14px;">${mensaje}</div>

        </div>
    `;
}

function nuevoPersonalConURL() {
  window.location.href = window.location.pathname + "?id=0";
}

// Variable global para almacenar el base64
let currentPhotoBase64 = null;

// Función para activar el input de archivo
function triggerFileInput() {
  document.getElementById("photoInput").click();
}

// Función principal para manejar la selección de foto
function handlePhotoSelect(event) {
  const file = event.target.files[0];

  if (!file) return;

  // Validar tipo de archivo
  if (!file.type.startsWith("image/")) {
    alert("Por favor selecciona una imagen válida");
    return;
  }

  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("La imagen es muy grande. Máximo 5MB");
    return;
  }

  // Mostrar loading
  showLoading(true);

  // Convertir a base64
  convertToBase64(file)
    .then((base64) => {
      currentPhotoBase64 = base64;
      displayPhoto(base64);
      updateDebugInfo();
      showLoading(false);
    })
    .catch((error) => {
      console.error("Error convirtiendo imagen:", error);
      alert("Error procesando la imagen");
      showLoading(false);
    });
}

// Función para convertir archivo a base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

// Función para mostrar la foto en el círculo
function displayPhoto(base64) {
  const photoPreview = document.getElementById("photoPreview");
  const photoPlaceholder = document.getElementById("photoPlaceholder");
  const removeBtn = document.getElementById("removeBtn");

  photoPreview.src = base64;
  photoPreview.style.display = "block";
  photoPlaceholder.style.display = "none";
  removeBtn.style.display = "inline-block";
}

// Función para quitar la foto
function removePhoto() {
  const photoPreview = document.getElementById("photoPreview");
  const photoPlaceholder = document.getElementById("photoPlaceholder");
  const removeBtn = document.getElementById("removeBtn");
  const photoInput = document.getElementById("photoInput");

  currentPhotoBase64 = null;
  photoPreview.style.display = "none";
  photoPlaceholder.style.display = "block";
  removeBtn.style.display = "none";
  photoInput.value = "";

  updateDebugInfo();
}

// Función para mostrar estado de carga
function showLoading(isLoading) {
  const container = document.querySelector(".photo-input-wrapper");
  const overlay = container.querySelector(".photo-overlay span");

  if (isLoading) {
    container.classList.add("loading");
    overlay.textContent = "Procesando...";
  } else {
    container.classList.remove("loading");
    overlay.textContent = "Cambiar foto";
  }
}

// Función para actualizar info de debug
function updateDebugInfo() {
  const debugInfo = document.getElementById("debugInfo");

  if (currentPhotoBase64) {
    const sizeKB = Math.round((currentPhotoBase64.length * 0.75) / 1024); // Aproximado
    debugInfo.innerHTML = `
                    <div>Foto cargada: ${sizeKB}KB</div>
                    <div>Formato: ${currentPhotoBase64.substring(
                      5,
                      currentPhotoBase64.indexOf(";")
                    )}</div>
                    <div>Base64 preview: ${currentPhotoBase64.substring(
                      0,
                      50
                    )}...</div>
                `;
  } else {
    debugInfo.textContent = "Sin foto seleccionada";
  }
}

// Función para obtener el base64 actual (usar en formularios)
function getCurrentPhotoBase64() {
  return currentPhotoBase64;
}

// Función para cargar foto desde base64 (útil para edición)
function loadPhotoFromBase64(base64) {
  if (base64) {
    currentPhotoBase64 = base64;
    displayPhoto(base64);
    updateDebugInfo();
  }
}

// Función para integrar con formularios
function getPhotoForForm() {
  return {
    fotoBase64: currentPhotoBase64,
    hasFoto: currentPhotoBase64 !== null,
  };
}

// Evento de drag and drop (opcional)
function setupDragAndDrop() {
  const photoCircle = document.getElementById("photoCircle");

  photoCircle.addEventListener("dragover", (e) => {
    e.preventDefault();
    photoCircle.style.borderColor = "#3b82f6";
  });

  photoCircle.addEventListener("dragleave", (e) => {
    e.preventDefault();
    photoCircle.style.borderColor = "#d1d5db";
  });

  photoCircle.addEventListener("drop", (e) => {
    e.preventDefault();
    photoCircle.style.borderColor = "#d1d5db";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = { target: { files: files } };
      handlePhotoSelect(fakeEvent);
    }
  });
}

// Función para integrar con formularios
function getPhotoForForm() {
  return {
    fotoBase64: currentPhotoBase64,
    hasFoto: currentPhotoBase64 !== null,
  };
}
// Función para cargar foto desde base64 (útil para edición)
function loadPhotoFromBase64(base64) {
  if (base64) {
    currentPhotoBase64 = base64;
    displayPhoto(base64);
    updateDebugInfo();
  }
}

window.PhotoManager = {
  getCurrentPhotoBase64,
  loadPhotoFromBase64,
  getPhotoForForm,
  removePhoto,
};
