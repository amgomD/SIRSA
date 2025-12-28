 // Tabs behavior
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


 
 
 
 
 cargarCategorias();

function openModal() {
  
if(PermCreForm == "S"){
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}else{
  alert("No tiene permiso para crear o editar Formularios")
}



}

function closeModal(event) {
  // Si se hace clic en el overlay o en el botón de cerrar
  if (
    event &&
    event.target !== event.currentTarget &&
    !event.target.classList.contains("close-btn")
  ) {
    return;
  }

  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

function saveData() {
  const titulo = document.getElementById("TituloCat").value;
  const descripcion = document.getElementById("CatDescr").value;
  const photoInput = document.getElementById("photoUpload");

  // Validaciones básicas
  if (!titulo.trim()) {
    alert("El título es requerido");
    return;
  }

  if (!descripcion.trim()) {
    alert("La descripción es requerida");
    return;
  }

  // Preparar datos para enviar
  const formData = {
    titulo: titulo.trim(),
    descripcion: descripcion.trim(),
    foto: null,
  };

  // Si hay foto, convertirla a base64 para el blob
  if (photoInput.files.length > 0) {
    const file = photoInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      // Obtener solo la data base64 sin el prefijo data:image/...
      formData.foto = e.target.result;
      enviarDatos(formData);
    };

    reader.onerror = function () {
      alert("Error al procesar la imagen");
    };

    reader.readAsDataURL(file);
  } else {
    // No hay foto, enviar datos sin imagen
    enviarDatos(formData);
  }
}

function enviarDatos(formData) {
  // Mostrar indicador de carga
  const saveBtn = document.querySelector(".btn-primary");
  const originalText = saveBtn.textContent;
  saveBtn.textContent = "Guardando...";
  saveBtn.disabled = true;

  fetch("/api/Categoria/wsGuardarCategoria", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Formulario guardado exitosamente!\nID: " + data.form_id);
        closeModal();
        // Limpiar formulario
        limpiarFormulario();
        window.location.href = `Formulador.html?id=${data.form_id}`;
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error de conexión al servidor");
    })
    .finally(() => {
      // Restaurar botón
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    });
}

function limpiarFormulario() {
  document.getElementById("TituloCat").value = "";
  document.getElementById("CatDescr").value = "";
  removeImage();
  refrescarCategorias();
}
function removeImage() {
  const fileInput = document.getElementById("photoUpload");
  const preview = document.getElementById("imagePreview");
  const uploadArea = document.querySelector(".file-upload-area");

  fileInput.value = "";
  preview.style.display = "none";
  uploadArea.style.display = "block";
}

// Manejar la selección de archivo
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("photoUpload");

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido.");
        fileInput.value = "";
        return;
      }

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert("El archivo es muy grande. Máximo 10MB permitido.");
        fileInput.value = "";
        return;
      }

      showImagePreview(file);
    }
  });
});

