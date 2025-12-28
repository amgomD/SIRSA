const express = require('express');
const router = express.Router();
const db = require('../config/database');



router.post('/wsGuardarCategoria', async (req, res) => {
    let connection;
    try {
        console.log('POST /wsGuardarCategoria - Datos recibidos:', req.body);
       
        const { titulo, descripcion, foto } = req.body;
       
        if (!titulo) {
            return res.status(400).json({
                success: false,
                message: 'El titulo es requerido'
            });
        }

        // Generar ID aleatorio para la llave primaria
        const generateRandomId = () => {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        // Obtener conexión
        connection = await db.getConnection();
       
        // Iniciar transacción
        await connection.beginTransaction();
       
        console.log('Guardando Encuesta ...');
       
        // Preparar datos para insertar
        const catFormSec = generateRandomId();
        const fechaCreacion = new Date();
        const usuarioCreacion = 'prueba';
        
        // Convertir array de tarjetas a JSON string
        /*const tarjetasJson = descripcion && descripcion.length > 0 
            ? JSON.stringify(descripcion) 
            : null;
       */
        // Insertar registro principal
        const insertQuery = `
            INSERT INTO categoria (
                CatFormSec, 
                CatFormTitu,
                CatFormDesc, 
                CatFormEst, 
                CatFormLog, 
                CatFormFecCre, 
                CatFormUsuCre
            ) VALUES (?, ?,?, ?, ?, ?, ?)
        `;
       
        await connection.execute(insertQuery, [
            catFormSec,
            titulo,
            descripcion,
            'ACT',
            foto || "", // Si hay foto se guarda, sino null
            fechaCreacion,
            usuarioCreacion
        ]);
       
        console.log('Encuesta guardada con ID:', catFormSec);
       
        // Confirmar transacción
        await connection.commit();
       
        res.json({
            success: true,
            message: 'Encuesta guardada exitosamente',
            form_id: catFormSec,
            titulo: titulo,
            descripcion: descripcion || [],
            tiene_foto: !!foto
        });
       
    } catch (error) {
        console.error('Error guardando Encuesta :', error);
       
        // Revertir transacción si hay error
        if (connection) {
            await connection.rollback();
        }
       
        res.status(500).json({
            success: false,
            message: 'Error guardando Encuesta: ' + error.message
        });
    } finally {
        // Liberar conexión
        if (connection) {
            connection.release();
        }
    }
});


// API para listar categorías
router.get('/wsListarCategorias', async (req, res) => {
    let connection;
    try {
        console.log('GET /wsListarCategorias - Obteniendo categorías...');
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Query para obtener todas las categorías
        const selectQuery = `
            SELECT 
                CatFormSec as id,
                CatFormDesc as descripcion ,
                CatFormTitu as titulo,
                CatFormLog as icono,
                CatFormFecCre as fecha_creacion,
                CatFormUsuCre as usuario_creacion,
                CatFormEst as estado
            FROM categoria 
            ORDER BY CatFormFecCre ASC
        `;
        
        const [rows] = await connection.execute(selectQuery);
        
        // Procesar los resultados para el frontend
        const categorias = rows.map(categoria => ({
            id: categoria.id,
            titulo: categoria.titulo || 'Sin título',
            descripcion: categoria.descripcion || 'Sin descripción',
            icono: categoria.icono || null, // Asegurar que sea null si no existe
            fecha_creacion: categoria.fecha_creacion,
            usuario_creacion: categoria.usuario_creacion,
            estado: categoria.estado,
            // Formatear fecha para mostrar
            fecha_formateada: new Date(categoria.fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));
        
        console.log(`Se encontraron ${categorias.length} categorías`);
        
        res.json({
            success: true,
            message: 'Categorías obtenidas exitosamente',
            total: categorias.length,
            categorias: categorias
        });
        
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error obteniendo categorías: ' + error.message,
            categorias: []
        });
    } finally {
        // Liberar conexión
        if (connection) {
            connection.release();
        }
    }
});

router.get('/wsListarCategoriastab', async (req, res) => {
    let connection;
    try {
        console.log('GET /wsListarCategorias - Obteniendo categorías...');
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Query para obtener todas las categorías
        const selectQuery = `
            SELECT 
                CatFormSec as id,
                CatFormDesc as descripcion ,
                CatFormTitu as titulo,
                CatFormLog as icono,
                CatFormFecCre as fecha_creacion,
                CatFormUsuCre as usuario_creacion,
                CatFormEst as estado
            FROM categoria  where CatFormEst = 'ACT'
            ORDER BY CatFormFecCre ASC
        `;
        
        const [rows] = await connection.execute(selectQuery);
        
        // Procesar los resultados para el frontend
        const categorias = rows.map(categoria => ({
            id: categoria.id,
            titulo: categoria.titulo || 'Sin título',
            descripcion: categoria.descripcion || 'Sin descripción',
            icono: categoria.icono || null, // Asegurar que sea null si no existe
            fecha_creacion: categoria.fecha_creacion,
            usuario_creacion: categoria.usuario_creacion,
            estado: categoria.estado,
            // Formatear fecha para mostrar
            fecha_formateada: new Date(categoria.fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));
        
        console.log(`Se encontraron ${categorias.length} categorías`);
        
        res.json({
            success: true,
            message: 'Categorías obtenidas exitosamente',
            total: categorias.length,
            categorias: categorias
        });
        
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error obteniendo categorías: ' + error.message,
            categorias: []
        });
    } finally {
        // Liberar conexión
        if (connection) {
            connection.release();
        }
    }
});

// API para obtener una categoría específica por ID
router.get('/wsObtenerCategoria/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría requerido'
            });
        }
        
        console.log(`GET /wsObtenerCategoria/${id} - Obteniendo categoría...`);
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Query para obtener categoría específica
        const selectQuery = `
            SELECT 
                CatFormSec as id,
                CatFormDesc as descripcion ,
                CatFormTitu as titulo,
                CatFormLog as icono,
                CatFormFecCre as fecha_creacion,
                CatFormUsuCre as usuario_creacion
            FROM categoria 
            WHERE CatFormSec = ? order by CatFormFecCre asc
        `;
        
        const [rows] = await connection.execute(selectQuery, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        const categoria = {
            id: rows[0].id,
            titulo: rows[0].titulo,
            descripcion: rows[0].descripcion,
            icono: rows[0].icono,
            fecha_creacion: rows[0].fecha_creacion,
            usuario_creacion: rows[0].usuario_creacion,
            fecha_formateada: new Date(rows[0].fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        res.json({
            success: true,
            message: 'Categoría obtenida exitosamente',
            categoria: categoria
        });
        
    } catch (error) {
        console.error('Error obteniendo categoría:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error obteniendo categoría: ' + error.message
        });
    } finally {
        // Liberar conexión
        if (connection) {
            connection.release();
        }
    }
});


