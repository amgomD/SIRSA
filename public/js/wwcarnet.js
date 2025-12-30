// URL de tu API - Ajusta según tu configuración
const API_URL = "http://localhost:3000"; // Cambia esto por tu URL real
// Variable global para almacenar las imágenes en base64
let IMAGENES_BASE64 = {};
let Exquery = "";
let currentSearchValue = "";
let Alcaldiaconfig = JSON.parse(localStorage.getItem("configuracion"));

let OrgCache = [];
let orcacheLoaded = false;
const OrgBtn = document.getElementById("OrgBtn");
const OrgContentFil = document.getElementById("OrgContentFil");
const OrgDropdown = document.getElementById("OrgDropdown");

let urlBase = window.location.origin; // Ejemplo: http://tuservidor.com
// Precargar todas las imágenes al inicio
async function precargarImagenes() {
  console.log("Precargando imágenes...");

  if (Alcaldiaconfig.ConfOrgLogo) {
    IMAGENES_BASE64.logo = Alcaldiaconfig.ConfOrgLogo;
  } else {
    IMAGENES_BASE64.logo = await cargarImagenBase64("img/bloqueheader4384.png");
  }

  // Agrega más imágenes si necesitas
  // IMAGENES_BASE64.fondo = await cargarImagenBase64('img/fondo.png');
  console.log("Imágenes precargadas");
}
// Cargar datos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarPersonal();
});

// Funciones para manejar dropdowns

// Funciones para manejar dropdowns
function closeAllDropdowns() {
  filtrosDropdown.classList.remove("show");
  OrgDropdown.classList.remove("show");
  opcionesDropdown.classList.remove("show");
  dropdownOverlay.style.display = "none";
}

function toggleDropdown(dropdown) {
  const isVisible = dropdown.classList.contains("show");
  closeAllDropdowns();

  if (!isVisible) {
    dropdown.classList.add("show");
    dropdownOverlay.style.display = "block";
  }
}

// Event listeners para los botones principales
filtrosBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleDropdown(filtrosDropdown);
});


OrgBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleDropdown(OrgDropdown);

CargarDropORg();



});



opcionesBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleDropdown(opcionesDropdown);
});

// Cerrar dropdowns al hacer click en overlay
dropdownOverlay.addEventListener("click", closeAllDropdowns);

// Evitar que los dropdowns se cierren al hacer click dentro
filtrosDropdown.addEventListener("click", function (e) {
  e.stopPropagation();
});
OrgDropdown.addEventListener("click", function (e) {
  e.stopPropagation();
});
opcionesDropdown.addEventListener("click", function (e) {
  e.stopPropagation();
});

// Funcionalidad de filtros
const clearFiltersBtn = document.getElementById("clearFilters");
const applyFiltersBtn = document.getElementById("applyFilters");
const clearFilterOrg = document.getElementById("clearFilterOrg");
const applyFilterOrg = document.getElementById("applyFilterOrg");


clearFiltersBtn.addEventListener("click", function () {
 limpiarFiltros();

});


clearFilterOrg.addEventListener("click", function () {

    
    // Ejecutar la búsqueda sin filtros
  limpiarFiltros();
cargarPersonal();
});


function limpiarFiltros(){

  const xcheckboxes = filtrosDropdown.querySelectorAll('input[type="checkbox"]');
  xcheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
      
    // Limpiar el input de búsqueda
    if (searchInput) {
        searchInput.value = '';
    }
    currentSearchValue = ''; // Limpiar la variable global
    
    console.log('🧹 Filtros limpiados');
    




  const checkboxes = OrgDropdown.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
      
    // Limpiar el input de búsqueda
    if (searchInput) {
        searchInput.value = '';
    }
    currentSearchValue = ''; // Limpiar la variable global
    
    console.log('🧹 Filtros limpiados');


      //
}


applyFiltersBtn.addEventListener("click", function () {
      console.log('📝 Valor actual de búsqueda:', currentSearchValue);
    cargarPersonal();
});

applyFilterOrg.addEventListener("click", function () {
      console.log('📝 Valor actual de búsqueda:', currentSearchValue);
    cargarPersonal();
});


const importarExcelBtn = document.getElementById("importarExcelBtn");

importarExcelBtn.addEventListener("click", function () {
    window.location.href = "importacion";
});






