const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.post("/save/:catFormSec", async (req, res) => {
  let connection;
  try {
     const { catFormSec} = req.params;
    console.log("POST /save - Datos recibidos:", req.body);

    const { formulario, formulario_opciones } = req.body;

    if (!formulario || !Array.isArray(formulario)) {
      return res.status(400).json({
        success: false,
        message: "Datos de formulario inválidos",
      });
    }

    // Obtener conexión
    connection = await db.getConnection();

    // Iniciar transacción
    await connection.beginTransaction();

    console.log("Guardando", formulario.length, "preguntas...");

    // Insertar cada pregunta

    // Intentar UPDATE primero

    const supdateOptionQuery = `
           DELETE fo
FROM FormularioOpciones fo
JOIN Formulario f ON fo.FormSec = f.FormSec
WHERE f.CatFormSec = ?;
        `;

    const supdateResult = await connection.execute(supdateOptionQuery, [
      catFormSec,
    ]);




    
    for (const pregunta of formulario) {
      // Intentar UPDATE primero
      const updateQuery = `
        UPDATE formulario 
        SET CatFormSec = ?, 
            FormPregunta = ?, 
            FormTipo = ?, 
            FormJson = ?, 
            FormReq = ?, 
            FormOrden = ?
        WHERE FormSec = ? and CatFormSec = ?
    `;

      const updateResult = await connection.execute(updateQuery, [
        pregunta.CatFormSec,
        pregunta.FormPregunta,
        pregunta.FormTipo,
        pregunta.FormJson,
        pregunta.FormReq ? 1 : 0,
        pregunta.FormOrden,
        pregunta.FormSec,
        pregunta.CatFormSec,
      ]);

      // Si no se actualizó ningún registro (no existe), hacer INSERT
      if (updateResult[0].affectedRows === 0) {
        const insertQuery = `
            INSERT INTO formulario (FormSec, CatFormSec, FormPregunta, FormTipo, FormJson, FormReq, FormOrden)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(insertQuery, [
          pregunta.FormSec,
          pregunta.CatFormSec,
          pregunta.FormPregunta,
          pregunta.FormTipo,
          pregunta.FormJson,
          pregunta.FormReq ? 1 : 0,
          pregunta.FormOrden,
        ]);

        console.log("Pregunta insertada:", pregunta.FormPregunta);
      } else {
        console.log("Pregunta actualizada:", pregunta.FormPregunta);
      }
    }

    console.log("Guardando", formulario_opciones.length, "opciones...");

    // Insertar opciones si existen
    // Insertar/actualizar opciones si existen
    if (formulario_opciones && formulario_opciones.length > 0) {
      for (const opcion of formulario_opciones) {
        const insertOptionQuery = `
                INSERT INTO FormularioOpciones (FormSec, FormOp)
                VALUES ( ?, ?)
            `;

        await connection.execute(insertOptionQuery, [
          opcion.FormSec,
          opcion.FormOp,
        ]);

        console.log("Opción insertada:", opcion.FormOp);
      }
      console.log("Opciones procesadas (upsert)");
    }

    // Confirmar transacción
    await connection.commit();

    res.json({
      success: true,
      message: "Formulario guardado en BD exitosamente",
      saved_questions: formulario.length,
      saved_options: formulario_opciones.length,
    });
  } catch (error) {
    console.error("Error guardando en BD:", error);

    // Revertir transacción si hay error
    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({
      success: false,
      message: "Error guardando en BD: " + error.message,
    });
  } finally {
    // Liberar conexión
    if (connection) {
      connection.release();
    }
  }
});


router.delete("/DeleteQ/:catFormSec/:FormSec", async (req, res) => {
  let connection;
  try {
        const { catFormSec, FormSec} = req.params;
    console.log("POST /save - Datos recibidos:", req.body);


    // Obtener conexión
    connection = await db.getConnection();

    // Iniciar transacción
    await connection.beginTransaction();



    // Insertar cada pregunta

    // Intentar UPDATE primero

    const supdateOptionQuery = `
           DELETE fo
FROM FormularioOpciones fo
JOIN Formulario f ON fo.FormSec = f.FormSec
WHERE f.CatFormSec = ? and fo.FormSec = ? ;
        `;

    const supdateResult = await connection.execute(supdateOptionQuery, [
      catFormSec,FormSec
    ]);

    const deletepregunta = `
           DELETE 
FROM Formulario WHERE CatFormSec = ? and FormSec = ? ;
        `;
  const deletequer = await connection.execute(deletepregunta, [
      catFormSec,FormSec
    ]);




    // Confirmar transacción
    await connection.commit();

    res.json({
      success: true,
      message: "Respuesta eliminada exitosamente",
    });




  } catch (error) {
    console.error("Error eliminando en BD:", error);

    // Revertir transacción si hay error
    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({
      success: false,
      message: "Error eliminando en BD: " + error.message,
    });
  } finally {
    // Liberar conexión
    if (connection) {
      connection.release();
    }
  }
});




// API para obtener un formulario específico con sus preguntas
router.get("/wsObtenerFormulario/:catFormSec/:perId", async (req, res) => {
  let connection;
  try {
    const { catFormSec, perId} = req.params;

    if (!catFormSec) {
      return res.status(400).json({
        success: false,
        message: "ID de categoría requerido",
      });
    }

    console.log(
      `GET /wsObtenerFormulario/${catFormSec} - Obteniendo formulario...`
    );

    // Obtener conexión
    connection = await db.getConnection();

    // Obtener información de la categoría
    const categoriaQuery = `
            SELECT 
                CatFormSec as id,
                CatFormDesc as descripcion,
                CatFormTitu as titulo ,
                CatFormLog as icono,
                CatFormFecCre as fecha_creacion,
                CatFormUsuCre as usuario_creacion
            FROM categoria 
            WHERE CatFormSec = ?
        `;

    const [categoriaRows] = await connection.execute(categoriaQuery, [
      catFormSec,
    ]);

    if (categoriaRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Formulario no encontrado",
      });
    }

    const categoria = categoriaRows[0];

    // Obtener preguntas del formulario
    let preguntasQuery = `
            SELECT 
                FormSec as id,
                FormPregunta as texto,
                FormTipo as tipo,
                FormJson as opciones_json,
                FormReq as requerido,
                FormOrden as orden
            FROM Formulario 
            WHERE CatFormSec = ?
            ORDER BY FormOrden ASC
        `;

  preguntasQuery = `  SELECT 
                 FormSec as id,
                FormPregunta as texto,
                FormTipo as tipo,
                FormJson as opciones_json,
                FormReq as requerido,
                FormOrden as orden,
                (
                    SELECT CASE
    WHEN FormTipo = 'number' THEN RespNum  
    WHEN FormTipo = 'date' THEN RespFecha
    ELSE  	RespValor
END
                 FROM respuestas r where r.FormSec = f.FormSec  and PerId = ?
                ) as valor 
            FROM Formulario  f 
            WHERE CatFormSec = ?
            ORDER BY FormOrden ASC

 `;

    const [preguntasRows] = await connection.execute(preguntasQuery, [
      perId ,catFormSec
    ]);

    const preguntas = [];

    for (const pregunta of preguntasRows) {
      // Obtener opciones para esta pregunta específica
      let opciones = [];

      if (["checkbox", "radio", "select"].includes(pregunta.tipo)) {
        const opcionesQuery = `
            SELECT
                FormOpSec as FormOpSec,
                FormSec as FormSec,
                FormOp as FormOp
            FROM FormularioOpciones
            WHERE FormSec = ?
            ORDER BY FormOpSec ASC
        `;

        // Agregar await aquí
        const [opcionesRow] = await connection.execute(opcionesQuery, [
          pregunta.id,
        ]);

        // Extraer solo los textos de las opciones
        opciones = opcionesRow.map((opcion) => opcion.FormOp);
      }

      // Crear objeto pregunta y agregarlo al array
      const preguntaCompleta = {
        id: pregunta.id,
        type: pregunta.tipo,
        text: pregunta.texto,
        valor:pregunta.valor,
        required: pregunta.requerido === 1,
        options: Array.isArray(opciones) ? opciones : [],
        orden: pregunta.orden,
      };

      preguntas.push(preguntaCompleta);
    }

    console.log(`Formulario encontrado con ${preguntas.length} preguntas`);

    res.json({
      success: true,
      message: "Formulario obtenido exitosamente",
      formulario: {
        categoria: categoria,
        preguntas: preguntas,
        total_preguntas: preguntas.length,
      },
    });
  } catch (error) {
    console.error("Error obteniendo formulario:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    // Liberar conexión
    if (connection) {
      connection.release();
    }
  }
});



router.get("/wsObtenerFormulario/:catFormSec", async (req, res) => {
  let connection;
  try {
    const { catFormSec} = req.params;

    if (!catFormSec) {
      return res.status(400).json({
        success: false,
        message: "ID de categoría requerido",
      });
    }

    console.log(
      `GET /wsObtenerFormulario/${catFormSec} - Obteniendo formulario...`
    );

    // Obtener conexión
    connection = await db.getConnection();

    // Obtener información de la categoría
    const categoriaQuery = `
            SELECT 
                CatFormSec as id,
                CatFormDesc as descripcion,
                CatFormTitu as titulo ,
                CatFormLog as icono,
                CatFormFecCre as fecha_creacion,
                CatFormUsuCre as usuario_creacion
            FROM categoria 
            WHERE CatFormSec = ?
        `;

    const [categoriaRows] = await connection.execute(categoriaQuery, [
      catFormSec,
    ]);

    if (categoriaRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Formulario no encontrado",
      });
    }

    const categoria = categoriaRows[0];

    // Obtener preguntas del formulario
    let preguntasQuery = `
            SELECT 
                FormSec as id,
                FormPregunta as texto,
                FormTipo as tipo,
                FormJson as opciones_json,
                FormReq as requerido,
                FormOrden as orden
            FROM Formulario 
            WHERE CatFormSec = ?
            ORDER BY FormOrden ASC
        `;



    const [preguntasRows] = await connection.execute(preguntasQuery, [
      catFormSec
    ]);

    const preguntas = [];

    for (const pregunta of preguntasRows) {
      // Obtener opciones para esta pregunta específica
      let opciones = [];

      if (["checkbox", "radio", "select"].includes(pregunta.tipo)) {
        const opcionesQuery = `
            SELECT
                FormOpSec as FormOpSec,
                FormSec as FormSec,
                FormOp as FormOp
            FROM FormularioOpciones
            WHERE FormSec = ?
            ORDER BY FormOpSec ASC
        `;

        // Agregar await aquí
        const [opcionesRow] = await connection.execute(opcionesQuery, [
          pregunta.id,
        ]);

        // Extraer solo los textos de las opciones
        opciones = opcionesRow.map((opcion) => opcion.FormOp);
      }

      // Crear objeto pregunta y agregarlo al array
      const preguntaCompleta = {
        id: pregunta.id,
        type: pregunta.tipo,
        text: pregunta.texto,
        required: pregunta.requerido === 1,
        options: Array.isArray(opciones) ? opciones : [],
        orden: pregunta.orden,
      };

      preguntas.push(preguntaCompleta);
    }

    console.log(`Formulario encontrado con ${preguntas.length} preguntas`);

    res.json({
      success: true,
      message: "Formulario obtenido exitosamente",
      formulario: {
        categoria: categoria,
        preguntas: preguntas,
        total_preguntas: preguntas.length,
      },
    });
  } catch (error) {
    console.error("Error obteniendo formulario:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    // Liberar conexión
    if (connection) {
      connection.release();
    }
  }
});



module.exports = router;
