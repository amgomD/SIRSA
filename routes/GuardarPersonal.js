 const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Función para validar base64 de imagen
function isValidImageBase64(base64String) {
  if (!base64String) return true; // Permitir vacío

  // Verificar formato data:image/...;base64,
  const regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
  return regex.test(base64String);
}

// Ruta para obtener todo el personal
router.post("/personal/obtener", async (req, res) => {
  let connection;
  try {
    // console.log("POST /personal/obtener - Obteniendo personal...");

    connection = await db.getConnection();
    let query = `
       SELECT 
          TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) AS EdadActual,
         p.*,o.*,l.* 
            FROM personal p 
            left join organizaciones o ON p.PerOrgSec = o.orgSec 
            left join localidad l ON p.localSec = l.localSec 
       
        `;
    // const query = `
    //       SELECT 
    //             PerId,
    //             PerNom,
    //             PerTipoDoc,
    //             PerDoc,
    //               PerDir,
    //               PerFecOrg,
    //               PerActRe,
    //             PerFechNa,
    //             TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) AS EdadActual,
    //             PerFechaExp,
    //             PerTel,
    //             PerEstado,
    //             o.orgNom,
    //             PerUsuId,
    //             l.localnom,
    //             PerAno,
    //             PerFoto,
    //             PerGen
    //         FROM personal p 
    //         left join organizaciones o ON p.PerOrgSec = o.orgSec 
    //         left join localidad l ON p.localSec = l.localSec 
    //         ORDER BY PerId DESC
    //     `;

    const [rows] = await connection.execute(query);

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "No se encontró personal registrado",
        data: [],
      });
    }

    const personal = rows.map((row) => ({
      id: row.PerId,
      nombre: row.PerNom,
      tipoDoc: row.PerTipoDoc,
      cedula: row.PerDoc,
      fechaNacimiento: row.PerFechNa,
      edad:row.EdadActual,
      fechaExpedicion: row.PerFechaExp,
      telefono: row.PerTel,
      estado: row.PerEstado,
      organizacion: row.orgNom,
      usuario: row.PerUsuId,
      localidad: row.localnom,
      ano: row.PerAno,
      foto: row.PerFoto,
      genero: row.PerGen,
      direccion:row.PerDir,
      fechaorg:row.PerFecOrg,
      actividad:row.PerActRe
    }));

    // console.log(`Se encontraron ${personal.length} registros de personal`);

    res.json({
      success: true,
      message: "Personal obtenido exitosamente",
      data: personal,
      total: personal.length,
    });
  } catch (error) {
    console.error("Error obteniendo personal:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.post("/personal/obtenerwhere", async (req, res) => {
  let connection;
  try {
    console.log("POST /personal/obtener - Obteniendo personal...");
     const { where } = req.body;
    connection = await db.getConnection();

    let query = `
              SELECT 
          TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) AS EdadActual,
         p.*,o.*,l.* 
            FROM personal p 
            left join organizaciones o ON p.PerOrgSec = o.orgSec 
            left join localidad l ON p.localSec = l.localSec 
       
        `;
        query += where
        // console.log(query)
    const [rows] = await connection.execute(query);

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "No se encontró personal registrado",
        data: [],
      });
    }

    const personal = rows.map((row) => ({
      
      id: row.PerId,
      nombre: row.PerNom,
      tipoDoc: row.PerTipoDoc,
      cedula: row.PerDoc,
      fechaNacimiento: row.PerFechNa,
      edad:row.EdadActual,
      telefono: row.PerTel,
      estado: row.PerEstado,
      organizacion: row.orgNom,
      usuario: row.PerUsuId,
      localidad: row.localNom,
      ano: row.PerAno,
      foto: row.PerFoto,
      genero: row.PerGen,
      direccion:row.PerDir,
      actividad:row.PerDisHorAct,
      PerNro:row.PerNro,
      PerTipRH:row.PerTipRH
    }));
  // console.log(personal)
  //   console.log(`Se encontraron ${personal.length} registros de personal`);

    res.json({
      success: true,
      message: "Personal obtenido exitosamente",
      data: personal,
      total: personal.length,
    });
  } catch (error) {
    console.error("Error obteniendo personal:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});








router.post("/personal/CarnetId", async (req, res) => {
  let connection;
  try {
        const { id } = req.body;

    // console.log("POST /personal/CarnetId - Obteniendo personal...");

    connection = await db.getConnection();

    // const query = `
    //       SELECT 
    //             PerId,
    //             PerNom,
    //             PerTipoDoc,
    //             PerDoc,
    //               PerDir,

    //             PerFechNa,
    //             TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) AS EdadActual,
           
    //             PerTel,
    //             PerEstado,
    //             o.orgNom,
    //             PerUsuId,
    //             l.localnom,
    //             PerAno,
    //             PerFoto,
    //             PerGen
    //         FROM personal p 
    //         left join organizaciones o ON p.PerOrgSec = o.orgSec 
    //         left join localidad l ON p.localSec = l.localSec 
    //          WHERE PerId = ? 
    //         ORDER BY PerId DESC
    //     `;
    let query = `
              SELECT 
          TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) AS EdadActual,
         p.*,o.*,l.* 
            FROM personal p 
            left join organizaciones o ON p.PerOrgSec = o.orgSec 
            left join localidad l ON p.localSec = l.localSec 
       
        `;
    const [rows] = await connection.execute(query, [id]);

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "No se encontró personal registrado",
        data: [],
      });
    }

    const personal = rows.map((row) => ({
      id: row.PerId,
      nombre: row.PerNom,
      tipoDoc: row.PerTipoDoc,
      cedula: row.PerDoc,
      fechaNacimiento: row.PerFechNa,
      edad:row.EdadActual,
      telefono: row.PerTel,
      estado: row.PerEstado,
      organizacion: row.orgNom,
      usuario: row.PerUsuId,
      localidad: row.localNom,
      ano: row.PerAno,
      foto: row.PerFoto,
      genero: row.PerGen,
      direccion:row.PerDir,
      actividad:row.PerDisHorAct,
      PerNro:row.PerNro,
      PerTipRH:row.PerTipRH
    }));

    // console.log(`Se encontraron ${personal.length} registros de personal`);

    res.json({
      success: true,
      message: "Personal obtenido exitosamente",
      data: personal,
      total: personal.length,
    });
  } catch (error) {
    console.error("Error obteniendo personal:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});










// Ruta para crear nuevo personal (con foto base64)
router.post("/personal/crear", async (req, res) => {
  let connection;
  try {
    const {
      userid,
     /* PerId,
      PerNom,
      PerGen,
      PerTipoDoc,
      PerDoc,
      fechaexp,
      contacto,
      estado,
      org,
      fecha,
      local,
      PerMun,
      PerDep,
      PerBar,
      PerDir,
      PerEstCivil,
      PerEstrato,
      PerHogar,
      fotoBase64,PerFecOrg,PerActRe,PerHabCa,PerDis,PerFecAct // Nuevo campo para la foto en base64 */

PerId, PerNom, PerGen, PerTipoDoc, PerDoc, PerTipRH, PerPais, PerTel, PerEstado, PerOrgSec, PerFechNa, localSec, PerBar, PerDir, PerEstCivil, PerEstrato, PerMilitar, PerHogar, fotoBase64, PerHabCa, PerDis, PerTipVinAno, PerTipVinMes, PerDisHorAct, PerDisHorHor, PerDiTraJorAm, PerDiTraJorPm, PerDiTraLu, PerDiTraMar, PerDiTraMie, PerDiTraJue, PerDiTraVie, PerDiTraSab, PerDiTraDom







    } = req.body;

    // Validaciones
    if (
      !userid ||
      !PerNom ||
      !PerGen ||
      !PerTipoDoc ||
      !PerDoc ||
      !PerTel ||
      !PerEstado ||
      !PerOrgSec ||
      !PerFechNa ||
      !localSec
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }


    // console.log(
    //   `POST /personal/crear - Creando personal: ${PerNom} (${PerDoc})`
    // );

    connection = await db.getConnection();

    // Verificar si ya existe la cédula
    const checkQuery = "SELECT PerDoc FROM personal WHERE PerId = ?";
    const [checkRows] = await connection.execute(checkQuery, [PerId]);

    const year = new Date().getFullYear();

    if (checkRows.length > 0) {
      // Si existe, hacer UPDATE
      const existingId = checkRows[0].PerId;
      const existingName = checkRows[0].PerNom;

      // console.log(
      //   `Cédula ${PerDoc} ya existe (ID: ${existingId}), actualizando datos...`
      // );

    //   const updateQuery = `
    //     UPDATE personal SET 
    //         PerNom = ?, PerTipoDoc = ?, PerFechNa = ?, PerFechaExp = ?,
    //         PerTel = ?, PerEstado = ?, PerOrgSec = ?, PerUsuId = ?, 
    //         localSec = ?, PerAno = ?, PerFoto = ?, PerGen = ?,PerMun = ?,PerDep= ?,PerBar = ? , 
    //         PerDir = ?,  PerEstCivil = ?, PerEstrato = ?,
    //         PerHogar = ?, PerDoc = ? ,PerFecOrg =?, PerActRe =?,PerHabCa=?,PerDis=?,PerFecAct=?
    //     WHERE PerId = ?
    // `;


    const updateQuery = `
  UPDATE personal SET 
    PerNom = ?,
    PerGen = ?,
    PerTipoDoc = ?,
    PerDoc = ?,
    PerTipRH = ?,
    PerPais = ?,
    PerTel = ?,
    PerEstado = ?,
    PerOrgSec = ?,
    PerFechNa = ?,
    localSec = ?,
    PerBar = ?,
    PerDir = ?,
    PerEstCivil = ?,
    PerEstrato = ?,
    PerMilitar = ?,
    PerHogar = ?,
    PerHabCa = ?,
    PerDis = ?,
    PerTipVinAno = ?,
    PerTipVinMes = ?,
    PerDisHorAct = ?,
    PerDisHorHor = ?,
    PerDiTraJorAm = ?,
    PerDiTraJorPm = ?,
    PerDiTraLu = ?,
    PerDiTraMar = ?,
    PerDiTraMie = ?,
    PerDiTraJue = ?,
    PerDiTraVie = ?,
    PerDiTraSab = ?,
    PerDiTraDom = ?,
    PerFoto = ?
  WHERE PerId = ?
`;




      const [updateResult] = await connection.execute(updateQuery, [
   PerNom, PerGen, PerTipoDoc, PerDoc, PerTipRH, PerPais, PerTel, PerEstado, PerOrgSec, PerFechNa, localSec, PerBar, PerDir, PerEstCivil, PerEstrato, PerMilitar, PerHogar, PerHabCa, PerDis, PerTipVinAno, PerTipVinMes, PerDisHorAct, PerDisHorHor, PerDiTraJorAm, PerDiTraJorPm, PerDiTraLu, PerDiTraMar, PerDiTraMie, PerDiTraJue, PerDiTraVie, PerDiTraSab, PerDiTraDom,
    fotoBase64 || "",
    PerId
      ]);

      if (updateResult.affectedRows === 0) {
        throw new Error("No se pudo actualizar el registro existente");
      }

      // console.log(
      //   `Personal actualizado: "${existingName}" -> "${PerNom}" (ID: ${existingId})`
      // );

      res.json({
        success: true,
        message: "Personal actualizado exitosamente (cédula ya existía)",
        data: {
          id: existingId,
          nombre: PerNom,
          tipoDoc: PerTipoDoc,
          cedula: PerDoc,
          fechaNacimiento: PerFechNa,
          fechaExpedicion: PerFechNa,
          telefono: PerTel,
          estado: PerEstado,
          organizacion: PerOrgSec,
          usuario: userid,
          localidad: localSec,
          ano: year,
          foto: fotoBase64 || null,
          genero: PerGen,
          actualizado: true,
        },
      });
    } else {
      // Si no existe, hacer INSERT normal
    //   const insertQuery = `
    //     INSERT INTO personal (
    //         PerNom, PerTipoDoc, PerDoc, PerFechNa, PerFechaExp, 
    //         PerTel, PerEstado, PerOrgSec, PerUsuId, localSec, 
    //         PerAno, PerFoto, PerGen,PerMun,
    //         PerDep,
    //         PerBar,
    //         PerDir,
    //         PerEstCivil,
    //         PerEstrato,
    //         PerHogar,PerFecOrg,PerActRe,PerHabCa,PerDis,PerFecAct
    //     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?,?,?,?)
    // `;
const insertQuery = `
  INSERT INTO personal (
    PerNom,
    PerGen,
    PerTipoDoc,
    PerDoc,
    PerTipRH,
    PerPais,
    PerTel,
    PerEstado,
    PerOrgSec,
    PerFechNa,
    localSec,
    PerBar,
    PerDir,
    PerEstCivil,
    PerEstrato,
    PerMilitar,
    PerHogar,
    PerHabCa,
    PerDis,
    PerTipVinAno,
    PerTipVinMes,
    PerDisHorAct,
    PerDisHorHor,
    PerDiTraJorAm,
    PerDiTraJorPm,
    PerDiTraLu,
    PerDiTraMar,
    PerDiTraMie,
    PerDiTraJue,
    PerDiTraVie,
    PerDiTraSab,
    PerDiTraDom,
    PerFoto,PerUsuId,PerAno
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?
  )
`;


// console.log({
//   PerNom,
//   PerGen,
//   PerTipoDoc,
//   PerDoc,
//   PerTipRH,
//   PerPais,
//   PerTel,
//   PerEstado,
//   PerOrgSec,
//   PerFechNa,
//   localSec,
//   PerBar,
//   PerDir,
//   PerEstCivil,
//   PerEstrato,
//   PerMilitar,
//   PerHogar,
//   PerHabCa,
//   PerDis,
//   PerTipVinAno,
//   PerTipVinMes,
//   PerDisHorAct,
//   PerDisHorHor,
//   PerDiTraJorAm,
//   PerDiTraJorPm,
//   PerDiTraLu,
//   PerDiTraMar,
//   PerDiTraMie,
//   PerDiTraJue,
//   PerDiTraVie,
//   PerDiTraSab,
//   PerDiTraDom,
//   fotoBase64: fotoBase64 || ""
// });


      const [insertResult] = await connection.execute(insertQuery, [
     PerNom, PerGen, PerTipoDoc, PerDoc, PerTipRH, PerPais, PerTel, PerEstado, PerOrgSec, PerFechNa, localSec, PerBar, PerDir, PerEstCivil, PerEstrato, PerMilitar, PerHogar, PerHabCa, PerDis, PerTipVinAno, PerTipVinMes, PerDisHorAct, PerDisHorHor, PerDiTraJorAm, PerDiTraJorPm, PerDiTraLu, PerDiTraMar, PerDiTraMie, PerDiTraJue, PerDiTraVie, PerDiTraSab, PerDiTraDom,
    fotoBase64 || "",userid,year
      ]);


      if (insertResult.affectedRows === 0) {
        throw new Error("No se pudo insertar el registro de personal");
      }

      // console.log(`Personal creado con ID: ${insertResult.insertId}`);

    const updateQuery = `
  UPDATE personal SET 
     	PerNro = ?
  WHERE PerId = ?
`;




      const [updateResult] = await connection.execute(updateQuery, [
     generarConsecutivo(insertResult.insertId)   ,
    insertResult.insertId
      ]);


      res.json({
        success: true,
        message: "Personal creado exitosamente",
        data: {
          id: insertResult.insertId,
          nombre: PerNom,
          tipoDoc: PerTipoDoc,
          cedula: PerDoc,
          fechaNacimiento: PerFechNa,
          fechaExpedicion: PerFechNa,
          telefono: PerTel,
          estado: PerEstado,
          organizacion: PerOrgSec,
          usuario: userid,
          localidad: localSec,
          ano: year,
          foto: fotoBase64 || null,
          genero: PerGen,
          actualizado: false,
        },
      });
    }
  } catch (error) {
    console.error("Error creando personal:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});






function generarConsecutivo(contador = 1) {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes  = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia  = String(hoy.getDate()).padStart(2, "0");

  const consecutivo = String(contador).padStart(3, "0");

  return `${anio}${mes}${dia}-${consecutivo}`;
}



// Ruta para eliminar personal
router.post("/personal/eliminar", async (req, res) => {
  let connection;
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de personal es requerido",
      });
    }

    // console.log(`POST /personal/eliminar - Eliminando personal ID: ${id}`);

    connection = await db.getConnection();

    // Verificar que existe
    const selectQuery = "SELECT PerId FROM personal WHERE PerId = ?";
    const [selectRows] = await connection.execute(selectQuery, [id]);

    if (selectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }

    // Eliminar de la base de datos
    const deleteQuery = "Update  personal set  PerEstado = 'No vinculado' WHERE PerId = ?";
    const [result] = await connection.execute(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      throw new Error("No se pudo eliminar el registro de personal");
    }

    // console.log(`Personal eliminado exitosamente: ID ${id}`);

    res.json({
      success: true,
      message: "Personal eliminado exitosamente",
      data: {
        id: parseInt(id),
        eliminado: true,
      },
    });
  } catch (error) {
    console.error("Error eliminando personal:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
// Ruta para eliminar personal
router.post("/personal/reintegrar", async (req, res) => {
  let connection;
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de personal es requerido",
      });
    }

    // console.log(`POST /personal/reintegrar - reintegrando personal ID: ${id}`);

    connection = await db.getConnection();

    // Verificar que existe
    const selectQuery = "SELECT PerId FROM personal WHERE PerId = ?";
    const [selectRows] = await connection.execute(selectQuery, [id]);

    if (selectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }

    // Eliminar de la base de datos
    const deleteQuery = "Update  personal set  PerEstado = 'Vinculado' WHERE PerId = ?";
    const [result] = await connection.execute(deleteQuery, [id]);

    if (result.affectedRows === 0) {
      throw new Error("No se pudo reintegrar el registro de personal");
    }

    // console.log(`Personal reintegrado exitosamente: ID ${id}`);

    res.json({
      success: true,
      message: "Personal reintegrado exitosamente",
      data: {
        id: parseInt(id),
        eliminado: true,
      },
    });
  } catch (error) {
    console.error("Error reintegrando personal:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Ruta para actualizar personal
router.post("/personal/actualizar", async (req, res) => {
  let connection;
  try {
    const {
      id,
      nombre,
      genero,
      tipo,
      cedula,
      fechaexp,
      contacto,
      estado,
      org,
      fecha,
      local,
      fotoBase64, // Foto en base64 (opcional)
    } = req.body;

    if (
      !id ||
      !nombre ||
      !genero ||
      !tipo ||
      !cedula ||
      !fechaexp ||
      !contacto ||
      !estado ||
      !org ||
      !fecha ||
      !local
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }

    // Validar base64 si se proporciona
  /*  if (fotoBase64 && !isValidImageBase64(fotoBase64)) {
      return res.status(400).json({
        success: false,
        message: "Formato de imagen base64 inválido",
      });
    }
*/
    // console.log(`POST /personal/actualizar - Actualizando personal ID: ${id}`);

    connection = await db.getConnection();

    // Verificar que existe
    const checkQuery = "SELECT PerFoto FROM personal WHERE PerId = ?";
    const [checkRows] = await connection.execute(checkQuery, [id]);

    if (checkRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }

    // Determinar qué foto usar
    let fotoFinal = checkRows[0].PerFoto; // Mantener foto actual por defecto

    if (fotoBase64 !== undefined) {
      // Si se envía fotoBase64 (incluso si es null/vacío), actualizar
      fotoFinal = fotoBase64 || null;
    }

    // Actualizar en la base de datos
    const updateQuery = `
            UPDATE personal SET 
                PerNom = ?, PerTipoDoc = ?, PerDoc = ?, PerFechNa = ?, 
                PerFechaExp = ?, PerTel = ?, PerEstado = ?, PerOrgSec = ?, 
                localSec = ?, PerFoto = ?, PerGen = ?
            WHERE PerId = ?
        `;

    const [result] = await connection.execute(updateQuery, [
      nombre,
      tipo,
      cedula,
      fecha,
      fechaexp,
      contacto,
      estado,
      org,
      local,
      fotoFinal,
      genero,
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("No se pudo actualizar el registro de personal");
    }

    // console.log(`Personal actualizado exitosamente: ID ${id}`);

    res.json({
      success: true,
      message: "Personal actualizado exitosamente",
      data: {
        id: parseInt(id),
        actualizado: true,
        fotoActualizada: fotoBase64 !== undefined,
      },
    });
  } catch (error) {
    console.error("Error actualizando personal:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



// Ruta para obtener personal por ID
router.post("/personal/obtenerId", async (req, res) => {
  let connection;
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de personal es requerido",
      });
    }

    connection = await db.getConnection();

    const query = "SELECT  * FROM personal WHERE PerId = ?";
    const [rows] = await connection.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }
const personal = {
  id: rows[0].PerId,
  PerNom: rows[0].PerNom,
  PerGen: rows[0].PerGen,
  PerTipoDoc: rows[0].PerTipoDoc,
  PerDoc: rows[0].PerDoc,
  PerTipRH: rows[0].PerTipRH,
  PerPais: rows[0].PerPais,
  PerTel: rows[0].PerTel,
  PerEstado: rows[0].PerEstado,
  PerOrgSec: rows[0].PerOrgSec,
  PerFechNa: rows[0].PerFechNa,
  localSec: rows[0].localSec,
    ano: rows[0].PerAno,
      foto: rows[0].PerFoto,


  // Dirección y datos personales
  PerBar: rows[0].PerBar,
  PerDir: rows[0].PerDir,
  PerEstCivil: rows[0].PerEstCivil,
  PerEstrato: rows[0].PerEstrato,
  PerMilitar: rows[0].PerMilitar,
  PerHogar: rows[0].PerHogar,

  // Condiciones
  PerHabCa: rows[0].PerHabCa,
  PerDis: rows[0].PerDis,

  // Vinculación
  PerTipVinAno: rows[0].PerTipVinAno,
  PerTipVinMes: rows[0].PerTipVinMes,

  // Disponibilidad horaria
  PerDisHorAct: rows[0].PerDisHorAct,
  PerDisHorHor: rows[0].PerDisHorHor,

  // Jornadas / días
  PerDiTraJorAm: rows[0].PerDiTraJorAm,
  tarde: rows[0].PerDiTraJorPM ,
  PerDiTraLu: rows[0].PerDiTraLu,
  PerDiTraMar: rows[0].PerDiTraMar,
  PerDiTraMie: rows[0].PerDiTraMie,
  PerDiTraJue: rows[0].PerDiTraJue,
  PerDiTraVie: rows[0].PerDiTraVie,
  PerDiTraSab: rows[0].PerDiTraSab,
  PerDiTraDom: rows[0].PerDiTraDom
};

// console.log(personal)
    // const personal = {
    //   id: rows[0].PerId,
    //   PerNom: rows[0].PerNom,
    //   tipoDoc: rows[0].PerTipoDoc,
    //   PerDoc: rows[0].PerDoc,
    //   fechaNacimiento: rows[0].PerFechNa,
    //   fechaExpedicion: rows[0].PerFechaExp,
    //   telefono: rows[0].PerTel,
    //   estado: rows[0].PerEstado,
    //   organizacion: rows[0].PerOrgSec,
    //   usuario: rows[0].PerUsuId,
    //   localidad: rows[0].localSec,
    //   ano: rows[0].PerAno,
    //   foto: rows[0].PerFoto,
    //   genero: rows[0].PerGen,
    //   PerMun: rows[0].PerMun,
    //   PerDep: rows[0].PerDep,
    //   PerBar: rows[0].PerBar,
    //   PerDir: rows[0].PerDir,
    //   PerEstCivil: rows[0].PerEstCivil,
    //   PerEstrato: rows[0].PerEstrato,
    //   PerHogar: rows[0].PerHogar,
    //   PerActRe: rows[0].PerActRe,
    //   PerFecOrg: rows[0].PerFecOrg,
    //   PerDis:rows[0].PerDis,
    //   PerHabCa:rows[0].PerHabCa,
    //    PerFecAct:rows[0].PerFecAct
    // };

    res.json({
      success: true,
      message: "Personal encontrado",
      data: personal,
    });
  } catch (error) {
    console.error("Error obteniendo personal por ID:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});






// Ruta para obtener personal por cedula
router.post("/personal/obtenerDoc", async (req, res) => {
  let connection;
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de personal es requerido",
      });
    }

    connection = await db.getConnection();

    const query = `SELECT * FROM personal p  
    left join organizaciones o ON p.PerOrgSec = o.orgSec 
    left join localidad l ON p.localSec = l.localSec  WHERE PerId = ? or PerDoc = ?`;

    const [rows] = await connection.execute(query, [id,id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Personal no encontrado",
      });
    }
const personal = {
  id: rows[0].PerId,
  PerNom: rows[0].PerNom,
  PerGen: rows[0].PerGen,
  PerTipoDoc: rows[0].PerTipoDoc,
  PerDoc: rows[0].PerDoc,
  PerTipRH: rows[0].PerTipRH,
  PerPais: rows[0].PerPais,
  PerTel: rows[0].PerTel,
  PerEstado: rows[0].PerEstado,
  PerOrgSec: rows[0].PerOrgSec,
  PerFechNa: rows[0].PerFechNa,
  localSec: rows[0].localSec,
    ano: rows[0].PerAno,
      foto: rows[0].PerFoto,
  organizacion: rows[0].orgNom,
   localidad: rows[0].localNom,


  // Dirección y datos personales
  PerBar: rows[0].PerBar,
  PerDir: rows[0].PerDir,
  PerEstCivil: rows[0].PerEstCivil,
  PerEstrato: rows[0].PerEstrato,
  PerMilitar: rows[0].PerMilitar,
  PerHogar: rows[0].PerHogar,

  // Condiciones
  PerHabCa: rows[0].PerHabCa,
  PerDis: rows[0].PerDis,

  // Vinculación
  PerTipVinAno: rows[0].PerTipVinAno,
  PerTipVinMes: rows[0].PerTipVinMes,

  // Disponibilidad horaria
  PerDisHorAct: rows[0].PerDisHorAct,
  PerDisHorHor: rows[0].PerDisHorHor,

  // Jornadas / días
  PerDiTraJorAm: rows[0].PerDiTraJorAm,
  PerDiTraJorPm: rows[0].PerDiTraJorPm,
  PerDiTraLu: rows[0].PerDiTraLu,
  PerDiTraMar: rows[0].PerDiTraMar,
  PerDiTraMie: rows[0].PerDiTraMie,
  PerDiTraJue: rows[0].PerDiTraJue,
  PerDiTraVie: rows[0].PerDiTraVie,
  PerDiTraSab: rows[0].PerDiTraSab,
  PerDiTraDom: rows[0].PerDiTraDom
};

    // const personal = {
    //   id: rows[0].PerId,
    //   PerNom: rows[0].PerNom,
    //   tipoDoc: rows[0].PerTipoDoc,
    //   PerDoc: rows[0].PerDoc,
    //   fechaNacimiento: rows[0].PerFechNa,
    //   fechaExpedicion: rows[0].PerFechaExp,
    //   telefono: rows[0].PerTel,
    //   estado: rows[0].PerEstado,
    //   organizacion: rows[0].orgNom,
    //   usuario: rows[0].PerUsuId,
    //   localidad: rows[0].localNom,
    //   ano: rows[0].PerAno,
    //   foto: rows[0].PerFoto,
    //   genero: rows[0].PerGen,
    //   PerMun: rows[0].PerMun,
    //   PerDep: rows[0].PerDep,
    //   PerBar: rows[0].PerBar,
    //   PerDir: rows[0].PerDir,
    //   PerEstCivil: rows[0].PerEstCivil,
    //   PerEstrato: rows[0].PerEstrato,
    //   PerHogar: rows[0].PerHogar,
    //   PerActRe: rows[0].PerActRe,
    //   PerFecOrg: rows[0].PerFecOrg,
    //   PerDis:rows[0].PerDis,
    //   PerHabCa:rows[0].PerHabCa,
    //   PerFecAct:rows[0].PerFecAct
    // };

    res.json({
      success: true,
      message: "Personal encontrado",
      data: personal,
    });
  } catch (error) {
    console.error("Error obteniendo personal por ID:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
