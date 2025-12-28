   
   
   cargarConfiguracion();

   window.currentUser = localStorage.getItem('currentUser');
const permisos = JSON.parse(window.permisos);


permisosAplicar()

  const btnAdmin = document.getElementById("Administrador");
const user = JSON.parse(window.currentUser);
  // Ocultar si NO es administrador (admin !== "S")
  if (user.admin !== "S") {
    btnAdmin.style.display = "none";
  }else{
  btnAdmin.style.display = "block";
  }




   const buttons = document.querySelectorAll(".tab-btn");
    const content = document.getElementById("content");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelector(".tab-btn.active").classList.remove("active");
        btn.classList.add("active");

        const tab = btn.getAttribute("data-tab");

        switch (tab) {
          case "cerrarsesion":

          cerrarSesion()
           break;
          case "preferencias":
            content.innerHTML = `<div class="form-container">
<h2><i class="fa-solid fa-sliders"></i> Preferencias</h2>
  <div class="settings-container">

    <!-- Opción 1 -->
    <div class="setting-row">
        <div class="setting-text">
            <h4>Personalizar primary color</h4>
            <p>Personaliza el aspecto de tu espacio de trabajo a tu gusto.</p>
        </div>

        <div class="color-picker">
            <input type="color" id="ConfOrgColor" value="#1E1E1E">
        </div>
    </div>

    <!-- Opción 2 -->
    <div class="setting-row">
        <div class="setting-text">
            <h4>Nombre Alcaldía</h4>
            <p>Ingresa el nombre del espacio de trabajo.</p>
        </div>

          <div class="field">
     <input type="text" id="ConfOrgNom">
    </div>
    </div>

    <!-- Opción 3 -->
    <div class="setting-row">
        <div class="setting-text">
            <h4>Subtítulo carnet</h4>
            <p>Texto que aparecerá en los carnets.</p>
        </div>

      <div class="field">
      <input type="text" id="confOrgSubCar">
    </div>
    </div>

</div>


     


  <div class="form-row">
    <div class="upload-box">
       <div class="setting-text">
            <h4>Logo Alcaldía</h4>
        </div>
      <input type="file" accept="image/*" id="ConfOrgLogo" hidden>
      <div class="upload-area" onclick="document.getElementById('ConfOrgLogo').click()">
        <img id="previewConfOrgLogo" alt="">
        <span>Subir foto</span>
      </div>
    </div>

    <div class="upload-box">
            <div class="setting-text">
            <h4>Portada</h4>
        </div>
 
      <input type="file" accept="image/*" id="confOrgPort" hidden>
      <div class="upload-area" onclick="document.getElementById('confOrgPort').click()">
        <img id="previewconfOrgPort" alt="">
        <span>Subir foto</span>
      </div>
    </div>
      <div class="form-row">
    <div class="upload-box">
         <div class="setting-text">
            <h4>Foto alterna</h4>
        </div>
      <input type="file" accept="image/*" id="confOrgFot" hidden>
      <div class="upload-area" onclick="document.getElementById('confOrgFot').click()">
        <img id="previewconfOrgFot" alt="">
        <span>Subir foto</span>
      </div>
    </div>
  </div>
  </div>



  <div class="field">
        <div class="setting-text">
            <h4>Foto alterna</h4>
        </div>
    <textarea id="confOrgAlcCar" rows="4"></textarea>
  </div>

  <button id="btnAplicar">Aplicar</button>
</div>`;
       initImageUploadHandlers();
cargarConfiguracion();
 permisosAplicar();
            break;

      case "Admin":
         content.innerHTML = `
            <h2 class="title">Usuarios</h2>
           <div class="tabla-cert">
<table id="tablaPermisosUsuario"> <thead> <tr> <th>Usuario</th> <th>Perfil</th>  <th>Estado</th>
<th></th>

<th>Creación formularios</th> <th>Eliminar formularios</th> <th>Agregar Encuestados</th> <th>Inactivar Encuestados</th> <th>Importar Excel</th> <th>Importar Fotos</th> <th>Descargar reporte</th> <th>Editar Sistema</th> </tr> </thead> <tbody></tbody> </table>
</div>
         <div class="separador"></div>
         <div class="perfiles">

       
<div id="rolesModal" class="roles-container">
    <h2 class="title">Perfiles</h2>

    <div class="user-header">
    <div class="field">
     <input placeholder="ingresar perfil" required type="text" id="PermDesc">
    </div>
    </div>

    <div class="permissions-header">
        <span>Permisos</span>
        <button class="select-all" id="selectAllBtn">Elegir todos</button>
    </div>

    <div class="permissions-list">

        <label class="perm-item">
            <input id="PermCreForm" type="checkbox" class="perm-check" >
            Creación formularios
        </label>

        <label class="perm-item">
            <input id="PerElForm"  type="checkbox" class="perm-check" >
             Eliminar formularios
        </label>

        <label class="perm-item">
            <input id="PerRespEn" type="checkbox" class="perm-check" >
            Agregar Encuestados
        </label>

        <label class="perm-item">
            <input  id="PerRespIna"  type="checkbox" class="perm-check" >
            Inactivar Encuestados
        </label>

        <label class="perm-item">
            <input id="PerRespImpEx" type="checkbox" class="perm-check" >
            Importar Excel
        </label>

        <label class="perm-item">
            <input id="PerRespImpFoto" type="checkbox" class="perm-check" >
           Importar Fotos
        </label>

        <label class="perm-item">
            <input id="PerRespDes" type="checkbox" class="perm-check" >
            Descargar reporte
        </label>

        <label class="perm-item">
            <input id="PermConfSis" type="checkbox" class="perm-check">
           Editar Sistema
        </label>

    </div>

    <div class="buttons">
        <button class="btn-cancelar">Cancelar</button>
        <button class="btn-guardar">Guardar</button>
    </div>

</div>

<div class="tabla-cert">
<table id="tablaPermisos">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th>Perfil</th>
      <th>Creación formularios</th>
      <th>Eliminar formularios</th>
      <th>Agregar Encuestados</th>
      <th>Inactivar Encuestados</th>
      <th>Importar Excel</th>
      <th>Importar Fotos</th>
      <th>Descargar reporte</th>
      <th>Editar Sistema</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>
</div>

</div>
`; permisosconf();
        
         break;
          case "perfil":

            content.innerHTML = `<section class="config-panel">
<form autocomplete="off" id="registrarForm" >
    <h2 class="config-title">
        <i class="fa-solid fa-user"></i> Perfil
    </h2>

    <!-- FILA -->
    <div class="config-row">
        <div class="config-info">
            <h3>Código de usuario</h3>
            <p>Abreviatura única del usuario.</p>
        </div>
        <div class="config-input">
            <input type="text" id="UsuCod"  name="UsuCod"placeholder="Abreviatura" />
        </div>
    </div>

    <hr>

    <div class="config-row">
        <div class="config-info">
            <h3>Nombre completo</h3>
            <p>Nombre real del usuario.</p>
        </div>
        <div class="config-input">
            <input type="text" id="UsuNom"  name="UsuNom" placeholder="Nombre completo" />
        </div>
    </div>

    <hr>

    <div class="config-row">
        <div class="config-info">
            <h3>Cédula</h3>
            <p>Documento del usuario.</p>
        </div>
        <div class="config-input">
            <input type="number" id="UsuCed"  name="UsuCedula" placeholder="Cédula" />
        </div>
    </div>

    <hr>

    <div class="config-row">
        <div class="config-info">
            <h3>Correo electrónico</h3>
            <p>Correo que usará para iniciar sesión.</p>
        </div>
        <div class="config-input">
            <input readonly type="email" id="UsuEmail"  name="UsuEmail" placeholder="Correo electrónico" />
        </div>
    </div>

    <hr>

    <div class="config-row">
        <div class="config-info">
            <h3>Teléfono</h3>
            <p>Teléfono de contacto.</p>
        </div>
        <div class="config-input">
            <input type="text" id="UsuTel"  name="UsuTel" placeholder="Teléfono" />
        </div>
    </div>

    <hr>

    <div class="config-row">
        <div class="config-info">
            <h3>Contraseña</h3>
            <p>Clave para el acceso.</p>
        </div>
        <div class="config-input">
            <input autocomplete="new-password" type="password" id="UsuCla" name="UsuClave" placeholder="********" />
        </div>
    </div>

    <hr>

    <div class="config-row">
        <div class="config-info">
            <h3>Estado</h3>
            <p>Define si el usuario está activo.</p>
        </div>
        <div class="config-input">
            <select id="UsuEst" name="UsuEst">
                <option value="A">Activo</option>
                <option value="P">Pendiente</option>
            </select>
        </div>
    </div>

    <button  id="btnGuardarUsuario" class="btn-apply">Guardar usuario</button>
</form>
</section>
`;
inicializaruser();
document.getElementById('registrarForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = new FormData(this);
    
    // Crear JSON con los datos
    const userData = {
        nombre: formData.get('UsuNom'),
        cedula: formData.get('UsuCedula'),
        telefono: formData.get('UsuTel'),
        email: formData.get('UsuEmail'),
        estado: formData.get('UsuEst'),
        password: formData.get('UsuClave')
    };
    
    console.log(userData)
    // Validar datos
    if (!userData.nombre || !userData.cedula || !userData.email || !userData.password) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    

    
    // Validar contraseña
    if (userData.password.length < 6) {
        alert( 'La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    console.log('Datos a enviar:', userData);
    
    try {

        // Enviar al servidor
        const response = await fetch('/api/auth/Actualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {



             mostrarMensajelog('loginMessage', 'Usuario Actualizado exitosamente', 'success');
            

            
        } else {
            alert( result.message || 'Error al registrar usuario');
        }
        
    } catch (error) {
        alert('Error de conexión '+error);
    }
});

            break;
          case "localidades":
            content.innerHTML = `<h2><i class="fa-solid fa-location-dot"></i> Localidades</h2><p>Gestión de localidades registradas.</p>
            
            <div class="org-container">
  <!-- Panel lateral -->
  <div class="locform-row">
    <h3>Comunas</h3>

    <label for="comNombre">Nombre.</label>
    <input type="text" id="comNombre" placeholder="Nombre.." />

    <button id="btnGuardarComuna">Guardar</button>
  </div>

  <!-- Tabla de comunas -->
  <div class="org-table">
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Usuario</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="tablaComunas">
        <!-- Se llenará dinámicamente -->
      </tbody>
    </table>
  </div>
</div>

            
            
            `;
            inicializarLocal();
            break;
          case "organizaciones":
            content.innerHTML = `<h2><i class="fa-solid fa-building"></i> Organizaciones</h2><p>Listado de organizaciones vinculadas.</p>
            
            <div class="org-container">
  <div class="orgform-row">
    <h3>Organizaciones</h3>
    <label>Nombre.</label>
    <input type="text" id="orgNombre" placeholder="Nombre..">
    <label>Nit.</label>
    <input type="text" id="orgNit" placeholder="Nit..">
        <label>Telefono.</label>
    <input type="text" id="OrgTel" placeholder="Telefono..">
            <label>Correo.</label>
    <input type="text" id="OrgCor" placeholder="Correo..">
        <label>Web.</label>
    <input type="text" id="OrgWeb" placeholder="Web..">
        <label>Rep. Legal.</label>
    <input type="text" id="OrgRepLe" placeholder="ep. Legal...">

    <button id="btnGuardarOrg">Guardar</button>
  </div>

  <div class="org-table">
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Nit</th>
          <th>Telefono</th>
          <th>Correo</th>
          <th>Web</th>
          <th>Rep. Legal</th>
          <th>Usuario</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="tablaOrganizaciones">
        <!-- Filas dinámicas -->
      </tbody>
    </table>
  </div>
</div>
            `;
             inicializarORg();
            break;
        }

 
      });
    });


    const inputsImagen = [
  { input: "ConfOrgLogo", preview: "previewConfOrgLogo" },
  { input: "confOrgPort", preview: "previewconfOrgPort" },
  { input: "confOrgFot", preview: "previewconfOrgFot" },
];

