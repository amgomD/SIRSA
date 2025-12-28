// Variables globales del formulario




    cargarFormulario(getIdFromURL() );


async function cargarFormulario(parametro) {
  const container = document.getElementById("encuestas");


  try {
    const response = await fetch(
      "/api/forms/wsObtenerFormulario/"+parametro
    );


    const data = await response.json();

    if (data.success) {
                // Procesar estructura
            const resultado = procesarDatosFormulario(data);

            
            // Extraer información básica
            const info = resultado.informacion;
            
            // Actualizar interfaz con información básica
            //document.title = info.titulo;

let iconoHtml = "";
  if (
    info.icono &&
    typeof info.icono === "string" &&
    info.icono.startsWith("data:image")
  ) {
    iconoHtml = `<img src="${info.icono}" alt="Ícono" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">`;
  } else {
    iconoHtml = `  <img style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;" src="img/LogoEncuesta.png" alt="">`;
  }


    if (document.getElementById('cardIcon')) {
                document.getElementById('cardIcon').innerHTML = iconoHtml;
            }

            if (document.getElementById('formTitle')) {
                document.getElementById('formTitle').value = info.titulo;
            }
            if (document.getElementById('formDescription')) {
                document.getElementById('formDescription').value = info.descripcion;
            }
            
            // Cargar preguntas en tu editor existente
            const preguntasParaEditor = data.formulario.preguntas;
        let json = {
                formulario: resultado.formulario,
                formulario_opciones: resultado.formulario_opciones
            };
       
importForm(json)
           
            
    } else {
  
    }
  } catch (error) {
    console.error("Error:", error);
  
  }
}



  function importForm(importData) {

                try {

                    
                    if (importData.formulario && Array.isArray(importData.formulario)) {
                        // Formato nuevo - array de preguntas
                        const formulariosArray = importData.formulario;
                        const opcionesArray = importData.formulario_opciones || [];
                        
                     
                        
                        // Reconstruir preguntas desde el array
                        questions = formulariosArray.map((formRow) => {
                            const preguntaId = formRow.FormSec;
                            
                            // Encontrar opciones para esta pregunta
                            const opcionesParaEsta = opcionesArray
                                .filter(opt => opt.FormSec === preguntaId)
                                .map(opt => opt.FormOp);
                            
                            // Parsear FormJson si existe
                            let questionData = {};
                            try {
                                const parsedJson = JSON.parse(formRow.FormJson || '{}');
                                questionData = parsedJson.questionData || {};
                            } catch (e) {
                                console.warn('Error parsing FormJson for question:', preguntaId);
                            }
                            
                            return {
                                id: questionData.id || Date.now() + Math.random(),
                                type: formRow.FormTipo || 'text',
                                text: formRow.FormPregunta || 'Pregunta sin título',
                                required: formRow.FormReq || false,
                                options: opcionesParaEsta
                            };
                        });
                        
                        // Ordenar por FormOrden si existe
                        if (formulariosArray[0]?.FormOrden !== undefined) {
                            const ordenMap = {};
                            formulariosArray.forEach(f => {
                                ordenMap[f.FormSec] = f.FormOrden;
                            });
                            
                            questions.sort((a, b) => {
                                const orderA = ordenMap[formulariosArray.find(f => f.FormPregunta === a.text)?.FormSec] || 0;
                                const orderB = ordenMap[formulariosArray.find(f => f.FormPregunta === b.text)?.FormSec] || 0;
                                return orderA - orderB;
                            });
                        }
                        
                    } else if (importData.formulario && typeof importData.formulario === 'object') {
                        // Formato anterior - objeto único
                        document.getElementById('formTitle').value = importData.formulario.FormPregunta || 'Formulario Importado';
                        
                        try {
                            const formJson = JSON.parse(importData.formulario.FormJson || '{}');
                            document.getElementById('formDescription').value = formJson.description || '';
                            
                            if (formJson.questions) {
                                questions = formJson.questions.map(q => ({
                                    id: q.id || Date.now() + Math.random(),
                                    type: q.type || 'text',
                                    text: q.text || 'Pregunta',
                                    required: q.required || false,
                                    options: q.options || []
                                }));
                            }
                        } catch (error) {
                            console.error('Error parsing legacy FormJson:', error);
                            questions = [];
                        }
                        
                    } else if (importData.questions) {
                        // Formato legacy original
                        document.getElementById('formTitle').value = importData.title || 'Formulario Importado';
                        document.getElementById('formDescription').value = importData.description || '';
                        questions = importData.questions;
                    } else {
                        throw new Error('Formato no válido - se esperaba array de preguntas');
                    }
                    
                    questionCounter = Math.max(...questions.map(q => {
                        const match = q.text.match(/\d+/);
                        return match ? parseInt(match[0]) : 0;
                    }), 0) + 1;
                    
                    renderForm();
                    showNotification(`Importadas ${questions.length} preguntas correctamente`, 'success');
                    
                } catch (error) {
                    console.error('Error al importar:', error);
                    showNotification('Error: ' + error.message, 'error');
                }
        }

      function getIdFromURL() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }
