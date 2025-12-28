let questions = [];
let questionCounter = 1;
const urlParams = new URLSearchParams(window.location.search);
let pcatFormSec = urlParams.get("id") || urlParams.get("catFormSec");
// Inicializar con datos de ejemplo
function initializeForm() {
  renderForm();
}

function addQuestion(type = "text", text = "", required = false) {
  const question = {
    id: generateCustomId(),
    type: type,
    text: text || `Pregunta ${questionCounter}`,
    required: required,
    options: type === "checkbox" || type === "radio" ? ["Opción 1"] : [],
  };

  questions.push(question);
  questionCounter++;
  renderForm();
  return question;
}
function generateCustomId(options = {}) {
  const {
    length = 20,
    includeNumbers = true,
    includeUppercase = true,
    includeLowercase = true,
    includeSpecial = false,
    prefix = "FORM",
    suffix = "",
  } = options;

  let chars = "";
  if (includeNumbers) chars += "0123456789";
  if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
  if (includeSpecial) chars += "!@#$%^&*";

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix + result + suffix;
}
function deleteQuestion(id) {
  questions = questions.filter((q) => q.id !== id);
  
  fetch(`/api/forms/DeleteQ/${pcatFormSec}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Error en la petición");
      return response.json();
    })
    .then((data) => {
           showNotification(data.message, "error");
      console.log("Respuesta del servidor:", data);
    })
    .catch((err) => {
      console.error("Error en fetch:", err);
    });

  renderForm();
}

function updateQuestion(id, field, value) {
  const question = questions.find((q) => q.id === id);
  if (question) {
    question[field] = value;

    // Si cambia el tipo, resetear opciones
    if (field === "type") {
      if (value === "checkbox" || value === "radio") {
        question.options = ["Opción 1"];
      } else {
        question.options = [];
      }
    }
  }
  renderForm();
}

function addOption(questionId) {
  const question = questions.find((q) => q.id === questionId);
  if (question) {
    question.options.push(`Opción ${question.options.length + 1}`);
    renderForm();
  }
}

function removeOption(questionId, optionIndex) {
  const question = questions.find((q) => q.id === questionId);
  if (question && question.options.length > 1) {
    question.options.splice(optionIndex, 1);
    renderForm();
  }
}

function updateOption(questionId, optionIndex, value) {
  const question = questions.find((q) => q.id === questionId);
  if (question) {
    question.options[optionIndex] = value;
  }
}

function renderForm() {
  const builder = document.getElementById("formBuilder");

  if (questions.length === 0) {
    builder.innerHTML = `
                    <div class="empty-state">
                        <h3>✨ Comienza creando tu primer pregunta</h3>
                        <p>Haz clic en "Agregar Pregunta" para empezar</p>
                    </div>
                `;
  } else {
    builder.innerHTML = questions
      .map(
        (question, index) => `
                    <div data-id="'${question.id}'" class="question-item">
                    <div>
                    
                        <div class="question-header">
                            <div class="question-number">Q. ${index + 1}</div>
                            <input type="text" class="question-input" value="${
                              question.text
                            }" 
                                   onchange="updateQuestion('${
                                     question.id
                                   }', 'text', this.value)">
                            <select class="question-type" onchange="updateQuestion('${
                              question.id
                            }', 'type', this.value)">
                                <option value="text" ${
                                  question.type === "text" ? "selected" : ""
                                }>Respuesta corta</option>
                                <option value="textarea" ${
                                  question.type === "textarea" ? "selected" : ""
                                }>Párrafo</option>
                               
                                <option value="radio" ${
                                  question.type === "radio" ? "selected" : ""
                                }>Opciones</option>
                                <option value="select" ${
                                  question.type === "select" ? "selected" : ""
                                }>Lista desplegable</option>
                                <option value="number" ${
                                  question.type === "number" ? "selected" : ""
                                }>Número</option>
                                <option value="email" ${
                                  question.type === "email" ? "selected" : ""
                                }>Email</option>
                                <option value="date" ${
                                  question.type === "date" ? "selected" : ""
                                }>Fecha</option>
                            </select>
                        </div>

                            ${
                              question.type === "checkbox" ||
                              question.type === "radio" ||
                              question.type === "select"
                                ? `
                            <div class="options-container">
                                <strong>Opciones:</strong>
                                ${question.options
                                  .map(
                                    (option, optionIndex) => `
                                    <div class="option-item">
                                        <span style="color: #64748b;">•</span>
                                        <input type="text" class="option-input" value="${option}" 
                                               onchange="updateOption('${
                                                 question.id
                                               }', ${optionIndex}, this.value)">
                                        ${
                                          question.options.length > 1
                                            ? `
                                            <button class="btn btn-danger btn-small" 
                                                    onclick="removeOption('${question.id}', ${optionIndex})">×</button>
                                        `
                                            : ""
                                        }
                                    </div>
                                `
                                  )
                                  .join("")}
                                <button class="btn btn-secondary btn-small" onclick="addOption('${
                                  question.id
                                }')">
                                    + Agregar opción
                                </button>
                            </div>
                        `
                                : ""
                            }
    </div>
                        <div class="question-controls">
                            <div class="order-controls">
                                <button class="btn-order" onclick="moveQuestion('${
                                  question.id
                                }', 'up')" 
                                        ${
                                          index === 0 ? "disabled" : ""
                                        } title="Subir">↑</button>
                                <button class="btn-order" onclick="moveQuestion('${
                                  question.id
                                }', 'down')" 
                                        ${
                                          index === questions.length - 1
                                            ? "disabled"
                                            : ""
                                        } title="Bajar">↓</button>
                            </div>
                                <button class="delete-question" onclick="deleteQuestion('${
                                  question.id
                                }')"><i class="fa-solid fa-trash-can"></i></button>
                            <div class="required-toggle">
                                <span>Requerido</span>
                                
                                <div class="switch ${
                                  question.required ? "active" : ""
                                }" 
                                     onclick="updateQuestion('${
                                       question.id
                                     }', 'required', ${!question.required})"></div>
                         
                            </div>
                        </div>


                    
                    </div>
                `
      )
      .join("");
  }
  /* <option value="checkbox" ${
                                  question.type === "checkbox" ? "selected" : ""
                                }>Casillas</option> */
  //    <span style="color: ${question.required ? '#168fff' : '#64748b'};">
  //                     ${question.required ? 'Este campo es requerido' : 'Campo opcional'}
  //                 </span>
  updateQuestionCount();
}

function updateQuestionCount() {
  document.getElementById("questionCount").textContent = questions.length;
}

function moveQuestion(id, direction) {
  const currentIndex = questions.findIndex((q) => q.id === id);
  if (currentIndex === -1) return;

  let newIndex;
  if (direction === "up" && currentIndex > 0) {
    newIndex = currentIndex - 1;
  } else if (direction === "down" && currentIndex < questions.length - 1) {
    newIndex = currentIndex + 1;
  } else {
    return; // No se puede mover
  }

  // Intercambiar posiciones
  [questions[currentIndex], questions[newIndex]] = [
    questions[newIndex],
    questions[currentIndex],
  ];

  renderForm();
  showNotification(
    `Pregunta movida ${direction === "up" ? "arriba" : "abajo"}`,
    "success"
  );
}

function importForm(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importData = JSON.parse(e.target.result);

      if (importData.formulario && Array.isArray(importData.formulario)) {
        // Formato nuevo - array de preguntas
        const formulariosArray = importData.formulario;
        const opcionesArray = importData.formulario_opciones || [];

        // Obtener título y descripción del metadata o primera pregunta
        const metadata = importData.metadata || {};
        document.getElementById("formTitle").value =
          metadata.form_title || "Formulario Importado";
        document.getElementById("formDescription").value =
          metadata.form_description || "";

        // Reconstruir preguntas desde el array
        questions = formulariosArray.map((formRow) => {
          const preguntaId = formRow.FormSec;

          // Encontrar opciones para esta pregunta
          const opcionesParaEsta = opcionesArray
            .filter((opt) => opt.FormSec === preguntaId)
            .map((opt) => opt.FormOp);

          // Parsear FormJson si existe
          let questionData = {};
          try {
            const parsedJson = JSON.parse(formRow.FormJson || "{}");
            questionData = parsedJson.questionData || {};
          } catch (e) {
            console.warn("Error parsing FormJson for question:", preguntaId);
          }

          return {
            id: questionData.id || Date.now() + Math.random(),
            type: formRow.FormTipo || "text",
            text: formRow.FormPregunta || "Pregunta sin título",
            required: formRow.FormReq || false,
            options: opcionesParaEsta,
          };
        });

        // Ordenar por FormOrden si existe
        if (formulariosArray[0]?.FormOrden !== undefined) {
          const ordenMap = {};
          formulariosArray.forEach((f) => {
            ordenMap[f.FormSec] = f.FormOrden;
          });

          questions.sort((a, b) => {
            const orderA =
              ordenMap[
                formulariosArray.find((f) => f.FormPregunta === a.text)?.FormSec
              ] || 0;
            const orderB =
              ordenMap[
                formulariosArray.find((f) => f.FormPregunta === b.text)?.FormSec
              ] || 0;
            return orderA - orderB;
          });
        }
      } else if (
        importData.formulario &&
        typeof importData.formulario === "object"
      ) {
        // Formato anterior - objeto único
        document.getElementById("formTitle").value =
          importData.formulario.FormPregunta || "Formulario Importado";

        try {
          const formJson = JSON.parse(importData.formulario.FormJson || "{}");
          document.getElementById("formDescription").value =
            formJson.description || "";

          if (formJson.questions) {
            questions = formJson.questions.map((q) => ({
              id: q.id || Date.now() + Math.random(),
              type: q.type || "text",
              text: q.text || "Pregunta",
              required: q.required || false,
              options: q.options || [],
            }));
          }
        } catch (error) {
          console.error("Error parsing legacy FormJson:", error);
          questions = [];
        }
      } else if (importData.questions) {
        // Formato legacy original
        document.getElementById("formTitle").value =
          importData.title || "Formulario Importado";
        document.getElementById("formDescription").value =
          importData.description || "";
        questions = importData.questions;
      } else {
        throw new Error("Formato no válido - se esperaba array de preguntas");
      }

      questionCounter =
        Math.max(
          ...questions.map((q) => {
            const match = q.text.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          }),
          0
        ) + 1;

      renderForm();
      showNotification(
        `Importadas ${questions.length} preguntas correctamente`,
        "success"
      );
    } catch (error) {
      console.error("Error al importar:", error);
      showNotification("Error: " + error.message, "error");
    }
  };

  reader.readAsText(file);
  event.target.value = "";
}

function clearForm() {
  if (confirm("¿Estás seguro de que quieres limpiar todo el formulario?")) {
    questions = [];
    questionCounter = 1;
    renderForm();
    showNotification("Formulario limpiado completamente", "success");
  }
}


function VolverCat(){
    window.location.href = 'Categorias.html'
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Inicializar la aplicación
initializeForm();

// Funciones para modales
function openModal(modalId) {
  document.getElementById(modalId).classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("show");
  document.body.style.overflow = "auto";
}

// Cerrar modal al hacer clic fuera
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal")) {
    closeModal(e.target.id);
  }
});

// Vista previa del formulario
function previewForm() {
  if (questions.length === 0) {
    showNotification(
      "Agrega al menos una pregunta para ver la vista previa",
      "error"
    );
    return;
  }

  const title =
    document.getElementById("formTitle").value || "Formulario sin título";
  const description = document.getElementById("formDescription").value;

  const previewContent = document.getElementById("previewContent");

  // Determinar si necesita grid de 2 columnas
  const needsGrid = questions.some((q) =>
    ["text", "email", "number", "date", "select"].includes(q.type)
  );

  previewContent.innerHTML = `
                <div class="${
                  needsGrid ? "form-grid" : "form-grid single-column"
                }">
                    ${questions
                      .map((question, index) =>
                        renderPreviewField(question, index)
                      )
                      .join("")}
                </div>
            `;

  openModal("previewModal");
}

// Ejecutar formulario funcional
function executeForm() {
  if (questions.length === 0) {
    showNotification(
      "Agrega al menos una pregunta para ejecutar el formulario",
      "error"
    );
    return;
  }

  const title =
    document.getElementById("formTitle").value || "Formulario sin título";
  const description = document.getElementById("formDescription").value;

  // Actualizar título y subtítulo del modal
  document.getElementById("executeFormTitle").textContent = title;
  document.getElementById("executeFormSubtitle").textContent =
    description || "Completa la información solicitada";

  const form = document.getElementById("executableForm");

  // Determinar si necesita grid de 2 columnas
  const needsGrid = questions.some((q) =>
    ["text", "email", "number", "date", "select"].includes(q.type)
  );

  form.innerHTML = `
                <div class="${
                  needsGrid ? "form-grid" : "form-grid single-column"
                }">
                    ${questions
                      .map((question, index) =>
                        renderExecutableField(question, index)
                      )
                      .join("")}
                </div>
            `;

  // Agregar event listener para el envío del formulario
  form.removeEventListener("submit", handleFormSubmit); // Remover listener previo
  form.addEventListener("submit", handleFormSubmit);

  openModal("executeModal");
}

function renderPreviewField(question, index) {
  const isFullWidth = ["textarea", "checkbox", "radio"].includes(question.type);
  const fieldClass = isFullWidth ? "form-field full-width" : "form-field";

  return `
                <div class="${fieldClass}">
                    <label class="form-label ${
                      question.required ? "required" : ""
                    }">
                        ${question.text}
                    </label>
                    ${getFieldHtml(question, "preview", false)}
                </div>
            `;
}

function renderExecutableField(question, index) {
  const isFullWidth = ["textarea", "checkbox", "radio"].includes(question.type);
  const fieldClass = isFullWidth ? "form-field full-width" : "form-field";

  return `
                <div class="${fieldClass}">
                    <label class="form-label ${
                      question.required ? "required" : ""
                    }">
                        ${question.text}
                    </label>
                    ${getFieldHtml(question, "execute", false)}
                </div>
            `;
}

function getFieldHtml(question, mode, disabled) {
  const fieldName =
    mode === "execute"
      ? `question_'${question.id}'`
      : `preview_'${question.id}'`;
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

function exportResults() {
  if (!window.currentResults) {
    showNotification("No hay resultados para exportar", "error");
    return;
  }

  const respuestaId = Math.floor(Math.random() * 1000000);
  const formId = 1001; // En producción vendría del formulario actual
  const now = new Date();

  // Respuesta principal para MySQL
  const formularioRespuesta = {
    RespuestaSec: respuestaId,
    FormSec: formId,
    UsuarioId: `user_${Date.now()}`,
    FechaRespuesta: now.toISOString(),
    RespuestaJson: JSON.stringify(window.currentResults.responses),
    EstadoRespuesta: "completa",
    MetadatosUsuario: JSON.stringify({
      userAgent: navigator.userAgent,
      timestamp: now.toISOString(),
      sessionId: `session_${Date.now()}`,
    }),
  };

  // Respuestas detalladas para MySQL
  const respuestasDetalle = [];
  let detalleId = 1;

  Object.entries(window.currentResults.responses).forEach(
    ([preguntaTexto, respuestaValor]) => {
      const questionObj = questions.find((q) => q.text === preguntaTexto);
      const orden = questions.findIndex((q) => q.text === preguntaTexto) + 1;

      // Procesar respuesta según tipo
      let valorFinal = null;
      if (Array.isArray(respuestaValor) && respuestaValor.length > 0) {
        valorFinal = respuestaValor.join("|"); // Separar múltiples opciones
      } else if (respuestaValor && respuestaValor.trim() !== "") {
        valorFinal = respuestaValor;
      }

      respuestasDetalle.push({
        DetalleSec: detalleId++,
        RespuestaSec: respuestaId,
        PreguntaId: questionObj ? questionObj.id : null,
        PreguntaTexto: preguntaTexto,
        RespuestaValor: valorFinal,
        TipoRespuesta: questionObj ? questionObj.type : "text",
        OrdenPregunta: orden,
      });
    }
  );

  // Estructura final para respuestas
  const exportData = {
    formulario_respuesta: formularioRespuesta,
    respuestas_detalle: respuestasDetalle,
    metadata: {
      exported_at: now.toISOString(),
      total_questions: respuestasDetalle.length,
      answered_questions: respuestasDetalle.filter(
        (r) => r.RespuestaValor !== null
      ).length,
      completion_rate: Math.round(
        (respuestasDetalle.filter((r) => r.RespuestaValor !== null).length /
          respuestasDetalle.length) *
          100
      ),
    },
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `respuesta_${respuestaId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Respuestas exportadas para MySQL", "success");
}

