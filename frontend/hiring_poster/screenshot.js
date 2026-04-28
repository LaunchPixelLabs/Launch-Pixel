const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        // Match a good poster ratio, e.g., 1080x1350 for Instagram portrait
        await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
        
        const filePath = `file://${path.join(__dirname, 'index.html')}`;
        console.log("Loading path:", filePath);
        
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        // Small delay to ensure all fonts and animations have settled
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const outputPath = path.join(__dirname, '../hiring_posters/ai_mern_developer_poster.png');
        await page.screenshot({ path: outputPath, fullPage: true });
        
        console.log(`Poster saved to ${outputPath}`);
        await browser.close();
    } catch (err) {
        console.error(err);
    }
})();
