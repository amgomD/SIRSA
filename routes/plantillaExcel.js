const express = require("express");
const router = express.Router();
const db = require("../config/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const XLSX = require("xlsx");
const { console } = require("inspector");
const util = require("util");

function generarConsecutivo(contador = 1) {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes  = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia  = String(hoy.getDate()).padStart(2, "0");

  const consecutivo = String(contador).padStart(3, "0");

  return `${anio}${mes}${dia}-${consecutivo}`;
}
// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `upload_${timestamp}_${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      return cb(new Error("Solo se permiten archivos Excel (.xlsx, .xls)"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

class GeneradorPlantillaExcel {
  constructor(conexionDB) {
    this.db = conexionDB;
  }

  /**
   * Obtiene formularios agrupados por categoría desde la BD
   */
  async obtenerFormulariosDB() {
    const query = `
      SELECT 
        f.FormSec,
        f.FormPregunta,
        f.FormTipo,
        f.FormReq,
        f.FormOrden,
        f.FormJson,
        cf.CatFormSec,
        cf.CatFormDesc
      FROM formulario f
      INNER JOIN categoria cf ON f.CatFormSec = cf.CatFormSec
      ORDER BY  CatFormFecCre ASC
    `;

    const [formularios] = await this.db.query(query);

    // Agrupar por categoría
    const porCategoria = {};
    formularios.forEach((form) => {
      const cat = form.CatFormDesc || "Sin Categoría";
      if (!porCategoria[cat]) {
        porCategoria[cat] = [];
      }
      porCategoria[cat].push(form);
    });

    return { formularios, porCategoria };
  }

  /**
   * Genera el workbook completo de Excel
   */
  async generarWorkbook() {
    const workbook = XLSX.utils.book_new();

    // Obtener formularios
    const { formularios, porCategoria } = await this.obtenerFormulariosDB();

    // Crear hoja principal
    this.crearHojaEncuestas(workbook, { formularios, porCategoria });

    // Crear hoja de instrucciones
    this.crearHojaInstrucciones(workbook, { formularios, porCategoria });

    return workbook;
  }

  /**
   * Crea la hoja principal con estructura: Personal | Formularios
   */
  crearHojaEncuestas(workbook, { formularios, porCategoria }) {
    const data = [];

    // FILA 0: Categorías (vacío en columnas personales)
    const filaCategorias = this.obtenerCamposPersonales().map(() => "");

    // FILA 1: Encabezados
    const filaEncabezados = [...this.obtenerCamposPersonales()];

    // Agregar formularios dinámicos
    Object.entries(porCategoria).forEach(([categoria, forms]) => {
      forms.forEach((form) => {
        filaCategorias.push(categoria);
        filaEncabezados.push(form.FormPregunta);
      });
    });

    data.push(filaCategorias);
    data.push(filaEncabezados);

    // FILAS 2-3: Ejemplos
    /*const ejemplos = this.generarDatosEjemplo(porCategoria);
    ejemplos.forEach(ejemplo => data.push(ejemplo));
*/
    // Crear hoja
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Configurar anchos de columna
    const numCamposPersonales = this.obtenerCamposPersonales().length;
    ws["!cols"] = [];

    // Columnas personales
    for (let i = 0; i < numCamposPersonales; i++) {
      ws["!cols"].push({ wch: 20 });
    }

    // Columnas de formularios
    for (let i = numCamposPersonales; i < filaEncabezados.length; i++) {
      ws["!cols"].push({ wch: 25 });
    }

    XLSX.utils.book_append_sheet(workbook, ws, "Encuestas");
  }

  /**
   * Define campos personales (columnas fijas)
   */
  obtenerCamposPersonales() {
    return [
     "Nombre",
      "Tipo_documento",
      "No_Documento",
      "Genero",
      "Fecha_de_nacimiento",
      "Pais_de_nacimiento",
      "Celular",
      "Direccion",
      "Estrato",
      "Cabeza_de_hogar",
      "Estado_civil",
      "Libreta_militar",
      "Tiene_discapacidad",
      "Es_habitante_de_calle",
      "Tipo_de_sangre",
      "Estado",
      "Comuna_donde_labora",
      "Barrio",
      "Organizacion",
      "Tipo_de_vinculacion_Anos",
      "Tipo_de_vinculacion_Meses",
      "Actividad_que_realiza",
      "N_de_horas",
      "Jornada_AM",
      "Jornada_PM",
      "Dias_Lunes",
      "Dias_Martes",
      "Dias_Miercoles",
      "Dias_Jueves",
      "Dias_Viernes",
      "Dias_Sabado",
      "Dias_Domingo",
    ];
  }

  /**
   * Genera datos de ejemplo
   
  generarDatosEjemplo(porCategoria) {
    const ejemplos = [];
    
    // Ejemplo 1
    const ej1 = [
      'Juan Pérez',
      'CC',
      '1234567890',
      '01/01/2024',
      'Calle 10 #20-30',
      'Centro',
      'Asociación A',
      '15/01/2024',
      'Reciclador',
      '15/05/1990',
      34,
      '3001234567',
      'Activo',
      2024,
      'M'
    ];

    Object.values(porCategoria).forEach(forms => {
      forms.forEach(form => {
        ej1.push(this.generarRespuestaEjemplo(form));
      });
    });

    ejemplos.push(ej1);

    // Ejemplo 2
    const ej2 = [
      'María García',
      'CC',
      '9876543210',
      '15/02/2024',
      'Carrera 15 #25-50',
      'Norte',
      'No asociado',
      '01/02/2024',
      'Bodeguero',
      '20/08/1985',
      39,
      '3109876543',
      'Activo',
      2024,
      'F'
    ];

    Object.values(porCategoria).forEach(forms => {
      forms.forEach(form => {
        ej2.push(this.generarRespuestaEjemplo(form));
      });
    });

    ejemplos.push(ej2);

    return ejemplos;
  }

  /**
   * Genera respuesta ejemplo según tipo

  generarRespuestaEjemplo(formulario) {
    switch (formulario.FormTipo.toLowerCase()) {
      case 'texto':
        return 'Texto de ejemplo';
      case 'numero':
        return Math.floor(Math.random() * 10) + 1;
      case 'fecha':
        return '01/11/2024';
      case 'seleccion':
        try {
          const opciones = JSON.parse(formulario.FormJson);
          return opciones[0] || 'Opción 1';
        } catch {
          return 'Opción 1';
        }
      case 'boolean':
        return 'Sí';
      default:
        return '';
    }
  }
*/
  /**
   * Crea hoja de instrucciones
   */
  crearHojaInstrucciones(workbook, { porCategoria }) {
    const instrucciones = [
      ["INSTRUCCIONES PARA LLENAR LA PLANTILLA DE ENCUESTAS"],
      [""],
      ["ESTRUCTURA DEL ARCHIVO:"],
      [""],
      [" Columnas 1-15: DATOS PERSONALES (obligatorios)"],
      ["  - PerNom: Nombre completo de la persona"],
      ["  - PerTipoDoc: CC, TI, CE, etc."],
      ["  - PerDoc: Número de documento (único)"],
      ["  - FechaExp: Formato DD/MM/YYYY"],
      ["  - PerDir: Dirección completa"],
      ["  - localSec: Debe existir en la base de datos"],
      ["  - PerOrgSec: Debe existir en la base de datos"],
      ["  - Los demás campos son autoexplicativos"],
      [""],
      ["  Columnas 16+: FORMULARIOS DINÁMICOS (organizados por categoría)"],
      ["  - Fila 1: Nombre de la categoría del formulario"],
      ["  - Fila 2: Pregunta específica del formulario"],
      ["  - Filas 3+: Respuestas de cada persona"],
      [""],
    ];

    let colNum = 16;
    Object.entries(porCategoria).forEach(([categoria, forms]) => {
      instrucciones.push([
        `CATEGORÍA: ${categoria} (Columnas ${colNum}-${
          colNum + forms.length - 1
        })`,
      ]);
      forms.forEach((form, idx) => {
        const requerido = form.FormReq ? "[OBLIGATORIO]" : "[OPCIONAL]";
        instrucciones.push([
          `  ${colNum + idx}. ${form.FormPregunta} (${
            form.FormTipo
          }) ${requerido}`,
        ]);
      });
      instrucciones.push([""]);
      colNum += forms.length;
    });

    instrucciones.push([""]);
    instrucciones.push([" NOTAS IMPORTANTES:"]);
    instrucciones.push([
      "1. NO modifique las filas 1 y 2 (categorías y encabezados)",
    ]);
    instrucciones.push(["2. NO elimine columnas, solo agregue filas"]);
    instrucciones.push(["3. Agregue tantas filas como personas necesite"]);
    instrucciones.push(["4. Respete los formatos de fecha: DD/MM/YYYY"]);
    instrucciones.push([
      "5. Para campos de selección, use exactamente las opciones indicadas",
    ]);
    instrucciones.push([
      "6. Los campos marcados [OBLIGATORIO] no pueden estar vacíos",
    ]);
    instrucciones.push([
      "7. La Localidad y Organización deben existir en la base de datos",
    ]);
    instrucciones.push([""]);
    instrucciones.push([
      " Al terminar, guarde el archivo y envíelo al sistema para procesarlo",
    ]);

    const ws = XLSX.utils.aoa_to_sheet(instrucciones);
    ws["!cols"] = [{ wch: 80 }];

    XLSX.utils.book_append_sheet(workbook, ws, "Instrucciones");
  }
}

router.post("/generar", async (req, res) => {
  try {
    //console.log("Solicitud de generación de plantilla recibida");

    // Crear generador
    const generador = new GeneradorPlantillaExcel(db);

    // Generar workbook
    const workbook = await generador.generarWorkbook();

    // Convertir a buffer
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      compression: true,
    });

    // Nombre del archivo con timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .substring(0, 19);
    const nombreArchivo = `plantilla_encuestas_${timestamp}.xlsx`;

    // Configurar headers para descarga
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );
    res.setHeader("Content-Length", buffer.length);
    // console.log(`Plantilla generada: ${nombreArchivo}`);

    // Enviar archivo
    res.send(buffer);
  } catch (error) {
    console.error("Error al generar plantilla:", error);

    res.status(500).json({
      success: false,
      message: "Error al generar plantilla",
      error: error.message,
    });
  }
});