const imagenesBase64 = {};
initImageUploadHandlers();
function initImageUploadHandlers() {
  inputsImagen.forEach(({ input, preview }) => {
    const el = document.getElementById(input);
    if (!el) return; // el input no existe en este tab todavía
    el.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          document.getElementById(preview).src = reader.result;
          document.getElementById(preview).style.display = "block";
          document.querySelector(`#${preview} + span`)?.remove();
          imagenesBase64[input] = reader.result;
        };
        reader.readAsDataURL(file);
      }
    };
  });


  document.getElementById("btnAplicar").addEventListener("click", async  () => {
  const data = {
    nombreAlcaldia: document.getElementById("ConfOrgNom").value,
    subtitulo: document.getElementById("confOrgSubCar").value,
    color: document.getElementById("ConfOrgColor").value,
    mensaje: document.getElementById("confOrgAlcCar").value,
    imagenes: imagenesBase64,
  };
  try {
    const response = await fetch("/api/configuracion/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.ok) {
      alert("Configuración guardada correctamente");
      cargarConfiguracion()
    } else {
      alert("Error al guardar: " + (result.error || "Desconocido"));
    }
  } catch (error) {
    console.error("Error al enviar datos:", error);
    alert("No se pudo conectar con el servidor");
  }
});

}

async function cargarConfiguracion() {
  try {
    const response = await fetch("/api/configuracion/traer");
    const data = await response.json();

    if (!data) {
      console.warn("⚠️ No hay configuración guardada aún.");
      return;
    }
    localStorage.setItem("configuracion", JSON.stringify(data));
    // --- Llenar los campos de texto ---
    document.getElementById("ConfOrgNom").value = data.ConfOrgNom || "";
    document.getElementById("confOrgSubCar").value = data.confOrgSubCar || "";
    document.getElementById("ConfOrgColor").value = data.ConfOrgColor || "#000000";
    document.getElementById("confOrgAlcCar").value = data.confOrgAlcCar || "";


    if (data.ConfOrgLogo) {
      document.getElementById("previewConfOrgLogo").src = data.ConfOrgLogo;
      document.getElementById("previewConfOrgLogo").style.display = "block";
      imagenesBase64["ConfOrgLogo"] = data.ConfOrgLogo;
    }
    if (data.confOrgPort) {
      document.getElementById("previewconfOrgPort").src = data.confOrgPort;
      document.getElementById("previewconfOrgPort").style.display = "block";
      imagenesBase64["confOrgPort"] = data.confOrgPort;
    }
    if (data.confOrgFot) {
      document.getElementById("previewconfOrgFot").src = data.confOrgFot;
      document.getElementById("previewconfOrgFot").style.display = "block";
      imagenesBase64["confOrgFot"] = data.confOrgFot;
    }



    console.log("Configuración cargada:", data);
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }
}

