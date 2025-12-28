const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'florida',
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 0,
});

// Probar conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        return;
    }
    console.log('✅ Conectado a MySQL como ID', connection.threadId);
    connection.release();
});
//SET GLOBAL max_allowed_packet = 67108864;
module.exports = pool.promise();