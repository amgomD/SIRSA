// Sirsa Navbar JavaScript
   window.permisos = localStorage.getItem('permissions');
   const permissions = JSON.parse(window.permisos);

document.addEventListener('DOMContentLoaded', function() {






    // Cargar el navbar en todas las páginas
    function loadNavbar() {
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        if (navbarPlaceholder) {
            fetch('navbar.html')
                .then(response => response.text())
                .then(data => {
                    navbarPlaceholder.innerHTML = data;
                    initNavbarFunctionality();
                })
                .catch(error => {
                    console.error('Error loading navbar:', error);
                });
        }
    }
    
    // Función para detectar si estamos en móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// Función para detectar si estamos en tablet
function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

// Función para detectar si estamos en desktop
function isDesktop() {
    return window.innerWidth > 1024;
}


    // Inicializar funcionalidades del navbar
    function initNavbarFunctionality() {
        // Menú hamburguesa
    const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
        console.log("Menu hamburguesa clickeado");
        
        // Detectar el tipo de dispositivo
        const isMobile = window.innerWidth <= 768;
        const isTabletOrDesktop = window.innerWidth > 768;
        
        if (isMobile) {
            // === COMPORTAMIENTO PARA MÓVIL ===
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Manejar scroll del body
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            
        } else if (isTabletOrDesktop) {
            // === COMPORTAMIENTO PARA TABLET/DESKTOP ===

            // Cerrar menú móvil si está abierto
            if (mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Activar sidebar toggle
            if (typeof SirsaSidebar !== 'undefined') {
                SirsaSidebar.toggle();
            }
        }
    });
}


        
        // Cerrar menú móvil al hacer click fuera
        document.addEventListener('click', function(event) {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                    menuToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                  
                }
            }
        });
        
        // Funcionalidad de búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Shortcut Ctrl+K para enfocar la búsqueda
            document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    searchInput.focus();
                }
            });
            
            // Búsqueda en tiempo real (opcional)
            let searchTimeout;
            searchInput.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length > 2) {
                    searchTimeout = setTimeout(() => {
                       //performSearch(query);
                    }, 300);
                }
            });
            
            // Enter para buscar
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = e.target.value.trim();
                    if (query) {
                       performSearch(query);
                    }
                }
            });
        }
        
        // Manejar redimensionamiento de ventana
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
              const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
        // Si cambiamos a tablet/desktop, cerrar menú móvil
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
            console.log("Menú móvil cerrado por resize");
        }
    } else {
        // Si cambiamos a móvil, cerrar sidebar
        if (typeof SirsaSidebar !== 'undefined') {
            SirsaSidebar.close();
            console.log("Sidebar cerrado por resize");
        }
    }
        });
        
        // Scroll behavior para el navbar
        let lastScrollTop = 0;
        const navbar = document.querySelector('.sirsa-navbar');
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
        
        // Agregar transition al navbar para el efecto de hide/show
        navbar.style.transition = 'transform 0.3s ease';
    }
    
    // Función de búsqueda
    function performSearch(query) {
obtenerPersonal(query) 
        showNotification(`Buscando: "${query}"`);
    }
    async function obtenerPersonal(query) {
  // Obtener el valor del input con el id (por ejemplo, desde un campo de texto)
  const id = query;

  if (!id) {
    alert("Por favor ingresa un ID o documento.");
    return;
  }

  try {
    const response = await fetch("/api/personal/personal/obtenerDoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error al obtener el personal");
    }

    if (result.success && result.data) {
      const personal = result.data;
      // Redirigir a la página con el id obtenido
      window.location.href = `encuestado?id=${personal.id}`;
    } else {
          showNotification("No se encontró información del personal.");
    
    }

  } catch (error) {
    console.error("Error al obtener personal:", error);

     showNotification("Ocurrió un error al buscar el personal: " + error.message);

  }
}






    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: type === 'info' ? '#3b82f6' : '#10b981',
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
        }, 3000);
    }
    
    // Highlighted search results
    function highlightSearchTerm(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Cargar navbar automáticamente
    loadNavbar();
    
    // Si el navbar ya está en el DOM, inicializar directamente
    if (document.querySelector('.sirsa-navbar')) {
        initNavbarFunctionality();
    }
});

// Función global para actualizar el contador de notificaciones (opcional)
window.updateNotificationCount = function(count) {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
};


function obtenerConfig() {
  const data = localStorage.getItem("configuracion");
  return data ? JSON.parse(data) : null;
}

// Ejemplo de uso:
const config = obtenerConfig();

if (config) {
  console.log("Nombre Alcaldía:", config.nombreAlcaldia);
  console.log("Color principal:", config.color);
  // Ejemplo: aplicar color al header
  //document.querySelector("header").style.backgroundColor = config.color;
}

// Exportar funciones si se usan módulos ES6
// export { loadNavbar, performSearch, showNotification };