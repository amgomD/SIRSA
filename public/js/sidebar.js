// Sirsa Sidebar JavaScript

document.addEventListener("DOMContentLoaded", function () {
  infocargarConfiguracion();

  // Cargar el sidebar en todas las páginas
  function loadSidebar() {
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) {
      fetch("sidebar.html")
        .then((response) => response.text())
        .then((data) => {
          sidebarPlaceholder.innerHTML = data;
          initSidebarFunctionality();
          // Datos del usuario
          window.authToken = localStorage.getItem("authToken");
          window.currentUser = localStorage.getItem("currentUser");

          verificarToken();
        })
        .catch((error) => {
          console.error("Error loading sidebar:", error);
        });
    }
  }

  // Inicializar funcionalidades del sidebar
  function initSidebarFunctionality() {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const userMenuToggle = document.getElementById("userMenuToggle");
    const userDropdown = document.getElementById("userDropdown");

    // Toggle sidebar en móvil
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function () {
        toggleSidebar();
      });
    }

    // Cerrar sidebar con overlay
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", function () {
        closeSidebar();
      });
    }

    // Toggle menú de usuario
    if (userMenuToggle && userDropdown) {
      userMenuToggle.addEventListener("click", function (e) {
        console.log("goooo");
        e.stopPropagation();
        userDropdown.classList.toggle("active");
      });
    }

    // Cerrar menú de usuario al hacer click fuera
    document.addEventListener("click", function (event) {
      if (userDropdown && userDropdown.classList.contains("active")) {
        if (
          !userDropdown.contains(event.target) &&
          !userMenuToggle.contains(event.target)
        ) {
          userDropdown.classList.remove("active");
        }
      }
    });

    // Manejar navegación activa
    updateActiveNavigation();

    // Manejar redimensionamiento
    window.addEventListener("resize", handleResize);

    // Manejar escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeSidebar();
        if (userDropdown) {
          userDropdown.classList.remove("active");
        }
      }
    });

    // Agregar tooltips en modo colapsado (desktop)
    addTooltips();
  }

  // Función para toggle del sidebar
  function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (sidebar) {
      const isActive = sidebar.classList.contains("active");

      if (isActive) {
        console.log("ffffffffffffff");
        closeSidebar();
      } else {
        openSidebar();
      }
    }
  }

  // Abrir sidebar
  function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (sidebar && overlay) {
      sidebar.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  // Cerrar sidebar
  function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const userDropdown = document.getElementById("userDropdown");

    if (sidebar && overlay) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    if (userDropdown) {
      userDropdown.classList.remove("active");
    }
  }

  // Actualizar navegación activa basada en la URL actual
  function updateActiveNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const currentPath = window.location.pathname;

    navLinks.forEach((link) => {
      link.classList.remove("active");

      // Comparar href con la URL actual
      const href = link.getAttribute("href");
      if (
        href === currentPath ||
        (currentPath === "/" && href === "/dashboard")
      ) {
        link.classList.add("active");
      }
    });
  }

  // Manejar cambios de tamaño de ventana
  function handleResize() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (window.innerWidth > 1024) {
      // Desktop - cerrar sidebar móvil si está abierto
      if (sidebar && overlay) {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  }

  // Agregar tooltips para modo colapsado
  function addTooltips() {
    const navLinks = document.querySelectorAll(".nav-link");
    const footerLinks = document.querySelectorAll(".footer-link");

    function createTooltip(element, text) {
      element.setAttribute("title", text);
      element.setAttribute("data-tooltip", text);
    }

    navLinks.forEach((link) => {
      const text = link.querySelector(".nav-text")?.textContent;
      if (text) {
        createTooltip(link, text);
      }
    });

    footerLinks.forEach((link) => {
      const text = link.querySelector(".footer-text")?.textContent;
      if (text) {
        createTooltip(link, text);
      }
    });
  }

  // Función para colapsar/expandir sidebar en desktop
  function toggleSidebarCollapse() {
    document.body.classList.toggle("sidebar-collapsed");

    // Guardar estado en localStorage
    const isCollapsed = document.body.classList.contains("sidebar-collapsed");
    localStorage.setItem("sidebarCollapsed", isCollapsed);
  }

  // Restaurar estado del sidebar desde localStorage
  function restoreSidebarState() {
    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    }
  }

  // Función para actualizar información del usuario
  function updateUserInfo(userData) {
    const userName = document.querySelector(".user-name");
    const userId = document.querySelector(".user-id");
    const userAvatar = document.querySelector(".user-avatar");

    if (userName && userData.name) {
      userName.textContent = userData.name;
    }

    if (userId && userData.id) {
      userId.textContent = userData.id;
    }

    if (userAvatar && userData.avatar) {
      userAvatar.innerHTML = `<img src="${userData.avatar}" alt="${userData.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
  }

  // Función para destacar notificaciones o elementos
  function highlightNavItem(path, highlight = true) {
    const navLink = document.querySelector(`[href="${path}"]`);
    if (navLink) {
      if (highlight) {
        navLink.classList.add("has-notification");
      } else {
        navLink.classList.remove("has-notification");
      }
    }
  }

  // Función para agregar badge de notificación
  function addNotificationBadge(path, count) {
    const navLink = document.querySelector(`[href="${path}"]`);
    if (navLink) {
      // Remover badge existente
      const existingBadge = navLink.querySelector(".notification-badge");
      if (existingBadge) {
        existingBadge.remove();
      }

      // Agregar nuevo badge si count > 0
      if (count > 0) {
        const badge = document.createElement("span");
        badge.className = "notification-badge";
        badge.textContent = count > 99 ? "99+" : count;
        navLink.appendChild(badge);
      }
    }
  }

  // Manejar navegación con SPA (Single Page Application)
  function handleSPANavigation() {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        // Si es una URL interna y no tiene target="_blank"
        if (href && href.startsWith("/") && !this.hasAttribute("target")) {
          e.preventDefault();

          // Actualizar estado activo
          navLinks.forEach((l) => l.classList.remove("active"));
          this.classList.add("active");

          // Cerrar sidebar en móvil
          if (window.innerWidth <= 1024) {
            closeSidebar();
          }

          // Aquí puedes agregar tu lógica de routing
          // Por ejemplo: router.navigate(href);
          console.log("Navigating to:", href);

          // Simular navegación (reemplazar con tu router real)
          history.pushState(null, null, href);
        }
      });
    });
  }

  // Inicializar todo
  function init() {
    loadSidebar();
    restoreSidebarState();

    // Si el sidebar ya está en el DOM
    if (document.querySelector(".sirsa-sidebar")) {
      initSidebarFunctionality();
    }
  }

  // Cargar sidebar automáticamente
  init();

  // Exponer funciones globales útiles
  window.SirsaSidebar = {
    toggle: toggleSidebar,
    collapse: toggleSidebarCollapse,
    updateUser: updateUserInfo,
    highlight: highlightNavItem,
    addBadge: addNotificationBadge,
    close: closeSidebar,
    open: openSidebar,
  };
});

// CSS adicional para notificaciones y badges
const additionalStyles = `
    .nav-link.has-notification {
        position: relative;
        background-color: #fef3c7 !important;
        border-left-color: #f59e0b !important;
    }
    
    .notification-badge {
        position: absolute;
        top: 8px;
        right: 16px;
        background-color: #ef4444;
        color: white;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
        line-height: 1.2;
    }
    
    .sidebar-collapsed .notification-badge {
        top: 4px;
        right: 4px;
    }
    
    /* Tooltip styles para modo colapsado */
    .sidebar-collapsed [data-tooltip] {
        position: relative;
    }
    
    .sidebar-collapsed [data-tooltip]:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        background-color: #1f2937;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        margin-left: 10px;
        opacity: 0;
        animation: tooltipFadeIn 0.2s ease forwards;
    }
    
    .sidebar-collapsed [data-tooltip]:hover::before {
        content: '';
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-left: 5px;
        border: 5px solid transparent;
        border-right-color: #1f2937;
        z-index: 1000;
    }
    
    @keyframes tooltipFadeIn {
        from { opacity: 0; transform: translateY(-50%) translateX(-5px); }
        to { opacity: 1; transform: translateY(-50%) translateX(0); }
    }
    
    /* Animación suave para el colapso */
    .sirsa-sidebar .nav-text,
    .sirsa-sidebar .footer-text,
    .sirsa-sidebar .logo-text,
    .sirsa-sidebar .user-details {
        transition: opacity 0.2s ease, width 0.2s ease;
    }
    
    /* Estados de carga */
    .nav-link.loading {
        pointer-events: none;
        opacity: 0.6;
    }
    
    .nav-link.loading::after {
        content: '';
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        border: 2px solid #d1d5db;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: translateY(-50%) rotate(360deg); }
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// FUNCIÓN VERIFICAR TOKEN
async function verificarToken() {
  if (!window.authToken) {
    mostrarMensaje("dashboardMessage", "No hay token", "error");
    window.location.href = "/";
    return;
  }

  mostrarMensaje("dashboardMessage", "Verificando token...", "info");

  try {
    const response = await fetch("/api/auth/verify", {
      headers: {
        Authorization: "Bearer " + window.authToken,
      },
    });

    const data = await response.json();

    if (data.valid) {
      document.getElementById("usernom").innerHTML = data.user.nombre;
      document.getElementById("usuced").innerHTML = data.user.cedula;
      if(document.getElementById("usernomconf")){
document.getElementById("usernomconf").innerHTML = `<i class="fa-solid fa-circle-user"></i> `+data.user.nombre;

      }
      
      
    } else {
      mostrarMensaje("statuslog", "Token inválido: " + data.message, "error");
      cerrarSesion();
    }
  } catch (error) {
    mostrarMensaje("statuslog", "Error verificando token" + error, "error");
  }
}

function mostrarMensaje(elementId, mensaje, tipo) {
  const element = document.getElementById("statuslog");
  if (tipo === "error") {
    setTimeout(() => {
      element.classList.remove("active");
      element.classList.add("inactive");
    }, 500);
  } else {
    element.classList.add("active");
    element.classList.remove("inactive");
  }
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

async function infocargarConfiguracion() {
  try {
    const hoy = new Date().toISOString().split("T")[0]; // formato: "2025-10-05"
    const ultimaCarga = localStorage.getItem("configuracion_fecha");

    if (ultimaCarga === hoy) {
      console.log("🟡 Configuración ya cargada hoy, usando localStorage.");
      const data = JSON.parse(localStorage.getItem("configuracion"));
      if (data && data.ConfOrgColor) {
        document.documentElement.style.setProperty(
          "--color-principal",
          data.ConfOrgColor
        );
      }
      return; // ⛔ No vuelve a pedir al servidor
    }

    const response = await fetch("/api/configuracion/traer");
    const data = await response.json();

    if (!data) {
      console.warn("⚠️ No hay configuración guardada aún.");
      return;
    }

    // Guardar datos y fecha
    localStorage.setItem("configuracion", JSON.stringify(data));
    localStorage.setItem("configuracion_fecha", hoy);

    // Aplicar color principal
    if (data.ConfOrgColor) {
      document.documentElement.style.setProperty("--color-principal", data.ConfOrgColor);
    }


    console.log("Configuración cargada:", data);
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }
}
