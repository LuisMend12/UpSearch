import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '..', 'docs', 'presentation', 'assets');

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

const shot = async (filename, options = {}) => {
  await page.screenshot({ path: join(outDir, filename), ...options });
  console.log(`captured ${filename}`);
};

const shotLocator = async (selector, filename) => {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await locator.screenshot({ path: join(outDir, filename) });
  console.log(`captured ${filename}`);
};

await page.evaluate(() => window.scrollTo(0, 0));
await shot('current-os-idle.png');

const together = page.getByRole('button', { name: 'Together' }).last();
if (await together.isVisible()) {
  await together.click();
  await page.waitForTimeout(900);
}
await shotLocator('.studio-cinema', 'current-os-packet.png');

const technicalNote = page.getByRole('tab', { name: 'Technical note' });
if (await technicalNote.isVisible()) {
  await technicalNote.click();
  await page.waitForTimeout(300);
}
await shotLocator('.studio-cinema', 'current-os-note.png');

const drafts = page.getByRole('tab', { name: 'drafts' });
if (await drafts.isVisible()) {
  await drafts.click();
  await page.waitForTimeout(300);
}
await shotLocator('.studio-cinema', 'current-os-drafts.png');

await shotLocator('.studio-lower-grid', 'current-os-approval.png');

await page.evaluate(() => window.scrollTo(0, 0));
await page.getByRole('button', { name: 'Quick Search' }).click();
await page.waitForTimeout(350);
await shot('current-quick-search.png');

await page.getByRole('button', { name: 'Harness Demo' }).click();
await page.waitForTimeout(350);
await shot('current-harness-demo.png');

await browser.close();
