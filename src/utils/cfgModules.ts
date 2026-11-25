import type { CfgCmdPreset, CfgProfileId } from '../data/cfgPresets'

export interface ParsedBind {
  key: string
  command: string
  lineIndex: number
}

export interface InstalledCfgModule {
  presetId: string
  preset: CfgCmdPreset
  startLine: number
  endLine: number
  isMarked: boolean
  boundKey: string
  boundParam?: string
  rawBlock: string
}

export interface UnmatchedBindEntry {
  key: string
  command: string
  lineIndex: number
}

export interface CfgAnalysisResult {
  binds: Map<string, ParsedBind>
  duplicateKeys: string[]
  byPresetId: Map<string, InstalledCfgModule>
  installedList: InstalledCfgModule[]
  unmatchedBinds: UnmatchedBindEntry[]
}

const BIND_RE = /^\s*bind\s+"?([^"\s]+)"?\s+(?:"([^"]*)"|(\S+))/i
const BLOCK_START_RE = /^\s*\/\/\s*>>>\s*\[99x:([^\]]+)\](.*)$/
const BLOCK_END_RE = /^\s*\/\/\s*<<<\s*\[99x:([^\]]+)\]\s*$/

export function parseAllBinds(cfgText: string): {
  binds: Map<string, ParsedBind>
  allBindLines: ParsedBind[]
  duplicateKeys: string[]
} {
  const binds = new Map<string, ParsedBind>()
  const allBindLines: ParsedBind[] = []
  const counts = new Map<string, number>()
  const lines = cfgText.split(/\r?\n/)

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) return
    const m = BIND_RE.exec(trimmed)
    if (m) {
      const entry: ParsedBind = {
        key: m[1],
        command: m[2] !== undefined ? m[2] : m[3] || '',
        lineIndex: idx
      }
      allBindLines.push(entry)
      const lower = m[1].toLowerCase()
      counts.set(lower, (counts.get(lower) || 0) + 1)
      binds.set(lower, entry)
    }
  })

  const duplicateKeys = Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key]) => key)

  return { binds, allBindLines, duplicateKeys }
}

function extractModuleMetaFromBlock(
  preset: CfgCmdPreset,
  blockLines: string[]
): { boundKey: string; boundParam?: string } {
  let boundKey = ''
  let boundParam: string | undefined

  const bindLines: Array<{ key: string; cmd: string }> = []
  for (const line of blockLines) {
    const t = line.trim()
    if (!t || t.startsWith('//')) continue
    const m = BIND_RE.exec(t)
    if (m) {
      bindLines.push({ key: m[1], cmd: m[2] !== undefined ? m[2] : m[3] || '' })
    }
  }

  if (preset.isDirectCvar) {
    if (preset.hasParam && preset.command.includes('{{PARAM}}')) {
      const prefix = preset.command.split('{{PARAM}}')[0].trim()
      for (const line of blockLines) {
        const t = line.trim()
        if (t && !t.startsWith('//') && t.toLowerCase().startsWith(prefix.toLowerCase())) {
          boundParam = t.slice(prefix.length).trim()
          break
        }
      }
    }
    return { boundKey: '', boundParam }
  }

  if (preset.isKeyTemplate) {
    const matchTarget = (preset.bindMatchCmd || '').trim().toLowerCase()
    const primary =
      bindLines.find((b) => b.cmd.trim().toLowerCase() === matchTarget) || bindLines[0]
    if (primary) boundKey = primary.key

    if (preset.hasParam && preset.paramIsKey) {
      const secondary = bindLines.find((b) => b !== primary)
      if (secondary) boundParam = secondary.key
    } else if (preset.hasParam && preset.command.includes('{{PARAM}}')) {
      // e.g. alias 180turn "yaw {{PARAM}} 1 1"
      const templateLine = preset.command
        .split('\n')
        .find((l) => l.includes('{{PARAM}}'))
      if (templateLine) {
        const [before, after] = templateLine.split('{{PARAM}}')
        for (const line of blockLines) {
          const idxB = line.indexOf(before)
          if (idxB !== -1) {
            const rest = line.slice(idxB + before.length)
            const idxA = after ? rest.indexOf(after) : rest.length
            if (idxA !== -1) {
              boundParam = rest.slice(0, idxA).trim()
              break
            }
          }
        }
      }
    }
    return { boundKey, boundParam }
  }

  // Standard single-line bind preset
  if (bindLines[0]) {
    boundKey = bindLines[0].key
    const cmd = bindLines[0].cmd.trim()
    if (preset.hasParam) {
      if (preset.command.includes('{{PARAM}}')) {
        const [before, after] = preset.command.split('{{PARAM}}')
        if (cmd.toLowerCase().startsWith(before.toLowerCase())) {
          const rest = cmd.slice(before.length)
          boundParam = after && rest.endsWith(after) ? rest.slice(0, -after.length).trim() : rest.trim()
        }
      } else if (cmd.toLowerCase().startsWith(preset.command.toLowerCase())) {
        boundParam = cmd.slice(preset.command.length).trim()
      }
    }
  }

  return { boundKey, boundParam }
}