clearFiltersBtn.addEventListener("click", function () {
  const checkboxes = filtrosDropdown.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Limpiar el input de búsqueda
  if (searchInput) {
    searchInput.value = "";
  }
  currentSearchValue = ""; // Limpiar la variable global

  console.log("🧹 Filtros limpiados");

  // Ejecutar la búsqueda sin filtros
  cargarPersonal();
});



async function cargarPersonal() {
  const loading = document.getElementById("loadingMessage");
  const error = document.getElementById("errorMessage");
  const container = document.getElementById("tableContainer");
  let where = generarwhere();
    const org = await cargarOrg();
  try {
    loading.style.display = "block";
    error.style.display = "none";
    container.innerHTML = "";

    const response = await fetch(`/api/personal/personal/obtenerwhere`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ where }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Error desconocido");
    }

    console.log(`Se cargaron ${result.total} registros`);

    // Generar carnets
    for (const persona of result.data) {
      const carnetElement = await crearCarnet(persona);
      if (carnetElement) {
        container.appendChild(carnetElement);
      }
    }

document.querySelectorAll(".qr-code").forEach((el) => {
  if (el.dataset.generado === "1") return;

  new QRCode(el, {
    text: el.dataset.text,
    width: 90,
    height: 90,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });

  el.dataset.generado = "1";
});




    if (result.data.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; padding: 40px;">No hay personal registrado</p>';
    }
  } catch (err) {
    console.error("Error:", err);
    error.textContent = `Error al cargar personal: ${err.message}`;
    error.style.display = "block";
  } finally {
    loading.style.display = "none";
  }
}


