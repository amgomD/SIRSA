// Referencias a elementos del DOM
// Convertir el string en objeto
const permisos = JSON.parse(window.permisos);

let OrgCache = [];
let orcacheLoaded = false;

// Crear variables individuales
const PermCreForm      = permisos.PermCreForm;
const PerElForm        = permisos.PerElForm;
const PerRespEn        = permisos.PerRespEn;
const PerRespIna       = permisos.PerRespIna;
const PerRespImpEx     = permisos.PerRespImpEx;
const PerRespImpFoto   = permisos.PerRespImpFoto;
const PerRespDes       = permisos.PerRespDes;
const PermConfSis      = permisos.PermConfSis;
 



const tableBody = document.getElementById("tableBody");
const filtrosBtn = document.getElementById("filtrosBtn");
const OrgBtn = document.getElementById("OrgBtn");
const OrgContentFil = document.getElementById("OrgContentFil");
const OrgDropdown = document.getElementById("OrgDropdown");
const opcionesBtn = document.getElementById("opcionesBtn");
const filtrosDropdown = document.getElementById("filtrosDropdown");

const opcionesDropdown = document.getElementById("opcionesDropdown");
const dropdownOverlay = document.getElementById("dropdownOverlay");
 let personalData =null;
 let Exquery = '';
// Variable global para almacenar el valor de búsqueda
let currentSearchValue = '';



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


      obtenerPersonal();
}


applyFiltersBtn.addEventListener("click", function () {
      console.log('📝 Valor actual de búsqueda:', currentSearchValue);
    obtenerPersonal();
});

applyFilterOrg.addEventListener("click", function () {
      console.log('📝 Valor actual de búsqueda:', currentSearchValue);
    obtenerPersonal();
});

// Funcionalidad del menú de opciones
const nuevoBtn = document.getElementById("nuevoBtn");
const importarExcelBtn = document.getElementById("importarExcelBtn");

const importarFotosBtn = document.getElementById("importarFotosBtn");

nuevoBtn.addEventListener("click", function () {

  window.location.href = "Edicion" + "?id=0";

  closeAllDropdowns();


});

importarExcelBtn.addEventListener("click", function () {
  window.location.href = "importacion";
});


importarFotosBtn.addEventListener("click", function () {

  window.location.href = "ImportarFotos";
});

// Cerrar dropdowns con Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeAllDropdowns();
  }
});


// Funcionalidad responsive - Alternar entre tabla y tarjetas
const viewToggle = document.getElementById("viewToggle");
const tableContainer = document.getElementById("tableContainer");
const dataTable = document.getElementById("dataTable");
const cardView = document.getElementById("cardView");

let isCardView = false;

// Mostrar/ocultar botón según el tamaño de pantalla
function checkScreenSize() {
      const cardContainer = document.getElementById("cardView");

  if (window.innerWidth <= 480) {
    viewToggle.style.display = "block";
    cardContainer.style.display = "block";
  } else {
    viewToggle.style.display = "none";
    cardContainer.style.display = "none";
    // Asegurar que la tabla esté visible en pantallas grandes
    dataTable.style.display = "table";
    cardView.classList.remove("active");
    isCardView = false;
    cardContainer.innerHTML =
      '';
    viewToggle.innerHTML =
      ' <i class="fa-solid fa-address-card"></i>  Cambiar a vista de tarjetas';
  }
}



viewToggle.addEventListener("click", function () {
  isCardView = !isCardView;
     const cardContainer = document.getElementById("cardView");
  if (isCardView) {
     generateCardView(personalData)
    dataTable.style.display = "none";
    cardView.classList.add("active");
    this.innerHTML = '<i class="fa-solid fa-table"></i>  Cambiar a vista de tabla';
  } else {
         cardContainer.innerHTML =
      '';
    dataTable.style.display = "table";
    cardView.classList.remove("active");
    this.innerHTML = '<i class="fa-solid fa-address-card"></i>  Cambiar a vista de tarjetas';
  }
});