/** Collect alias tokens defined inside a key-template preset for legacy block range detection */
function getTemplateTokens(preset: CfgCmdPreset): Set<string> {
  const tokens = new Set<string>()
  if (preset.bindMatchCmd) tokens.add(preset.bindMatchCmd.toLowerCase())
  for (const line of preset.command.split('\n')) {
    const m = /^\s*alias\s+"?([^"\s]+)"?/i.exec(line.trim())
    if (m) tokens.add(m[1].toLowerCase())
  }
  return tokens
}

export function analyzeCfgContent(
  cfgText: string,
  allPresets: CfgCmdPreset[],
  activeProfile: CfgProfileId
): CfgAnalysisResult {
  const lines = cfgText.split(/\r?\n/)
  const { binds, allBindLines, duplicateKeys } = parseAllBinds(cfgText)
  const presetById = new Map(allPresets.map((p) => [p.id, p]))
  const byPresetId = new Map<string, InstalledCfgModule>()
  const claimedLines = new Set<number>()

  // Pass 1: Detect explicit [99x:<id>] modular blocks
  for (let i = 0; i < lines.length; i++) {
    const startMatch = BLOCK_START_RE.exec(lines[i])
    if (!startMatch) continue
    const presetId = startMatch[1].trim()
    const preset = presetById.get(presetId)
    let endIdx = -1
    for (let j = i + 1; j < lines.length; j++) {
      const endMatch = BLOCK_END_RE.exec(lines[j])
      if (endMatch && endMatch[1].trim() === presetId) {
        endIdx = j
        break
      }
      if (BLOCK_START_RE.test(lines[j])) break
    }
    if (endIdx !== -1 && preset) {
      const blockLines = lines.slice(i, endIdx + 1)
      const { boundKey, boundParam } = extractModuleMetaFromBlock(preset, blockLines)
      for (let k = i; k <= endIdx; k++) claimedLines.add(k)
      byPresetId.set(preset.id, {
        presetId: preset.id,
        preset,
        startLine: i,
        endLine: endIdx,
        isMarked: true,
        boundKey,
        boundParam,
        rawBlock: blockLines.join('\n')
      })
      i = endIdx
    }
  }

  // Filter presets to active profile + common for legacy unmarked matching
  const profilePresets = allPresets.filter(
    (p) => (p.profile === activeProfile || p.profile === 'common') && !byPresetId.has(p.id)
  )

  // Pass 2A: Legacy key-template scripts (match via bindMatchCmd + adjacent alias lines)
  for (const preset of profilePresets) {
    if (!preset.isKeyTemplate || !preset.bindMatchCmd) continue
    const matchLower = preset.bindMatchCmd.toLowerCase()
    const bindLine = allBindLines.find(
      (b) => !claimedLines.has(b.lineIndex) && b.command.trim().toLowerCase() === matchLower
    )
    if (!bindLine) continue

    const tokens = getTemplateTokens(preset)
    let start = bindLine.lineIndex
    let end = bindLine.lineIndex

    // Expand up/down across contiguous related alias/bind/cl_allow_multi_input_binds lines
    const isRelated = (idx: number): boolean => {
      if (idx < 0 || idx >= lines.length || claimedLines.has(idx)) return false
      const t = lines[idx].trim()
      if (!t) return false
      if (t.startsWith('//')) return false
      const am = /^\s*alias\s+"?([^"\s]+)"?/i.exec(t)
      if (am && tokens.has(am[1].toLowerCase())) return true
      if (preset.paramIsKey && /^\s*bind\s+"?[^"\s]+"?\s+"?-attack"?/i.test(t)) return true
      if (/^cl_allow_multi_input_binds\b/i.test(t) && preset.command.includes('cl_allow_multi_input_binds')) {
        return true
      }
      return false
    }

    while (isRelated(start - 1)) start--
    while (isRelated(end + 1)) end++
    // Include single preceding comment if directly above
    if (start > 0 && !claimedLines.has(start - 1) && lines[start - 1].trim().startsWith('//') && !BLOCK_END_RE.test(lines[start - 1])) {
      start--
    }

    const blockLines = lines.slice(start, end + 1)
    const { boundKey, boundParam } = extractModuleMetaFromBlock(preset, blockLines)
    for (let k = start; k <= end; k++) claimedLines.add(k)
    byPresetId.set(preset.id, {
      presetId: preset.id,
      preset,
      startLine: start,
      endLine: end,
      isMarked: false,
      boundKey: boundKey || bindLine.key,
      boundParam,
      rawBlock: blockLines.join('\n')
    })
  }

  // Pass 2B: Legacy direct-cvar / multi-line fixed blocks
  for (const preset of profilePresets) {
    if (!preset.isDirectCvar) continue
    const expectedLines = preset.command
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//'))
    if (expectedLines.length === 0) continue

    if (preset.hasParam && preset.command.includes('{{PARAM}}')) {
      const prefix = preset.command.split('{{PARAM}}')[0].trim().toLowerCase()
      const idx = lines.findIndex(
        (l, i) => !claimedLines.has(i) && l.trim().toLowerCase().startsWith(prefix) && !l.trim().startsWith('//')
      )
      if (idx !== -1) {
        let start = idx
        if (start > 0 && !claimedLines.has(start - 1) && lines[start - 1].trim().startsWith('//') && !BLOCK_END_RE.test(lines[start - 1])) {
          start--
        }
        const blockLines = lines.slice(start, idx + 1)
        const { boundParam } = extractModuleMetaFromBlock(preset, blockLines)
        for (let k = start; k <= idx; k++) claimedLines.add(k)
        byPresetId.set(preset.id, {
          presetId: preset.id,
          preset,
          startLine: start,
          endLine: idx,
          isMarked: false,
          boundKey: '',
          boundParam,
          rawBlock: blockLines.join('\n')
        })
      }
      continue
    }

    // Match each expected line (case-insensitive, ignoring optional quotes on values)
    const norm = (s: string) => s.trim().toLowerCase().replace(/"/g, '').replace(/\s+/g, ' ')
    const matchedIndices: number[] = []
    for (const exp of expectedLines) {
      const target = norm(exp)
      const foundIdx = lines.findIndex(
        (l, i) =>
          !claimedLines.has(i) &&
          !matchedIndices.includes(i) &&
          !l.trim().startsWith('//') &&
          norm(l) === target
      )
      if (foundIdx !== -1) matchedIndices.push(foundIdx)
    }

    // Require all lines for 1-2 line blocks, or >= 50% for larger blocks (e.g. log_flags, fps)
    const threshold = expectedLines.length <= 2 ? expectedLines.length : Math.ceil(expectedLines.length * 0.5)
    if (matchedIndices.length >= threshold) {
      matchedIndices.sort((a, b) => a - b)
      let start = matchedIndices[0]
      const end = matchedIndices[matchedIndices.length - 1]
      // Only group as contiguous block if span isn't huge
      if (end - start <= expectedLines.length + 3) {
        if (start > 0 && !claimedLines.has(start - 1) && lines[start - 1].trim().startsWith('//') && !BLOCK_END_RE.test(lines[start - 1])) {
          start--
        }
        for (let k = start; k <= end; k++) claimedLines.add(k)
        const blockLines = lines.slice(start, end + 1)
        byPresetId.set(preset.id, {
          presetId: preset.id,
          preset,
          startLine: start,
          endLine: end,
          isMarked: false,
          boundKey: '',
          rawBlock: blockLines.join('\n')
        })
      }
    }
  }

  // Pass 2C: Legacy single-line bind presets (sort longest command first to avoid prefix collisions like .bet ct vs .bet)
  const singleBindPresets = profilePresets
    .filter((p) => !p.isDirectCvar && !p.isKeyTemplate)
    .sort((a, b) => b.command.length - a.command.length)

  for (const preset of singleBindPresets) {
    const cmdLower = preset.command.trim().toLowerCase()
    const hasTemplateParam = preset.command.includes('{{PARAM}}')
    const templatePrefix = hasTemplateParam
      ? preset.command.split('{{PARAM}}')[0].trim().toLowerCase()
      : ''

    const matched = allBindLines.find((b) => {
      if (claimedLines.has(b.lineIndex)) return false
      const bCmd = b.command.trim().toLowerCase()
      if (hasTemplateParam) {
        return bCmd.startsWith(templatePrefix)
      }
      if (preset.hasParam) {
        return bCmd === cmdLower || bCmd.startsWith(`${cmdLower} `)
      }
      return bCmd === cmdLower
    })

    if (!matched) continue

    let start = matched.lineIndex
    const end = matched.lineIndex
    if (
      start > 0 &&
      !claimedLines.has(start - 1) &&
      lines[start - 1].trim().startsWith('//') &&
      !BLOCK_END_RE.test(lines[start - 1])
    ) {
      // Only include preceding comment if it isn't a section header like "// ===" or "// 视野..."
      const prevTrim = lines[start - 1].trim()
      if (!prevTrim.startsWith('// ===') && prevTrim.includes(preset.label.slice(0, 2))) {
        start--
      }
    }

    const blockLines = lines.slice(start, end + 1)
    const { boundKey, boundParam } = extractModuleMetaFromBlock(preset, blockLines)
    for (let k = start; k <= end; k++) claimedLines.add(k)
    byPresetId.set(preset.id, {
      presetId: preset.id,
      preset,
      startLine: start,
      endLine: end,
      isMarked: false,
      boundKey: boundKey || matched.key,
      boundParam,
      rawBlock: blockLines.join('\n')
    })
  }

  const installedList = Array.from(byPresetId.values()).sort((a, b) => a.startLine - b.startLine)
  const unmatchedBinds: UnmatchedBindEntry[] = allBindLines.filter(
    (b) => !claimedLines.has(b.lineIndex)
  )

  return {
    binds,
    duplicateKeys,
    byPresetId,
    installedList,
    unmatchedBinds
  }
}