class ProcesadorPlantilla {
  constructor(conexionDB) {
    this.db = conexionDB;
  }

  /**
   * Procesa el archivo Excel completo
   */
  async procesarArchivo(rutaArchivo) {
   //console.log(`Leyendo archivo: ${rutaArchivo}`);

    // Leer archivo Excel
    const workbook = XLSX.readFile(rutaArchivo, {
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    // Verificar que existe la hoja "Encuestas"
    if (!workbook.SheetNames.includes("Encuestas")) {
      throw new Error('El archivo no contiene la hoja "Encuestas"');
    }

    const sheet = workbook.Sheets["Encuestas"];
    const data = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: false,
    });

    if (data.length < 3) {
      throw new Error(
        "El archivo debe tener al menos 3 filas (categorías, encabezados, datos)"
      );
    }

    // Extraer estructura
    const filaCategorias = data[0];
    const filaEncabezados = data[1];
    const filasPersonas = data
      .slice(2)
      .filter(
        (fila) => fila && fila.some((cell) => cell !== null && cell !== "")
      );

 //(`Datos encontrados: ${filasPersonas.length} personas`);

    // Identificar columnas
    const numCamposPersonales = this.obtenerCamposPersonales().length;

    // Obtener formularios de BD
    const formulariosBD = await this.obtenerFormulariosDB();

    // Mapear columnas Excel -> BD
    const mapeoFormularios = this.crearMapeoFormularios(
      filaCategorias,
      filaEncabezados,
      numCamposPersonales,
      formulariosBD
    );

    // Procesar cada persona
    const personas = [];
    const respuestas = [];

    for (let i = 0; i < filasPersonas.length; i++) {
      const fila = filasPersonas[i];
      const numeroFila = i + 3; // +3 porque Excel empieza en 1 y hay 2 filas de encabezado

      // Extraer datos personales
      const persona = this.extraerDatosPersonales(
        fila,
        numCamposPersonales,
        numeroFila
      );
      personas.push(persona);

      // Extraer respuestas
      const respuestasPersona = this.extraerRespuestas(
        fila,
        numCamposPersonales,
        mapeoFormularios,
        numeroFila
      );
      respuestas.push(...respuestasPersona);
    }

    // Validar datos
    const errores = this.validarDatos(personas, respuestas, mapeoFormularios);

    return {
      personas,
      respuestas,
      mapeoFormularios,
      errores,
      estadisticas: {
        totalPersonas: personas.length,
        totalRespuestas: respuestas.length,
        totalFormularios: mapeoFormularios.length,
      },
    };
  }

