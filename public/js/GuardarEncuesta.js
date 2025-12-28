// ========================================
// MANEJO DEL FORMULARIO DE ENCUESTADO
// ========================================

// Función principal para manejar el envío del formulario
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');

  try {
    // Deshabilitar botón durante el envío
    submitButton.disabled = true;
    submitButton.textContent = "Guardando...";

    // Recopilar datos del formulario
    const formData = recopilarDatosFormulario(form);

    // Validar datos antes de enviar
    const validationResult = validarDatos(formData);
    if (!validationResult.isValid) {
      showNotification(validationResult.message, "error");
      return;
    }

    // Enviar al API
    const result = await enviarPersonalAPI(formData);

    if (result.success) {
      showNotification(result.message, "success");

      // Limpiar formulario después del éxito
      // form.reset();

      // Actualizar caché si existe (para sincronizar con tabla)
      if (typeof personalCache !== "undefined") {
        // Si existe un sistema de caché, actualizarlo
        await actualizarCachePersonal();
      }
    } else {
      showNotification(result.message || "Error al guardar", "error");
    }
  } catch (error) {
    console.error("Error en envío del formulario:", error);
    showNotification("Error de conexión. Intenta nuevamente.", "error");
  } finally {
    event.preventDefault();
    // Restaurar botón
    submitButton.disabled = false;
    submitButton.textContent = "Guardar";
  }
}

// Función para recopilar datos del formulario
function recopilarDatosFormulario(form) {
  const formData = new FormData(form);

  // Convertir FormData a objeto
  const data = {};
  for (let [key, value] of formData.entries()) {
    console.log(key + value);
    data[key] = value;
  }
    const photoData = window.PhotoManager.getPhotoForForm();
    data.fotoBase64 = photoData.fotoBase64;
    

  const url = new URL(window.location);
   let PerId = url.searchParams.get("id");
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));


  // Mapear campos del formulario a los campos del API
  const personalData = {
    // Campos requeridos por el API
    userid:currentUser.id, //getCurrentUserId(), // Función que obtienes el ID del usuario actual
    PerId:PerId,
    PerNom: data.PerNom || "", // Asumiendo que tienes un campo nombre
    PerGen: data.PerGen || "",
    PerTipoDoc: data.PerTipoDoc || "",
    PerDoc: data.PerDoc || "", // Asumiendo que tienes un campo cédula
    PerTipRH: data.PerTipRH || "",
    PerPais: data.PerPais || "",
    PerTel: data.PerTel || "",
    PerEstado: data.PerEstado || "Vinculado",
    PerOrgSec: parseInt(data.PerOrgSec) || 0,
    PerFechNa: data.PerFechNa || "",
    localSec: parseInt(data.localSec) || 0,

    // Campos adicionales del formulario
    PerBar: data.PerBar || "",
    PerDir: data.PerDir || "",
    PerEstCivil: data.PerEstCivil || "Soltero",
    PerEstrato: data.PerEstrato || "0",
    PerMilitar: data.PerMilitar || "No requiere",
    PerHogar: data.PerHogar || "NO",
    fotoBase64: data.fotoBase64,
    PerHabCa: data.PerHabCa,
    PerDis: data.PerDis,
    PerTipVinAno: data.PerTipVinAno|| "",
    PerTipVinMes: data.PerTipVinMes|| "",
    PerDisHorAct: data.PerDisHorAct|| "",
    PerDisHorHor: data.PerDisHorHor|| "",
    PerDiTraJorAm: data.PerDiTraJorAm === "on" ? "X" : "",
    PerDiTraJorPm: data.PerDiTraJorPm === "on" ? "X" : "",
    PerDiTraLu: data.PerDiTraLu === "on" ? "X" : "",
    PerDiTraMar: data.PerDiTraMar === "on" ? "X" : "",
    PerDiTraMie: data.PerDiTraMie === "on" ? "X" : "",
    PerDiTraJue: data.PerDiTraJue === "on" ? "X" : "",
    PerDiTraVie: data.PerDiTraVie === "on" ? "X" : "",
    PerDiTraSab: data.PerDiTraSab === "on" ? "X" : "",
    PerDiTraDom: data.PerDiTraDom === "on" ? "X" : "",


  };

  console.log("Datos recopilados:", personalData);
  return personalData;
}

