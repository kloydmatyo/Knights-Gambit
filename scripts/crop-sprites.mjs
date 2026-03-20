// Crops PNG spritesheets to top half only using raw PNG manipulation
// No external dependencies needed

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const DIR = 'public/sprites/slimes';

function readUInt32BE(buf, offset) {
  return (buf[offset] << 24 | buf[offset+1] << 16 | buf[offset+2] << 8 | buf[offset+3]) >>> 0;
}

function writeUInt32BE(buf, value, offset) {
  buf[offset]   = (value >>> 24) & 0xff;
  buf[offset+1] = (value >>> 16) & 0xff;
  buf[offset+2] = (value >>> 8)  & 0xff;
  buf[offset+3] =  value         & 0xff;
}

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function cropTopHalf(inputPath) {
  const buf = fs.readFileSync(inputPath);
  
  // Read dimensions from IHDR
  const width  = readUInt32BE(buf, 16);
  const height = readUInt32BE(buf, 20);
  
  if (height <= 128) {
    console.log(`SKIP ${path.basename(inputPath)}: already ${width}x${height}`);
    return;
  }
  
  const newHeight = Math.floor(height / 2);
  const bitDepth  = buf[24];
  const colorType = buf[25];
  
  // Bytes per pixel based on color type
  const channels = colorType === 2 ? 3 : colorType === 6 ? 4 : colorType === 0 ? 1 : 4;
  const bytesPerPixel = Math.ceil(bitDepth * channels / 8);
  const stride = width * bytesPerPixel + 1; // +1 for filter byte per row
  
  // Decompress IDAT chunks
  const idatChunks = [];
  let pos = 8; // skip PNG signature
  while (pos < buf.length) {
    const len  = readUInt32BE(buf, pos);
    const type = buf.slice(pos+4, pos+8).toString('ascii');
    const data = buf.slice(pos+8, pos+8+len);
    if (type === 'IDAT') idatChunks.push(data);
    pos += 12 + len;
    if (type === 'IEND') break;
  }
  
  const compressed = Buffer.concat(idatChunks);
  const raw = zlib.inflateSync(compressed);
  
  // Keep only top newHeight rows
  const topRaw = raw.slice(0, newHeight * stride);
  const newCompressed = zlib.deflateSync(topRaw, { level: 9 });
  
  // Build new PNG
  const sig = buf.slice(0, 8);
  
  // New IHDR with updated height
  const ihdrData = Buffer.alloc(13);
  ihdrData.copy(buf.slice(16, 29), 0, 0, 13); // copy original
  buf.copy(ihdrData, 0, 16, 29);
  writeUInt32BE(ihdrData, newHeight, 4);
  
  const ihdrChunk = Buffer.alloc(25);
  writeUInt32BE(ihdrChunk, 13, 0);
  ihdrChunk.write('IHDR', 4);
  ihdrData.copy(ihdrChunk, 8);
  const ihdrCrc = crc32(ihdrChunk.slice(4, 21));
  writeUInt32BE(ihdrChunk, ihdrCrc, 21);
  
  // New IDAT chunk
  const idatChunk = Buffer.alloc(12 + newCompressed.length);
  writeUInt32BE(idatChunk, newCompressed.length, 0);
  idatChunk.write('IDAT', 4);
  newCompressed.copy(idatChunk, 8);
  const idatCrc = crc32(idatChunk.slice(4, 8 + newCompressed.length));
  writeUInt32BE(idatChunk, idatCrc, 8 + newCompressed.length);
  
  // IEND chunk
  const iend = Buffer.from([0,0,0,0,73,69,78,68,174,66,96,130]);
  
  const out = Buffer.concat([sig, ihdrChunk, idatChunk, iend]);
  fs.writeFileSync(inputPath, out);
  console.log(`CROPPED ${path.basename(inputPath)}: ${width}x${height} -> ${width}x${newHeight}`);
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.png'));
for (const f of files) {
  cropTopHalf(path.join(DIR, f));
}