function inicializaruser(){
const currentUser = localStorage.getItem("currentUser");
const usuario = JSON.parse(currentUser);
console.log("Usuario desde LocalStorage:", usuario);
console.log("Usuario desde LocalStorage:", usuario);
  cargarUsuario(usuario.email);
}


function inicializarORg() {

  const btnGuardar = document.getElementById("btnGuardarOrg");




  // Guardar nueva organización
btnGuardar.addEventListener("click", async () => {
  const nombre = document.getElementById("orgNombre").value.trim();
  const nit = document.getElementById("orgNit").value.trim();
  const telefono = document.getElementById("OrgTel").value.trim();
  const correo = document.getElementById("OrgCor").value.trim();
  const web = document.getElementById("OrgWeb").value.trim();
  const replegal = document.getElementById("OrgRepLe").value.trim();





  // Recuperar el usuario del localStorage
 const currentUser = localStorage.getItem("currentUser");
let usuarixo = JSON.parse(currentUser);
console.log("Usuario desde LocalStorage:", usuarixo);

  if (!usuarixo.email) {
    alert("No se encontró información del usuario en el sistema");
    return;
  }

  // Si está guardado como JSON, parsear
  let usuario;
  try {
    usuario = usuarixo.email;
  } catch {
    usuario = usuarixo.email;
  }

  const usucod = usuario.UsuCod || usuario.usucod || usuario || null;
  if (!usucod) {
    alert("No se pudo obtener el código de usuario");
    return;
  }

  if (!nombre || !nit) {
    alert("Complete todos los campos");
    return;
  }

  try {
    const res = await fetch("/api/Organizacion/organizaciones/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usucod, nombre, nit,telefono,correo,web,replegal })
    });

    const data = await res.json();

    if (data.success) {
      alert("Organización creada exitosamente");
      cargarOrganizaciones();

      // Limpiar campos
      document.getElementById("orgNombre").value = "";
      document.getElementById("orgNit").value = "";
       document.getElementById("OrgTel").value = "";
    document.getElementById("OrgCor").value = "";
    document.getElementById("OrgWeb").value = "";
    document.getElementById("OrgRepLe").value = "";
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error guardando organización:", err);
    alert("Ocurrió un error al guardar la organización");
  }
});

  cargarOrganizaciones();

}