function importFormfile(eventOrData) {
    try {
        let importData = null;

        // Detectar si viene de un input file o directamente
        if (eventOrData?.target?.files) {
            const file = eventOrData.target.files[0];
            if (!file) throw new Error("No se seleccionó ningún archivo.");
            const reader = new FileReader();

            reader.onload = (e) => {
                const text = e.target.result;
                importData = JSON.parse(text);
                procesarImportacion(importData);
            };

            reader.readAsText(file);
            return; // detener aquí, el resto se ejecuta dentro del reader.onload
        } else {
            importData = eventOrData;
        }

        procesarImportacion(importData);

    } catch (error) {
        console.error("Error al importar:", error);
        showNotification("Error: " + error.message, "error");
    }
}

// --- Función auxiliar para manejar el contenido ya leído ---
function procesarImportacion(importData) {
    try {
        let data = importData;
        if (data.data) data = data.data;
        if (data.result) data = data.result;

        if (data.formulario && Array.isArray(data.formulario)) {
            const formulariosArray = data.formulario;
            const opcionesArray = data.formulario_opciones || [];

            // Leer título y descripción del primer FormJson
            let formTitle = "Formulario importado";
            let formDescription = "";
            try {
                const parsed = JSON.parse(formulariosArray[0]?.FormJson || "{}");
                formTitle = parsed.formTitle || formTitle;
                formDescription = parsed.formDescription || "";
            } catch {
                console.warn("No se pudo leer título o descripción del formulario.");
            }

            document.getElementById("formTitle").value = formTitle;
            document.getElementById("formDescription").value = formDescription;

            // Función para generar un id aleatorio con prefijo FORM
            const generarIdFORM = () => {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let randomPart = "";
                for (let i = 0; i < 10; i++) {
                    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return "FORM" + randomPart;
            };

            // Reconstruir preguntas
            questions = formulariosArray.map((formRow) => {
                // Generar nuevo ID aleatorio
                const nuevoId = generarIdFORM();

                // Buscar opciones asociadas
                const opciones = opcionesArray
                    .filter((opt) => opt.FormSec === formRow.FormSec)
                    .map((opt) => opt.FormOp);

                // Parsear datos adicionales
                let questionData = {};
                try {
                    const parsedJson = JSON.parse(formRow.FormJson || "{}");
                    questionData = parsedJson.questionData || {};
                } catch (e) {
                    console.warn("Error parseando FormJson en:", formRow.FormSec);
                }

                return {
                    id: nuevoId, // ✅ siempre un id aleatorio con "FORM"
                    type: formRow.FormTipo || "text",
                    text: (formRow.FormPregunta || "Pregunta sin título").trim(),
                    required: questionData.required || formRow.FormReq || false,
                    options: opciones,
                };
            });

            // Ordenar según FormOrden
            questions.sort((a, b) => {
                const qA = formulariosArray.find((f) => f.FormPregunta === a.text);
                const qB = formulariosArray.find((f) => f.FormPregunta === b.text);
                return (qA?.FormOrden || 0) - (qB?.FormOrden || 0);
            });

            questionCounter = questions.length + 1;
            renderForm();
            showNotification(`Importadas ${questions.length} preguntas correctamente`, "success");
        } else {
            throw new Error("Formato no válido - se esperaba array de preguntas");
        }
    } catch (error) {
        console.error("Error al procesar importación:", error);
        showNotification("Error: " + error.message, "error");
    }
}


// Función para procesar la estructura del formulario y extraer los datos
function procesarEstructuraFormulario(data) {
    // Extraer información básica del formulario
    const categoria = data.formulario.categoria;
    const preguntas = data.formulario.preguntas;
    
    // Información básica
    const informacionBasica = {
        titulo: categoria.titulo,
        icono: categoria.icono,
        descripcion: categoria.descripcion,
        catFormSec: categoria.id,
        fechaCreacion: categoria.fecha_creacion,
        usuarioCreacion: categoria.usuario_creacion
    };
    
    // Procesar preguntas
    const formulario = [];
    const formulario_opciones = [];
    let opcionCounter = 1;
    
    preguntas.forEach((pregunta, index) => {
        // Crear objeto pregunta
        const preguntaObj = {
            FormSec: pregunta.id,
            CatFormSec: categoria.id,
            FormPregunta: pregunta.text,
            FormTipo: pregunta.type,
            FormJson: generarFormJson(pregunta),
            FormReq: pregunta.required,
            FormOrden: pregunta.orden || (index + 1)
        };
        
        formulario.push(preguntaObj);
        
        // Procesar opciones si existen
        if (pregunta.options && pregunta.options.length > 0) {
            pregunta.options.forEach(opcion => {
                const opcionObj = {
                    FormOpSec: opcionCounter++,
                    FormSec: pregunta.id,
                    FormOp: opcion
                };
                formulario_opciones.push(opcionObj);
            });
        }
    });
    
    return {
        informacion: informacionBasica,
        formulario: formulario,
        formulario_opciones: formulario_opciones
    };
}

// Función para generar el FormJson según el formato requerido
function generarFormJson(pregunta) {
    const formJson = {
        formTitle: "Formulario Importado",
        formDescription: "",
        questionData: {
            id: pregunta.id,
            required: pregunta.required,
            placeholder: `Respuesta para: ${pregunta.text}`,
            validation: pregunta.required ? "required" : "optional"
        }
    };
    
    // Agregar opciones si existen
    if (pregunta.options && pregunta.options.length > 0) {
        formJson.questionData.options = pregunta.options;
    }
    
    // Agregar configuraciones específicas por tipo
    switch (pregunta.type) {
        case 'textarea':
            formJson.questionData.rows = 4;
            break;
        case 'number':
            formJson.questionData.min = 0;
            formJson.questionData.max = 999999;
            break;
        case 'email':
            formJson.questionData.pattern = "^[^@]+@[^@]+\\.[^@]+$";
            break;
        case 'date':
            formJson.questionData.format = "YYYY-MM-DD";
            break;
    }
    
    return JSON.stringify(formJson);
}

// Función específica para extraer solo la información básica
function extraerInformacionBasica(data) {
    if (!data || !data.formulario || !data.formulario.categoria) {
        throw new Error('Estructura de datos inválida');
    }
    
    const categoria = data.formulario.categoria;
    
    return {
        titulo: categoria.titulo || 'Sin título',
        icono: categoria.icono || null,
        descripcion: categoria.descripcion || 'Sin descripción',
        id: categoria.id,
        fechaCreacion: categoria.fecha_creacion,
        usuarioCreacion: categoria.usuario_creacion
    };
}

// Función para extraer solo las preguntas
function extraerPreguntas(data) {
    if (!data || !data.formulario || !data.formulario.preguntas) {
        return [];
    }
    
    return data.formulario.preguntas.map((pregunta, index) => ({
        id: pregunta.id,
        texto: pregunta.text,
        tipo: pregunta.type,
        requerido: pregunta.required,
        opciones: pregunta.options || [],
        orden: pregunta.orden || (index + 1)
    }));
}

// Función para generar IDs únicos si faltan
function generarIdUnico(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return prefix + timestamp + random;
}

// Función para validar la estructura antes de procesar
function validarEstructura(data) {
    const errores = [];
    
    if (!data) {
        errores.push('Datos no proporcionados');
        return errores;
    }
    
    if (!data.formulario) {
        errores.push('Falta el objeto formulario');
    }
    
    if (!data.formulario.categoria) {
        errores.push('Falta información de la categoría');
    }
    
    if (!data.formulario.preguntas || !Array.isArray(data.formulario.preguntas)) {
        errores.push('Falta el array de preguntas o no es válido');
    }
    
    // Validar cada pregunta
    if (data.formulario.preguntas) {
        data.formulario.preguntas.forEach((pregunta, index) => {
            if (!pregunta.id) {
                errores.push(`Pregunta ${index + 1}: Falta ID`);
            }
            if (!pregunta.text) {
                errores.push(`Pregunta ${index + 1}: Falta texto`);
            }
            if (!pregunta.type) {
                errores.push(`Pregunta ${index + 1}: Falta tipo`);
            }
        });
    }
    
    return errores;
}

// Función principal para usar con los datos que tienes
function procesarDatosFormulario(responseData) {
    try {
        // Validar estructura
        const errores = validarEstructura(responseData);
        if (errores.length > 0) {
            console.error('Errores de validación:', errores);
            throw new Error('Estructura de datos inválida: ' + errores.join(', '));
        }
        
        // Procesar datos
        const resultado = procesarEstructuraFormulario(responseData);
        
        console.log('Información básica:', resultado.informacion);
        console.log('Formulario procesado:', resultado.formulario);
        console.log('Opciones procesadas:', resultado.formulario_opciones);
        
        return resultado;
        
    } catch (error) {
        console.error('Error procesando formulario:', error);
        throw error;
    }
}


