// Variables globales
let currentFormData = null;
let urlpar;
let questions = []; // Para mantener compatibilidad con tu código existente
// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", function () {
  // Esperar un poco para asegurar que los tabs estén renderizados
  
    const url = new URL(window.location);

    if (url.searchParams.get("id") == 0) {

    }else{
      urlpar = url.searchParams.get("id")
  setTimeout(initializeTabs, 100);
    }

});
// Función principal para manejar click en tabs
function handleTabClick(tab) {
 const url = new URL(window.location);

    if (url.searchParams.get("id") == 0) {
  showNotification("Debe crear la información personal", "error");
    }else{
       const isMobile = window.innerWidth <= 768;
        const isDesktop = window.innerWidth > 768;



  const tabId = tab.getAttribute("data-id");
  const leftPanel = document.getElementById("left-panel");
  const contentContainer = document.getElementById("content-container");
  // Remover active de todos los tabs
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));

  // Activar tab clickeado
  tab.classList.add("active");

  if (!tabId || tabId === "personal") {
    if(isMobile){
    contentContainer.style.display = "none";
    leftPanel.style.display = "flex";
    }

  } else {
      if(isMobile){
  contentContainer.style.display = "flex";
    leftPanel.style.display = "none";
    }
  
    // Tab con data-id - cargar formulario desde API
    loadFormularioFromAPI(tabId, tab.textContent.trim());
  }
    }

   
}
function initializeTabs() {
  // Buscar el primer tab que no sea personal
  const nonPersonalTab =
    document.querySelector('.tab[data-id]:not([data-id="personal"])') ||
    document.querySelector(".tab:not(:first-child)"); // Fallback al segundo tab

  if (nonPersonalTab) {
    // Activar el tab encontrado
    handleTabClick(nonPersonalTab);
  } else {
    // Si no hay tabs disponibles, mantener el personal activo
    const personalTab =
      document.querySelector(".tab:not([data-id])") ||
      document.querySelector('.tab[data-id="personal"]') ||
      document.querySelector(".tab:first-child");

    if (personalTab) {
      personalTab.classList.add("active");
    }
  }
}
// Función para cargar formulario desde API
async function loadFormularioFromAPI(catFormSec, tabName) {
  try {
    // Mostrar loading
    showLoadingInContent(tabName);

    // Llamar al API
    const response = await fetch(
      "/api/forms/wsObtenerFormulario/" + catFormSec+"/"+urlpar
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Error al cargar formulario");
    }

    // Guardar datos del formulario
    currentFormData = data.formulario;
    questions = data.formulario.preguntas; // Actualizar variable global

    // Renderizar formulario en el contenido
    renderFormularioContent(data.formulario, tabName);
  } catch (error) {
    console.error("Error cargando formulario:", error);
    showErrorInContent(error.message, tabName);
  }
}

