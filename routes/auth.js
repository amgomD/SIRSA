const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

  const JWT_SECRET = 'secreto123';
        
// TOKEN GLOBAL
let currentToken = null;

// LOGIN
router.post('/loginAnt', async (req, res) => {
  const { email, password } = req.body;
   let connection ;
  try {
     connection = await db.getConnection();
    
    const selectQuery = "SELECT * FROM Usuarios WHERE UsuEmail = ? and UsuCla = ? and UsuEst = 'A' ";
    const [rows] = await connection.execute(selectQuery, [email,password]);

    if (rows.length === 0) {
      return res.json({ success: false, message: "Usuario no encontrado" });
    }
    
    const user = rows[0];

  // 3. Generar token simple
    const token = crypto.randomBytes(64).toString('hex');
    
     // 4. Calcular expiración (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
   // 5. Guardar token en MySQL
    const insertTokenQuery = `
      INSERT INTO refreshtokens (UsuId, RtToken, RtExpira, RtCreado) 
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        RtToken = VALUES(RtToken), 
        RtExpira = VALUES(RtExpira), 
        RtRevocado = 0,
        RtUltimoUso = NOW()
    `;
  
  
     await connection.execute(insertTokenQuery, [
      user.UsuId, 
      token, 
      expiresAt
    ]);

     console.log('Token guardado para usuario:', user.UsuId);
    
   res.json({ 
      success: true, 
      token: token,
      user: { 
        id: user.UsuId, 
        email: user.UsuEmail, 
        nombre: user.UsuNombre ,
        cedula: user.UsuCed
      },
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.json({ success: false, message: "Error en servidor" });
  }finally {
        if (connection) {
            connection.release(); // ¡Importante cerrar!
        }
    }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let connection;

  try {
    connection = await db.getConnection();

    // 1. Consultar usuario + permisos
    const selectQuery = `
      SELECT 
        u.UsuId,
        u.UsuEmail,
        u.UsuNom,
        u.UsuCed,
        u.UsuEst,
        IFNULL(u.UsuAdmin,'N') UsuAdmin,
        p.PermSec,
        p.PermDesc,

        IFNULL(p.PermCreForm, 'N')      AS PermCreForm,
        IFNULL(p.PerElForm, 'N')        AS PerElForm,
        IFNULL(p.PerRespEn, 'N')        AS PerRespEn,
        IFNULL(p.PerRespIna, 'N')       AS PerRespIna,
        IFNULL(p.PerRespImpEx, 'N')     AS PerRespImpEx,
        IFNULL(p.PerRespImpFoto, 'N')   AS PerRespImpFoto,
        IFNULL(p.PerRespDes, 'N')       AS PerRespDes,
        IFNULL(p.PermConfSis, 'N')      AS PermConfSis

      FROM usuarios u
      LEFT JOIN permisos p ON u.PermSec = p.PermSec
      WHERE u.UsuEmail = ? 
        AND u.UsuCla = ? 
        AND u.UsuEst = 'A';
    `;

    const [rows] = await connection.execute(selectQuery, [email, password]);

    if (rows.length === 0) {
      return res.json({ success: false, message: "Usuario no encontrado o inactivo" });
    }

    const user = rows[0];

    // 2. Generar token seguro
    const token = crypto.randomBytes(64).toString("hex");

    // 3. Expira en 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 4. Guardar token en la BD
    const insertTokenQuery = `
      INSERT INTO refreshtokens (UsuId, RtToken, RtExpira, RtCreado)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        RtToken = VALUES(RtToken),
        RtExpira = VALUES(RtExpira),
        RtRevocado = 0,
        RtUltimoUso = NOW()
    `;

    await connection.execute(insertTokenQuery, [
      user.UsuId,
      token,
      expiresAt
    ]);

    // 5. Respuesta final
    res.json({
      success: true,
      token: token,
      expiresAt: expiresAt.toISOString(),

      user: {
        id: user.UsuId,
        email: user.UsuEmail,
        nombre: user.UsuNom,
        cedula: user.UsuCed,
        admin: user.UsuAdmin,
        perfil: {
          id: user.PermSec,
          nombre: user.PermDesc
        }
      },

      permissions: {
        PermCreForm: user.PermCreForm,
        PerElForm: user.PerElForm,
        PerRespEn: user.PerRespEn,
        PerRespIna: user.PerRespIna,
        PerRespImpEx: user.PerRespImpEx,
        PerRespImpFoto: user.PerRespImpFoto,
        PerRespDes: user.PerRespDes,
        PermConfSis: user.PermConfSis
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.json({ success: false, message: "Error en servidor" });
  } finally {
    if (connection) connection.release();
  }
});



// VERIFICAR TOKEN
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  let connection;
  if (!token) {
    return res.json({ valid: false, message: "No hay token" });
  }
  
  try {

   connection = await db.getConnection();
    // Buscar token en MySQL y unir con usuario
    const verifyQuery = `
      SELECT rt.*, u.UsuId, u.UsuEmail, u.UsuNom,u.UsuCed  
      FROM refreshtokens rt
      JOIN Usuarios u ON rt.UsuId = u.UsuId
      WHERE rt.RtToken = ? 
        AND rt.RtExpira > NOW() 
        AND rt.RtRevocado = 0
    `;
    
    const [rows] = await connection.execute(verifyQuery, [token]);
    
    if (rows.length === 0) {
      return res.json({ valid: false, message: "Token inválido o expirado" });
    }
    
    const tokenData = rows[0];
    
    // Actualizar último uso
    const updateQuery = "UPDATE refreshtokens SET RtUltimoUso = NOW() WHERE RtToken = ?";
    await connection.execute(updateQuery, [token]);
    
    res.json({ 
      valid: true, 
      user: {
        id: tokenData.UsuId,
        email: tokenData.UsuEmail,
        nombre: tokenData.UsuNom,
        cedula: tokenData.UsuCed
      },
      expiresAt: tokenData.RtExpira
    });
    
  } catch (error) {
    console.error('Error verificando token:', error);
    res.json({ valid: false, message: "Error en servidor" });
  }finally {
        if (connection) {
            connection.release(); // ¡Importante cerrar!
        }
    }


});



router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
      let connection;
  if (!token) {
    return res.json({ success: false, message: "No hay token" });
  }
  
  try {
   connection = await db.getConnection();
    
    // Revocar token
    const revokeQuery = "UPDATE refreshtokens SET RtRevocado = 1 WHERE RtToken = ?";
    await connection.execute(revokeQuery, [token]);
    
    res.json({ success: true, message: "Logout exitoso" });
    
  } catch (error) {
    console.error('Error en logout:', error);
    res.json({ success: false, message: "Error en servidor" });
  }finally {
        if (connection) {
            connection.release(); // ¡Importante cerrar!
        }
    }
});



router.post('/register', async (req, res) => {
  const { nombre,cedula,telefono,email, password } = req.body;
  let connection;
  try {
    console.log(nombre)
     connection = await db.getConnection();
    
    // Verificar si usuario ya existe
    const checkQuery = "SELECT * FROM Usuarios WHERE UsuEmail = ?";
    const [existingUsers] = await connection.execute(checkQuery, [email]);
    
    if (existingUsers.length > 0) {
      return res.json({ success: false, message: "El usuario ya existe" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertQuery = "INSERT INTO Usuarios (UsuNom ,	UsuCed, 	UsuEmail, 	UsuTel, 	UsuCla ,	UsuEst ,permsec) VALUES (?, ?, ?,?,?,?,null)";
    await connection.execute(insertQuery, [nombre,cedula,email,telefono,password,'P']);
    
    res.json({ success: true, message: "Usuario creado exitosamente" });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.json({ success: false, message: "Error creando usuario" });
  }finally {
        if (connection) {
            connection.release(); // ¡Importante cerrar!
        }
    }
});




router.post('/Actualizar', async (req, res) => {
  const { nombre,cedula,telefono,email,estado, password } = req.body;
  let connection;
  try {
    console.log(nombre)
     connection = await db.getConnection();
    

    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertQuery = ` update Usuarios
    set UsuNom = ? ,
    UsuCed = ? ,
    UsuEmail = ? ,
    UsuTel = ? ,
    UsuCla = ? ,
    UsuEst = ? 
    where UsuEmail = ?`


    await connection.execute(insertQuery, [nombre,cedula,email,telefono,password,estado,email]);
    
    res.json({ success: true, message: "Usuario actualizado exitosamente" });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.json({ success: false, message: "Error creando usuario" });
  }finally {
        if (connection) {
            connection.release(); // ¡Importante cerrar!
        }
    }
});




// RENOVAR TOKEN
router.post('/refresh', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
   let connection;
  if (!token) {
    return res.json({ success: false, message: "No hay token" });
  }
  
  try {
   connection = await db.getConnection();
    
    // Verificar token actual
    const verifyQuery = `
      SELECT rt.*, u.UsuId, u.UsuEmail, u.UsuNom 
      FROM refreshtokens rt
      JOIN Usuarios u ON rt.UsuId = u.UsuId
      WHERE rt.RtToken = ? 
        AND rt.RtRevocado = 0
    `;
    
    const [rows] = await connection.execute(verifyQuery, [token]);
    
    if (rows.length === 0) {
      return res.json({ success: false, message: "Token inválido" });
    }
    
    const userData = rows[0];
    
    // Generar nuevo token
    const newToken = crypto.randomBytes(64).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 24);
    
    // Revocar token anterior y crear nuevo
    await connection.execute("UPDATE refreshtokens SET RtRevocado = 1 WHERE RtToken = ?", [token]);
    
    const insertNewTokenQuery = `
      INSERT INTO refreshtokens (UsuId, RtToken, RtExpira, RtCreado) 
      VALUES (?, ?, ?, NOW())
    `;
    
    await connection.execute(insertNewTokenQuery, [
      userData.UsuId, 
      newToken, 
      newExpiresAt
    ]);
    
    res.json({
      success: true,
      token: newToken,
      expiresAt: newExpiresAt.toISOString(),
      message: "Token renovado"
    });
    
  } catch (error) {
    console.error('Error renovando token:', error);
    res.json({ success: false, message: "Error renovando token" });
  }finally {
        if (connection) {
            connection.release(); // ¡Importante cerrar!
        }
    }
});


module.exports = router;