function inicializarLocal(){
cargarLocalidades();
document.getElementById("btnGuardarComuna").addEventListener("click", crearLocalidad);



}









     async function cargarUsuario(email) {
  try {
console.log(email)
    const response = await fetch(
      "/api/Usuario/usuario/obtener",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         body: JSON.stringify({ email })
      }
    )  .then(res => res.json())
  .then(result => {
    if (result.success && result.data && result.data.length > 0) {
      const usuario = result.data[0]; // accede al primer registro

      // 🔹 Llenar los inputs con los datos obtenidos
      document.getElementById("UsuCod").value = usuario.UsuCod || "";
      document.getElementById("UsuNom").value = usuario.UsuNom || "";
      document.getElementById("UsuCed").value = usuario.UsuCed || "";
      document.getElementById("UsuEmail").value = usuario.UsuEmail || "";
      document.getElementById("UsuTel").value = usuario.UsuTel || "";
      document.getElementById("UsuEst").value = usuario.UsuEst || "P";
      
      console.log("Usuario cargado:", usuario);
    } else {
      console.warn("No se encontró información del usuario");
    }
  })
  } catch (error) {
    console.error("Error:", error);
  }
}




function mostrarMensajelog(elementId, mensaje, tipo) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Clases CSS según el tipo
    let className = '';
    switch(tipo) {
        case 'success':
            className = 'alert alert-success';
            break;
        case 'error':
            className = 'alert alert-danger';
            break;
        case 'info':
            className = 'alert alert-info';
            break;
        default:
            className = 'alert';
    }
    
    element.innerHTML = `<div class="${className}">${mensaje}</div>`;
    element.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        element.style.display = 'none';
    }, 10000);
}