  /**
   * Obtiene formularios de la BD
   */
  async obtenerFormulariosDB() {
    const query = `
      SELECT 
        f.FormSec,
        f.FormPregunta,
        f.FormTipo,
        f.FormReq,
        cf.CatFormDesc
      FROM formulario f
      INNER JOIN categoria cf ON f.CatFormSec = cf.CatFormSec
    `;

    const [formularios] = await this.db.query(query);
    return formularios;
  }

  /**
   * Mapea columnas Excel a formularios de BD
   */
  crearMapeoFormularios(
    filaCategorias,
    filaEncabezados,
    inicio,
    formulariosBD
  ) {
    const mapeo = [];
    const advertencias = [];

    for (let i = inicio; i < filaEncabezados.length; i++) {
      const categoria = filaCategorias[i];
      const pregunta = filaEncabezados[i];

      if (!pregunta) continue;

      // Buscar en BD (case insensitive y sin espacios extras)
      const formulario = formulariosBD.find(
        (f) =>
          f.FormPregunta.trim().toLowerCase() === pregunta.trim().toLowerCase()
      );

      if (formulario) {
        mapeo.push({
          indiceColumna: i,
          FormSec: formulario.FormSec,
          FormPregunta: pregunta,
          FormTipo: formulario.FormTipo,
          FormReq: formulario.FormReq,
          Categoria: categoria,
        });
      } else {
        advertencias.push(
          `Columna ${i + 1}: "${pregunta}" no encontrada en BD`
        );
      }
    }

    if (advertencias.length > 0) {
      console.warn(" Advertencias de mapeo:");
      advertencias.forEach((adv) => console.warn(`   ${adv}`));
    }

    return mapeo;
  }

