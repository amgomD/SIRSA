const express = require('express');
const router = express.Router();
const db = require("../config/database");

// Ruta 1: Obtener todas las organizaciones
router.post('/organizaciones/obtener', async (req, res) => {
    let connection;
    try {
        console.log('POST /organizaciones/obtener - Obteniendo organizaciones...');
        
        connection = await db.getConnection();
        
        const query = "SELECT * FROM organizaciones";
        const [rows] = await connection.execute(query);
        
        if (rows.length === 0) {
            return res.json({
                success: false,
                message: 'No se encontraron organizaciones',
                data: []
            });
        }
        
        const organizaciones = rows.map(row => ({
            llave: row.orgSec,
            nombre: row.orgNom,
            nit: row.orgNit,
            telefono: row.OrgTel,
            correo: row.OrgCor,
            web: row.OrgWeb,
            replegal: row.OrgRepLe,
            usuario: row.oUsuCod,
            fecha: row.oFecha
        }));
        
        console.log(`Se encontraron ${organizaciones.length} organizaciones`);
        
        res.json({
            success: true,
            message: 'Organizaciones obtenidas exitosamente',
            data: organizaciones,
            total: organizaciones.length
        });
        
    } catch (error) {
        console.error('Error obteniendo organizaciones:', error);
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



// Ruta 1: Obtener todas las organizaciones id
router.get('/organizaciones/obtener/:orgid', async (req, res) => {
      const { orgid } = req.params;
    let connection;
    try {
        console.log('POST /organizaciones/obtener - Obteniendo organizaciones...');
        
        connection = await db.getConnection();
        
        const query = "SELECT * FROM organizaciones where orgsec = ?";
        const [rows] = await connection.query(query,[orgid]);

  

    
        if (rows.length === 0) {
            return res.json({
                success: false,
                message: 'No se encontraron organizaciones',
                data: []
            });
        }
        
        const organizaciones = rows.map(row => ({
            llave: row.orgSec,
            nombre: row.orgNom,
            nit: row.orgNit,
            telefono: row.OrgTel,
            correo: row.OrgCor,
            web: row.OrgWeb,
            replegal: row.OrgRepLe,
            usuario: row.oUsuCod,
            fecha: row.oFecha
        }));
        
        console.log(`Se encontraron ${organizaciones.length} organizaciones`);
        
        res.json({
            success: true,
            message: 'Organizaciones obtenidas exitosamente',
            data: organizaciones,
            total: organizaciones.length
        });
        
    } catch (error) {
        console.error('Error obteniendo organizaciones:', error);
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



// Ruta 2: Crear nueva organización
router.post('/organizaciones/crear', async (req, res) => {
    let connection;
    try {
        const { usucod, nombre, nit, telefono, correo, web, replegal } = req.body;

        if (!usucod || !nombre || !nit) {
            return res.status(400).json({
                success: false,
                message: 'Usuario, nombre y NIT son requeridos'
            });
        }

        console.log(`POST /organizaciones/crear - Procesando organización: ${nombre}`);

        connection = await db.getConnection();

        const fechaActual = new Date().toISOString().split('T')[0];

        // 1️⃣ Verificar si el NIT ya existe
        const [rows] = await connection.execute(
            "SELECT orgsec FROM organizaciones WHERE orgNit = ?",
            [nit]
        );

        // 2️⃣ Si existe → UPDATE
        if (rows.length > 0) {
            const orgId = rows[0].orgId;

            const updateQuery = `
                UPDATE organizaciones
                SET 
                    orgNom = ?,
                    oUsuCod = ?,
                    OrgTel = ?,
                    OrgCor = ?,
                    OrgWeb = ?,
                    OrgRepLe = ?
                WHERE orgNit = ?
            `;

            await connection.execute(updateQuery, [
                nombre,
                usucod,
                telefono,
                correo,
                web,
                replegal,
                nit
            ]);

            return res.json({
                success: true,
                message: 'Organización actualizada exitosamente',
                data: {
                    llave: orgId,
                    nombre,
                    nit,
                    usuario: usucod
                }
            });
        }

        // 3️⃣ Si NO existe → INSERT
        const insertQuery = `
            INSERT INTO organizaciones
            (orgNom, orgNit, oUsuCod, oFecha, OrgTel, OrgCor, OrgWeb, OrgRepLe)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(insertQuery, [
            nombre,
            nit,
            usucod,
            fechaActual,
            telefono,
            correo,
            web,
            replegal
        ]);

        res.json({
            success: true,
            message: 'Organización creada exitosamente',
            data: {
                llave: result.insertId,
                nombre,
                nit,
                usuario: usucod,
                fecha: fechaActual
            }
        });

    } catch (error) {
        console.error('Error creando/actualizando organización:', error);
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


// Ruta 3: Eliminar organización
router.post('/organizaciones/eliminar', async (req, res) => {
    let connection;
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de organización es requerido'
            });
        }
        
        console.log(`POST /organizaciones/eliminar - Eliminando organización ID: ${id}`);
        
        connection = await db.getConnection();
        
        const checkQuery = "SELECT orgSec FROM organizaciones WHERE orgSec = ?";
        const [checkRows] = await connection.execute(checkQuery, [id]);
        
        if (checkRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Organización no encontrada'
            });
        }
        
        const query = "DELETE FROM organizaciones WHERE orgSec = ?";
        const [result] = await connection.execute(query, [id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se pudo eliminar la organización');
        }
        
        console.log(`Organización eliminada exitosamente: ID ${id}`);
        
        res.json({
            success: true,
            message: 'Organización eliminada exitosamente',
            data: {
                id: parseInt(id),
                eliminada: true
            }
        });
        
    } catch (error) {
        console.error('Error eliminando organización:', error);
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

// Ruta 4: Actualizar organización
router.post('/organizaciones/actualizar', async (req, res) => {
    let connection;
    try {
        const { id, nombre, nit ,telefono,correo,web,replegal} = req.body;
        
        if (!id || !nombre || !nit) {
            return res.status(400).json({
                success: false,
                message: 'ID, nombre y NIT son requeridos'
            });
        }
        
        console.log(`POST /organizaciones/actualizar - Actualizando organización ID: ${id}`);
        
        connection = await db.getConnection();
        
        const checkQuery = "SELECT orgSec, orgNom, orgNit FROM organizaciones WHERE orgSec = ?";
        const [checkRows] = await connection.execute(checkQuery, [id]);
        
        if (checkRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Organización no encontrada'
            });
        }
        
        const organizacionAnterior = checkRows[0];
        
        const query = "UPDATE organizaciones SET orgNom = ?, orgNit = ?, OrgTel = ?, 	OrgCor = ? , 	OrgWeb = ?, 	OrgRepLe = ? WHERE orgSec = ?";
        const [result] = await connection.execute(query, [nombre, nit,telefono,correo,web,replegal, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se pudo actualizar la organización');
        }
        
        console.log(`Organización actualizada: "${organizacionAnterior.orgNom}" -> "${nombre}"`);
        
        res.json({
            success: true,
            message: 'Organización actualizada exitosamente',
            data: {
                llave: parseInt(id),
                nombre_anterior: organizacionAnterior.orgNom,
                nit_anterior: organizacionAnterior.orgNit,
                nombre_nuevo: nombre,
                nit_nuevo: nit,
                actualizada: true
            }
        });
        
    } catch (error) {
        console.error('Error actualizando organización:', error);
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