async function editarOrg(id){


    // Guardar temporal el PermSec que se está editando
    window.idActual = id;

    const res = await fetch(`/api/Organizacion/organizaciones/obtener/${id}`);
    const resultado = await res.json();




    if (!resultado.success) {
      console.warn(resultado.message);
      return;
    }



    resultado.data.forEach(org => {

         // Llenar inputs
    document.getElementById("orgNombre").value = org.nombre;
    document.getElementById("orgNit").value = org.nit;
    document.getElementById("OrgTel").value = org.telefono;
    document.getElementById("OrgCor").value = org.correo;
    document.getElementById("OrgWeb").value = org.web;
    document.getElementById("OrgRepLe").value = org.replegal;




    });

 
       
}

async function eliminarorg(id) {
  if (!id) {
    alert("ID no válido para eliminar organización");
    return;
  }

  // Confirmación antes de eliminar
  if (!confirm("¿Estás seguro de que deseas eliminar esta organización?")) {
    return;
  }

  try {
    const res = await fetch("/api/Organizacion/organizaciones/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (data.success) {
      alert("Organización eliminada exitosamente");
      cargarOrganizaciones(); // Recarga la tabla
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error eliminando organización:", err);
    alert("Ocurrió un error al intentar eliminar la organización");
  }
}

  // Cargar organizaciones desde el servidor
async function cargarOrganizaciones() {
  
  const tabla = document.getElementById("tablaOrganizaciones");
  try {
    const res = await fetch("/api/Organizacion/organizaciones/obtener", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      throw new Error("Error al obtener las organizaciones");
    }

    const resultado = await res.json();

    if (!resultado.success) {
      console.warn(resultado.message);
      tabla.innerHTML = `<tr><td colspan="5">${resultado.message}</td></tr>`;
      return;
    }

    // Vaciar tabla antes de agregar filas nuevas
    tabla.innerHTML = "";

    resultado.data.forEach(org => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${org.nombre}</td>
        <td>${org.nit}</td>
        <td>${org.telefono}</td>
        <td>${org.correo}</td>
        <td>${org.web}</td>
        <td>${org.replegal}</td>
        <td>${org.usuario}</td>
        <td>${org.fecha}</td>
        <td class="acciones">
          <i onclick="eliminarorg(${org.llave})" class="fa fa-trash delete" data-id="${org.llave}"></i>
            <i onclick="editarOrg(${org.llave})" class="fa-solid fa-pen-to-square" data-id="${org.llave}"></i>        
    
        </td>
      `;
      tabla.appendChild(fila);
    });

  } catch (error) {
    console.error("Error cargando organizaciones:", error);
    tabla.innerHTML = `<tr><td colspan="5">Error cargando organizaciones</td></tr>`;
  }
}



async function cargarLocalidades() {
  try {
    console.log("Cargando localidades...");

    const res = await fetch("/api/Localidad/localidad/obtener", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    const tabla = document.getElementById("tablaComunas");
    tabla.innerHTML = ""; // Limpia la tabla antes de llenarla

    if (!data.success || !data.data || data.data.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;">No se encontraron localidades</td>
        </tr>`;
      return;
    }

    // Recorremos las localidades
    data.data.forEach(loc => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${loc.localidad}</td>
        <td>${loc.usuario}</td>
        <td>${loc.fecha}</td>
        <td class="acciones">
          <i  onclick="eliminarLocalidad(${loc.llave})" class="fa fa-trash delete" data-id="${loc.llave}"></i>

        </td>
      `;
      tabla.appendChild(fila);
    });

    console.log(`Se cargaron ${data.data.length} localidades`);
  } catch (error) {
    console.error("Error cargando localidades:", error);
  }
}

async function crearLocalidad() {
  const nombre = document.getElementById("comNombre").value.trim();

  // Obtener usuario desde localStorage

  let usuCod = "";
const currentUser = localStorage.getItem("currentUser");
const usuario = JSON.parse(currentUser);


  try {
    // Si el valor del localStorage es JSON
 
    usuCod = usuario.email;
  } catch {
    // Si está guardado como texto simple
    usuCod = usuario.email;
  }


  if (!nombre) {
    alert("Por favor ingresa el nombre de la comuna.");
    return;
  }

  if (!usuCod) {
    alert("No se pudo obtener el código de usuario.");
    return;
  }

  try {
    const res = await fetch("/api/Localidad/localidad/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usucod: usuCod,
        nombre: nombre
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Error: " + data.message);
      return;
    }

    alert("Localidad creada exitosamente");
    document.getElementById("comNombre").value = "";

    // Recargar la tabla automáticamente
    cargarLocalidades();

  } catch (error) {
    console.error("Error al crear la localidad:", error);
    alert("Ocurrió un error al crear la localidad.");
  }
}


async function eliminarLocalidad(id) {
  if (!id) {
    alert("ID de localidad inválido");
    return;
  }

  const confirmar = confirm("¿Estás seguro de eliminar esta localidad?");
  if (!confirmar) return;

  try {
    const res = await fetch("/api/Localidad/localidad/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (!data.success) {
      alert("❌ Error: " + data.message);
      return;
    }

    alert("Localidad eliminada exitosamente");
    cargarLocalidades(); // recargar tabla

  } catch (error) {
    console.error("Error al eliminar la localidad:", error);
    alert("Ocurrió un error al eliminar la localidad.");
  }
}







function  permisosconf(){
// Manejar el botón guardar
document.querySelector('.btn-guardar').addEventListener('click', async function() {
    const permDesc = document.getElementById('PermDesc').value.trim();
    
    if (!permDesc) {
        alert('Por favor ingrese un nombre para el perfil');
        return;
    }
    


    if(window.PermSecActual){
          const body = {
        PermSec: window.PermSecActual,
        PermDesc: document.getElementById("PermDesc").value,

        // checkboxes → convertir a S/N
        PermCreForm: document.getElementById("PermCreForm").checked ? "S" : "N",
        PerElForm: document.getElementById("PerElForm").checked ? "S" : "N",
        PerRespEn: document.getElementById("PerRespEn").checked ? "S" : "N",
        PerRespIna: document.getElementById("PerRespIna").checked ? "S" : "N",
        PerRespImpEx: document.getElementById("PerRespImpEx").checked ? "S" : "N",
        PerRespImpFoto: document.getElementById("PerRespImpFoto").checked ? "S" : "N",
        PerRespDes: document.getElementById("PerRespDes").checked ? "S" : "N",
        PermConfSis: document.getElementById("PermConfSis").checked ? "S" : "N"
    };

    const res = await fetch("/api/permisos/Actualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const json = await res.json();

    if (json.success) {
        alert("Perfil actualizado");
            document.getElementById('PermDesc').value = '';
    document.querySelectorAll('.perm-check').forEach(cb => cb.checked = false);
    window.PermSecActual = null;
        cargarPermisos(); // refrescar la tabla
    } else {
        alert(json.message);
    }


    }else{
    // Construir el objeto con los permisos
    const permisos = {
        PermDesc: permDesc,
        PermCreForm: document.getElementById('PermCreForm').checked ? 'S' : 'N',
        PerElForm: document.getElementById('PerElForm').checked ? 'S' : 'N',
        PerRespEn: document.getElementById('PerRespEn').checked ? 'S' : 'N',
        PerRespIna: document.getElementById('PerRespIna').checked ? 'S' : 'N',
        PerRespImpEx: document.getElementById('PerRespImpEx').checked ? 'S' : 'N',
        PerRespImpFoto: document.getElementById('PerRespImpFoto').checked ? 'S' : 'N',
        PerRespDes: document.getElementById('PerRespDes').checked ? 'S' : 'N',
        PermConfSis: document.getElementById('PermConfSis').checked ? 'S' : 'N'
    };
    
    try {
        const response = await fetch('/api/permisos/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(permisos)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Perfil creado exitosamente');
            // Limpiar formulario
              cargarPermisos();
            document.getElementById('PermDesc').value = '';
            document.querySelectorAll('.perm-check').forEach(cb => cb.checked = false);
        } else {
            alert(data.message || 'Error al crear el perfil');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
    }


});

// Manejar el botón cancelar
document.querySelector('.btn-cancelar').addEventListener('click', function() {
    document.getElementById('PermDesc').value = '';
    document.querySelectorAll('.perm-check').forEach(cb => cb.checked = false);
});

// Manejar el botón de seleccionar todos
document.getElementById('selectAllBtn').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.perm-check');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
    
    this.textContent = allChecked ? 'Elegir todos' : 'Desmarcar todos';
});
cargarPermisos() ;
cargarUsuarios();
}


async function cargarPermisos() {
    try {
        const res = await fetch('/api/permisos/permisos');
        const data = await res.json();

        const tbody = document.querySelector("#tablaPermisos tbody");
        tbody.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td onclick="Editar(${item.PermSec})"><i class="fa-solid fa-pen"></i></td>
            <td onclick="Eliminar(${item.PermSec})">
    <i class="fa-solid fa-trash"></i>
</td>
                <td>${item.PermDesc}</td>
                <td><input disabled type="checkbox" ${item.PermCreForm === 'S' ? "checked" : ""}></td>
                <td><input disabled type="checkbox" ${item.PerElForm === 'S' ? "checked" : ""}></td>
                <td><input disabled type="checkbox" ${item.PerRespEn === 'S' ? "checked" : ""}></td>
                <td><input disabled type="checkbox" ${item.PerRespIna === 'S' ? "checked" : ""}></td>
                <td><input disabled type="checkbox" ${item.PerRespImpEx === 'S' ? "checked" : ""}></td>
                <td><input disabled type="checkbox" ${item.PerRespImpFoto === 'S' ? "checked" : ""}></td>
                <td><input disabled type="checkbox" ${item.PerRespDes === 'S' ? "checked" : ""}></td>
                <td><input disabled type="checkbox" ${item.PermConfSis === 'S' ? "checked" : ""}></td>
            `;

            tbody.appendChild(row);
        });
    } catch (e) {
        console.error("Error cargando permisos:", e);
    }

    cargarUsuarios() 
}