// Detectar cambios de tamaño de ventana
window.addEventListener("resize", checkScreenSize);
window.addEventListener("load", checkScreenSize);

// Indicador de scroll horizontal en tabla
function addScrollIndicator() {
  const table = document.querySelector(".table-container");
  if (table) {
    table.addEventListener("scroll", function () {
      const isScrolled = this.scrollLeft > 0;
      const firstColumn = document.querySelectorAll(
        "th:first-child, td:first-child"
      );

      firstColumn.forEach((cell) => {
        if (isScrolled) {
          cell.style.boxShadow = "2px 0 4px rgba(0,0,0,0.1)";
        } else {
          cell.style.boxShadow = "none";
        }
      });
    });
  }
}

// Inicializar indicador de scroll
addScrollIndicator();

// Simular datos de ejemplo (opcional)
function addSampleData() {
  const sampleData = [
    {
      encuestado: "Juan Pérez",
      contacto: "juan@email.com",
      nacimiento: "15/05/1985",
      edad: "38",
      registro: "001",
      organizacion: "Empresa A",
      estado: "Activo",
      acciones: "...",
    },
    {
      encuestado: "María García",
      contacto: "maria@email.com",
      nacimiento: "22/08/1990",
      edad: "33",
      registro: "002",
      organizacion: "Empresa B",
      estado: "Inactivo",
      acciones: "...",
    },
  ];

  // Descomenta las siguientes líneas si quieres agregar datos de ejemplo

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  sampleData.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
                    <td>${row.encuestado}</td>
                    <td>${row.contacto}</td>
                    <td>${row.nacimiento}</td>
                    <td>${row.edad}</td>
                    <td>${row.registro}</td>
                    <td>${row.organizacion}</td>
                    <td>${row.estado}</td>
                    <td>${row.acciones}</td>
                `;
    tbody.appendChild(tr);
  });
}

// Función para generar vista de tarjetas dinámicamente
function generateCardView(data) {
  const cardContainer = document.getElementById("cardView");
  cardContainer.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "data-card";
    card.innerHTML = `
                    <div class="data-row">
                        <span class="data-label">Encuestado:</span>
                        <span class="data-value">${item.nombre || ""}</span>
                    </div>
                                  <div class="data-row">
                        <span class="data-label">Documento:</span>
                        <span class="data-value">${item.cedula || ""}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Contacto:</span>
                        <span class="data-value">${item.telefono || ""}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">F.Nacimiento:</span>
                        <span class="data-value">${formatearFechaParaInput(item.fechaNacimiento)|| ""}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Edad:</span>
                        <span class="data-value">${item.edad || ""}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Registro:</span>
                        <span class="data-value">${item.registro || ""}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Organización:</span>
                        <span class="data-value">${
                          item.organizacion || ""
                        }</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Estado:</span>
                        <span class="data-value">${item.estado || ""}</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Acciones:</span>
                        <span class="data-value"> <div class="tableOption">
    <button onclick="editar(${item.id})"><i class="fa-solid fa-pen-to-square"></i></button>
    <button><i class="fa-solid fa-trash-can"></i></button>
</div></span>
                    </div>
                `;
    cardContainer.appendChild(card);
  });
}

function verCarnets(){
    window.location.href = "wwcarnets";

}



async function obtenerPersonal() {
  const org = await cargarOrg();
       let tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
 let where =  generarwhere();
  try {
    const response = await fetch(
      "/api/personal/personal/obtenerwhere",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, body: JSON.stringify({ where })
      }
    );

    const data = await response.json();

    if (data.success) {
       console.log(data.data)
        personalData = data.data;
        // Selecciona el tbody
   
// Limpia contenido previo


 // Recorremos el array de personas
personalData.forEach(persona => {
  let tr = document.createElement("tr");
  let fotoHtml = persona.foto 
    ? `<img src="${persona.foto}" alt="Foto" width="50" height="50">`
    : `<span><i class="fa-solid fa-user"></i></span>`;
    
  // Cada propiedad en una columna
 let botones = `
    <button onclick="editar(${persona.id})"><i class="fa-solid fa-pen-to-square"></i></button>
`;

if (persona.estado === "No vinculado") {
  botones += `<button onclick="reintegrar(${persona.id})"><i class="fa-solid fa-arrows-rotate"></i></button>`;
} else {
  botones += `<button onclick="eliminar(${persona.id})"><i class="fa-solid fa-trash-can"></i></button>`;
}

botones += `
    <button onclick="Carnet(${persona.id})"><i class="fa-solid fa-address-card"></i></button>
`;





tr.innerHTML = `
  <td>
    <div class="table-info">
      ${fotoHtml}
      <div>
        <h4>${persona.nombre}</h4>
        <small>${persona.cedula}</small>
      </div>
    </div>
  </td>
  <td>${persona.PerNro}</td>
  <td>${persona.telefono}</td>
  <td>${formatearFechaParaInput(persona.fechaNacimiento)}</td>
  <td>${persona.edad}</td>
  <td>${persona.ano}</td>
  <td>${persona.organizacion}</td>
  <td>${persona.estado}</td>
  <td>
    <div class="tableOption">
      ${botones}
    </div>
  </td>
`;


tr.dataset.id = persona.id;
  tbody.appendChild(tr);
});


      return data.data;
    } else {
      console.error("Error del API:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error en petición:", error);
    return null;
  }
}


async function eliminar(id) {
  if(PerRespIna == "S"){
  if (!confirm("¿Seguro que deseas eliminar este registro?")) return;

  try {
    const response = await fetch("/api/personal/personal/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!data.success) {
      alert("❌ Error: " + data.message);
      return;
    }

    // Éxito: eliminar del front
    alert(data.message);
obtenerPersonal()
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("Error en la conexión con el servidor.");
  }
  }else{
    alert("No tiene permiso para manejar encuestados")
  }

}





async function reintegrar(id) {
    if(PerRespIna == "S"){
  if (!confirm("¿Seguro que deseas reintegrar este registro?")) return;

  try {
    const response = await fetch("/api/personal/personal/reintegrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!data.success) {
      alert("❌ Error: " + data.message);
      return;
    }

    // Éxito: eliminar del front
    alert(data.message);
obtenerPersonal()
  } catch (error) {
    console.error("Error al reintegrar:", error);
    alert("Error en la conexión con el servidor.");
  }
    }else{
    alert("No tiene permiso para manejar encuestados")
  }

  
}



function formatearFechaParaInput(fecha) {
    if (!fecha) return '';
    
    try {
        // Si la fecha viene como string de la BD (ej: "2023-12-25T00:00:00.000Z")
        const fechaObj = new Date(fecha);
        
        // Verificar que sea una fecha válida
        if (isNaN(fechaObj.getTime())) {
            console.warn('Fecha inválida:', fecha);
            return '';
        }
        
        // Formatear como YYYY-MM-DD (requerido por input type="date")
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        
        const fechaFormateada = `${year}-${month}-${day}`;
        console.log(`Fecha original: ${fecha} → Formateada: ${fechaFormateada}`);
        
        return fechaFormateada;
        
    } catch (error) {
        console.error('Error formateando fecha:', fecha, error);
        return '';
    }
}
obtenerPersonal()

function editar(id){
  window.location.href = "Edicion" + "?id="+id;

}

function Carnet(id){
  window.location.href = "carnets" + "?id="+id;

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
let searchTimeout;


// Event listener para el input de búsqueda
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        currentSearchValue = e.target.value.trim();
        console.log('✏️ Valor de búsqueda capturado:', currentSearchValue);
        
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            obtenerPersonal();
        }, 300);
    });
}





async function exportar() {

  if(PerRespDes == "S"){
   let where =  generarwhereexc();
   
  const res = await fetch("/api/excel/Exportar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({where// 👈 filtro dinámico
    })
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

  }else{
    alert("No tiene permiso para exportar el reporte")
  }




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