function showImagePreview(file) {
  const preview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const imageName = document.getElementById("imageName");
  const uploadArea = document.querySelector(".file-upload-area");

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    imageName.textContent = file.name;
    uploadArea.style.display = "none";
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// Cerrar modal con tecla Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Prevenir el cierre del modal al hacer clic dentro de él
document.querySelector(".modal").addEventListener("click", function (e) {
  e.stopPropagation();
});

// Función para cargar y mostrar las categorías
async function cargarCategorias() {
  const container = document.getElementById("encuestas");

  // Mostrar indicador de carga
  container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #718096;">
            <div style="font-size: 18px; margin-bottom: 10px;">Cargando categorías...</div>
            <div style="font-size: 14px;">Por favor espera</div>
        </div>
    `;

  try {
    const response = await fetch(
      "/api/Categoria/wsListarCategorias"
    );
    const data = await response.json();

    if (data.success) {
      mostrarCategorias(data.categorias);
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
  const container = document.getElementById("encuestas");

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
    html += generarTarjetaCategoria(categoria);
  });
   
  console.log(html)
  container.innerHTML =  nuevaencuesta()+html;
}

function nuevaencuesta(){
    let htmlcard = 
      ` <div class="nuevaencuesta cardEncuesta">
        <div class="cardicon"><i class="fa-solid fa-clipboard-list" style="font-size: 24px; color: #ffffffff;"></i></div>
        <h3>Crear encuesta</h3>
                <div class="CardDescr">
           Click para crear una nueva encuesta y empezar a recolectar información
         </div>
         <button
         onclick="openModal()"
         id="btnCrear"
         class="btnEncuesta"><p>Crear encuesta</p> <strong>+</strong></button>
      </div>`

      return htmlcard;

}
// Función para generar el HTML de una tarjeta
function generarTarjetaCategoria(categoria) {
  // Procesar el ícono - verificar que sea string y sea base64, sino usar ícono por defecto
  let iconoHtml = "";
  if (
    categoria.icono &&
    typeof categoria.icono === "string" &&
    categoria.icono.startsWith("data:image")
  ) {
    iconoHtml = `<img src="${categoria.icono}" alt="Ícono" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">`;
  } else {
    iconoHtml = `<i class="fa-solid fa-clipboard-list" style="font-size: 24px; color: #ffffffff;"></i>`;
  }

  // Truncar descripción si es muy larga
  const descripcionCorta =
    categoria.descripcion.length > 150
      ? categoria.descripcion.substring(0, 150) + "..."
      : categoria.descripcion;

  let htmlcard = `
        <div class="cardEncuesta" data-categoria-id="${categoria.id}">
            <div class="CardHead">
                <div class="cardicon">
                    ${iconoHtml}
                </div>
                <div class="CardTitulo">
                    <h3>${categoria.titulo}</h3>
                </div>
                <div class="CardOpciones" onclick="toggleDropdown('${categoria.id}')">
<div class="dropdown">
                        <i class="fa-solid fa-sliders" ></i>
                        <div class="dropdown-content" id="dropdown-${categoria.id}">
                        `;
  if (categoria.estado == "INA") {
    htmlcard += `
            <a href="#" onclick="reactivarCategoria('${categoria.id}')">
                <i class="fa-solid fa-check-circle"></i> Reactivar
            </a>

            <a href="#" onclick="eliminarCategoria('${categoria.id}')" style="color: #e53e3e;">
                <i class="fa-solid fa-trash"></i> Eliminar
            </a>
          
        `;
  } else {
    htmlcard += ` 
                        
                            <a href="#" onclick="editarCategoria('${categoria.id}')">
                                <i class="fa-solid fa-edit"></i> Editar
                            </a>
                   
                   
                                 <a href="#" onclick="desactivarCategoria('${categoria.id}')" style="color: #f6ad55;">
                <i class="fa-solid fa-pause"></i> Desactivar
            </a>
                       
                    
`;
  }

  htmlcard += ` </div></div> </div>
            </div>
            <div class="CardContent">
                <div class="CardDescr">
                    ${descripcionCorta}
                </div>
            </div>
            <div class="cardStatus">
                <span class="status-badge status-${categoria.estado.toLowerCase()}">
                    ${categoria.estado === "ACT" ? "Activo" : "Inactivo"}
                </span>
                <small class="fechapie" style="color: #718096; margin-left: 10px;">
                    ${categoria.fecha_formateada}
                </small>
            </div>
        </div>
    `;

  return htmlcard;
}