  /**
   * Extrae datos personales de una fila
   */
  extraerDatosPersonales(fila, numCampos, numeroFila) {
    const campos = this.obtenerCamposPersonales();
    const persona = { _numeroFila: numeroFila };

    for (let i = 0; i < numCampos && i < fila.length; i++) {
      const campo = campos[i];
      let valor = fila[i];

      // Convertir fechas
      if (campo.includes("Fecha_de_nacimiento") && valor) {
        valor = this.convertirFecha(valor);
      }

      persona[campo] = valor || null;
    }
   // console.log(persona);
    return persona;
  }

  /**
   * Extrae respuestas de formularios
   */
  extraerRespuestas(fila, inicio, mapeoFormularios, numeroFila) {
    const respuestas = [];

    mapeoFormularios.forEach((mapeo) => {
      const valor = fila[mapeo.indiceColumna];

      if (valor !== null && valor !== undefined && valor !== "") {
        respuestas.push({
          FormSec: mapeo.FormSec,
          RespValor: String(valor).trim(),
          NumeroFila: numeroFila,
          FormTipo: mapeo.FormTipo,
        });
      } else if (mapeo.FormReq === 1) {
        // Si es obligatorio y está vacío, agregar con null para detectar en validación
        respuestas.push({
          FormSec: mapeo.FormSec,
          RespValor: null,
          NumeroFila: numeroFila,
          FormTipo: mapeo.FormTipo,
          _esObligatorio: true,
        });
      }
    });
 
    return respuestas;
  }