function generatePDF() {
    const element = document.getElementById("documento") // O el contenedor específico que contiene las dos páginas
    const opt = {
        margin: 0,
        filename: 'carnet_reciclador.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
}



async function crearCarnet(persona) {
  const card = document.createElement("div");
  card.className = "id-card";
 

  const fechaNacimiento = formatearFecha(persona.fechaNacimiento);
  const fotoUrl = persona.foto ;
  let logoBase64 = await cargarImagenBase64("img/LogoAlcaldia.png");
  if (Alcaldiaconfig.ConfOrgLogo) {
    logoBase64 = Alcaldiaconfig.ConfOrgLogo;
  }

  let nombreAlcaldia = Alcaldiaconfig.ConfOrgNom;
  let subtitulo = Alcaldiaconfig.confOrgSubCar;
const ahora = new Date();

const fechaActual =
    String(ahora.getDate()).padStart(2, '0') +
    String(ahora.getMonth() + 1).padStart(2, '0') +
    ahora.getFullYear() +
    String(ahora.getHours()).padStart(2, '0') +
    String(ahora.getMinutes()).padStart(2, '0') +
    String(ahora.getSeconds()).padStart(2, '0') +
    String(ahora.getMilliseconds()).padStart(3, '0');
 card.dataset.info = persona.cedula+"-"+fechaActual
  card.innerHTML = `


    <div class="flip-card">


    
        <div class="flip-inner">

            <!-- FRENTE -->
            <div class="fcard front">
                <div class="fondo">
                    <img src="img/FondoFront.svg" alt="">
                </div>
                <div class="top">Carnet digital <p>de <span>recicladores</span></p>
                    <p>2025</p>
                </div>
                <div><img class="photo" src="${fotoUrl}" alt="Foto de ${persona.nombre}"></div>
                <div class="content">
                    <div class="name">
                        <p>${persona.nombre} </p>
                        <div class="infoCard">
                            <div class="lado">
                                <div class="role">RECICLADOR</div>
                                <div class="info">${persona.tipoDoc || "CC"} ${persona.cedula}</div>
                            </div>
                         <div class="ladoD">
                             <div class="infox"><b>RH</b><p>${
                                    persona.PerTipRH || "N/A"
                                    }</p>
                                </div>
                            </div>



                        </div>
                        <div class="infoorganizacion">
                            <h2>Organización</h2>
                            <b>${
                                persona.organizacion || "N/A"
                                }</b>
                        </div>

                        <div class="infoActCo">
                            <div class="itemLado">
                                <div class="Item">
                                    Actividad que realiza
                                </div>
                                <b>${
                                    persona.actividad || "N/A"
                                    }</b>
                            </div>

                            <div class="itemLado borde">
                                <div class="Item">
                                    Contacto
                                </div>
                                <b>${
                                    persona.telefono || "N/A"
                                    }</b>
                            </div>

                        </div>


                        <div class="infoActCo">
                            <div class="itemLado2">
                                <div class="Item">
                                    Dirección
                                </div>
                                <b>${
                                    persona.direccion || "N/A"
                                    }</b>
                            </div>

                            <div class="itemLado2 borde">
                                <div class="Item">
                                    Comuna
                                </div>
                                <b>${
                                    persona.localidad || "N/A"
                                    }</b>
                            </div>
                            <div class="itemLado2 borde">
                                <div class="Item">
                                    Fecha de nacimiento
                                </div>
                                <b>${fechaNacimiento}</b>
                            </div>
                        </div>


                    </div>


                </div>
                <div class="footer"> <img src="${
                                  Alcaldiaconfig.ConfOrgLogo ||
                                  " https://www.floridablanca.gov.co/info/floridablanca_se/media//bloqueheader4384.png"
                        }" alt="Logo Alcaldía">
                </div>
            </div>

              <!-- REVERSO -->
            <div class="fcard backx">
                 <div class="fondo">
                    <img src="img/FondoBack.svg" alt="">
                </div>
        
                      <div class="info-reverso">
                              <p>
    Este carnet es personal e intransferible y lo acredita únicamente como
    Reciclador Censado por el Gobierno de Floridablanca.
  </p>

  <p>
    El uso inadecuado de este documento es responsabilidad del titular.
    Debe portarlo siempre en lugar visible durante la actividad de reciclaje.
  </p>

  <p>
    En caso de pérdida o extravío informar a la Oficina de Gestión Ambiental
    y Mitigación del Riesgo de la Alcaldía de Floridablanca.
  </p>
<h3>Consulte Censo de Recicladores</h3>
<div class="qr qr-code" data-text="${urlBase}/carnet.html?id=${
    persona.id
  }"></div></div>
                <div class="footer"><img src="img/LogoBack.png" alt="Logo Alcaldía"></div>
            </div>



        </div>
            <!-- REVERSO -->
            <div class="fcard back">
                 <div class="fondo">
                    <img src="img/FondoBack.svg" alt="">
                </div>
      
                       <div class="info-reverso">
                              <p>
    Este carnet es personal e intransferible y lo acredita únicamente como
    Reciclador Censado por el Gobierno de Floridablanca.
  </p>

  <p>
    El uso inadecuado de este documento es responsabilidad del titular.
    Debe portarlo siempre en lugar visible durante la actividad de reciclaje.
  </p>

  <p>
    En caso de pérdida o extravío informar a la Oficina de Gestión Ambiental
    y Mitigación del Riesgo de la Alcaldía de Floridablanca.
  </p>
<h3>Consulte Censo de Recicladores</h3>
<div class="qr qr-code" data-text="${urlBase}/carnet.html?id=${
    persona.id
  }"></div></div>
                <div class="footer"><img src="img/LogoBack.png" alt="Logo Alcaldía"></div>
            </div>

    </div>



 
            `;

  return card;
}

function formatearFecha(fecha) {
  if (!fecha) return "N/A";
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function calcularTiempo(fechaOrg) {
  if (!fechaOrg) return "N/A";
  const inicio = new Date(fechaOrg);
  const ahora = new Date();
  const anos = ahora.getFullYear() - inicio.getFullYear();
  const meses = ahora.getMonth() - inicio.getMonth();

  if (anos > 0) {
    return `${anos} año${anos > 1 ? "s" : ""}`;
  } else if (meses > 0) {
    return `${meses} mes${meses > 1 ? "es" : ""}`;
  }
  return "Menos de 1 mes";
}



document.getElementById("exportBtn").addEventListener("click", async () => {
  const btn = document.getElementById("exportBtn");
  const originalText = btn.innerHTML;
  try {
    btn.disabled = true;
    const cards = document.querySelectorAll(".id-card");
    const totalCards = cards.length;
    
    if (totalCards === 0) {
      alert("No hay carnets para exportar");
      return;
    }

    const conf = JSON.parse(localStorage.getItem("configuracion"));
    const color = conf?.ConfOrgColor || "#3366cc";
    const BATCH_SIZE = 30;
    const totalBatches = Math.ceil(totalCards / BATCH_SIZE);
    
    // ✅ Cargar CSS una sola vez
    let css = await fetch("styles/CarnetDescargar.css").then((res) => res.text());
    css = css.replace(
      /(--color-principal:\s*)(#[0-9A-Fa-f]{3,6}|[a-zA-Z]+)(\s*;?)/,
      `$1${color}$3`
    );

    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, totalCards);
      
      btn.innerHTML = `<i class="fa-solid fa-hourglass-start"></i> ${start + 1}-${end}/${totalCards}`;
      
      const batchCards = Array.from(cards).slice(start, end);
      const data = [];

      for (const card of batchCards) {
        const Nombre = card.dataset.info;
        const htmlWithImages = await convertImagesToBase64(card);
        
        // ✅ Envolver cada carnet con su propio <style>
        const fullHtml = `
          <html>
            <head>
              <style>${css}</style>
            </head>
            <body>
              ${htmlWithImages}
            </body>
          </html>
        `.replace(/\s+/g, " ").trim();
        
        data.push({ html: fullHtml, Nombre });
      }

      // ✅ Ya no envías CSS por separado
      const res = await fetch("/api/carnets/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }) // Solo el array data
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carnets_${i + 1}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    alert(`✅ ${totalCards} carnets exportados`);
  } catch (error) {
    console.error("Error:", error);
    alert(`❌ ${error.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
});
async function convertImagesToBase64(card) {
  const clone = card.cloneNode(true);
  
  const imgs = clone.querySelectorAll("img");

  for (const img of imgs) {
    const src = img.getAttribute("src");

    // ignorar si ya es base64
    if (src.startsWith("data:image")) continue;

    const response = await fetch(src);
    const blob = await response.blob();

    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    img.setAttribute("src", base64);
  }

  return clone.outerHTML;
}



// Función auxiliar si la necesitas separada
async function getHTMLCards() {
  const css = await fetch("styles/CarnetDescargar.css").then((res) => res.text());
  const cards = document.querySelectorAll(".id-card");
  const data = [];

  cards.forEach((card) => {
    const html = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${card.outerHTML}
        </body>
      </html>
    `;
    data.push({ html });
  });

  return data;
}

async function cargarImagenBase64(rutaImagen) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Para evitar problemas de CORS

    img.onload = () => {
      try {
        // Crear canvas para convertir a base64
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Convertir a base64
        const base64 = canvas.toDataURL("image/png");
        console.log("✅ Imagen cargada exitosamente:", rutaImagen);
        resolve(base64);
      } catch (error) {
        console.error("❌ Error al convertir imagen:", error);
        resolve(null);
      }
    };

    img.onerror = (error) => {
      console.error("❌ Error cargando imagen:", rutaImagen, error);
      resolve(null);
    };

    console.log("🔍 Cargando imagen desde:", rutaImagen);
    img.src = rutaImagen;
  });
}

function generarwhere(){
    let Exquery = '';
    
    // Obtener los filtros seleccionados
    const estadoCivil = [];
    const estado = [];
    const cabezaHogar = [];
    const jornada = [];
    const genero = [];
    const OrgSec = [];
   
    // Recopilar Estado Civil
      document.querySelectorAll('.filter-section:nth-child(1) input[type="checkbox"]:checked').forEach(checkbox => {
        genero.push(checkbox.nextElementSibling.textContent.trim());
    });


    document.querySelectorAll('.filter-section:nth-child(3) input[type="checkbox"]:checked').forEach(checkbox => {
        estadoCivil.push(checkbox.nextElementSibling.textContent.trim());
    });
   
    // Recopilar Estado
    document.querySelectorAll('.filter-section:nth-child(5) input[type="checkbox"]:checked').forEach(checkbox => {
        estado.push(checkbox.nextElementSibling.textContent.trim());
    });
       // Recopilar Jornada
    document.querySelectorAll('.filter-section:nth-child(7) input[type="checkbox"]:checked').forEach(checkbox => {
        jornada.push(checkbox.nextElementSibling.textContent.trim());
    });


    // Recopilar Cabeza de Hogar
    document.querySelectorAll('.filter-section:nth-child(9) input[type="checkbox"]:checked').forEach(checkbox => {
        cabezaHogar.push(checkbox.nextElementSibling.textContent.trim());
    });
    
    // Usar la variable global
    const searchValue = currentSearchValue;
    
    // Construir la cláusula WHERE
    let whereConditions = [];
   
    // Filtro de búsqueda por nombre o documento
    if (searchValue !== '') {
        whereConditions.push(`(PerNro LIKE '%${searchValue}%' OR PerNom LIKE '%${searchValue}%' OR PerDoc LIKE '%${searchValue}%')`);
    }
   
    // Filtro Estado Civil
    if (estadoCivil.length > 0 && estadoCivil.length < 5) {
        const estadoCivilSQL = estadoCivil.map(ec => `'${ec}'`).join(', ');
        whereConditions.push(`PerEstCivil IN (${estadoCivilSQL})`);
    }
   
    // Filtro Estado (Vinculado/Desvinculado)
    console.log(estado.length)
    if (estado.length > 0 && estado.length < 3) {
        const estadoSQL = estado.map(e => `'${e}'`).join(', ');
        whereConditions.push(`PerEstado IN (${estadoSQL})`);
    }

  if (jornada && jornada.length > 0) {
    const condicionesJornada = [];

    if (jornada.includes('AM')) {
        condicionesJornada.push(`PerDiTraJorAm = 'X'`);
    }

    if (jornada.includes('PM')) {
        condicionesJornada.push(`PerDiTraJorPM = 'X'`);
    }

    if (condicionesJornada.length > 0) {
        whereConditions.push(`(${condicionesJornada.join(' OR ')})`);
    }
}


if (genero && genero.length > 0) {

    const mapGenero = {
        'Masculino': 'Masculino',
        'Femenino': 'Femenino',
        'Otro': 'Otro'
    };

    const valores = genero
        .map(g => mapGenero[g.trim()]) // quita espacios y mapea
        .filter(Boolean);              // elimina undefined

    if (valores.length > 0) {
        const generoSQL = valores.map(v => `'${v}'`).join(', ');
        whereConditions.push(`PerGen IN (${generoSQL})`);
    }
}

    
       // Filtro Cabeza de Hogar
    if (cabezaHogar.length > 0 && cabezaHogar.length < 2) {
        const cabezaValue = cabezaHogar[0] === 'Si' ? 'SI' : 'NO';
        whereConditions.push(`PerHogar = '${cabezaValue}'`);
    }

    const orgContainer = document.getElementById('OrgContentFil');

const selectedOrgs = Array.from(
    orgContainer.querySelectorAll('input[type="checkbox"]:checked')
).map(cb => cb.dataset.id);


if (selectedOrgs.length > 0) {
    const orgSQL = selectedOrgs.join(', ');
    whereConditions.push(`PerOrgSec IN (${orgSQL})`);
}

    // Agregar WHERE si hay condiciones
    if (whereConditions.length > 0) {
        Exquery += ' WHERE ' + whereConditions.join(' AND ');
    }
   
    Exquery += ' ORDER BY PerId DESC';
   
    console.log('WHERE Completo generado:', Exquery);
    
    return Exquery;
}


// Agregar esta función al HTML en lugar de descargarTodosPDFs()

// Event listener para el input de búsqueda
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function (e) {
    currentSearchValue = e.target.value.trim();
    console.log("✏️ Valor de búsqueda capturado:", currentSearchValue);

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      cargarPersonal();
    }, 300);
  });
}