// Función para validar datos antes del envío
function validarDatos(data) {
  const errores = [];

  // Validaciones básicas
  if (!data.PerNom || data.PerNom.trim() === "") {
    errores.push("El nombre es requerido");
  }

  if (!data.PerDoc || data.PerDoc.trim() === "") {
    errores.push("La cédula es requerida");
  }

  if (!data.PerTipoDoc || data.PerTipoDoc === "") {
    errores.push("El tipo de documento es requerido");
  }

  if (!data.PerGen || data.PerGen === "") {
    errores.push("El género es requerido");
  }

  if (!data.PerTel || data.PerTel.trim() === "") {
    errores.push("El contacto es requerido");
  }

  if (!data.PerOrgSec || data.PerOrgSec === 0) {
    errores.push("La organización es requerida");
  }

  if (!data.localSec || data.localSec === 0) {
    errores.push("La comuna es requerida");
  }

  // Validar formato de cédula (solo números)
  if (data.PerDoc && !/^\d+$/.test(data.PerDoc)) {
    errores.push("La cédula debe contener solo números");
  }

  // Validar formato de teléfono (básico)
  /*if (data.contacto && !/^\d{7,10}$/.test(data.contacto)) {
        errores.push('El contacto debe ser un número de 7 a 10 dígitos');
    }*/

  // Validar fechas
  if (data.PerFechNa && !isValidDate(data.PerFechNa)) {
    errores.push("La fecha de nacimiento no es válida");
  }

  return {
    isValid: errores.length === 0,
    message: errores.length > 0 ? errores.join(", ") : "Datos válidos",
    errores: errores,
  };
}









// Función para enviar datos al API
async function enviarPersonalAPI(personalData) {
  try {
    console.log("Enviando datos al API:", personalData);

    const response = await fetch(
      "/api/personal/personal/crear",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personalData),
      }
    );

    const data = await response.json();

    console.log("Respuesta del API:", data);

    const url = new URL(window.location);

    if (url.searchParams.get("id") == 0) {
      url.searchParams.set("id", data.data.id);
      window.history.pushState({}, "", url);
        setTimeout(initializeTabs, 100);
    }


    return data;
  } catch (error) {
    console.error("Error enviando al API:", error);
    return {
      success: false,
      message: "Error de conexión con el servidor",
    };
  }
}

// Función para obtener el ID del usuario actual
function getCurrentUserId() {
  // Aquí debes implementar tu lógica para obtener el ID del usuario
  // Puede ser desde localStorage, sessionStorage, una variable global, etc.

  // Ejemplo:
  return (
    localStorage.getItem("userId") ||
    sessionStorage.getItem("userId") ||
    window.currentUser?.id ||
    "USR001"
  ); // Valor por defecto para testing
}

// Función para validar fechas
function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Función para mostrar notificaciones
function showNotification(message, type = "info") {
  // Implementación simple con alert
  // Puedes reemplazar con tu sistema de notificaciones


  // Alternativa más elegante (requiere CSS)
  
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '1001',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        fontSize: '14px'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },3000);
    
}

// Función para actualizar caché de personal (opcional)
async function actualizarCachePersonal() {}

// Función adicional para precargar datos en el formulario (opcional)
function precargarFormulario(personalData) {
  const form = document.getElementById("encuestadoForm");
  if (!form || !personalData) return;

  // Precargar campos del formulario con datos existentes
  Object.entries(personalData).forEach(([key, value]) => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) {
      field.value = value;
    }
  });
}

// Función para limpiar formulario manualmente
function limpiarFormulario() {
  const form = document.getElementById("encuestadoForm");
  if (form) {
    form.reset();

    // Restaurar selects a su valor por defecto
    const selects = form.querySelectorAll("select");
    selects.forEach((select) => {
      const defaultOption = select.querySelector("option[selected]");
      if (defaultOption) {
        select.value = defaultOption.value;
      }
    });
  }
}








// Función principal para obtener y llenar formulario
async function cargarPersonalEnFormulario(personalId) {
    try {
        console.log(`Cargando personal ID: ${personalId}`);
        
        // Mostrar loading
        mostrarLoadingFormulario();
        
        // Obtener datos del API
        const personalData = await obtenerPersonalPorId(personalId);
        
        if (personalData) {
            // Llenar formulario con los datos
            llenarFormularioPersonal(personalData);
            
   
            showNotification('Datos cargados exitosamente', 'success');
        } else {
            showNotification('No se encontraron datos para este ID', 'error');
        }
        
    } catch (error) {
        console.error('Error cargando personal:', error);
        showNotification('Error cargando los datos', 'error');
    } finally {
        ocultarLoadingFormulario();
    }
}