export function formatMarkedModule(preset: CfgCmdPreset, body: string, keyLabel?: string): string {
  const suffix = keyLabel ? ` (${keyLabel})` : ''
  return [
    `// >>> [99x:${preset.id}] ${preset.label}${suffix}`,
    body.trimEnd(),
    `// <<< [99x:${preset.id}]`
  ].join('\n')
}

export function upsertModuleInCfg(
  cfgText: string,
  preset: CfgCmdPreset,
  body: string,
  existingModule?: InstalledCfgModule,
  keyLabel?: string
): string {
  const formatted = formatMarkedModule(preset, body, keyLabel)
  if (existingModule) {
    const lines = cfgText.split(/\r?\n/)
    const before = lines.slice(0, existingModule.startLine)
    const after = lines.slice(existingModule.endLine + 1)
    return [...before, ...formatted.split('\n'), ...after].join('\n')
  }
  const trimmedEnd = cfgText.replace(/\s+$/, '')
  return trimmedEnd ? `${trimmedEnd}\n\n${formatted}\n` : `${formatted}\n`
}

export function removeLineRangeFromCfg(
  cfgText: string,
  startLine: number,
  endLine: number
): string {
  const lines = cfgText.split(/\r?\n/)
  const next = [...lines.slice(0, startLine), ...lines.slice(endLine + 1)]
  // Collapse 3+ consecutive blank lines into at most 1 blank line
  const cleaned: string[] = []
  let blankRun = 0
  for (const line of next) {
    if (line.trim() === '') {
      blankRun++
      if (blankRun <= 1) cleaned.push(line)
    } else {
      blankRun = 0
      cleaned.push(line)
    }
  }
  return cleaned.join('\n').replace(/^\n+/, '').replace(/\n{3,}$/, '\n')
}
