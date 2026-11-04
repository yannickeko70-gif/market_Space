import { readFile, access, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// Setup for both image scripts:
// npm install --prefix tmp/image-tools --no-save --package-lock=false sharp
const require = createRequire(path.resolve('tmp/image-tools/package.json'));
const sharp = require('sharp');
const products = JSON.parse(await readFile('src/app/data/products.json', 'utf8'));
const manifest = JSON.parse(await readFile('public/assets/img/products/sources.json', 'utf8'));
const thumbnails = [];
let checked = 0;

for (const [index, product] of products.entries()) {
  const entry = manifest.images.find((item) => item.productId === product.id);
  if (!entry || entry.localSrc !== product.images[0].src)
    throw new Error(`Source mismatch: ${product.id}`);
  for (const image of product.images) {
    const base = image.src.replace(/-800\.jpg$/, '');
    for (const width of [400, 800]) {
      for (const format of ['jpg', 'webp', 'avif']) {
        const file = `public/${base}-${width}.${format}`;
        await access(file);
        const metadata = await sharp(file).metadata();
        if (metadata.width !== width || metadata.height !== width * 1.25) {
          throw new Error(`Invalid dimensions: ${file}`);
        }
        await sharp(file).raw().toBuffer();
        checked++;
      }
    }
  }
  const thumb = await sharp(`public/${product.images[0].src}`).resize(180, 225).png().toBuffer();
  const label = Buffer.from(
    `<svg width="190" height="28"><text x="8" y="20" font-family="Arial" font-size="16">${product.id}</text></svg>`,
  );
  thumbnails.push({ input: thumb, left: (index % 6) * 190 + 5, top: Math.floor(index / 6) * 260 });
  thumbnails.push({
    input: label,
    left: (index % 6) * 190,
    top: Math.floor(index / 6) * 260 + 225,
  });
}

await mkdir('tmp', { recursive: true });
await sharp({
  create: {
    width: 1140,
    height: Math.ceil(products.length / 6) * 260,
    channels: 3,
    background: '#ffffff',
  },
})
  .composite(thumbnails)
  .png()
  .toFile('tmp/product-images-review.png');
console.log(`${products.length} products, ${checked} responsive images decoded successfully.`);
