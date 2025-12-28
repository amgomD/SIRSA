     cargarPersonalEnFormulario  (getIdFromURL())    // Obtener ID de la URL

// Función principal para obtener y llenar formulario
async function cargarPersonalEnFormulario(personalId) {
    try {
        console.log(`Cargando personal ID: ${personalId}`);
        
        // Mostrar loading

        
        // Obtener datos del API
        const personalData = await obtenerPersonalPorId(personalId);
        
        if (personalData) {
            // Llenar formulario con los datos
                        document.getElementById('carnet-container').style.opacity = '1';
        document.getElementById('exportBtn').style.opacity = '1';
            llenarFormularioPersonal(personalData);
            
   
         //   showNotification('Datos cargados exitosamente', 'success');
        } else {
          
limpiarVisualizacion();

        }
        
    } catch (error) {
        console.error('Error cargando personal:', error);
       // showNotification('Error cargando los datos', 'error');
    } finally {
      
    }
}

// Función para obtener datos del API
async function obtenerPersonalPorId(id) {
    try {
        const response = await fetch('/api/personal/personal/obtenerDoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Datos recibidos:', data.data);
            return data.data;
        } else {
            console.error('Error del API:', data.message);
            return null;
        }
        
    } catch (error) {
        console.error('Error en petición:', error);
        return null;
    }
}

// Función para llenar el formulario con los datos
function llenarFormularioPersonal(personalData) {
    const form = document.getElementById('encuestadoForm');
    
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }
    const nuevoId = personalData.id;
const params = new URLSearchParams(window.location.search);
params.set("id", nuevoId);
window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
cargarCarnet() 

    // Mapeo de campos API a campos del formulario
    let camposMapeados = {
        // Campos básicos
     
        'PerTipoDoc': personalData.PerTipoDoc,
        'PerTel': personalData.PerTel,
        'PerEstado': personalData.PerEstado,
        'PerOrgSec': personalData.organizacion,
        'PerFechNa': formatearFechaParaInput(personalData.PerFechNa),
        'PerGen': personalData.PerGen,
        'localSec': personalData.localidad,
        
        // Campos adicionales
        'PerPais': personalData.PerPais,
        'PerTipRH': personalData.PerTipRH,
        'PerBar': personalData.PerBar,
        'PerDir': personalData.PerDir,
        'PerEstCivil': personalData.PerEstCivil,
        'PerEstrato': personalData.PerEstrato,
        'PerHogar': personalData.PerHogar,
        'PerFecOrg':formatearFechaParaInput(personalData.PerFecOrg),
        'PerDisHorAct':personalData.PerDisHorAct
    };
    
    document.getElementById('PerNom').innerHTML = personalData.PerNom;
    document.getElementById('PerDoc').innerHTML = personalData.PerDoc;

    // Llenar cada campo usando textContent en lugar de value
    Object.entries(camposMapeados).forEach(([nombreCampo, valor]) => {
        const campo = document.querySelector(`#${nombreCampo}`);
        
        if (campo) {
            // Para elementos de visualización usamos textContent
            campo.textContent = (valor !== null && valor !== undefined && valor !== '') ? valor : '-';
            
            // Aplicar clase especial para estado "Vinculado"
            if (nombreCampo === 'estado' && valor === 'Vinculado') {
                campo.classList.add('status-vinculado');
            }
            
            // Logging para debugging
            console.log(`Llenando ${nombreCampo}: ${valor}`);
        } else {
            console.warn(`Campo no encontrado: ${nombreCampo}`);
        }
    });
    

    console.log('Formulario llenado completamente');
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



        // Obtener ID de la URL
        function getIdFromURL() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }



        // Función para limpiar con animación suave
function limpiarVisualizacion(mostrarMensaje = false) {
    const card = document.getElementById('encuestadoForm');
    const container = document.getElementById('carnet-container');
    
    // Agregar clase de fade out (opcional)
    card.style.opacity = '0.5';
    
    setTimeout(() => {
        // Limpiar header
        document.getElementById('PerNom').textContent = mostrarMensaje ? 'No encontrado' : '-';
        document.getElementById('PerDoc').textContent = '-';
        

        // Campos a limpiar
        const campos = [
            'PerTipoDoc', 'PerFechaExp', 'PerTel', 'PerEstado', 'PerOrgSec',
            'PerFechNa', 'PerGen', 'localSec', 'PerMun', 'PerDep',
            'PerBar', 'PerDir', 'PerEstCivil', 'PerEstrato', 'PerHogar',
            'PerFecOrg', 'PerActRe'
        ];

        campos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = '-';
                elemento.className = 'info-value'; // Reset clases
            }
        });
        
        // Reset datos globales
        personalDataGlobal = null;
               container.style.opacity = '0';
        // Deshabilitar descarga
        document.getElementById('exportBtn').style.opacity = '0';
        const params = new URLSearchParams(window.location.search);
params.set("id", "");
window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        // Restaurar opacidad
        card.style.opacity = '1';
 
        cargarCarnet() 
    }, 100);
}