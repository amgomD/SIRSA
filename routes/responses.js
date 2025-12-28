const express = require('express');
const router = express.Router();

router.post('/save', async (req, res) => {
    try {
        console.log('Respuesta recibida:', req.body);
        res.json({ success: true, message: 'Respuesta guardada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

module.exports = router;