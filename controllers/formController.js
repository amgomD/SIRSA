const db = require('../config/database');

exports.saveForm = async (req, res) => {
    try {
        const { formulario, formulario_opciones } = req.body;
        
        // Insertar cada pregunta
        for (const pregunta of formulario) {
            await db.execute(
                'INSERT INTO Formulario (FormSec,  FormPregunta, FormTipo, FormJson, FormReq, FormOrden) VALUES (?, ?, ?, ?, ?, ?)',
                [pregunta.FormSec, pregunta.FormPregunta, pregunta.FormTipo, pregunta.FormJson, pregunta.FormReq, pregunta.FormOrden]
            );
        }
        
        // Insertar opciones
        for (const opcion of formulario_opciones) {
            await db.execute(
                'INSERT INTO FormularioOpciones (FormOpSec, FormSec, FormOp) VALUES (?, ?, ?)',
                [opcion.FormOpSec, opcion.FormSec, opcion.FormOp]
            );
        }
        
        res.json({ success: true, message: 'Formulario guardado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al guardar formulario' });
    }
};

exports.getForms = async (req, res) => {
    try {
        const [forms] = await db.execute('SELECT * FROM Formulario ORDER BY FormOrden');
        res.json({ success: true, data: forms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener formularios' });
    }
};