async function Editar(PermSec) {
    // Mostrar el modal
    document.getElementById("rolesModal").style.display = "block";

    // Guardar temporal el PermSec que se está editando
    window.PermSecActual = PermSec;

    const res = await fetch(`/api/permisos/permisos/${PermSec}`);
    const json = await res.json();

    if (!json.success) {
        alert("No se encontró el permiso");
        return;
    }

    const data = json.data;

    // Llenar inputs
    document.getElementById("PermDesc").value = data.PermDesc;

    // Llenar checkboxes (si es 'S' marcar)
    document.getElementById("PermCreForm").checked = data.PermCreForm === "S";
    document.getElementById("PerElForm").checked = data.PerElForm === "S";
    document.getElementById("PerRespEn").checked = data.PerRespEn === "S";
    document.getElementById("PerRespIna").checked = data.PerRespIna === "S";
    document.getElementById("PerRespImpEx").checked = data.PerRespImpEx === "S";
    document.getElementById("PerRespImpFoto").checked = data.PerRespImpFoto === "S";
    document.getElementById("PerRespDes").checked = data.PerRespDes === "S";
    document.getElementById("PermConfSis").checked = data.PermConfSis === "S";
}


async function Eliminar(PermSec) {

    const confirmar = confirm("¿Seguro que deseas eliminar este perfil?");
    if (!confirmar) return;

    const res = await fetch("/api/permisos/Eliminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PermSec })
    });

    const json = await res.json();

    if (json.success) {
        alert("Perfil eliminado correctamente");
        cargarPermisos(); // refrescar tabla
    } else {
        alert("Error: " + json.message);
    }
}


