const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

// Generates a crisp 256x256 WinUI 3 / Fluent 2 layered accent blue icon as a valid Windows .ico (PNG-in-ICO)
const SIZE = 256
const rgba = Buffer.alloc(SIZE * SIZE * 4)

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
  const idx = (y * SIZE + x) * 4
  const srcA = a / 255
  const dstA = rgba[idx + 3] / 255
  const outA = srcA + dstA * (1 - srcA)
  if (outA <= 0) return
  rgba[idx] = Math.round((r * srcA + rgba[idx] * dstA * (1 - srcA)) / outA)
  rgba[idx + 1] = Math.round((g * srcA + rgba[idx + 1] * dstA * (1 - srcA)) / outA)
  rgba[idx + 2] = Math.round((b * srcA + rgba[idx + 2] * dstA * (1 - srcA)) / outA)
  rgba[idx + 3] = Math.round(outA * 255)
}

function drawRoundedRect(x0, y0, w, h, radius, r, g, b, a = 255) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      let dx = 0
      let dy = 0
      if (x < x0 + radius) dx = x0 + radius - x
      else if (x >= x0 + w - radius) dx = x - (x0 + w - radius - 1)
      if (y < y0 + radius) dy = y0 + radius - y
      else if (y >= y0 + h - radius) dy = y - (y0 + h - radius - 1)
      const dist = Math.hypot(dx, dy)
      if (dist <= radius) {
        const edge = Math.min(1, Math.max(0, radius - dist + 0.5))
        setPixel(x, y, r, g, b, Math.round(a * edge))
      }
    }
  }
}

// Fluent 2 gradient-layered Windows Accent Blue rounded tile
drawRoundedRect(12, 12, 232, 232, 48, 0, 95, 184, 255)
drawRoundedRect(16, 16, 224, 224, 44, 0, 120, 212, 255)
// Subtle top acrylic sheen
drawRoundedRect(24, 24, 208, 100, 36, 96, 205, 255, 65)
// Crisp Fluent 4-pane emblem (subtle Windows 11 geometry)
drawRoundedRect(64, 64, 58, 58, 10, 255, 255, 255, 245)
drawRoundedRect(134, 64, 58, 58, 10, 255, 255, 255, 215)
drawRoundedRect(64, 134, 58, 58, 10, 255, 255, 255, 215)
drawRoundedRect(134, 134, 58, 58, 10, 168, 228, 255, 245)

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

const rawRows = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  rawRows[y * (SIZE * 4 + 1)] = 0
  rgba.copy(rawRows, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4)
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8
ihdr[9] = 6
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', zlib.deflateSync(rawRows, { level: 9 })),
  pngChunk('IEND', Buffer.alloc(0))
])

const icoHeader = Buffer.alloc(6)
icoHeader.writeUInt16LE(0, 0)
icoHeader.writeUInt16LE(1, 2)
icoHeader.writeUInt16LE(1, 4)

const icoEntry = Buffer.alloc(16)
icoEntry[0] = 0
icoEntry[1] = 0
icoEntry[2] = 0
icoEntry[3] = 0
icoEntry.writeUInt16LE(1, 4)
icoEntry.writeUInt16LE(32, 6)
icoEntry.writeUInt32LE(png.length, 8)
icoEntry.writeUInt32LE(22, 12)

const ico = Buffer.concat([icoHeader, icoEntry, png])
const outPath = path.join(__dirname, '..', 'build', 'icon.ico')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, ico)
console.log('Generated Fluent 2 icon:', outPath, `(${ico.length} bytes)`)
