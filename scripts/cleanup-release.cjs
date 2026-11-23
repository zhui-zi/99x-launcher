const fs = require('node:fs')
const path = require('node:path')

const releaseDir = path.join(__dirname, '..', 'release')
const keepFile = '99x-launcher.exe'
const targetCopyDir = 'C:\\Users\\keita\\OneDrive\\Game\\CSGO'

if (fs.existsSync(releaseDir)) {
  for (const name of fs.readdirSync(releaseDir)) {
    if (name === keepFile) continue
    try {
      fs.rmSync(path.join(releaseDir, name), { recursive: true, force: true })
    } catch {
      // Skip locked files (e.g. if an older launcher exe is currently running)
    }
  }
  const builtExe = path.join(releaseDir, keepFile)
  console.log('Cleaned release directory. Active portable exe:', builtExe)

  if (fs.existsSync(builtExe)) {
    try {
      fs.mkdirSync(targetCopyDir, { recursive: true })
      const destExe = path.join(targetCopyDir, keepFile)
      fs.copyFileSync(builtExe, destExe)
      console.log('Copied portable exe to:', destExe)
    } catch (err) {
      console.warn('Warning: failed to copy exe to OneDrive folder:', err.message)
    }
  }
}