// Función para mostrar errores
function mostrarError(mensaje) {
  const container = document.getElementById("encuestas");
  container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e53e3e;">
            <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
            <div style="font-size: 18px; margin-bottom: 10px;">Error</div>
            <div style="font-size: 14px;">${mensaje}</div>
            <button onclick="cargarCategorias()" style="margin-top: 20px; padding: 10px 20px; background: #ff6b6b; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Reintentar
            </button>
        </div>
    `;
}

// Funciones para las acciones del dropdown
function toggleDropdown(categoriaId) {
  // Cerrar todos los dropdowns
  document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
    if (dropdown.id !== `dropdown-${categoriaId}`) {
      dropdown.style.display = "none";
    }
  });

  // Toggle del dropdown actual
  const dropdown = document.getElementById(`dropdown-${categoriaId}`);
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

function editarCategoria(categoriaId) {
    
if(PermCreForm == "S"){
 
  window.location.href = `Formulador.html?id=${categoriaId}`;
  toggleDropdown(categoriaId); // Cerrar dropdown
}else{
  alert("No tiene permiso para crear o editar Formularios")
}

}

function verDetalles(categoriaId) {




openModal();


  
 // toggleDropdown(categoriaId); // Cerrar dropdown






}

//Función para mostrar notificaciones toast (opcional)
function showToast(message, type = "info") {
  // Crear elemento toast
  const toast = document.createElement("div");
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

  // Colores según el tipo
  const colors = {
    success: "#48bb78",
    error: "#f56565",
    warning: "#ed8936",
    info: "#4299e1",
  };

  toast.style.background = colors[type] || colors.info;
  toast.textContent = message;

  // Agregar al DOM
  document.body.appendChild(toast);

  // Animación de entrada
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  }, 100);

  // Remover después de 3 segundos
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Función para eliminar múltiples categorías (opcional)
function eliminarCategorias(categoriaIds) {

      
if(PerElForm == "S"){
 
  if (!Array.isArray(categoriaIds) || categoriaIds.length === 0) {
    alert("No hay categorías seleccionadas");
    return;
  }

  const cantidad = categoriaIds.length;
  const mensaje =
    cantidad === 1
      ? "¿Eliminar 1 categoría seleccionada?"
      : `¿Eliminar ${cantidad} categorías seleccionadas?`;

  if (confirm(mensaje + "\n\nEsta acción no se puede deshacer.")) {
    // Mostrar indicador de carga
    showToast("Eliminando categorías...", "info");

    fetch("/wsEliminarCategorias", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: categoriaIds }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.total_eliminadas > 0) {
          // Recargar la lista
          cargarCategorias();

          let mensaje = `${data.total_eliminadas} categorías eliminadas`;
          if (data.total_errores > 0) {
            mensaje += `, ${data.total_errores} errores`;
          }

          showToast(mensaje, "success");
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error de conexión al servidor");
      });
  }
  }else{
  alert("No tiene permiso para eliminar Formularios")
}

}

function eliminarCategoria(categoriaId) {
  if(PerElForm == "S"){
 

  if (
    confirm(
      "¿Estás seguro de que quieres eliminar esta categoría?\n\nEsta acción no se puede deshacer."
    )
  ) {
    // Mostrar indicador de carga
    const card = document.querySelector(`[data-categoria-id="${categoriaId}"]`);
    const originalContent = card.innerHTML;

    card.style.opacity = "0.6";
    card.style.pointerEvents = "none";

    // Llamar al API
    fetch(
      `/api/Categoria/wsEliminarCategoria/${categoriaId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Animación de eliminación
          card.style.transition = "all 0.5s ease";
          card.style.transform = "scale(0.8)";
          card.style.opacity = "0";

          setTimeout(() => {
            card.remove();

            // Verificar si no quedan más categorías
            const remainingCards = document.querySelectorAll(".cardEncuesta");
            if (remainingCards.length === 0) {
              mostrarCategorias([]);
            }

            // Mostrar mensaje de éxito
            showToast("Categoría eliminada exitosamente", "success");
          }, 500);
        } else {
          // Restaurar card en caso de error
          card.style.opacity = "1";
          card.style.pointerEvents = "auto";
          card.innerHTML = originalContent;

          alert("Error al eliminar: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);

        // Restaurar card en caso de error
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
        card.innerHTML = originalContent;

        alert("Error de conexión al servidor");
      });
  }

  toggleDropdown(categoriaId); // Cerrar dropdown

    }else{
  alert("No tiene permiso para eliminar Formularios")
}

}

