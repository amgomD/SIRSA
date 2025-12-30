// Generar código QR con los datos del carnet





let Alcaldiaconfig = JSON.parse(localStorage.getItem("configuracion"));

let urlBase = window.location.origin;  
document.getElementById("exportBtn").addEventListener("click", async () => {
     

     const data = await getHTMLCards();

  const res = await fetch("/api/carnets/zip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data })
  });

  // Descargar el ZIP
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "carnets.zip";
  a.click();
  URL.revokeObjectURL(url);
});


async function getHTMLCards() {
  // 1. Traer el CSS

    let css = await fetch("styles/CarnetDescargar.css").then((res) => res.text());
    const color = Alcaldiaconfig?.ConfOrgColor || "#3366cc";
    css = css.replace(
      /(--color-principal:\s*)(#[0-9A-Fa-f]{3,6}|[a-zA-Z]+)(\s*;?)/,
      `$1${color}$3`
    );

  // 2. Obtener todos los carnets
  const cards = document.querySelectorAll(".id-card");
  const data = [];

for (const card of cards) {
  // Convertir imágenes del carnet a base64
  const cardHTML = await convertImagesToBase64(card);
  const Nombre = card.dataset.info; 
  const html = `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${cardHTML}
      </body>
    </html>
  `;

  data.push({ html,Nombre });
}

  return data;
}


async function convertImagesToBase64(card) {
  const clone = card.cloneNode(true);

  const imgs = clone.querySelectorAll("img");

  for (const img of imgs) {
    const src = img.getAttribute("src");

    // Si ya es base64, saltar
    if (src.startsWith("data:image")) continue;

    const response = await fetch(src);
    const blob = await response.blob();

    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    img.setAttribute("src", base64);
  }

  return clone.outerHTML;
}

        const API_URL = 'http://localhost:3000';


        // Formatear fecha
        function formatearFecha(fecha) {
            if (!fecha) return 'N/A';
            const date = new Date(fecha);
            const dia = String(date.getDate()).padStart(2, '0');
            const mes = String(date.getMonth() + 1).padStart(2, '0');
            const ano = date.getFullYear();
            return `${dia}/${mes}/${ano}`;
        }

        // Calcular tiempo en organización
        function calcularTiempo(fechaOrg) {
            if (!fechaOrg) return 'N/A';
            const inicio = new Date(fechaOrg);
            const ahora = new Date();
            const anos = ahora.getFullYear() - inicio.getFullYear();
            const meses = ahora.getMonth() - inicio.getMonth();
            
            if (anos > 0) {
                return `${anos} año${anos > 1 ? 's' : ''}`;
            } else if (meses > 0) {
                return `${meses} mes${meses > 1 ? 'es' : ''}`;
            }
            return 'Menos de 1 mes';
        }

        // Crear el carnet
       async  function crearCarnet(persona) {
            const fotoUrl = persona.foto;

                   let logoBase64 = await cargarImagenBase64("img/bloqueheader4384.png");
  if (Alcaldiaconfig.ConfOrgLogo) {
    logoBase64 = Alcaldiaconfig.ConfOrgLogo;
  }
   if (Alcaldiaconfig.ConfOrgColor) {
      document.documentElement.style.setProperty("--color-principal", Alcaldiaconfig.ConfOrgColor);
    }
  let nombreAlcaldia = Alcaldiaconfig.ConfOrgNom;
  let subtitulo = Alcaldiaconfig.confOrgSubCar;

let logoenc =  document.getElementById('logoenc');
logoenc.src = logoBase64;

const ahora = new Date();

const fechaActual =
    String(ahora.getDate()).padStart(2, '0') +
    String(ahora.getMonth() + 1).padStart(2, '0') +
    ahora.getFullYear() +
    String(ahora.getHours()).padStart(2, '0') +
    String(ahora.getMinutes()).padStart(2, '0') +
    String(ahora.getSeconds()).padStart(2, '0') +
    String(ahora.getMilliseconds()).padStart(3, '0');

            return `
   <div data-info="${persona.cedula+"-"+fechaActual}"  id="id-card" class="id-card">
            
    <div class="flip-card">


    
        <div class="flip-inner">

            <!-- FRENTE -->
            <div    class="fcard front">
                <div class="fondo">
                    <img src="img/FondoFront.svg" alt="">
                </div>
                <div class="top">Carnet digital <p>de <span>recicladores</span></p>
                    <p>2025</p>
                </div>
                <div><img class="photo" src="${fotoUrl}" alt="Foto de ${persona.nombre}"></div>
                <div class="content">
                    <div class="name">
                        <p>${persona.nombre} </p>
                        <div class="infoCard">
                            <div class="lado">
                                <div class="role">RECICLADOR</div>
                                <div class="info">${persona.tipoDoc || "CC"} ${persona.cedula}</div>
                            </div>
                         <div class="ladoD">
                                <div class="infox"><b>RH</b><p>${
                                    persona.PerTipRH || "N/A"
                                    }</p>
                                </div>
                            </div>



                        </div>
                        <div class="infoorganizacion">
                            <h2>Organización</h2>
                            <b>${
                                persona.organizacion || "N/A"
                                }</b>
                        </div>

                        <div class="infoActCo">
                            <div class="itemLado">
                                <div class="Item">
                                    Actividad que realiza
                                </div>
                                <b>${
                                    persona.actividad || "N/A"
                                    }</b>
                            </div>

                            <div class="itemLado borde">
                                <div class="Item">
                                    Contacto
                                </div>
                                <b>${
                                    persona.telefono || "N/A"
                                    }</b>
                            </div>

                        </div>


                        <div class="infoActCo">
                            <div class="itemLado2">
                                <div class="Item">
                                    Dirección
                                </div>
                                <b>${
                                    persona.direccion || "N/A"
                                    }</b>
                            </div>

                            <div class="itemLado2 borde">
                                <div class="Item">
                                    Comuna
                                </div>
                                <b>${
                                    persona.localidad || "N/A"
                                    }</b>
                            </div>
                            <div class="itemLado2 borde">
                                <div class="Item">
                                    Fecha de nacimiento
                                </div>
                                <b>${formatearFecha(persona.fechaNacimiento)}</b>
                            </div>
                        </div>


                    </div>


                </div>
                <div class="footer"> <img src="${
                                  Alcaldiaconfig.ConfOrgLogo ||
                                  " https://www.floridablanca.gov.co/info/floridablanca_se/media//bloqueheader4384.png"
                        }" alt="Logo Alcaldía">
                </div>
            </div>

              <!-- REVERSO -->
            <div class="fcard backx">
                 <div class="fondo">
                    <img src="img/FondoBack.svg" alt="">
                </div>
                <div class="curve"></div>
                   <div class="info-reverso">
                              <p>
    Este carnet es personal e intransferible y lo acredita únicamente como
    Reciclador Censado por el Gobierno de Floridablanca.
  </p>

  <p>
    El uso inadecuado de este documento es responsabilidad del titular.
    Debe portarlo siempre en lugar visible durante la actividad de reciclaje.
  </p>

  <p>
    En caso de pérdida o extravío informar a la Oficina de Gestión Ambiental
    y Mitigación del Riesgo de la Alcaldía de Floridablanca.
  </p>
<h3>Consulte Censo de Recicladores</h3>
<div class="qr qr-code" data-text="${urlBase}/carnet.html?id=${
    persona.id
  }">
                            </div>
                            


                            </div>
                <div class="footer"><img src="img/LogoBack.png" alt="Logo Alcaldía"></div>
            </div>



        </div>
            <!-- REVERSO -->
            <div class="fcard back">
            
                 <div class="fondo">
                    <img src="img/FondoBack.svg" alt="">
                </div>
                <div class="curve"></div>
               
            <div class="info-reverso">
                              <p>
    Este carnet es personal e intransferible y lo acredita únicamente como
    Reciclador Censado por el Gobierno de Floridablanca.
  </p>

  <p>
    El uso inadecuado de este documento es responsabilidad del titular.
    Debe portarlo siempre en lugar visible durante la actividad de reciclaje.
  </p>

  <p>
    En caso de pérdida o extravío informar a la Oficina de Gestión Ambiental
    y Mitigación del Riesgo de la Alcaldía de Floridablanca.
  </p>
<h3>Consulte Censo de Recicladores</h3>
<div class="qr qr-code" data-text="${urlBase}/carnet.html?id=${
    persona.id
  }"></div></div>
  
                <div class="footer"><img src="img/LogoBack.png" alt="Logo Alcaldía"></div>
            </div>

    </div>



    
                </div>
            `;
        }

        // Cargar datos del carnet
        async function cargarCarnet() {
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const container = document.getElementById('carnet-container');

            try {
                // Obtener ID de la URL
                const id = getIdFromURL();
                
                if (!id) {
                    throw new Error('Ingresa un documento para buscar');
                }

                console.log('Cargando carnet para ID:', id);
error.style.display = 'none';
                // Hacer petición al servidor
                const response = await fetch(`/api/personal/personal/CarnetId`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Error al obtener datos');
                }

                if (result.data.length === 0) {
                    throw new Error('Ingresa un documento para buscar');
                }

                // Crear y mostrar el carnet
                const persona = result.data[0];
                container.innerHTML = await crearCarnet(persona);
                loading.style.display = 'none';
      document.querySelectorAll(".qr-code").forEach((el) => {
        new QRCode(el, {
          text: el.dataset.text, // usa el texto definido en data-text
          width: 90,
          height: 90,
          colorDark: "#000000",
          colorLight: "#ffffff",
        });
      });
            } catch (err) {
                console.error('Error:', err);
                loading.style.display = 'none';
                error.textContent = `Error: ${err.message}`;
                error.style.display = 'block';
            }
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
        console.error('Error cargando imagen:', error);
        return null;
    }
}

        // Cargar al iniciar
        document.addEventListener('DOMContentLoaded', cargarCarnet);