async function cargarUsuarios() {
    const resUsuarios = await fetch("/api/permisos/Usuario");
  const usuarios = await resUsuarios.json();

  const resPermisos = await fetch("/api/permisos/permisosSelect");
  const permisosList = await resPermisos.json();

  const tbody = document.querySelector("#tablaPermisosUsuario tbody");
  tbody.innerHTML = "";

  usuarios.forEach(u => {
    const tr = document.createElement("tr");

    // Color por estado
    tr.classList.add(`estado-${u.UsuEst}`);

    // -------- COMBO PERFIL --------
    let perfilSelect = `<select class="comboPerfil"> <option value="">Sin Perfil</option>`;
    permisosList.forEach(p => {
      const selected = p.PermSec === u.PermSec ? "selected" : "";
      perfilSelect += `<option value="${p.PermSec}" ${selected}>${p.PermDesc}</option>`;
    });
    perfilSelect += `</select>`;

    // -------- COMBO ESTADO --------
    const estadoSelect = `
      <select class="comboEstado">
        <option value="A" ${u.UsuEst === "A" ? "selected" : ""}>Activo</option>
        <option value="I" ${u.UsuEst === "I" ? "selected" : ""}>Inactivo</option>
        <option value="P" ${u.UsuEst === "P" ? "selected" : ""}>Pendiente</option>
      </select>
    `;

    // Agregar columnas
    tr.innerHTML = `
      <td>${u.UsuNom}</td>
      <td>${perfilSelect}</td>
      <td>${estadoSelect}</td>
      <td> <button onclick="GuardarUser(${u.UsuId})" class="btn-guardarPerfil">Guardar</button></td>
      <td><input disabled type="checkbox" ${u.PermCreForm === "S" ? "checked" : ""}></td>
      <td><input disabled type="checkbox" ${u.PerElForm === "S" ? "checked" : ""}></td>
      <td><input disabled type="checkbox" ${u.PerRespEn === "S" ? "checked" : ""}></td>
      <td><input  disabled type="checkbox" ${u.PerRespIna === "S" ? "checked" : ""}></td>
      <td><input disabled type="checkbox" ${u.PerRespImpEx === "S" ? "checked" : ""}></td>
      <td><input disabled type="checkbox" ${u.PerRespImpFoto === "S" ? "checked" : ""}></td>
      <td><input disabled type="checkbox" ${u.PerRespDes === "S" ? "checked" : ""}></td>
      <td><input  disabled type="checkbox" ${u.PermConfSis === "S" ? "checked" : ""}></td>
    `;

    tbody.appendChild(tr);
  });
}