router.delete('/wsEliminarCategoria/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría requerido'
            });
        }
        
        console.log(`DELETE /wsEliminarCategoria/${id} - Eliminando categoría...`);
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Iniciar transacción
        await connection.beginTransaction();
        
        // Verificar si la categoría existe
        const checkQuery = `
            SELECT CatFormSec, CatFormDesc 
            FROM categoria 
            WHERE CatFormSec = ?
        `;
        
        const [existingRows] = await connection.execute(checkQuery, [id]);
        
        if (existingRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        const categoria = existingRows[0];
        
        // TODO: Opcional - Verificar si tiene formularios dependientes
        // const checkFormulariosQuery = `
        //     SELECT COUNT(*) as total 
        //     FROM Formulario 
        //     WHERE FormSec = ?
        // `;
        // const [formRows] = await connection.execute(checkFormulariosQuery, [id]);
        // 
        // if (formRows[0].total > 0) {
        //     await connection.rollback();
        //     return res.status(409).json({
        //         success: false,
        //         message: 'No se puede eliminar la categoría porque tiene formularios asociados',
        //         formularios_asociados: formRows[0].total
        //     });
        // }
        
        // Eliminar la categoría
        const deleteQuery = `
            DELETE FROM categoria 
            WHERE CatFormSec = ?
        `;
        
        const [deleteResult] = await connection.execute(deleteQuery, [id]);
        
        if (deleteResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({
                success: false,
                message: 'No se pudo eliminar la categoría'
            });
        }
        
        // Confirmar transacción
        await connection.commit();
        
        console.log(`Categoría eliminada exitosamente: ${categoria.CatFormDesc}`);
        
        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente',
            categoria_eliminada: {
                id: id,
                titulo: categoria.CatFormDesc
            }
        });
        
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        
        // Revertir transacción si hay error
        if (connection) {
            await connection.rollback();
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    } finally {
        // Liberar conexión
        if (connection) {
            connection.release();
        }
    }
});

