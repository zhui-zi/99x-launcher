import { app } from 'electron'

export interface UpdateCheckResult {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
  releaseUrl: string
  downloadUrl: string
  releaseNotes: string
  publishedAt: string
  error?: string
}

const GITHUB_REPO = 'zhui-zi/99x-launcher'
const LATEST_RELEASE_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`

function normalizeVer(v: string): number[] {
  return (v || '0.0.0')
    .replace(/^v/i, '')
    .split('.')
    .map((n) => Number.parseInt(n, 10) || 0)
}

function isNewerVersion(latest: string, current: string): boolean {
  const a = normalizeVer(latest)
  const b = normalizeVer(current)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const av = a[i] || 0
    const bv = b[i] || 0
    if (av > bv) return true
    if (av < bv) return false
  }
  return false
}

export function getAppVersion(): string {
  return app.getVersion() || '1.2.0'
}

export async function checkForUpdates(): Promise<UpdateCheckResult> {
  const currentVersion = getAppVersion()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 7000)

  try {
    const res = await fetch(LATEST_RELEASE_API, {
      signal: controller.signal,
      headers: {
        'User-Agent': `99x-launcher/${currentVersion}`,
        Accept: 'application/vnd.github+json'
      }
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const data: any = await res.json()
    const tag = String(data?.tag_name || '').replace(/^v/i, '')
    const releaseUrl = String(data?.html_url || `${GITHUB_REPO_URL}/releases`)
    const assets: any[] = Array.isArray(data?.assets) ? data.assets : []
    const exeAsset = assets.find((a) => String(a?.name || '').toLowerCase().endsWith('.exe'))
    const downloadUrl = String(exeAsset?.browser_download_url || releaseUrl)

    return {
      currentVersion,
      latestVersion: tag || currentVersion,
      hasUpdate: Boolean(tag && isNewerVersion(tag, currentVersion)),
      releaseUrl,
      downloadUrl,
      releaseNotes: String(data?.body || '').trim(),
      publishedAt: String(data?.published_at || '')
    }
  } catch (err: any) {
    return {
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
      releaseUrl: `${GITHUB_REPO_URL}/releases`,
      downloadUrl: `${GITHUB_REPO_URL}/releases`,
      releaseNotes: '',
      publishedAt: '',
      error: err?.message || '检查更新失败'
    }
  } finally {
    clearTimeout(timer)
  }
}