function desactivarCategoria(categoriaId) {
  if(PerElForm == "S"){
 
  if (
    confirm(
      "¿Deseas desactivar esta categoría?\n\nPodrás reactivarla más tarde si es necesario."
    )
  ) {
    // Mostrar indicador de carga en la tarjeta
    const card = document.querySelector(`[data-categoria-id="${categoriaId}"]`);
    const cardStatus = card.querySelector(".cardStatus");
    const originalStatusContent = cardStatus.innerHTML;

    // Indicador visual de procesamiento
    cardStatus.innerHTML = `
            <span style="color: #f6ad55; font-weight: 600;">
                <i class="fa-solid fa-spinner fa-spin"></i> Desactivando...
            </span>
        `;

    card.style.opacity = "0.7";
    card.style.pointerEvents = "none";

    // Llamar al API de desactivación
    fetch(
      `/api/Categoria/wsDesactivarCategoria/${categoriaId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Actualizar visualmente el estado de la tarjeta
          cardStatus.innerHTML = `
                    <span class="status-badge status-inactivo">
                        Inactivo
                    </span>
                    <small style="color: #718096; margin-left: 10px;">
                        Desactivado ahora
                    </small>
                `;

          // Aplicar estilo visual de desactivado
          card.style.opacity = "0.6";
          card.style.filter = "grayscale(50%)";
          card.style.pointerEvents = "auto";

          // Agregar clase para identificar categorías inactivas
          card.classList.add("categoria-inactiva");

          // Actualizar el dropdown para mostrar opción de reactivar
          actualizarDropdownInactivo(categoriaId);

          // Mostrar mensaje de éxito
          showToast("Categoría desactivada exitosamente", "warning");
        } else {
          // Restaurar estado original en caso de error
          cardStatus.innerHTML = originalStatusContent;
          card.style.opacity = "1";
          card.style.pointerEvents = "auto";

          alert("Error al desactivar: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);

        // Restaurar estado original en caso de error
        cardStatus.innerHTML = originalStatusContent;
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";

        alert("Error de conexión al servidor");
      });
  }

  toggleDropdown(categoriaId); // Cerrar dropdown
      }else{
  alert("No tiene permiso para eliminar Formularios")
}
}

function actualizarDropdownInactivo(categoriaId) {
  const dropdown = document.getElementById(`dropdown-${categoriaId}`);
  if (dropdown) {
    dropdown.innerHTML = `
            <a href="#" onclick="reactivarCategoria('${categoriaId}')">
                <i class="fa-solid fa-check-circle"></i> Reactivar
            </a>

            <a href="#" onclick="eliminarCategoria('${categoriaId}')" style="color: #e53e3e;">
                <i class="fa-solid fa-trash"></i> Eliminar definitivamente
            </a>
        `;
  }
}

// Función para reactivar categorías (bonus)
function reactivarCategoria(categoriaId) {
  if (confirm("¿Deseas reactivar esta categoría?")) {
    const card = document.querySelector(`[data-categoria-id="${categoriaId}"]`);
    const cardStatus = card.querySelector(".cardStatus");

    // Indicador visual de procesamiento
    cardStatus.innerHTML = `
            <span style="color: #48bb78; font-weight: 600;">
                <i class="fa-solid fa-spinner fa-spin"></i> Reactivando...
            </span>
        `;

    // Llamar al API de reactivación (necesitarías crear este endpoint)
    fetch(`/api/Categoria/wsReactivarCategoria/${categoriaId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Restaurar estado visual activo
          cardStatus.innerHTML = `
                    <span class="status-badge status-activo">
                        Activo
                    </span>
                    <small style="color: #718096; margin-left: 10px;">
                        Reactivado ahora
                    </small>
                `;

          // Remover estilos de inactivo
          card.style.opacity = "1";
          card.style.filter = "none";
          card.classList.remove("categoria-inactiva");

          // Restaurar dropdown original
          restaurarDropdownActivo(categoriaId);

          showToast("Categoría reactivada exitosamente", "success");
        } else {
          alert("Error al reactivar: " + data.message);
          // Recargar para obtener estado actual
          cargarCategorias();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error de conexión al servidor");
        cargarCategorias();
      });
  }

  toggleDropdown(categoriaId);
}

// Función para restaurar dropdown de categoría activa
function restaurarDropdownActivo(categoriaId) {
  const dropdown = document.getElementById(`dropdown-${categoriaId}`);
  if (dropdown) {
    dropdown.innerHTML = `
            <a href="#" onclick="editarCategoria('${categoriaId}')">
                <i class="fa-solid fa-edit"></i> Editar
            </a>

            <a href="#" onclick="desactivarCategoria('${categoriaId}')" style="color: #f6ad55;">
                <i class="fa-solid fa-pause"></i> Desactivar
            </a>
  
        `;
  }
}

// Cerrar dropdowns al hacer clic fuera
document.addEventListener("click", function (event) {
  if (!event.target.closest(".CardOpciones")) {
    document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
      dropdown.style.display = "none";
    });
  }
});

// Cargar categorías cuando se carga la página
document.addEventListener("DOMContentLoaded", function () {
  cargarCategorias();
});

// Función para refrescar la lista (útil después de crear/editar)
function refrescarCategorias() {
  cargarCategorias();
}