// Función para mostrar loading
function showLoadingInContent(tabName) {
  const contentContainer = getContentContainer();
  contentContainer.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <h3>${tabName}</h3>
            <p>Cargando formulario...</p>
        </div>
    `;
}

// Función para mostrar error
function showErrorInContent(errorMessage, tabName) {
  const contentContainer = getContentContainer();
  contentContainer.innerHTML = `
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h3>${tabName}</h3>
            <p class="error-message">Error: ${errorMessage}</p>
            <button onclick="retryLoadForm()" class="retry-btn">Reintentar</button>
        </div>
    `;
}

// Función para renderizar contenido del formulario
function renderFormularioContent(formulario, tabName) {
  const contentContainer = getContentContainer();
  const { categoria, preguntas } = formulario;

  contentContainer.innerHTML = `
  <form id="${categoria.id}"> 
        <div class="formulario-content">
            <div class="formulario-header">
                <h3>${categoria.titulo || tabName}</h3>
                <p class="formulario-descripcion">${
                  categoria.descripcion ||
                  "Formulario cargado desde base de datos"
                }</p>
                <div class="formulario-meta">
                    <span class="form-id">ID: ${categoria.id}</span>
                    <span class="question-count">${
                      preguntas.length
                    } preguntas</span>
                </div>
            </div>
            

            
            <div class="formulario-preview">
                <div class="form-grid">
                    ${preguntas
                      .map((pregunta, index) =>
                        renderExecutableField(pregunta, index)
                      )
                      .join("")}
                </div>
            </div>

                        <div class="formulario-actions">
                <button  form="${categoria.id}" class="btn-ejecutar">
                   Guardar
                </button>

            </div>
        </div>

</form>
    `;

   const form = document.getElementById(categoria.id);
   // Agregar event listener para el submit
     
preguntas.forEach((pregunta) => {
    const campo = form.querySelector(`[name="${pregunta.id}"]`);
    
    if (campo && pregunta.valor !== null && pregunta.valor !== undefined) {
       
        if(pregunta.type == 'date'){
  campo.value =  formatearFechaParaInput(pregunta.valor);
        }  else if (pregunta.type == 'checkbox') {
            campo.checked = Boolean(pregunta.valor);
            
        }   else if (pregunta.type == 'radio') {
            const radioButton = form.querySelector(`[name="${pregunta.id}"][value="${pregunta.valor}"]`);
            if (radioButton) {
                radioButton.checked = true;
            }
        }
        
        
        
        else{
 campo.value = pregunta.valor;
        }
       
        
        // Logging para debugging
        console.log(`Llenando ${pregunta.id}: ${pregunta.valor}`);
    }
});



form.addEventListener('submit', function(event) {
    event.preventDefault(); // Previene el envío normal
    obtenerinfo(categoria.id) 
});

}





async function obtenerinfo(id){
  
   const form = document.getElementById(id);
      const datosParaAPI = [];
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
  inputs.forEach(input => {
        if (input.name) {
            let valor;
            let id = input.name;
            let tipo = input.type; // Obtener el tipo del input
            // Manejar checkboxes
            if (input.type === 'checkbox') {
                valor = input.checked;
                id = input.id;
                tipo = 'checkbox';
            }
            // Manejar radio buttons
            else if (input.type === 'radio') {
                if (input.checked) {
                    valor = input.value;
                    tipo = 'radio';
                } else {
                    return; // Skip si no está seleccionado
                }
            }
            // Detectar si es number
            else if (input.type === 'number') {
                valor = input.value ? Number(input.value) : null; // Convertir a número
                tipo = 'number';
                console.log(`Campo NUMBER detectado: ${input.name} = ${valor}`);
            }
            // Detectar si es date
            else if (input.type === 'date') {
                valor = input.value; // Ya viene en formato YYYY-MM-DD
                tipo = 'date';
                console.log(`Campo DATE detectado: ${input.name} = ${valor}`);
            }
            // Detectar otros tipos de fecha/hora
            else if (input.type === 'datetime-local') {
                valor = input.value;
                tipo = 'datetime-local';
                console.log(`Campo DATETIME detectado: ${input.name} = ${valor}`);
            }
            else if (input.type === 'time') {
                valor = input.value;
                tipo = 'time';
                console.log(`Campo TIME detectado: ${input.name} = ${valor}`);
            }
            else {
                // Otros tipos (text, email, password, etc.)
                valor = input.value;
            }
            
            // Agregar al array con el formato requerido
            datosParaAPI.push({
                perId: urlpar,
                tipo:tipo,
                id: id,
                valor: valor
            });


        }
    });
    


       try {

              console.log(JSON.stringify(datosParaAPI) );

                // Hacer petición de login
                const response = await fetch('/api/respuesta/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify(datosParaAPI) 
                });
                
                const data = await response.json();
                
                if (data.success) {

  showNotification("¡Formulario enviado exitosamente!", "success");
                    
                } else {
                    // Mostrar error
                   showNotification("Error en el registro", "error");
                }
                
            } catch (error) {
               console.log(error);
             showNotification(error, "error");

            }







}



function renderExecutableField(question, index) {
  const isFullWidth = ["textarea", "checkbox", "radio"].includes(question.type);
  const fieldClass = isFullWidth ? "form-field full-width" : "form-field";

  return `
                <div class="${fieldClass}">
                    <label class="form-label">
                        ${question.text}
                    </label>
                    ${getFieldHtml(question, "execute", false)}
                </div>
            `;
}

function getFieldHtml(question, mode, disabled) {
  const fieldName = question.id;
  const required = question.required && mode === "execute" ? "required" : "";
  const disabledAttr = disabled ? "disabled" : "";

  switch (question.type) {
    case "text":
    case "email":
    case "number":
    case "date":
      return `<input type="${question.type}" name="${fieldName}" class="form-input" placeholder="Ingresa tu respuesta" ${required} ${disabledAttr}>`;

    case "textarea":
      return `<textarea name="${fieldName}" class="form-input form-textarea" placeholder="Ingresa tu respuesta" ${required} ${disabledAttr}></textarea>`;

    case "select":
      return `
                        <select name="${fieldName}" class="form-input form-select" ${required} ${disabledAttr}>
                            <option value="">Selecciona una opción</option>
                            ${question.options
                              .map(
                                (option) =>
                                  `<option value="${option}">${option}</option>`
                              )
                              .join("")}
                        </select>
                    `;

    case "radio":
      return `
                        <div class="radio-group">
                            ${question.options
                              .map(
                                (option, i) => `
                                <div class="radio-item">
                                    <input type="radio" name="${fieldName}" value="${option}" id="${mode}_radio_'${question.id}'_${i}" ${required} ${disabledAttr}>
                                    <label for="${mode}_radio_'${question.id}'_${i}">${option}</label>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    `;

    case "checkbox":
      return `
                        <div class="checkbox-group">
                            ${question.options
                              .map(
                                (option, i) => `
                                <div class="checkbox-item">
                                    <input type="checkbox" name="${fieldName}[]" value="${option}" id="${mode}_check_'${question.id}'_${i}" ${disabledAttr}>
                                    <label for="${mode}_check_'${question.id}'_${i}">${option}</label>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    `;

    default:
      return `<input type="text" name="${fieldName}" class="form-input" placeholder="Respuesta" ${required} ${disabledAttr}>`;
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const results = {};

  // Procesar respuestas
  questions.forEach((question) => {
    const fieldName = `question_'${question.id}'`;

    if (question.type === "checkbox") {
      results[question.text] = formData.getAll(`${fieldName}[]`);
    } else {
      results[question.text] = formData.get(fieldName) || "";
    }
  });

  displayResults(results);
}

function displayResults(results) {
  const resultsDiv = document.getElementById("formResults");
  const resultsContent = document.getElementById("resultsContent");

  resultsContent.innerHTML = Object.entries(results)
    .map(
      ([question, answer]) => `
                <div class="result-item">
                    <div class="result-label">${question}</div>
                    <div class="result-value">
                        ${
                          Array.isArray(answer)
                            ? answer.length > 0
                              ? answer.join(", ")
                              : "Sin respuesta"
                            : answer || "Sin respuesta"
                        }
                    </div>
                </div>
            `
    )
    .join("");

  resultsDiv.style.display = "block";

  // Guardar resultados globalmente para exportar
  window.currentResults = {
    formTitle:
      document.getElementById("formTitle").value || "Formulario sin título",
    submissionDate: new Date().toISOString(),
    responses: results,
  };

  showNotification("¡Formulario enviado exitosamente!", "success");
}

// Función para ejecutar formulario cargado
function executeLoadedForm() {
  if (!currentFormData || !questions.length) {
    showNotification("No hay formulario cargado para ejecutar", "error");
    return;
  }

  const { categoria } = currentFormData;

  const form = document.getElementById("executableForm");

  // Determinar si necesita grid de 2 columnas
  const needsGrid = questions.some((q) =>
    ["text", "email", "number", "date", "select"].includes(q.type)
  );

  form.innerHTML = `
        <div class="${needsGrid ? "form-grid" : "form-grid single-column"}">
            ${questions
              .map((question, index) => renderExecutableField(question, index))
              .join("")}
        </div>
    `;

  // Agregar event listener para el envío del formulario
  form.removeEventListener("submit", handleFormSubmit);
  form.addEventListener("submit", handleFormSubmit);

  openModal("executeModal");
}

// Función auxiliar para obtener etiqueta del tipo
function getTypeLabel(type) {
  const labels = {
    text: "Texto",
    email: "Email",
    number: "Número",
    date: "Fecha",
    textarea: "Área de texto",
    select: "Selección",
    radio: "Opción única",
    checkbox: "Múltiple selección",
  };
  return labels[type] || type;
}

// Función auxiliar para obtener contenedor
function getContentContainer() {
  return (
    document.getElementById("content-container") ||
    document.querySelector(".tab-content") ||
    document.querySelector(".formulario-content-area")
  );
}

// Función para reintentar carga
function retryLoadForm() {
  const activeTab = document.querySelector(".tab.active");
  if (activeTab) {
    handleTabClick(activeTab);
  }
}

// Modificar el event listener de tabs para usar la nueva función
document.addEventListener("DOMContentLoaded", function () {

});

// Función modificada para el resize que funciona con el nuevo sistema
window.addEventListener("resize", function () {
  const isMobile = window.innerWidth <= 768;
  const isDesktop = window.innerWidth > 768;

  if (isDesktop) {
    // Generar formulario en el panel izquierdo
    if (typeof leftPanel !== "undefined" && typeof generarForm === "function") {
    }

    // Manejar cambio de tabs en desktop
    handleDesktopTabSwitch();
  } else if (isMobile) {
    if (typeof leftPanel !== "undefined") {
      leftPanel.innerHTML = "";
    }
  }
});

function handleDesktopTabSwitch() {
  // Buscar tab Personal
  const personalTab =
    document.querySelector(".tab:not([data-id])") ||
    document.querySelector('.tab[data-id="personal"]');

  if (personalTab && personalTab.classList.contains("active")) {
    personalTab.classList.remove("active");

    // Buscar primer tab con data-id
    const firstDataTab = document.querySelector(
      '.tab[data-id]:not([data-id="personal"])'
    );

    if (firstDataTab) {
      // Activar y cargar contenido
      handleTabClick(firstDataTab);
    }
  }
}

// CSS adicional para los estilos
const xadditionalStyles = `
    .loading-content, .error-content {
        text-align: center;
        padding: 40px 20px;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .formulario-content {
        padding: 20px;
    }
    
  
    .btn-ejecutar, .btn-preview {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
    }
    
    .btn-ejecutar {
        background: #007bff;
        color: white;
    }
    
    .btn-preview {
        background: #6c757d;
        color: white;
    }
 
    .question-item {
        border: 1px solid #eee;
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 10px;
    }
    
    .question-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
    }
    
    .question-number {
        background: #007bff;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
    }
    
    .question-type {
        background: #e9ecef;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        text-transform: uppercase;
    }
    
    .required-badge {
        background: #dc3545;
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
    }
    
    .error-icon {
        font-size: 48px;
        margin-bottom: 15px;
    }
    
    .retry-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
    }
`;

// Agregar estilos al documento
const xstyleSheet = document.createElement("style");
xstyleSheet.textContent = xadditionalStyles;
document.head.appendChild(xstyleSheet);