async function GuardarUser(UsuId) {
    try {
        // Obtener la fila donde se hizo clic
        const fila = event.target.closest("tr");

        // Obtener valores del combo perfil y estado
        const perfilSelect = fila.querySelector(".comboPerfil");
        const estadoSelect = fila.querySelector(".comboEstado");

        const PermSec = perfilSelect.value;
        const UsuEst = estadoSelect.value;

        // Enviar al backend
        const res = await fetch("/api/permisos/ActualizarPerfil", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                PermSec,
                UsuEst,
                UsuId
            })
        });

        const data = await res.json();

        if (data.success) {
            alert("Usuario actualizado correctamente");
    cargarUsuarios() 
            // Refrescar colores del estado
            fila.classList.remove("estado-A", "estado-I", "estado-P");
            fila.classList.add(`estado-${UsuEst}`);
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error("Error guardando usuario:", error);
        alert("Error guardando cambios");
    }
}


function permisosAplicar(){
  // Verificar el permiso PermConfSis
const puedeConfigurar = permisos.PermConfSis === "S";

const camposConfig = [
  "ConfOrgColor",
  "ConfOrgNom",
  "confOrgSubCar",
  "ConfOrgLogo",
  "confOrgPort",
  "confOrgFot",
  "confOrgAlcCar"
];
// Aplicar permisos
camposConfig.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.disabled = !puedeConfigurar;
});

// Opcional: cambiar la apariencia de las cajas de carga cuando están deshabilitadas
document.querySelectorAll(".upload-area").forEach(box => {
  if (!puedeConfigurar) {
    box.style.pointerEvents = "none";
    box.style.opacity = "0.5";
  }
});

}


// FUNCIÓN CERRAR SESIÓN
async function cerrarSesion() {
  if (window.authToken) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + window.authToken,
        },
      });
    } catch (error) {
      console.error("Error en logout:", error);
    }
  }

  // Limpiar todo
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("expiresAt");

  window.authToken = null;
  window.currentUser = null;

  window.location.href = "/";
}