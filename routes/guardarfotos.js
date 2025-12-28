// server.js
const express = require('express');
const cors = require('cors');
const router = express.Router();
const dbConfig = require("../config/database");
const fs = require('fs').promises;
const path = require('path');



// Crear carpeta de uploads si no existe
// Crear carpeta de uploads en la raíz del proyecto
const uploadsDir = path.join(__dirname, '..', 'uploads'); // Sube un nivel desde routes
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);


// Pool de conexiones MySQL para mejor rendimiento
 

// Endpoint principal para subir imágenes
router.post('/guardar', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { imageData, imageName } = req.body;

console.log(imageName)
    // Validaciones rápidas
    if (!imageData || !imageName) {
      return res.status(400).json({ 
        error: 'Datos incompletos: se requiere imageData e imageName' 
      });
    }

    // Extraer información del base64
    const matches = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Formato de imagen inválido' });
    }

    const imageType = matches[1];
    const base64Data = matches[2];

    // Generar nombre único y seguro
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const safeName = imageName.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    const filename = `${timestamp}_${randomString}_${safeName}`;
    const filepath = path.join(uploadsDir, filename);

    // Convertir base64 a buffer (más eficiente que string)
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Guardar archivo de forma asíncrona
    await fs.writeFile(filepath, imageBuffer);

    // Ruta relativa para la BD
    const relativePath = `/uploads/${filename}`;
console.log(safeName)
    // Insertar en BD de forma asíncrona
    const [result] = await dbConfig.execute(
      'Update personal set PerFoto = ? where PerDoc = ? ',
      [relativePath ,safeName]
    );

    const executionTime = Date.now() - startTime;

    res.json({
      success: true,
      filename,
      path: relativePath,
      id: result.insertId,
      size: imageBuffer.length,
      executionTime: `${executionTime}ms`
    });

  } catch (error) {
    console.error('Error al procesar imagen:', error);
    res.status(500).json({ 
      error: 'Error al guardar la imagen',
      details: error.message 
    });
  }
});

// Endpoint para obtener todas las imágenes
router.get('/api/images', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, filename, original_name, file_path, file_size, mime_type, created_at FROM images ORDER BY created_at DESC'
    );
    res.json({ success: true, images: rows });
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ error: 'Error al obtener imágenes' });
  }
});

// Endpoint para eliminar imagen
router.delete('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información de la imagen
    const [rows] = await dbConfig.execute(
      'SELECT filename FROM images WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const filename = rows[0].filename;
    const filepath = path.join(uploadsDir, filename);

    // Eliminar archivo
    await fs.unlink(filepath).catch(err => {
      console.warn('Advertencia: No se pudo eliminar el archivo físico:', err.message);
    });

    // Eliminar de BD
    await pool.execute('DELETE FROM images WHERE id = ?', [id]);

    res.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});











module.exports = router;