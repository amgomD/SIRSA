const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require("body-parser");
const favicon = require('serve-favicon');



const app = express();





// Aumentar el límite de tamaño para JSON (para imágenes base64)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());





app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
// Servir la carpeta "public" como estática
// Sirve el favicon
app.use(favicon(path.join(__dirname, 'public', 'IconSirsa.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal (cargar index.html automáticamente)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});









app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/wcdashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wcdashboard.html'));
});



app.get('/configuracion', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'configuracion.html'));
});

app.get('/graficos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Graficos.html'));
});
app.get('/wcgraficos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wcGraficos.html'));
});
app.get('/encuestado', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wpEncuestado.html'));
});

app.get('/importacion', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'importacion.html'));
});
app.get('/ImportarFotos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ImportarFoto.html'));
});

app.get('/carnets', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'carnet.html'));
});

app.get('/wccarnet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'carnet.html'));
});

app.get('/wwcarnets', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wwcarnets.html'));
});


app.get('/Categorias', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Categorias.html'));
});

app.get('/Encuestados', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Encuestados.html'));
});

app.get('/Formulador', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Formulador.html'));
});


app.get('/Edicion', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wpEncuestado.html'));
});





app.use('/api/auth', require('./routes/auth'));

app.use('/api/Categoria', require('./routes/db_Categoria'));

app.use('/api/Localidad', require('./routes/localidades'));
app.use('/api/Usuario', require('./routes/Usuario'));
app.use('/api/indicadores', require('./routes/dashboard'));
app.use('/api/graficos', require('./routes/graficos'));
app.use('/api/fotos', require('./routes/guardarfotos'));

app.use('/api/Organizacion', require('./routes/organizaciones'));

app.use('/api/forms', require('./routes/forms'));

app.use('/api/respuesta', require('./routes/RespuestaSave'));
app.use('/api/permisos', require('./routes/permisos'));



app.use('/api/personal', require('./routes/GuardarPersonal'));
app.use('/api/excel', require('./routes/excel'));
app.use('/api/plantilla', require('./routes/plantillaExcel'));
app.use('/api/configuracion', require('./routes/configuracion'));


app.use('/api/responses', require('./routes/responses'));

// Ruta básica para probar
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});
const carnetRoutes = require("./routes/generatePDF");
app.use("/api/carnets", carnetRoutes);
// Manejar rutas no encontradas
app.use('', (req,res) => {
  res.status(404).json({ message: '404 Ruta no encontrada' });
});






app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}`);
    console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
});