const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const archiver = require("archiver");
const stream = require("stream");

router.post("/zip", async (req, res) => {
  let browser;
  let headersSent = false;
  
  try {
    const { data, css } = req.body;
  
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Formato inválido" });
    }

    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    const archiveStream = new stream.PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(archiveStream);
    res.attachment("carnets.zip");
    archiveStream.pipe(res);
    headersSent = true;

    let i = 1;
    
    for (const carnet of data) {
    
      if (!carnet.html) continue;
      
      try {
        const fullHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Raleway:wght@400;500;700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
              <style>${css || ''} .itemLado2 b{
    
  color: #737373;
    font-size:10px;
     font-weight:bold;
     width: 200px;
     line-height: 10px;
}
</style>
            </head>
            <body>
              ${carnet.html}
            </body>
          </html>
        `;
        
        await page.setContent(fullHTML, { 
          waitUntil: "domcontentloaded", // ✅ Cambiado de domcontentloaded
          timeout: 60000
        });
        
        // ✅ Esperar a que las fuentes se carguen
        await page.evaluateHandle('document.fonts.ready');
        
        // ✅ Pequeño delay adicional para asegurar renderizado
      //  await new Promise(resolve => setTimeout(resolve, 700));
        
        const pdfBuffer = await page.pdf({
          width: '325px',
          height: '526px',
          printBackground: true,
          margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
          preferCSSPageSize: true
        });
        
        archive.append(Buffer.from(pdfBuffer), { name: `carnet_${carnet.Nombre}.pdf` });
        i++;
        
      } catch (pdfError) {
        console.error(`⚠️ Error PDF ${i}:`, pdfError.message);
        continue;
      }
    }
    
    await browser.close();
    browser = null;
    await archive.finalize();
    
  } catch (err) {
    console.error("❌ Error:", err);
    
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    if (!headersSent) {
      return res.status(500).json({ error: "Error generando PDFs" });
    }
    
    res.destroy();
  }
});

module.exports = router;