// API alternativo para eliminación suave (cambiar estado en lugar de eliminar)
router.patch('/wsDesactivarCategoria/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría requerido'
            });
        }
        
        console.log(`PATCH /wsDesactivarCategoria/${id} - Desactivando categoría...`);
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Verificar si la categoría existe
        const checkQuery = `
            SELECT CatFormSec, CatFormDesc 
            FROM categoria 
            WHERE CatFormSec = ?
        `;
        
        const [existingRows] = await connection.execute(checkQuery, [id]);
        
        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        // Agregar campo de estado si no existe (opcional)
        // ALTER TABLE CatForm ADD COLUMN CatFormEstado VARCHAR(20) DEFAULT 'Activo';
        
        // Actualizar estado a 'Inactivo' en lugar de eliminar
        const updateQuery = `
            UPDATE categoria 
            SET CatFormEst = 'INA',
                CatFormFecMod = ?,
                CatFormUsuMod = 'sistema'
            WHERE CatFormSec = ?
        `;
        
        const fechaModificacion = new Date();
        const [updateResult] = await connection.execute(updateQuery, [fechaModificacion, id]);
        
        if (updateResult.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'No se pudo desactivar la categoría'
            });
        }
        
        console.log(`Categoría desactivada: ${existingRows[0].CatFormDesc}`);
        
        res.json({
            success: true,
            message: 'Categoría desactivada exitosamente',
            categoria_desactivada: {
                id: id,
                titulo: existingRows[0].CatFormDesc,
                nuevo_estado: 'Inactivo'
            }
        });
        
    } catch (error) {
        console.error('Error desactivando categoría:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    } finally {
        // Liberar conexión
        if (connection) {
            connection.release();
        }
    }
});


router.patch('/wsReactivarCategoria/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría requerido'
            });
        }
        
        console.log(`PATCH /wsReactivarCategoria/${id} - Desactivando categoría...`);
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Verificar si la categoría existe
        const checkQuery = `
            SELECT CatFormSec, CatFormDesc 
            FROM categoria 
            WHERE CatFormSec = ?
        `;
        
        const [existingRows] = await connection.execute(checkQuery, [id]);
        
        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        // Agregar campo de estado si no existe (opcional)
        // ALTER TABLE CatForm ADD COLUMN CatFormEstado VARCHAR(20) DEFAULT 'Activo';
        
        // Actualizar estado a 'Inactivo' en lugar de eliminar
        const updateQuery = `
            UPDATE categoria 
            SET CatFormEst = 'ACT',
                CatFormFecMod = ?,
                CatFormUsuMod = 'sistema'
            WHERE CatFormSec = ?
        `;
        
        const fechaModificacion = new Date();
        const [updateResult] = await connection.execute(updateQuery, [fechaModificacion, id]);
        
        if (updateResult.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'No se pudo activar la categoría'
            });
        }
        
        console.log(`Categoría activada: ${existingRows[0].CatFormDesc}`);
        
        res.json({
            success: true,
            message: 'Categoría activada exitosamente',
            categoria_desactivada: {
                id: id,
                titulo: existingRows[0].CatFormDesc,
                nuevo_estado: 'Activo'
            }
        });
        
    } catch (error) {
        console.error('Error activando categoría:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    } finally {
        // Liberar conexión
        if (connection) {
            connection.release();
        }
    }
});

// API para eliminar múltiples categorías
router.delete('/wsEliminarCategorias', async (req, res) => {
    let connection;
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Array de IDs requerido'
            });
        }
        
        console.log(`DELETE /wsEliminarCategorias - Eliminando ${ids.length} categorías...`);
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Iniciar transacción
        await connection.beginTransaction();
        
        const eliminadas = [];
        const errores = [];
        
        // Eliminar cada categoría
        for (const id of ids) {
            try {
                // Verificar existencia
                const checkQuery = `SELECT CatFormSec, CatFormDesc FROM categoria WHERE CatFormSec = ?`;
                const [existingRows] = await connection.execute(checkQuery, [id]);
                
                if (existingRows.length === 0) {
                    errores.push({ id, error: 'Categoría no encontrada' });
                    continue;
                }
                
                // Eliminar
                const deleteQuery = `DELETE FROM categoria WHERE CatFormSec = ?`;
                const [deleteResult] = await connection.execute(deleteQuery, [id]);
                
                if (deleteResult.affectedRows > 0) {
                    eliminadas.push({
                        id,
                        titulo: existingRows[0].CatFormDesc
                    });
                } else {
                    errores.push({ id, error: 'No se pudo eliminar' });
                }
                
            } catch (error) {
                errores.push({ id, error: error.message });
            }
        }
        
        // Confirmar transacción si hay al menos una eliminación exitosa
        if (eliminadas.length > 0) {
            await connection.commit();
        } else {
            await connection.rollback();
        }
        
        res.json({
            success: eliminadas.length > 0,
            message: `${eliminadas.length} categorías eliminadas, ${errores.length} errores`,
            eliminadas,
            errores,
            total_procesadas: ids.length,
            total_eliminadas: eliminadas.length,
            total_errores: errores.length
        });
        
    } catch (error) {
        console.error('Error eliminando categorías múltiples:', error);
        
        if (connection) {
            await connection.rollback();
        }
        
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