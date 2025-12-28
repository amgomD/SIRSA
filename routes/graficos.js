 const express = require("express");
const router = express.Router();
const db = require("../config/database");



router.post('/respuestas', async (req, res) => {
  let connection;
  try {
        const { id } = req.body;
    connection = await  db.getConnection();
    
    const [rows] = await connection.query(`
      SELECT 
        f.FormPregunta AS Pregunta,
        r.RespValor AS Respuesta,
        COUNT(*) AS Total
      FROM respuestas r
      LEFT JOIN formulario f ON r.FormSec = f.FormSec
      WHERE  CatFormSec = '${id}' 
      GROUP BY r.FormSec, r.RespValor
      ORDER BY r.FormSec, Total DESC;
    `);
// f.FormTipo NOT IN ('number', 'text', 'date') and
    // 🔹 Transformar el resultado en un objeto agrupado
    const agrupado = {};
    rows.forEach(row => {
      if (!agrupado[row.Pregunta]) agrupado[row.Pregunta] = [];
      agrupado[row.Pregunta].push({
        respuesta: row.Respuesta,
        total: row.Total
      });
    });

    res.json({
      success: true,
      data: agrupado
    });

  } catch (error) {
    console.error('❌ Error en /respuestas/agrupadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo respuestas agrupadas',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});



module.exports = router;
