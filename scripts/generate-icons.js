import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create public/icon.svg
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Background container with rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer subtle circular ring -->
  <circle cx="256" cy="256" r="190" fill="none" stroke="#38bdf8" stroke-width="4" stroke-opacity="0.3" stroke-dasharray="8 8" />

  <!-- Central Time Warp & Face Aging Silhouette -->
  <g filter="url(#shadow)">
    <!-- Left half: Youth / sparkle -->
    <path d="M 256 120 C 180 120 140 180 140 256 C 140 330 185 380 256 392 Z" fill="url(#glowGrad)" fill-opacity="0.95" />
    
    <!-- Right half: Maturity / wisdom / golden glow -->
    <path d="M 256 120 C 332 120 372 180 372 256 C 372 330 327 380 256 392 Z" fill="url(#goldGrad)" fill-opacity="0.9" />

    <!-- Center vertical splitting laser line -->
    <line x1="256" y1="100" x2="256" y2="412" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
    
    <!-- Center AI Time Core -->
    <circle cx="256" cy="256" r="32" fill="#0f172a" stroke="#ffffff" stroke-width="5" />
    
    <!-- Hourglass / clock hands inside core -->
    <path d="M 246 244 L 266 244 L 256 256 L 266 268 L 246 268 Z" fill="#38bdf8" />
    
    <!-- Sparkles on youth side -->
    <path d="M 180 180 L 186 195 L 201 201 L 186 207 L 180 222 L 174 207 L 159 201 L 174 195 Z" fill="#ffffff" />
    <circle cx="160" cy="280" r="8" fill="#38bdf8" />
    
    <!-- Sparkles on age side -->
    <path d="M 332 300 L 336 312 L 348 316 L 336 320 L 332 332 L 328 320 L 316 316 L 328 312 Z" fill="#ffffff" />
    <circle cx="352" cy="210" r="8" fill="#fbbf24" />
  </g>

  <!-- Android Bottom Badge / Accent -->
  <rect x="206" y="432" width="100" height="12" rx="6" fill="#38bdf8" fill-opacity="0.8" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon, 'utf8');

// Function to generate raw PNG file buffers using pure node zlib
function createPngBuffer(width, height, isMaskable = false) {
  // CRC Table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const check = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(check, 8 + len);
    return buf;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw Image Data (Filter byte 0 + RGBA per pixel per row)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width / 2;
  const scale = isMaskable ? 0.65 : 0.85;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    const ny = y / height;
    const dy = y - cy;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const nx = x / width;
      const dx = x - cx;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base gradient (slate-900 to deep royal blue)
      let r = Math.round(15 + 25 * ny);
      let g = Math.round(23 + 45 * ny + 20 * nx);
      let b = Math.round(42 + 95 * nx + 30 * ny);
      let a = 255;

      // Squircle or safe-zone check
      if (!isMaskable) {
        // Rounded corners for normal icon
        const cornerR = width * 0.22;
        const inCornerX = x < cornerR ? cornerR - x : x > width - cornerR ? x - (width - cornerR) : 0;
        const inCornerY = y < cornerR ? cornerR - y : y > height - cornerR ? y - (height - cornerR) : 0;
        if (inCornerX > 0 && inCornerY > 0) {
          const cornerDist = Math.sqrt(inCornerX * inCornerX + inCornerY * inCornerY);
          if (cornerDist > cornerR) {
            a = 0; // transparent outside rounded corner
          }
        }
      }

      if (a > 0) {
        // Inner design: split circle
        const emblemR = maxR * scale;
        if (dist <= emblemR) {
          const factor = (emblemR - dist) / emblemR;
          if (dx < -2) {
            // Youth side (Cyan / Sky glow)
            r = Math.round(14 + factor * 42);
            g = Math.round(140 + factor * 70);
            b = Math.round(220 + factor * 35);
          } else if (dx > 2) {
            // Age side (Amber / Gold glow)
            r = Math.round(230 + factor * 25);
            g = Math.round(150 + factor * 40);
            b = Math.round(20 + factor * 30);
          } else {
            // White divider
            r = 255;
            g = 255;
            b = 255;
          }

          // Center core
          const coreR = emblemR * 0.22;
          if (dist <= coreR) {
            r = 15;
            g = 23;
            b = 42;
            if (dist <= coreR * 0.5) {
              r = 56;
              g = 189;
              b = 248;
            }
          }
        } else if (dist <= emblemR + 4 && dist >= emblemR - 2) {
          // Glow border
          r = 56;
          g = 189;
          b = 248;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Write the required icon files
const icon192 = createPngBuffer(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPngBuffer(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = createPngBuffer(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleIcon = createPngBuffer(180, 180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Favicon ICO (can reuse 192 png content)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icon192);

console.log('Successfully generated all PWA Android icons in /public:');
console.log('- icon.svg');
console.log('- pwa-192x192.png');
console.log('- pwa-512x512.png');
console.log('- pwa-maskable-512x512.png');
console.log('- apple-touch-icon.png');
console.log('- favicon.ico');
