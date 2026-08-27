const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });
        await page.goto('https://qiumishijie.x.yupoo.com/', {waitUntil: 'networkidle2', timeout: 30000});
        
        await new Promise(r => setTimeout(r, 5000));
        
        const categories = await page.evaluate(() => {
            const links = document.querySelectorAll('a[href*="/categories/"]');
            return Array.from(links).map(a => ({
                name: a.innerText.trim(),
                href: a.getAttribute('href')
            })).filter(c => c.name.length > 0 && /\d+/.test(c.href));
        });
        
        console.log('Categories found:', categories.length);
        if (categories.length > 0) console.log(categories.slice(0, 5));
        
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
