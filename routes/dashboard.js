 const express = require("express");
const router = express.Router();
const db = require("../config/database");



router.post("/principal", async (req, res) => {
  let connection;
  try {
    connection = await  db.getConnection();
    

    // 1️ Agrupación por género
    const [genero] = await connection.query(`
      SELECT PerGen AS Genero, COUNT(*) AS Total
      FROM personal
      GROUP BY PerGen
    `);

    // 2️ Habitantes de calle
    const [habitantesCalle] = await connection.query(`
      SELECT 
       COUNT(*) AS Total
      FROM personal where PerHabCa = 'SI'
    `);

    // 3️ Personas con discapacidad
    const [discapacidad] = await connection.query(`
      SELECT 
      COUNT(*) AS Total
      FROM personal where  PerDis = 'SI'
   
    `);

    // 4️ Totales por año de registro
    /*const [anioRegistro] = await connection.query(`
      SELECT PerAno AS Año, COUNT(*) AS Total
      FROM personal
      GROUP BY PerAno
      ORDER BY Año
    `);*/
const [DiasLaborales] = await connection.query(`
SELECT 'Lunes' AS Dia,
       SUM(PerDiTraLu = 'X' AND PerDiTraJorAm = 'X') AS AM,
       SUM(PerDiTraLu = 'X' AND PerDiTraJorPM = 'X') AS PM
FROM personal

UNION ALL
SELECT 'Martes',
       SUM(PerDiTraMar = 'X' AND PerDiTraJorAm = 'X'),
       SUM(PerDiTraMar = 'X' AND PerDiTraJorPM = 'X')
FROM personal

UNION ALL
SELECT 'Miércoles',
       SUM(PerDiTraMie = 'X' AND PerDiTraJorAm = 'X'),
       SUM(PerDiTraMie = 'X' AND PerDiTraJorPM = 'X')
FROM personal

UNION ALL
SELECT 'Jueves',
       SUM(PerDiTraJue = 'X' AND PerDiTraJorAm = 'X'),
       SUM(PerDiTraJue = 'X' AND PerDiTraJorPM = 'X')
FROM personal

UNION ALL
SELECT 'Viernes',
       SUM(PerDiTraVie = 'X' AND PerDiTraJorAm = 'X'),
       SUM(PerDiTraVie = 'X' AND PerDiTraJorPM = 'X')
FROM personal

UNION ALL
SELECT 'Sábado',
       SUM(PerDiTraSab = 'X' AND PerDiTraJorAm = 'X'),
       SUM(PerDiTraSab = 'X' AND PerDiTraJorPM = 'X')
FROM personal

UNION ALL
SELECT 'Domingo',
       SUM(PerDiTraDom = 'X' AND PerDiTraJorAm = 'X'),
       SUM(PerDiTraDom = 'X' AND PerDiTraJorPM = 'X')
FROM personal;

    `);




    
    // 5️ Rangos de edad
    const [rangoEdad] = await connection.query(`
      SELECT 
        CASE
          WHEN PerFechNa IS NULL THEN 'Sin información'
          WHEN TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) >= 60 THEN 'Adulto mayor'
          WHEN TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) BETWEEN 26 AND 59 THEN 'Adulto'
          WHEN TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE()) BETWEEN 18 AND 25 THEN 'Joven'
          ELSE 'Sin información'
        END AS Rango_Edad,
        COUNT(*) AS Total
      FROM personal
      GROUP BY Rango_Edad
    `);

    // 6️ Rangos de años de actividad
    const [rangoActividad] = await connection.query(`
  SELECT CASE WHEN COALESCE(PerTipVinAno, 0) = 0 AND COALESCE(PerTipVinMes, 0) = 0 THEN 'Sin dato' WHEN (COALESCE(PerTipVinAno, 0) * 12 + COALESCE(PerTipVinMes, 0)) < 24 THEN 'Menos de 2 años' WHEN (COALESCE(PerTipVinAno, 0) * 12 + COALESCE(PerTipVinMes, 0)) BETWEEN 36 AND 60 THEN 'Entre 3 y 5 años' WHEN (COALESCE(PerTipVinAno, 0) * 12 + COALESCE(PerTipVinMes, 0)) BETWEEN 72 AND 120 THEN 'Entre 6 y 10 años' WHEN (COALESCE(PerTipVinAno, 0) * 12 + COALESCE(PerTipVinMes, 0)) BETWEEN 132 AND 240 THEN 'Entre 11 y 20 años' WHEN (COALESCE(PerTipVinAno, 0) * 12 + COALESCE(PerTipVinMes, 0)) BETWEEN 252 AND 360 THEN 'Entre 21 y 30 años' ELSE 'Sin dato' END AS Rango_Actividad, COUNT(*) AS Total FROM personal GROUP BY Rango_Actividad ORDER BY Total DESC; 

    `);

    // 7️Recicladores por localidad
    const [localidad] = await connection.query(`
      SELECT localNom AS Localidad, COUNT(*) AS Total
      FROM personal p left join localidad l on p.localsec = l.localsec
    GROUP BY p.localsec
      ORDER BY Total DESC
    `);

    // 📦 Respuesta combinada
    const data = {
      genero,
      habitantesCalle,
      discapacidad,
      DiasLaborales,
      rangoEdad,
      rangoActividad,
      localidad
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error en /indicadores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los indicadores",
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});









module.exports = router;