function resetForm() {
  document.getElementById("executableForm").reset();
  document.getElementById("formResults").style.display = "none";
  window.currentResults = null;
}

// Modificar la función exportForm existente
function exportForm() {
  const baseFormSec = Math.floor(Math.random() * 100000);
  const formTitle =
    document.getElementById("formTitle").value || "Formulario sin título";
  const formDescription =
    document.getElementById("formDescription").value || "";
  const urlParams = new URLSearchParams(window.location.search);
  let CatFormSec = urlParams.get("id") || urlParams.get("catFormSec");

  // Cada pregunta es una fila en la tabla Formulario
  const formulario = questions.map((question, index) => ({
    FormSec: question.id,
    CatFormSec: CatFormSec,
    FormPregunta: question.text,
    FormTipo: question.type,
    FormJson: JSON.stringify({
      formTitle: formTitle,
      formDescription: formDescription,
      questionData: {
        id: question.id,
        required: question.required,
        placeholder: `Respuesta para: ${question.text}`,
        validation: question.required ? "required" : "optional",
      },
    }),
    FormReq: question.required,
    FormOrden: index + 1,
  }));

  // Opciones para preguntas que las tienen
  const formularioOpciones = [];
  let opcionId = 1;

  questions.forEach((question, questionIndex) => {
    if (question.options && question.options.length > 0) {
      const formSec = question.id;
      question.options.forEach((option) => {
        formularioOpciones.push({
          FormOpSec: opcionId++,
          FormSec: formSec,
          FormOp: option,
        });
      });
    }
  });

  // Ahora sí tienes las variables definidas
  const exportData = {
    formulario: formulario,
    formulario_opciones: formularioOpciones,
  };

  // Aquí puedes elegir: exportar archivo O enviar a backend
  // OPCIÓN A: Exportar como archivo (código actual)
  exportToFile(exportData, CatFormSec);

  // OPCIÓN B: Enviar a backend
  // saveFormToDatabase(exportData);
}

