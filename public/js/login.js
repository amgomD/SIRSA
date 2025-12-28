   // Variables globales
        window.authToken = localStorage.getItem('authToken');
        window.currentUser = localStorage.getItem('currentUser');

        // Si ya está logueado, ir al dashboard
        if (window.authToken) {
            window.location.href = '/dashboard';
        }

        // Manejar submit del formulario
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('message');
            
            // Mostrar cargando
            messageEl.innerHTML = 'Iniciando sesión...';
            messageEl.className = 'message';
            messageEl.style.display = 'block';
            
            try {
                // Hacer petición de login
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Guardar token y usuario
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                            localStorage.setItem('permissions', JSON.stringify(data.permissions));



                    // Actualizar variables globales
                    window.authToken = data.token;
                    window.currentUser = data.user;
                    
                    // Mostrar éxito
                    messageEl.innerHTML = 'Login exitoso, redirigiendo...';
                    messageEl.className = 'message success';
                    
                    // Redirigir al dashboard
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                    
                } else {
                    // Mostrar error
                    messageEl.innerHTML = data.message;
                    messageEl.className = 'message error';
                }
                
            } catch (error) {
                // Error de conexión
                messageEl.innerHTML = 'Error de conexión';
                messageEl.className = 'message error';
            }
        });

// Función para manejar el formulario de registro
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
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {



             mostrarMensajelog('loginMessage', 'Usuario registrado exitosamente, pendiente de aprobación del administrador', 'success');
            
            // Limpiar formulario
            this.reset();
            // Opcional: cambiar a login después de 2 segundos
            setTimeout(() => {
                loginnForm(); // Tu función para mostrar login
            }, 2000);
            
        } else {
            alert( result.message || 'Error al registrar usuario');
        }
        
    } catch (error) {
        alert('Error de conexión '+error);
    }
});

// Función alternativa para obtener solo los datos (sin enviar)
function obtenerDatosFormulario() {
    const form = document.getElementById('registrarForm');
    const formData = new FormData(form);
    
    const userData = {
        nombre: formData.get('UsuNom'),
        cedula: formData.get('UsuCedula'),
        telefono: formData.get('UsuTel'),
        email: formData.get('UsuEmail'),
        password: formData.get('UsuClave')
    };
    
    console.log('Datos del formulario:', userData);
    return userData;
}

// Función para mostrar mensajes
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

// Función para validar formulario sin enviar
function validarFormulario() {
    const datos = obtenerDatosFormulario();
    
    const errores = [];
    
    if (!datos.nombre) errores.push('Nombre es obligatorio');
    if (!datos.cedula) errores.push('Cédula es obligatoria');
    if (!datos.email) errores.push('Email es obligatorio');
    if (!datos.password) errores.push('Contraseña es obligatoria');
    
    if (datos.email && !datos.email.includes('@')) {
        errores.push('Email debe ser válido');
    }
    
    if (datos.password && datos.password.length < 6) {
        errores.push('Contraseña debe tener al menos 6 caracteres');
    }
    
    if (errores.length > 0) {
        mostrarMensaje('loginMessage', errores.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Función simplificada para solo obtener JSON
function getFormJSON() {
    const form = document.getElementById('registrarForm');
    const inputs = form.querySelectorAll('input');
    
    const data = {};
    inputs.forEach(input => {
        data[input.name] = input.value;
    });
    
    return data;
}

// Ejemplo de uso:
// const jsonData = getFormJSON();
// console.log(jsonData);
// 
// Resultado:
// {
//     "UsuNom": "Juan Pérez",
//     "UsuCedula": "12345678",
//     "UsuTel": "300123456",
//     "UsuEmail": "juan@email.com",
//     "UsuClave": "mipassword"
// }













function registrarForm(){
    const registrar = document.getElementById('registrarForm')
    registrar.style.display = 'flex'
    
        const loginForm = document.getElementById('loginForm')
    loginForm.style.display = 'none'
}


function loginnForm(){
    const registrar = document.getElementById('registrarForm')
    registrar.style.display = 'none'
    
        const loginForm = document.getElementById('loginForm')
    loginForm.style.display = 'flex'
}