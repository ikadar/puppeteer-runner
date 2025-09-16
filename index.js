import puppeteer from 'puppeteer';

const url = process.argv[2];       // 1. CLI argumentum: a betöltendő URL
const output = process.argv[3];    // 2. CLI argumentum: opcionális output fájlútvonal

// const url = "https://bar-dev.wheel.digital/tenant-assets/bat/f0d4c9f0-707e-a685-9c45-62ad3407520f/9c090140-3fa6-a40b-dcd7-8fa43673b4d4/__index.html";
// const output = "rendered.html";    // 2. CLI argumentum: opcionális output fájlútvonal


if (!url) {
    console.error("Usage: node save-dom.js <url> [output-file]");
    process.exit(1);
}

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

await page.goto(url, { waitUntil: 'networkidle0' });

// várj a jelző flagre (a te JS-ednek kell beállítania!)
await page.waitForFunction(() => window.__PROCESSING_DONE__ === true, { timeout: 0 });

// DOM módosítás a böngészőben
await page.evaluate(() => {
    // 1) Példa: minden script törlése
    // document.querySelectorAll('script').forEach(el => el.remove());

    // 2) Csak bizonyos script törlése (pl. id vagy src alapján)
    document.querySelectorAll('script').forEach(el => {
        if (
            el.id === 'add-pod-scripts' || el.id === 'call-pod-scripts'
        ) {
            el.remove();
        }
    });
});


const html = await page.content();

if (output) {
    // fájlba mentés
    const fs = await import('node:fs/promises');
    await fs.writeFile(output, html, 'utf8');
    console.log(output); // fájl elérési útját írd ki stdout-ra
} else {
    process.stdout.write(html); // teljes HTML-t írd ki stdout-ra
}

await browser.close();