const express = require("express");
const router = express.Router();
const db = require("../config/database");



// Ruta 1: Obtener todas las localidades
router.post('/localidad/obtener', async (req, res) => {
    let connection;
    try {
        console.log('POST /localidad/obtener - Obteniendo localidades...');
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Consulta
        const query = "SELECT localSec, localNom, lUsuCod, lFecha FROM localidad";
        const [rows] = await connection.execute(query);
        
        if (rows.length === 0) {
            return res.json({
                success: false,
                message: 'No se encontraron localidades',
                data: []
            });
        }
        
        // Formatear datos
        const localidades = rows.map(row => ({
            llave: row.localSec,
            localidad: row.localNom,
            usuario: row.lUsuCod,
            fecha: row.lFecha
        }));
        
        console.log(`Se encontraron ${localidades.length} localidades`);
        
        res.json({
            success: true,
            message: 'Localidades obtenidas exitosamente',
            data: localidades,
            total: localidades.length
        });
        
    } catch (error) {
        console.error('Error obteniendo localidades:', error);
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




// Ruta 2: Crear nueva localidad
router.post('/localidad/crear', async (req, res) => {
    let connection;
    try {
        const { usucod, nombre } = req.body;
        
        // Validaciones
        if (!usucod || !nombre) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y nombre son requeridos'
            });
        }
        
        console.log(`POST /localidad/crear - Creando localidad: ${nombre}`);
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Fecha actual
        const fechaActual = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Consulta de inserción
        const query = "INSERT INTO localidad (localNom, lUsuCod, lFecha) VALUES (?, ?, ?)";
        const [result] = await connection.execute(query, [nombre, usucod, fechaActual]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se pudo insertar la localidad');
        }
        
        console.log(`Localidad creada con ID: ${result.insertId}`);
        
        res.json({
            success: true,
            message: 'Localidad creada exitosamente',
            data: {
                id: result.insertId,
                nombre: nombre,
                usuario: usucod,
                fecha: fechaActual
            }
        });
        
    } catch (error) {
        console.error('Error creando localidad:', error);
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

// Ruta 3: Eliminar localidad
router.post('/localidad/eliminar', async (req, res) => {
    let connection;
    try {
        const { id } = req.body;
        
        // Validaciones
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de localidad es requerido'
            });
        }
        
        console.log(`POST /localidad/eliminar - Eliminando localidad ID: ${id}`);
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Verificar que la localidad existe
        const checkQuery = "SELECT localSec FROM localidad WHERE localSec = ?";
        const [checkRows] = await connection.execute(checkQuery, [id]);
        
        if (checkRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Localidad no encontrada'
            });
        }
        
        // Consulta de eliminación
        const query = "DELETE FROM localidad WHERE localSec = ?";
        const [result] = await connection.execute(query, [id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se pudo eliminar la localidad');
        }
        
        console.log(`Localidad eliminada exitosamente: ID ${id}`);
        
        res.json({
            success: true,
            message: 'Localidad eliminada exitosamente',
            data: {
                id: parseInt(id),
                eliminada: true
            }
        });
        
    } catch (error) {
        console.error('Error eliminando localidad:', error);
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

// Ruta 4: Actualizar localidad
router.post('/localidad/actualizar', async (req, res) => {
    let connection;
    try {
        const { id, nombre } = req.body;
        
        // Validaciones
        if (!id || !nombre) {
            return res.status(400).json({
                success: false,
                message: 'ID y nombre son requeridos'
            });
        }
        
        console.log(`POST /localidad/actualizar - Actualizando localidad ID: ${id}`);
        
        // Obtener conexión
        connection = await db.getConnection();
        
        // Verificar que la localidad existe
        const checkQuery = "SELECT localSec, localNom FROM localidad WHERE localSec = ?";
        const [checkRows] = await connection.execute(checkQuery, [id]);
        
        if (checkRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Localidad no encontrada'
            });
        }
        
        const localidadAnterior = checkRows[0].localNom;
        
        // Consulta de actualización
        const query = "UPDATE localidad SET localNom = ? WHERE localSec = ?";
        const [result] = await connection.execute(query, [nombre, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar la localidad');
        }
        
        console.log(`Localidad actualizada: "${localidadAnterior}" -> "${nombre}"`);
        
        res.json({
            success: true,
            message: 'Localidad actualizada exitosamente',
            data: {
                id: parseInt(id),
                nombre_anterior: localidadAnterior,
                nombre_nuevo: nombre,
                actualizada: true
            }
        });
        
    } catch (error) {
        console.error('Error actualizando localidad:', error);
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

// Ruta adicional: Obtener localidad por ID
router.post('/localidad/obtener-por-id', async (req, res) => {
    let connection;
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de localidad es requerido'
            });
        }
        
        console.log(`POST /localidad/obtener-por-id - Buscando localidad ID: ${id}`);
        
        connection = await db.getConnection();
        
        const query = "SELECT localSec, localNom, lUsuCod, lFecha FROM localidad WHERE localSec = ?";
        const [rows] = await connection.execute(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Localidad no encontrada'
            });
        }
        
        const localidad = {
            llave: rows[0].localSec,
            localidad: rows[0].localNom,
            usuario: rows[0].lUsuCod,
            fecha: rows[0].lFecha
        };
        
        res.json({
            success: true,
            message: 'Localidad encontrada',
            data: localidad
        });
        
    } catch (error) {
        console.error('Error obteniendo localidad por ID:', error);
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