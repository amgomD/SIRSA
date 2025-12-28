const express = require("express");
const router = express.Router();
const db = require("../config/database");
const ExcelJS = require("exceljs");

async function getRespuestasPivot(whereClause = "") {
  let connection = await db.getConnection();
  try {
    // 1. Construir columnas dinámicas con orden
    const [rows] = await connection.query(`
      SELECT
        GROUP_CONCAT(
          DISTINCT CONCAT(
            'MAX(CASE WHEN f.FormPregunta = ''',
            f.FormPregunta,
            ''' THEN COALESCE(r.RespValor, r.RespNum, r.RespFecha) END) AS \`',
            f.FormPregunta, '\`'
          )
          ORDER BY f.CatFormSec, f.FormOrden
        ) AS columnas
      FROM formulario f
      JOIN respuestas r ON r.FormSec = f.FormSec
    `);

    const columnas = rows[0].columnas;

    // 2. Query final con pivot dinámico
    const sqlFinal = `
      SELECT 
      PerNro as Numero,
     PerNom as Nombre,
                PerTipoDoc as TipoDocumento,
                PerDoc as Documento,
                PerGen as Genero,
                PerFechNa as FechaNacimiento,
                TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) AS EdadActual,
                PerPais as Pais_de_Nacimiento,
                PerTel as Celular,
                PerDir as Dirección,
                PerEstrato as estrato,
                PerHogar as Cabeza_de_Hogar,
                PerEstCivil as Estado_civil,
                PerMilitar as Libreta_militar,
                PerBar as Barrios,
                o.orgNom as Organización,
                PerTipVinAno as Años_de_vinculacion,
                PerTipVinMes as Meses_de_vinculación,
                PerDisHorAct as Actividades_que_realiza,
                PerDisHorHor as N_de_horas , 
                PerDiTraLu as Trabaja_lunes,  
PerDiTraMar as Trabaja_Martes, 
PerDiTraMie as Trabaja_Miercoles, 
PerDiTraJue as Trabaja_Jueves, 
PerDiTraVie as Trabaja_Viernes, 
PerDiTraSab as Trabaja_Sabado, 
PerDiTraDom as Trabaja_Domingo, 
PerDiTraJorAm as Jornada_AM, 
PerDiTraJorPM as Jornada_PM, 
                 l.localnom as Localidad,
                
                PerEstado as Estado_en_la_plataforma,
                PerAno as Año_de_registro,
               
       ${columnas}
      FROM personal p
      JOIN respuestas r ON p.PerId = r.PerId
      JOIN formulario f ON r.FormSec = f.FormSec
    left join organizaciones o ON p.PerOrgSec = o.orgSec 
    left join localidad l ON p.localSec = l.localSec 
      ${whereClause ? `WHERE ${whereClause}` : ""}
      GROUP BY p.PerId, p.PerNom
      ORDER BY p.PerNom
    `;

    const [resultados] = await connection.query(sqlFinal);
    return resultados;
  } finally {
    connection.release();
  }
}

// 📍 Endpoint para exportar Excel
router.post("/Exportar", async (req, res) => {
  try {
    const { where } = req.body; // filtro opcional
    const data = await getRespuestasPivot(where || "");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Respuestas");

    if (data.length > 0) {
      // Encabezados
      worksheet.columns = Object.keys(data[0]).map((key) => ({
        header: key,
        key: key,
        width: 25,
      }));

      // Filas
      data.forEach((row) => worksheet.addRow(row));

      // Estilos en encabezados
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center" };
      });
    }

    const now = new Date();
    const id = now
      .toISOString()
      .replace(/[-T:.Z]/g, "") // quitamos caracteres que no sirven
      .slice(0, 17); // YYYYMMDDHHMMSSmmm

    const fileName = `Reporteencuestados_${id}.xlsx`;

    // Encabezados HTTP para descarga
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Enviar archivo como stream
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generando Excel:", err);
    res.status(500).send("Error generando Excel");
  }
});

module.exports = router;
