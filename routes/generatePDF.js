const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const archiver = require("archiver");
const stream = require("stream");

router.post("/zip", async (req, res) => {
  let browser;
  let headersSent = false;
  
  try {
    const { data } = req.body; // ✅ Ya no necesitas CSS separado
  
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Formato inválido" });
    }

    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
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
      
      const page = await browser.newPage();
      
      try {
        // ✅ El HTML ya viene completo con estilos desde el frontend
        await page.setContent(carnet.html, { 
          waitUntil: "networkidle0",
          timeout: 60000
        });
        
        await page.evaluateHandle('document.fonts.ready');
        
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
      } finally {
        await page.close().catch(() => {});
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