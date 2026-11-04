import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(path.resolve('tmp/image-tools/package.json'));
const sharp = require('sharp');
const manifest = JSON.parse(await readFile('public/assets/img/products/sources.json', 'utf8'));
const products = JSON.parse(await readFile('src/app/data/products.json', 'utf8'));
await mkdir('tmp/product-originals', { recursive: true });
const failures = [];

for (const entry of manifest.images) {
  try {
    const product = products.find((item) => item.id === entry.productId);
    if (!product) throw new Error(`Unknown product ${entry.productId}`);
    const original = `tmp/product-originals/${product.id}`;
    const cached = await access(original).then(
      () => true,
      () => false,
    );
    if (!cached) {
      const download = spawnSync(
        'curl.exe',
        [
          '--fail',
          '--location',
          '--silent',
          '--show-error',
          '--retry',
          '2',
          '--max-time',
          '60',
          '--output',
          original,
          entry.imageUrl,
        ],
        { encoding: 'utf8' },
      );
      if (download.status !== 0) throw new Error(`${product.id}: ${download.stderr}`);
    }
    await sharp(original).metadata();
    const base = `assets/img/products/${product.id}-${product.slug}`;
    for (const width of [400, 800]) {
      const resized = await sharp(original)
        .rotate()
        .resize(width, width * 1.25, {
          fit: 'contain',
          background: '#f7f5f2',
        })
        .flatten({ background: '#f7f5f2' })
        .toBuffer();
      await sharp(resized)
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(`public/${base}-${width}.jpg`);
      await sharp(resized).webp({ quality: 82 }).toFile(`public/${base}-${width}.webp`);
      await sharp(resized).avif({ quality: 55, effort: 4 }).toFile(`public/${base}-${width}.avif`);
    }
    product.images = [{ src: `${base}-800.jpg`, alt: entry.alt, width: 800, height: 1000 }];
    entry.localSrc = `${base}-800.jpg`;
    console.log(`${product.id}: ${product.title}`);
  } catch (error) {
    failures.push(`${entry.productId}: ${error.message}`);
  }
}

if (failures.length) throw new Error(failures.join('\n'));
await writeFile('src/app/data/products.json', `${JSON.stringify(products, null, 2)}\n`);
await writeFile(
  'public/assets/img/products/sources.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
