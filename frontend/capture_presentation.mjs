import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const presentation = resolve(here, '..', 'docs', 'presentation');
const slidesDir = join(presentation, 'slides');
const deckUrl = pathToFileURL(join(presentation, 'upsearch-pitch-deck.html')).href;

await mkdir(slidesDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await page.goto(deckUrl, { waitUntil: 'networkidle' });
await page.evaluate(async () => document.fonts.ready);

const slides = await page.locator('.slide').all();
for (let index = 0; index < slides.length; index += 1) {
  const filename = `upsearch-slide-${String(index + 1).padStart(2, '0')}.png`;
  await slides[index].screenshot({ path: join(slidesDir, filename) });
  console.log(`exported ${filename}`);
}

await page.pdf({
  path: join(presentation, 'upsearch-pitch-deck.pdf'),
  width: '16in',
  height: '9in',
  printBackground: true,
  preferCSSPageSize: true,
});

await browser.close();
console.log('exported upsearch-pitch-deck.pdf');