function generarwhereexc(){
    let Exquery = '';
    
 // Obtener los filtros seleccionados
    const estadoCivil = [];
    const estado = [];
    const cabezaHogar = [];
    const jornada = [];
    const genero = [];
   
    // Recopilar Estado Civil
      document.querySelectorAll('.filter-section:nth-child(1) input[type="checkbox"]:checked').forEach(checkbox => {
        genero.push(checkbox.nextElementSibling.textContent.trim());
    });


    document.querySelectorAll('.filter-section:nth-child(3) input[type="checkbox"]:checked').forEach(checkbox => {
        estadoCivil.push(checkbox.nextElementSibling.textContent.trim());
    });
   
    // Recopilar Estado
    document.querySelectorAll('.filter-section:nth-child(5) input[type="checkbox"]:checked').forEach(checkbox => {
        estado.push(checkbox.nextElementSibling.textContent.trim());
    });
       // Recopilar Jornada
    document.querySelectorAll('.filter-section:nth-child(7) input[type="checkbox"]:checked').forEach(checkbox => {
        jornada.push(checkbox.nextElementSibling.textContent.trim());
    });


    // Recopilar Cabeza de Hogar
    document.querySelectorAll('.filter-section:nth-child(9) input[type="checkbox"]:checked').forEach(checkbox => {
        cabezaHogar.push(checkbox.nextElementSibling.textContent.trim());
    });
    
    
    // Usar la variable global
    const searchValue = currentSearchValue;
    
    // Construir la cláusula WHERE
    let whereConditions = [];
   
    // Filtro de búsqueda por nombre o documento
    if (searchValue !== '') {
        whereConditions.push(`(PerNro LIKE '%${searchValue}%' OR PerNom LIKE '%${searchValue}%' OR PerDoc LIKE '%${searchValue}%')`);
    }
   
    // Filtro Estado Civil
    if (estadoCivil.length > 0 && estadoCivil.length < 5) {
        const estadoCivilSQL = estadoCivil.map(ec => `'${ec}'`).join(', ');
        whereConditions.push(`PerEstCivil IN (${estadoCivilSQL})`);
    }
   
    // Filtro Estado (Vinculado/Desvinculado)
    if (estado.length > 0 && estado.length < 2) {
        const estadoSQL = estado.map(e => `'${e}'`).join(', ');
        whereConditions.push(`PerEstado IN (${estadoSQL})`);
    }
     if (jornada && jornada.length > 0) {
    const condicionesJornada = [];

    if (jornada.includes('AM')) {
        condicionesJornada.push(`PerDiTraJorAm = 'X'`);
    }

    if (jornada.includes('PM')) {
        condicionesJornada.push(`PerDiTraJorPM = 'X'`);
    }

    if (condicionesJornada.length > 0) {
        whereConditions.push(`(${condicionesJornada.join(' OR ')})`);
    }
} 
if (genero && genero.length > 0) {

    const mapGenero = {
        'Masculino': 'M',
        'Femenino': 'F',
        'Otro': 'O'
    };

    const valores = genero
        .map(g => mapGenero[g.trim()]) // quita espacios y mapea
        .filter(Boolean);              // elimina undefined

    if (valores.length > 0) {
        const generoSQL = valores.map(v => `'${v}'`).join(', ');
        whereConditions.push(`PerGen IN (${generoSQL})`);
    }
}


   
    // Filtro Cabeza de Hogar
    if (cabezaHogar.length > 0 && cabezaHogar.length < 2) {
        const cabezaValue = cabezaHogar[0] === 'Si' ? 'SI' : 'NO';
        whereConditions.push(`PerHogar = '${cabezaValue}'`);
    }
       const orgContainer = document.getElementById('OrgContentFil');

const selectedOrgs = Array.from(
    orgContainer.querySelectorAll('input[type="checkbox"]:checked')
).map(cb => cb.dataset.id);


if (selectedOrgs.length > 0) {
    const orgSQL = selectedOrgs.join(', ');
    whereConditions.push(`PerOrgSec IN (${orgSQL})`);
}

    // Agregar WHERE si hay condiciones
    if (whereConditions.length > 0) {
        Exquery +=  whereConditions.join(' AND ');
    }
   

   

    return Exquery;
}
const nuevoBtn = document.getElementById("nuevoBtn");
nuevoBtn.addEventListener("click", function () {
  window.location.href = "Edicion" + "?id=0";

  closeAllDropdowns();
});

async function exportar() {
  let where = generarwhereexc();

  const res = await fetch("/api/excel/Exportar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      where, // 👈 filtro dinámico
    }),
  });

  // Descargar archivo
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const now = new Date();
  const id = now
    .toISOString()
    .replace(/[-T:.Z]/g, "") // quitamos caracteres que no sirven
    .slice(0, 17); // YYYYMMDDHHMMSSmmm

  const fileName = `Reporteencuestados_${id}.xlsx`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}


function importarfoto(){
    window.location.href = "ImportarFotos";

}


async function  cargarOrg() {
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

function CargarDropORg(){


    const orgContainer = document.getElementById('OrgContentFil');

const selectedOrgs = Array.from(
    orgContainer.querySelectorAll('input[type="checkbox"]:checked')
).map(cb => cb.dataset.id);


if (selectedOrgs.length > 0) {
 
}else{


    let formPersonal  = ` `
    OrgCache.forEach((organizacion) => {
    const row = document.createElement("tr");
    formPersonal += `
          <label class="filter-option">
                <input data-id="${organizacion.llave}" type="checkbox" >
                <span>${organizacion.nombre}</span>
            </label>



            `;
  });
   
 

OrgContentFil.innerHTML = formPersonal;
}




}