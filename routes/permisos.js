const express = require('express');
const router = express.Router();
const db = require('../config/database');



router.post('/crear', async (req, res) => {
    const { 
        PermDesc, 
        PermCreForm, 
        PerElForm, 
        PerRespEn, 
        PerRespIna, 
        PerRespImpEx, 
        PerRespImpFoto, 
        PerRespDes, 
        PermConfSis 
    } = req.body;
    
    let connection;
    
    try {
        connection = await db.getConnection();
        
        // Verificar si el perfil ya existe
        const checkQuery = "SELECT * FROM permisos WHERE PermDesc = ?";
        const [existing] = await connection.execute(checkQuery, [PermDesc]);
        
        if (existing.length > 0) {
            return res.json({ success: false, message: "El perfil ya existe" });
        }
        
        // Insertar nuevo perfil
        const insertQuery = `
            INSERT INTO permisos (
                PermDesc, 
                PermCreForm, 
                PerElForm, 
                PerRespEn, 
                PerRespIna, 
                PerRespImpEx, 
                PerRespImpFoto, 
                PerRespDes, 
                PerDesCar, 
                PerIngPar, 
                PerElPar, 
                PerCreUsu, 
                PerAsigUsu, 
                PermConfSis, 
                PermConfLog, 
                PermConfColo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'N', 'N', 'N', 'N', 'N', ?, 'N', 'N')
        `;
        
        await connection.execute(insertQuery, [
            PermDesc,
            PermCreForm,
            PerElForm,
            PerRespEn,
            PerRespIna,
            PerRespImpEx,
            PerRespImpFoto,
            PerRespDes,
            PermConfSis
        ]);
        
        res.json({ success: true, message: "Perfil creado exitosamente" });
        
    } catch (error) {
        console.error('Error al crear perfil:', error);
        res.json({ success: false, message: "Error creando perfil" });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

router.post('/Actualizar', async (req, res) => {
    const { 
        PermSec,
        PermDesc, 
        PermCreForm, 
        PerElForm, 
        PerRespEn, 
        PerRespIna, 
        PerRespImpEx, 
        PerRespImpFoto, 
        PerRespDes, 
        PermConfSis 
    } = req.body;
    
    let connection;
    
    try {
        connection = await db.getConnection();
        
        // Verificar si el perfil ya existe
        const checkQuery = "SELECT * FROM permisos WHERE PermDesc = ?";
        const [existing] = await connection.execute(checkQuery, [PermDesc]);
        

        
        // Insertar nuevo perfil
    const updateQuery = `
    UPDATE permisos SET
        PermDesc = ?, 
        PermCreForm = ?, 
        PerElForm = ?, 
        PerRespEn = ?, 
        PerRespIna = ?, 
        PerRespImpEx = ?, 
        PerRespImpFoto = ?, 
        PerRespDes = ?, 
        PerDesCar = 'N',
        PerIngPar = 'N',
        PerElPar = 'N',
        PerCreUsu = 'N',
        PerAsigUsu = 'N',
        PermConfSis = ?, 
        PermConfLog = 'N',
        PermConfColo = 'N'
    WHERE PermSec = ?;
`;
        
        await connection.execute(updateQuery, [
            PermDesc,
            PermCreForm,
            PerElForm,
            PerRespEn,
            PerRespIna,
            PerRespImpEx,
            PerRespImpFoto,
            PerRespDes,
            PermConfSis,PermSec
        ]);
        
        res.json({ success: true, message: "Perfil creado exitosamente" });
        
    } catch (error) {
        console.error('Error al crear perfil:', error);
        res.json({ success: false, message: "Error creando perfil" });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


router.post('/ActualizarPerfil', async (req, res) => {
  const { PermSec, UsuEst, UsuId } = req.body;

  let connection;

  try {
      connection = await db.getConnection();

      const updateQuery = `
          UPDATE usuarios SET
              PermSec = ?, 
              UsuEst = ?
          WHERE UsuId = ?;
      `;

      await connection.execute(updateQuery, [
          PermSec,
          UsuEst,
          UsuId
      ]);

      res.json({ success: true, message: "Usuario actualizado correctamente" });

  } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.json({ success: false, message: "Error actualizando usuario" });
  } finally {
      if (connection) connection.release();
  }
});



router.post('/Eliminar', async (req, res) => {
    const { PermSec } = req.body;

    let connection;

    try {
        connection = await db.getConnection();

        const deleteQuery = `DELETE FROM permisos WHERE PermSec = ?`;

        const [result] = await connection.execute(deleteQuery, [PermSec]);

        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "No existe el perfil" });
        }

        res.json({ success: true, message: "Perfil eliminado correctamente" });

    } catch (error) {
        console.error('Error al eliminar perfil:', error);
        res.json({ success: false, message: "Error eliminando perfil" });
    } finally {
        if (connection) connection.release();
    }
});


router.get('/permisos/:PermSec', async (req, res) => {
  const { PermSec } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM permisos WHERE PermSec = ?", [PermSec]);

    if (rows.length === 0) {
      return res.json({ success: false, message: "No encontrado" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error consultando permiso:", error);
    res.status(500).json({ success: false });
  }
});

router.get('/permisos', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        PermSec,
        PermDesc,
        PermCreForm,
        PerElForm,
        PerRespEn,
        PerRespIna,
        PerRespImpEx,
        PerRespImpFoto,
        PerRespDes,
        PermConfSis
      FROM permisos
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error consultando permisos:", error);
    res.status(500).json({ error: "Error consultando permisos" });
  }
});


router.get('/permisosSelect', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        PermSec,
        PermDesc 
      FROM permisos
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error consultando permisos:", error);
    res.status(500).json({ error: "Error consultando permisos" });
  }
});



router.get('/Usuario', async (req, res) => {
  try {
    const [rows] = await db.query(`
SELECT 
    u.UsuId,
    u.UsuNom,
    u.UsuEst,
    p.PermDesc,
    p.PermSec,

    IFNULL(p.PermCreForm, 'N')      AS PermCreForm,
    IFNULL(p.PerElForm, 'N')        AS PerElForm,
    IFNULL(p.PerRespEn, 'N')        AS PerRespEn,
    IFNULL(p.PerRespIna, 'N')       AS PerRespIna,
    IFNULL(p.PerRespImpEx, 'N')     AS PerRespImpEx,
    IFNULL(p.PerRespImpFoto, 'N')   AS PerRespImpFoto,
    IFNULL(p.PerRespDes, 'N')       AS PerRespDes,
    IFNULL(p.PermConfSis, 'N')      AS PermConfSis

FROM usuarios u
LEFT JOIN permisos p ON u.permsec = p.PermSec; `);

    res.json(rows);
  } catch (error) {
    console.error("Error consultando permisos:", error);
    res.status(500).json({ error: "Error consultando permisos" });
  }
});




module.exports = router;