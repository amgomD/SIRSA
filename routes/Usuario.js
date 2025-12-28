const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Ruta 1: Obtener todas las localidades
router.post('/usuario/obtener', async (req, res) => {
      const { email } = req.body;

        if (!email) {
    return res.status(400).json({ error: "Falta el parámetro 'email'" });
  }

    let connection;
    try {
        console.log('POST /usuario/obtener - Obteniendo localidades...');
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Consulta
        const query = "SELECT * FROM usuarios WHERE UsuEmail = ?";
        const [rows] = await connection.execute(query,[email]);

        if (rows.length === 0) {
            return res.json({
                success: false,
                message: 'No se encontraron usuarios',
                data: []
            });
        }
        
        // Formatear datos
        const usuarioinfo = rows.map(row => ({
            UsuId: row.UsuId,
            UsuCod: row.UsuCod,
            UsuNom: row.UsuNom,
            UsuCed: row.UsuCed,
            UsuEmail: row.UsuEmail,
            UsuTel: row.UsuTel,
            UsuEst: row.UsuEst,
            UsuCed: row.UsuCed,
        }));
        
        console.log(`Se encontraron ${usuarioinfo.length} localidades`);
        
        res.json({
            success: true,
            message: 'usuario obtenido exitosamente',
            data: usuarioinfo,
            total: usuarioinfo.length
        });
        
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