// Función para obtener datos del API
async function obtenerPersonalPorId(id) {
    try {
        const response = await fetch('/api/personal/personal/obtenerId', {
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
     if (personalData.foto) {
        window.PhotoManager.loadPhotoFromBase64(personalData.foto);
    }

    console.log("personalData.PerMilitar"+personalData.PerMilitar)
    // Mapeo de campos API a campos del formulario
    let camposMapeados = {
        // Campos básicos
     
  'PerNom': personalData.PerNom,

  'PerGen': personalData.PerGen,
  'PerTipoDoc': personalData.PerTipoDoc,
  'PerDoc': personalData.PerDoc,
  'PerTipRH': personalData.PerTipRH,
  'PerPais': personalData.PerPais,
  'PerTel': personalData.PerTel,
  'PerEstado': personalData.PerEstado,
  'PerOrgSec': personalData.PerOrgSec,
  'PerFechNa': formatearFechaParaInput(personalData.PerFechNa),
  'localSec': personalData.localSec,

  // Dirección y datos generales
  'PerBar': personalData.PerBar,
  'PerDir': personalData.PerDir,
  'PerEstCivil': personalData.PerEstCivil,
  'PerEstrato': personalData.PerEstrato,
  'PerMilitar': personalData.PerMilitar,
  'PerHogar': personalData.PerHogar,

  // Condiciones
  'PerHabCa': personalData.PerHabCa,
  'PerDis': personalData.PerDis,

  // Vinculación
  'PerTipVinAno': personalData.PerTipVinAno,
  'PerTipVinMes': personalData.PerTipVinMes,

  // Disponibilidad horaria
  'PerDisHorAct': personalData.PerDisHorAct,
  'PerDisHorHor': personalData.PerDisHorHor,

  // Jornadas / días (checkbox → "X" o "")
  // 'PerDiTraJorAm': personalData.PerDiTraJorAm ? "X" : "",
  // 'PerDiTraJorPm': personalData.PerDiTraJorPm ? "X" : "",
  // 'PerDiTraLu': personalData.PerDiTraLu ? "X" : "",
  // 'PerDiTraMar': personalData.PerDiTraMar ? "X" : "",
  // 'PerDiTraMie': personalData.PerDiTraMie ? "X" : "",
  // 'PerDiTraJue': personalData.PerDiTraJue ? "X" : "",
  // 'PerDiTraVie': personalData.PerDiTraVie ? "X" : "",
  // 'PerDiTraSab': personalData.PerDiTraSab ? "X" : "",
  // 'PerDiTraDom': personalData.PerDiTraDom ? "X" : ""
    };
    console.log("PerDiTraJorPm "+personalData.tarde)
    document.getElementById("PerDiTraJorAm").checked = (personalData.PerDiTraJorAm  === "X");
    document.getElementById("PerDiTraJorPm").checked = (personalData.tarde  === "X");
    document.getElementById("PerDiTraLu").checked = (personalData.PerDiTraLu  === "X");
    document.getElementById("PerDiTraMar").checked = (personalData.PerDiTraMar  === "X");
    document.getElementById("PerDiTraMie").checked = (personalData.PerDiTraMie  === "X");
    document.getElementById("PerDiTraJue").checked = (personalData.PerDiTraJue  === "X");
    document.getElementById("PerDiTraVie").checked = (personalData.PerDiTraVie  === "X");
    document.getElementById("PerDiTraSab").checked = (personalData.PerDiTraSab  === "X");
    document.getElementById("PerDiTraDom").checked = (personalData.PerDiTraDom  === "X");




    document.getElementById('PerNom').value = personalData.PerNom;
 
       document.getElementById('PerDoc').value = personalData.PerDoc;
    // Llenar cada campo
    Object.entries(camposMapeados).forEach(([nombreCampo, valor]) => {
        const campo = form.querySelector(`[name="${nombreCampo}"]`);
        
        if (campo && valor !== null && valor !== undefined) {
            campo.value = valor;
            
            // Logging para debugging
            console.log(`Llenando ${nombreCampo}: ${valor}`);
        }
    });
    
    // Guardar ID para posterior actualización
    form.dataset.personalId = personalData.id;
    
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


// Función para mostrar loading en formulario
function mostrarLoadingFormulario() {
    const form = document.getElementById('encuestadoForm');
  
}

// Función para ocultar loading
function ocultarLoadingFormulario() {
    const form = document.getElementById('encuestadoForm');
    


}

// Función para cargar desde parámetro URL
function cargarDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    const personalId = params.get('id');
    
    if (personalId > 0) {
        cargarPersonalEnFormulario(personalId);
    }
}












// Exportar funciones para uso global
window.EncuestadoForm = {
  handleFormSubmit,
  precargarFormulario,
  limpiarFormulario,
  validarDatos,
  enviarPersonalAPI,
};
