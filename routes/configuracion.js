const express = require('express');
const router = express.Router();
const db = require('../config/database'); // tu conexión mysql2 o similar
const fs = require('fs');
const path = require('path');


// Función para guardar base64 como imagen
function guardarImagenBase64(base64String, nombreBase) {
  if (!base64String) return null;

  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;

  const ext = matches[1].split('/')[1]; // png, jpeg, etc
  const buffer = Buffer.from(matches[2], 'base64');
  const nombreArchivo = `${nombreBase}.${ext}`;

  const rutaCarpeta = path.join(__dirname, '..', 'uploads'); 
  const rutaCompleta = path.join(rutaCarpeta, nombreArchivo);

  // Crear carpeta si no existe
  if (!fs.existsSync(rutaCarpeta)) {
    fs.mkdirSync(rutaCarpeta, { recursive: true });
  }

  fs.writeFileSync(rutaCompleta, buffer);

  return `/uploads/${nombreArchivo}`;
}




router.post('/guardar', async (req, res) => {
  const { nombreAlcaldia, subtitulo, color, mensaje, imagenes } = req.body;

  try {
    // Verificar existencia
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM configuracion');
    const existe = rows[0].total > 0;

    // Guardar imágenes físicamente
    const imgLogo = guardarImagenBase64(imagenes?.ConfOrgLogo, 'logo');
    const imgPort = guardarImagenBase64(imagenes?.confOrgPort, 'portada');
    const imgFoto = guardarImagenBase64(imagenes?.confOrgFot, 'foto');

    // Valores a guardar
    const valores = [
      nombreAlcaldia,
      subtitulo,
      color,
      mensaje,
      imgLogo,
      imgPort,
      imgFoto
    ];

    if (existe) {
      await db.query(
        `UPDATE configuracion 
         SET ConfOrgNom = ?, confOrgSubCar = ?, ConfOrgColor = ?, confOrgAlcCar = ?, 
             ConfOrgLogo = COALESCE(?, ConfOrgLogo),
             confOrgPort = COALESCE(?, confOrgPort),
             confOrgFot = COALESCE(?, confOrgFot)
         WHERE ConfOrgSec = 1`,
        valores
      );
    } else {
      await db.query(
        `INSERT INTO configuracion (
           ConfOrgSec, ConfOrgNom, confOrgSubCar, ConfOrgColor, confOrgAlcCar,
           ConfOrgLogo, confOrgPort, confOrgFot
         ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
        valores
      );
    }

    res.json({ ok: true, mensaje: 'Configuración guardada correctamente' });

  } catch (err) {
    console.error('Error al guardar configuración:', err);
    res.status(500).json({ ok: false, error: 'Error al guardar configuración' });
  }
});

// Obtener configuración
router.get('/traer', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM configuracion LIMIT 1');
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

router.get('/traer', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM configuracion LIMIT 1');
    if (rows.length === 0) return res.json(null);
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});


module.exports = router;