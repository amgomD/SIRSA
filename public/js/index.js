infocargarConfiguracion();
foto();


const iframe = document.getElementById("miIframe");

iframe.addEventListener("load", () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const boton = iframeDoc.getElementById("exportBtn");

    if (iframe.contentWindow.location.pathname === "/wccarnet") {
        boton.style.display = "none";
    }
});




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
      document.documentElement.style.setProperty(
        "--color-principal",
        data.ConfOrgColor
      );
    }

    console.log("Configuración cargada:", data);
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }
}
async function foto() {
  let Alcaldiaconfig = JSON.parse(localStorage.getItem("configuracion"));

  let logoBase64 = await cargarImagenBase64("img/bloqueheader4384.png");
  if (Alcaldiaconfig.ConfOrgLogo) {
    logoBase64 = Alcaldiaconfig.ConfOrgLogo;
  }
  if (Alcaldiaconfig.ConfOrgColor) {
    document.documentElement.style.setProperty(
      "--color-principal",
      Alcaldiaconfig.ConfOrgColor
    );
  }
  let nombreAlcaldia = Alcaldiaconfig.ConfOrgNom;
  let subtitulo = Alcaldiaconfig.confOrgSubCar;

  let logoenc = document.getElementById("logoenc");
  let logofoot = document.getElementById("logofoot"); 
  logoenc.src = logoBase64;
  logofoot.src = logoBase64;
}




async function cargarImagenBase64(rutaImagen) {
  try {
    const response = await fetch(rutaImagen);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error cargando imagen:", error);
    return null;
  }
}




const modal = document.getElementById("modalDatos");
const btn = document.getElementById("btnExplorar");
const closeBtn = document.querySelector(".close");

// Abrir modal
btn.onclick = function() {
  modal.style.display = "flex";
};

// Cerrar modal
closeBtn.onclick = function() {
  modal.style.display = "none";
};

// Cerrar haciendo clic afuera
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};



// Animación suave al entrar
const cards = document.querySelectorAll(".animate");

window.addEventListener("load", () => {
    cards.forEach((card, i) => {
        setTimeout(() => card.classList.add("show"), i * 200);
    });
});



const fades = document.querySelectorAll(".fade");

window.addEventListener("load", () => {
    fades.forEach((el, i) => {
        setTimeout(() => el.classList.add("show"), i * 200);
    });
});