// Función separada para exportar archivo
function exportToFile(exportData, baseFormSec) {
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `formulario_preguntas_${baseFormSec}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification(
    `Exportadas ${exportData.formulario.length} preguntas`,
    "success"
  );
}

// Agregar botón "Guardar en BD"
function saveFormToDatabase(exportData) {
  console.log("Enviando datos:", exportData); // Debug

  fetch("/api/forms/save/" + pcatFormSec, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exportData),
  })
    .then((response) => {
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Verificar si la respuesta tiene contenido
      return response.text(); // Cambiar a text() primero
    })
    .then((text) => {
      console.log("Raw response:", text); // Ver qué llega

      if (!text) {
        throw new Error("Respuesta vacía del servidor");
      }

      try {
        const data = JSON.parse(text);
        if (data.success) {
          showNotification("Formulario guardado en BD", "success");
        } else {
          showNotification("Error: " + data.message, "error");
        }
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        console.error("Text received:", text);
        showNotification("Error: Respuesta inválida del servidor", "error");
      }
    })
    .catch((error) => {
      console.error("Error completo:", error);
      showNotification("Error de conexión: " + error.message, "error");
    });
}

function saveToDatabase() {
  if (questions.length === 0) {
    showNotification("Agrega al menos una pregunta para guardar", "error");
    return;
  }

  // Reutilizar la lógica de exportForm pero para BD
  const baseFormSec = Math.floor(Math.random() * 100000);
  const formTitle =
    document.getElementById("formTitle").value || "Formulario sin título";
  const formDescription =
    document.getElementById("formDescription").value || "";

  const urlParams = new URLSearchParams(window.location.search);
  let CatFormSec = urlParams.get("id") || urlParams.get("catFormSec");

  const formulario = questions.map((question, index) => ({
    FormSec: question.id,
    CatFormSec: CatFormSec,
    FormPregunta: question.text,
    FormTipo: question.type,
    FormJson: JSON.stringify({
      formTitle: formTitle,
      formDescription: formDescription,
      questionData: {
        id: question.id,
        required: question.required,
      },
    }),
    FormReq: question.required,
    FormOrden: index + 1,
  }));

  const formularioOpciones = [];
  let opcionId = 1;

  questions.forEach((question, questionIndex) => {
    if (question.options && question.options.length > 0) {
      const formSec = question.id;
      question.options.forEach((option) => {
        formularioOpciones.push({
          FormOpSec: opcionId++,
          FormSec: formSec,
          FormOp: option,
        });
      });
    }
  });

  const exportData = {
    formulario: formulario,
    formulario_opciones: formularioOpciones,
  };

  saveFormToDatabase(exportData);
}

// Función de prueba simple
function testConnection() {
  fetch("/api/test")
    .then((response) => {
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);
      return response.text(); // Cambiar a .text() primero
    })
    .then((data) => {
      console.log("Raw response:", data);
      try {
        const jsonData = JSON.parse(data);
        console.log("Parsed JSON:", jsonData);
      } catch (e) {
        console.log("No es JSON válido:", e);
      }
    })
    .catch((error) => {
      console.error("Error de red:", error);
    });
}
