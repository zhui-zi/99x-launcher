const fs = require('node:fs')
const path = require('node:path')

const releaseDir = path.join(__dirname, '..', 'release')
const keepFile = '99x-launcher.exe'

if (fs.existsSync(releaseDir)) {
  for (const name of fs.readdirSync(releaseDir)) {
    if (name === keepFile) continue
    try {
      fs.rmSync(path.join(releaseDir, name), { recursive: true, force: true })
    } catch {
      // Skip locked files (e.g. if an older launcher exe is currently running)
    }
  }
  console.log('Cleaned release directory. Active portable exe:', path.join(releaseDir, keepFile))
}