  /**
   * Convierte fechas de Excel a formato MySQL
   */
convertirFecha(fecha) {
  if (!fecha) return null;

  // String MM/DD/YY o MM/DD/YYYY
  if (typeof fecha === "string" && fecha.includes("/")) {
    let [mes, dia, año] = fecha.split("/");

    año = parseInt(año, 10);

    // 🔥 FIX: años de 2 dígitos
    if (año < 100) {
      año = año > 30 ? 1900 + año : 2000 + año;
    }

    return `${año}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  // Número serial Excel
  if (typeof fecha === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + fecha * 86400000);
    return jsDate.toISOString().split("T")[0];
  }

  // Objeto Date
  if (fecha instanceof Date && !isNaN(fecha)) {
    return fecha.toISOString().split("T")[0];
  }

  return null;
}


  /**
   * Valida datos antes de insertar
   */
  validarDatos(personas, respuestas, mapeoFormularios) {
    const errores = [];

    // Validar personas
    personas.forEach((persona, idx) => {
      const fila = persona._numeroFila;

      if (!persona.Nombre) {
        errores.push(`Fila ${fila}: El nombre es obligatorio`);
      }

      if (!persona.Tipo_documento) {
        errores.push(`Fila ${fila}: El documento es obligatorio`);
      }

    });

    // Validar respuestas obligatorias
    respuestas.forEach((resp) => {
      if (resp._esObligatorio && !resp.RespValor) {
        errores.push(
          `Fila ${resp.NumeroFila}: La pregunta "${resp.FormSec}" es obligatoria`
        );
      }
    });

    // Validar documentos duplicados
    const documentos = personas.map((p) => p.Documento).filter((d) => d);
    const duplicados = documentos.filter(
      (doc, idx) => documentos.indexOf(doc) !== idx
    );
    if (duplicados.length > 0) {
      errores.push(
        `Documentos duplicados en el archivo: ${[...new Set(duplicados)].join(
          ", "
        )}`
      );
    }

    return errores;
  }

  /**
   * Valida formato de fecha YYYY-MM-DD
   */
  validarFormatoFecha(fecha) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(fecha);
  }

  /**
   * Campos personales
   */
  obtenerCamposPersonales() {
    return [
      "Nombre",
      "Tipo_documento",
      "No_Documento",
      "Genero",
      "Fecha_de_nacimiento",
      "Pais_de_nacimiento",
      "Celular",
      "Direccion",
      "Estrato",
      "Cabeza_de_hogar",
      "Estado_civil",
      "Libreta_militar",
      "Tiene_discapacidad",
      "Es_habitante_de_calle",
      "Tipo_de_sangre",
      "Estado",
      "Comuna_donde_labora",
      "Barrio",
      "Organizacion",
      "Tipo_de_vinculacion_Anos",
      "Tipo_de_vinculacion_Meses",
      "Actividad_que_realiza",
      "N_de_horas",
      "Jornada_AM",
      "Jornada_PM",
      "Dias_Lunes",
      "Dias_Martes",
      "Dias_Miercoles",
      "Dias_Jueves",
      "Dias_Viernes",
      "Dias_Sabado",
      "Dias_Domingo",
    ];
  }

  /**
   * Inserta datos en la base de datos
   */
  async insertarDatos(personas, respuestas) {

    
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();
     // console.log("Iniciando transacción...");

      // Insertar personas
      const personasInsertadas = await this.insertarPersonas(
        connection,
        personas
      );

      // Insertar respuestas vinculadas a personas
      await this.insertarRespuestas(connection, respuestas, personasInsertadas);

      await connection.commit();
      //console.log("Transacción completada");

      return {
        personasInsertadas: personasInsertadas.length,
        respuestasInsertadas: respuestas.filter((r) => r.RespValor).length,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error en transacción, rollback ejecutado");
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Inserta personas en la BD
   */

  



  async insertarPersonas(connection, personas) {


    
    const insertadas = [];

    for (const persona of personas) {
      // Obtener localSec
      let localSec = null;
      if (persona.Comuna_donde_labora) {
        const [localRows] = await connection.query(
          "SELECT localSec FROM localidad WHERE localNom = ?",
          [persona.Comuna_donde_labora]
        );
        if (localRows.length > 0) {
          localSec = localRows[0].localSec;
        } else {
          throw new Error(
            `Localidad "${persona.Comuna_donde_labora}" no existe (Fila ${persona._numeroFila})`
          );
        }
      }

      // Obtener orgSec
      let orgSec = null;
      if (persona.Organizacion) {
        const [orgRows] = await connection.query(
          "SELECT orgSec FROM organizaciones WHERE orgNom = ?",
          [persona.Organizacion]
        );
        if (orgRows.length > 0) {
          orgSec = orgRows[0].orgSec;
        } else {
          throw new Error(
            `Organización "${persona.Organizacion}" no existe (Fila ${persona._numeroFila})`
          );
        }
      }

      const [existe] = await connection.query(
        "SELECT PerId FROM personal WHERE PerDoc = ?",
        [persona.No_Documento]
      );

      if (existe.length > 0) {
 const perId = existe[0].PerId;

      const updateQuery = `
        UPDATE personal SET
          PerNom = ?, PerGen = ?, PerTipoDoc = ?, PerTipRH = ?,
          PerFechNa = ?, PerPais = ?, PerTel = ?, PerDir = ?,
          PerEstrato = ?, PerHogar = ?, PerEstCivil = ?, PerMilitar = ?,
          PerDis = ?, PerHabCa = ?, PerEstado = ?, localSec = ?,
          PerBar = ?, PerOrgSec = ?, PerTipVinAno = ?, PerTipVinMes = ?,
          PerDisHorAct = ?, PerDisHorHor = ?, PerDiTraJorAm = ?, PerDiTraJorPm = ?,
          PerDiTraLu = ?, PerDiTraMar = ?, PerDiTraMie = ?, PerDiTraJue = ?,
          PerDiTraVie = ?, PerDiTraSab = ?, PerDiTraDom = ?, PerAno = ?
        WHERE PerId = ?
      `;

 const year = new Date().getFullYear();
const [result] = await connection.execute(updateQuery, [
        persona.Nombre,
        persona.Genero,
        persona.Tipo_documento,
        persona.Tipo_de_sangre,
        persona.Fecha_de_nacimiento,
        persona.Pais_de_nacimiento,
        persona.Celular,
        persona.Direccion,
        persona.Estrato,
        persona.Cabeza_de_hogar,
        persona.Estado_civil,
        persona.Libreta_militar,
        persona.Tiene_discapacidad,
        persona.Es_habitante_de_calle,
        persona.Estado,
        localSec,
        persona.Barrio,
        orgSec,
        persona.Tipo_de_vinculacion_Anos,
        persona.Tipo_de_vinculacion_Meses,
        persona.Actividad_que_realiza,
        persona.N_de_horas,
        persona.Jornada_AM,
        persona.Jornada_PM,
        persona.Dias_Lunes,
        persona.Dias_Martes,
        persona.Dias_Miercoles,
        persona.Dias_Jueves,
        persona.Dias_Viernes,
        persona.Dias_Sabado,
        persona.Dias_Domingo,
        year,
        perId
      ]);

      insertadas.push({
          Perid: perId,
          Documento: persona.No_Documento,
          NumeroFila: persona._numeroFila,
      });




      } else {
        // Insertar persona
        const query = `
 INSERT INTO personal (
  PerNom,            -- persona.Nombre
  PerGen,            -- persona.Genero
  PerTipoDoc,        -- persona.Tipo_documento
  PerDoc,            -- persona.No_Documento
  PerTipRH,          -- persona.Tipo_de_sangre
  PerFechNa,         -- persona.Fecha_de_nacimiento
  PerPais,           -- persona.Pais_de_nacimiento
  PerTel,            -- persona.Celular
  PerDir,            -- persona.Direccion
  PerEstrato,        -- persona.Estrato
  PerHogar,          -- persona.Cabeza_de_hogar
  PerEstCivil,       -- persona.Estado_civil
  PerMilitar,        -- persona.Libreta_militar
  PerDis,            -- persona.Tiene_discapacidad
  PerHabCa,          -- persona.Es_habitante_de_calle
  PerEstado,         -- persona.Estado
  localSec,          -- localSec
  PerBar,            -- persona.Barrio
  PerOrgSec,         -- orgSec
  PerTipVinAno,      -- persona.Tipo_de_vinculacion_Anos
  PerTipVinMes,      -- persona.Tipo_de_vinculacion_Meses
  PerDisHorAct,      -- persona.Actividad_que_realiza
  PerDisHorHor,      -- persona.N_de_horas
  PerDiTraJorAm,     -- persona.Jornada_AM
  PerDiTraJorPm,     -- persona.Jornada_PM
  PerDiTraLu,        -- persona.Dias_Lunes
  PerDiTraMar,       -- persona.Dias_Martes
  PerDiTraMie,       -- persona.Dias_Miercoles
  PerDiTraJue,       -- persona.Dias_Jueves
  PerDiTraVie,       -- persona.Dias_Viernes
  PerDiTraSab,       -- persona.Dias_Sabado
  PerDiTraDom  ,     -- persona.Dias_Domingo
 PerAno,PerFoto
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,'/uploads/sinfoto'
);
      `;
 const year = new Date().getFullYear();

        const valores = [
          persona.Nombre,
          persona.Genero,
          persona.Tipo_documento,
          persona.No_Documento,
          persona.Tipo_de_sangre,
          persona.Fecha_de_nacimiento,
          persona.Pais_de_nacimiento,
          persona.Celular,
          persona.Direccion,
          persona.Estrato,
          persona.Cabeza_de_hogar,
          persona.Estado_civil,
          persona.Libreta_militar,
          persona.Tiene_discapacidad,
          persona.Es_habitante_de_calle,
          
          persona.Estado,
          localSec,
          persona.Barrio,
          orgSec,
          persona.Tipo_de_vinculacion_Anos,
          persona.Tipo_de_vinculacion_Meses,
          persona.Actividad_que_realiza,
          persona.N_de_horas,
          persona.Jornada_AM,
          persona.Jornada_PM,
          persona.Dias_Lunes,
          persona.Dias_Martes,
          persona.Dias_Miercoles,
          persona.Dias_Jueves,
          persona.Dias_Viernes,
          persona.Dias_Sabado,
          persona.Dias_Domingo,
          year
        ];

        const [result] = await connection.query(query, valores);
  const updateQuery = `
  UPDATE personal SET 
     	PerNro = ?
  WHERE PerId = ?
`;

    const [updateResult] = await connection.execute(updateQuery, [
     generarConsecutivo(result.insertId)   ,
    result.insertId
      ]);


        insertadas.push({
          Perid: result.insertId,
          Documento: persona.No_Documento,
          NumeroFila: persona._numeroFila,
        });
      }
    }

   // console.log(`${insertadas.length} personas insertadas`);
    return insertadas;
  }

  /**
   * Inserta respuestas en la BD
   */
  async insertarRespuestas(connection, respuestas, personasInsertadas) {



let query = "";




    let queryupd = ` update respuestas set  RespValor = ? where  PerId = ? and FormSec = ? `;



    let queryins = `
      INSERT INTO respuestas (RespSec, Perid, FormSec, RespValor, RespFecha)
      VALUES (?, ?, ?, ?, NOW())
    `;


    // Agrupar respuestas por fila
    const respuestasPorFila = {};
    respuestas.forEach((resp) => {
      if (!respuestasPorFila[resp.NumeroFila]) {
        respuestasPorFila[resp.NumeroFila] = [];
      }
      respuestasPorFila[resp.NumeroFila].push(resp);
    });

    let ultimoRespSec = 0;

    try {
      const query = `
      SELECT MAX(RespSec) as ultimoRespSec
      FROM respuestas
    `;

      const [rows] = await connection.query(query);
      ultimoRespSec = rows[0].ultimoRespSec || 0;
    } catch (error) {
      console.error("Error al obtener último RespSec:", error);
    }

    let totalInsertadas = 0;

    // Insertar respuestas para cada persona
    for (const personaInsertada of personasInsertadas) {



      const respuestasPersona =
        respuestasPorFila[personaInsertada.NumeroFila] || [];

      for (const resp of respuestasPersona) {

        
        if (resp.RespValor !== null) {

      const [existe] = await connection.query(
        "SELECT RespSec FROM respuestas  where  Perid = ? and FormSec = ? ",
        [personaInsertada.Perid,resp.FormSec]
      );


      if (existe.length > 0) {
 const RespSec = existe[0].RespSec;


    await connection.query(queryupd, [
            resp.RespValor,
            personaInsertada.Perid,
            resp.FormSec    
           ]);



      }else{
    await connection.query(queryins, [
            ultimoRespSec + 1,
            personaInsertada.Perid,
            resp.FormSec,
            resp.RespValor,
          ]);
      }

      

      
          totalInsertadas++;
        }
      }




    }

    //console.log(`${totalInsertadas} respuestas insertadas`);
  }
}

router.post("/importar", upload.single("archivo"), async (req, res) => {
  let archivoSubido = null;

  try {
    // Validar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se recibió ningún archivo",
        error: 'Debes enviar un archivo Excel con el campo "archivo"',
      });
    }

    archivoSubido = req.file.path;
    //console.log(`   Archivo recibido: ${req.file.originalname}`);
    //console.log(`   Tamaño: ${(req.file.size / 1024).toFixed(2)} KB`);

    // Procesar archivo
    const procesador = new ProcesadorPlantilla(db);
    const resultado = await procesador.procesarArchivo(archivoSubido);

    // Si hay errores de validación, retornar sin insertar
    if (resultado.errores.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El archivo tiene errores de validación",
        errores: resultado.errores,
        estadisticas: resultado.estadisticas,
      });
    }

    // Verificar si se debe insertar o solo validar
    const soloValidar =
      req.body.soloValidar === "true" || req.body.soloValidar === true;

    if (soloValidar) {
      // Solo retornar preview sin insertar
      return res.json({
        success: true,
        message: "Validación completada (sin insertar datos)",
        validacion: {
          errores: resultado.errores,
          advertencias: [],
        },
        estadisticas: resultado.estadisticas,
        preview: {
          personas: resultado.personas.slice(0, 5).map((p) => ({
            PerNom: p.Nombre,
            Documento: p.No_Documento,
            Localidad: p.Comuna_donde_labora,
          })),
          totalRespuestas: resultado.respuestas.length,
        },
      });
    }

    // Insertar en base de datos
    //console.log(" Insertando datos en la base de datos...");
    const resultadoInsercion = await procesador.insertarDatos(
      resultado.personas,
      resultado.respuestas
    );

    // Respuesta exitosa
    res.json({
      success: true,
      message: "Archivo importado y procesado correctamente",
      resultados: {
        personasInsertadas: resultadoInsercion.personasInsertadas,
        respuestasInsertadas: resultadoInsercion.respuestasInsertadas,
        estadisticas: resultado.estadisticas,
      },
      archivo: {
        nombre: req.file.originalname,
        tamaño: req.file.size,
      },
    });

    //console.log(" Importación completada exitosamente");
  } catch (error) {
    console.error(" Error al importar plantilla:", error);

    res.status(500).json({
      success: false,
      message: "Error al procesar el archivo",
      error: error.message,
    });
  } finally {
    // Limpiar archivo subido
    if (archivoSubido && fs.existsSync(archivoSubido)) {
      try {
        fs.unlinkSync(archivoSubido);
       // console.log("  Archivo temporal eliminado");
      } catch (err) {
        console.error("Error al eliminar archivo temporal:", err);
      }
    }
  }
});

// Endpoint para subir y leer el Excel
router.post("/leerExcel", upload.single("archivo"), (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);

    // Leer la primera hoja
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir a JSON desde la fila 2 y hasta la columna 15
    const data = XLSX.utils.sheet_to_json(sheet, {
      range: 1, // Empieza en la fila 2 (índice 1)
      header: 1, // Devuelve matriz de arrays
    });

    // Recortar columnas hasta la 15
    const trimmedData = data.map((row) => row.slice(0, 202));

    // Obtener los encabezados (fila 2)
    const headers = trimmedData.shift();

    // Convertir a objetos JSON con claves = encabezados
    const jsonData = trimmedData.map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    res.json({ success: true, data: jsonData });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error al procesar el Excel" });
  }
});

module.exports = router;
