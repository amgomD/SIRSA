const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.post("/save", async (req, res) => {
    let connection;
    try {
        const campos = req.body; // Array de objetos
        connection = await db.getConnection();
        console.log("Total de campos recibidos:", campos.length);
        
        // ✅ USAR for...of en lugar de forEach para async/await
     // ✅ SELECT para obtener la última RespSec
                const selectQuery = `
                    SELECT MAX(RespSec) as ultimaRespSec 
                    FROM respuestas 
                    WHERE PerId = ? AND FormSec = ?
                `;
                
                let bandera = 0;
              let nuevaRespSec = 1;

        for (const [index, campo] of campos.entries()) {
            console.log(`Campo ${index + 1}:`, {
                perId: campo.perId,
                tipo: campo.tipo,
                id: campo.id,
                valor: campo.valor,
            });
            
            // ✅ Inicializar variables con valores por defecto
            let RespValor = null;
            let RespFecha = null;
            let RespNum = null;
            
            switch (campo.tipo) {
                case "number":
                    RespNum = campo.valor || null;
                    break;
                case "date":
                    RespFecha = campo.valor || null;
                    break;
                default:
                    RespValor = campo.valor || null;
                    break;
            }
            
            // ✅ Verificar que los parámetros requeridos no sean undefined
            const perId = campo.perId || null;
            const formSec = campo.id || null;
            bandera += 1;
            if (!perId || !formSec) {
                console.log(`Saltando campo ${index + 1}: faltan perId o id`);
                continue;
            }
            
            const updateQuery = `
                UPDATE respuestas SET
                RespValor = ?,
                RespFecha = ?,
                RespNum = ?
                WHERE PerId = ? AND FormSec = ?
            `;
            
            // ✅ await en la consulta
            const [updateResult] = await connection.execute(updateQuery, [
                RespValor, RespFecha, RespNum, perId, formSec
            ]);
            
            if (updateResult.affectedRows === 0) {
            
                if(bandera == 1){
     const [selectResult] = await connection.execute(selectQuery, [perId, formSec]);
                
                // ✅ Calcular la nueva RespSec (última + 1, o 1 si no existe)
              
                if (selectResult.length > 0 && selectResult[0].ultimaRespSec !== null) {
                    nuevaRespSec = selectResult[0].ultimaRespSec ;
                }
                }
                   

           nuevaRespSec +=1;
                
         
                
                const insertQuery = `
                    INSERT INTO respuestas(RespValor, RespFecha, PerId, FormSec, RespNum, RespSec) 
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                
                // ✅ await en la consulta de inserción con la nueva RespSec
                const [insertResult] = await connection.execute(insertQuery, [
                    RespValor, RespFecha, perId, formSec, RespNum, nuevaRespSec
                ]);
                
                console.log(`Campo ${index + 1} insertado con RespSec: ${nuevaRespSec}`);
            } else {
                console.log(`Campo ${index + 1} actualizado`);
            }
        }
        
        res.json({
            success: true,
            mensaje: "Respuesta enviada",
            camposProcesados: campos.length,
        });
        
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

module.exports = router;
