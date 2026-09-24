// Generates src/assets/grain.png: a small tileable monochrome noise texture.
// Run with `node scripts/generate-grain.mjs`. Pure Node — no dependencies.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const SIZE = 96;
// Deterministic PRNG (mulberry32) so the asset is reproducible byte-for-byte.
let seed = 0x41504f4c;
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Grey + alpha, one filter byte per scanline.
const raw = Buffer.alloc(SIZE * (SIZE * 2 + 1));
for (let y = 0; y < SIZE; y++) {
  const row = y * (SIZE * 2 + 1);
  raw[row] = 0;
  for (let x = 0; x < SIZE; x++) {
    raw[row + 1 + x * 2] = 255;
    // 8 alpha levels compress far better than 256 and look identical at 5% opacity.
    raw[row + 2 + x * 2] = Math.floor(rand() * 8) * 36;
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 4; // colour type: greyscale + alpha
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync(new URL('../src/assets/grain.png', import.meta.url), png);
console.log(`grain.png written (${png.length} bytes)`);
