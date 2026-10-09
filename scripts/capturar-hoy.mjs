import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await p.goto('http://localhost:3000/app', { waitUntil: 'load' });
await p.waitForSelector('h1');
await p.waitForTimeout(600);
await p.screenshot({ path: 'docs/revisiones/hoy-375.png', fullPage: true });
console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
await b.close();
