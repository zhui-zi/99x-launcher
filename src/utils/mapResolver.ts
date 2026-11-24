import type { DifficultyLevel } from '../types/server'
import { MAP_FALLBACK_DICT } from '../data/mapFallbackDict'
import { normalizeDifficulty } from './grouping'

export interface MapDictValue {
  mapNameCN: string
  difficulty: string
}

export interface MapLookupIndex {
  exact: Map<string, MapDictValue>
  byBase: Map<string, MapDictValue>
}

const TIER_TO_DIFF: Record<string, DifficultyLevel> = {
  '1': '简单',
  '2': '普通',
  '3': '困难',
  '4': '极难',
  '5': '梦魇',
  '6': '史诗'
}

const SUFFIX_RE =
  /(?:_v\d[\w.-]*|_b\d[\w.-]*|_a\d[\w.-]*|_r\d+|_p\d*|_cs2[\w.-]*|_fys[\w.-]*|_fix\d*|_final\d*|_pro-?mod|_remake|_redux|_demo|_old|_hdr|_go|_s\d*|_l|_t|_c\d+)$/i

/**
 * Strip common CS2/CSGO map version and port suffixes so variants like
 * `ze_obj_nirvana_v1fix` or `de_inferno_pro-mod` can match their base map.
 */
export function normalizeMapBaseName(raw: string): string {
  let name = (raw || '').trim().toLowerCase()
  if (!name) return ''
  for (let i = 0; i < 4; i++) {
    const next = name.replace(SUFFIX_RE, '')
    if (next === name || next.length < 3) break
    name = next
  }
  return name
}

/**
 * Extract difficulty from parenthetical tier markers like "(Tier1)" or Chinese labels.
 */
export function extractDifficultyFromText(raw?: string): DifficultyLevel | '' {
  const text = (raw || '').trim()
  if (!text) return ''

  const direct = normalizeDifficulty(text)
  if (direct !== '未知') return direct

  const tierMatch = text.match(/\b(?:tier|t)\s*([1-6])\b/i)
  if (tierMatch) {
    return TIER_TO_DIFF[tierMatch[1]] || ''
  }

  for (const label of ['史诗', '梦魇', '极难', '困难', '普通', '简单'] as const) {
    if (text.includes(label)) return label
  }
  return ''
}

function isPlaceholderOrTagOnly(text: string): boolean {
  const t = text.trim()
  if (!t || t === '暂无译名' || t === '-') return true
  // Pure parenthetical note such as "(Tier1)" or "(学会断后)"
  return /^[(\[（【][^)\]）】]+[)\]）】]$/.test(t)
}

function mergeEntry(
  target: Map<string, MapDictValue>,
  key: string,
  cn?: string,
  diff?: string,
  preferNew = false
): void {
  if (!key) return
  const cleanCN = cn && !isPlaceholderOrTagOnly(cn) ? cn.trim() : ''
  const cleanDiff = diff ? extractDifficultyFromText(diff) : ''
  if (!cleanCN && !cleanDiff) return

  const prev = target.get(key)
  if (!prev) {
    target.set(key, { mapNameCN: cleanCN, difficulty: cleanDiff })
    return
  }
  target.set(key, {
    mapNameCN: preferNew ? cleanCN || prev.mapNameCN : prev.mapNameCN || cleanCN,
    difficulty: preferNew ? cleanDiff || prev.difficulty : prev.difficulty || cleanDiff
  })
}

/**
 * Build a unified map lookup index combining:
 * 1. Built-in fallback dictionary (lowest priority)
 * 2. Live cross-community server metadata
 * 3. EXG remote mapLists dictionary (highest priority for non-empty fields)
 */
export function buildMapLookupIndex(
  remoteMapDict: Record<string, MapDictValue>,
  liveServers: Array<{ map?: string; mapDisplayName?: string; mapDifficulty?: string }> = []
): MapLookupIndex {
  const exact = new Map<string, MapDictValue>()
  const byBase = new Map<string, MapDictValue>()

  // 1. Seed with built-in fallback dictionary
  for (const [k, v] of Object.entries(MAP_FALLBACK_DICT)) {
    const key = k.toLowerCase()
    mergeEntry(exact, key, v.mapNameCN, v.difficulty, false)
    mergeEntry(byBase, normalizeMapBaseName(key), v.mapNameCN, v.difficulty, false)
  }

  // 2. Overlay EXG remote mapDict (prefers remote values when present, keeps fallback when remote is empty/0)
  for (const [k, v] of Object.entries(remoteMapDict || {})) {
    const key = k.toLowerCase()
    mergeEntry(exact, key, v.mapNameCN, v.difficulty, true)
    mergeEntry(byBase, normalizeMapBaseName(key), v.mapNameCN, v.difficulty, false)
  }

  // 3. Overlay live cross-community metadata (fills gaps across EXG / ZED / FYS)
  for (const s of liveServers) {
    const key = (s.map || '').trim().toLowerCase()
    if (!key) continue
    const inferredDiff = s.mapDifficulty || extractDifficultyFromText(s.mapDisplayName)
    mergeEntry(exact, key, s.mapDisplayName, inferredDiff, false)
    mergeEntry(byBase, normalizeMapBaseName(key), s.mapDisplayName, inferredDiff, false)
  }

  return { exact, byBase }
}

function resolvePatternFallback(lowerMap: string): MapDictValue | null {
  if (!lowerMap) return null
  if (lowerMap.includes('lobby') || lowerMap.includes('_home')) {
    if (lowerMap.startsWith('fys_')) return { mapNameCN: '风云社大厅', difficulty: '简单' }
    if (lowerMap.startsWith('zed_')) return { mapNameCN: '乐园大厅', difficulty: '简单' }
    if (lowerMap.startsWith('exg_')) return { mapNameCN: 'EXG 大厅', difficulty: '简单' }
    return { mapNameCN: '社区大厅', difficulty: '简单' }
  }
  return null
}

/**
 * Resolve final Chinese display name and difficulty for a map.
 */
export function resolveMapMeta(
  mapName: string,
  rawDisplayName: string | undefined,
  rawDifficulty: string | undefined,
  index: MapLookupIndex
): { mapDisplayName: string; mapDifficulty: DifficultyLevel } {
  const lower = (mapName || '').trim().toLowerCase()
  const base = normalizeMapBaseName(lower)
  const exactHit = lower ? index.exact.get(lower) : undefined
  const baseHit = base ? index.byBase.get(base) : undefined
  const patternHit = resolvePatternFallback(lower)

  const trimmedRawCN = (rawDisplayName || '').trim()
  const dictCN = exactHit?.mapNameCN || baseHit?.mapNameCN || patternHit?.mapNameCN || ''

  let finalCN = ''
  if (trimmedRawCN && trimmedRawCN !== '暂无译名') {
    if (isPlaceholderOrTagOnly(trimmedRawCN)) {
      // Combine real Chinese name with tag/note, e.g. "涅槃重生 (学会断后)" or "信念连跳 (Tier1)"
      finalCN = dictCN ? `${dictCN} ${trimmedRawCN}` : trimmedRawCN
    } else {
      finalCN = trimmedRawCN
    }
  } else {
    finalCN = dictCN
  }

  const diffCandidate =
    extractDifficultyFromText(rawDifficulty) ||
    extractDifficultyFromText(trimmedRawCN) ||
    extractDifficultyFromText(exactHit?.difficulty) ||
    extractDifficultyFromText(baseHit?.difficulty) ||
    extractDifficultyFromText(patternHit?.difficulty)

  return {
    mapDisplayName: finalCN,
    mapDifficulty: normalizeDifficulty(diffCandidate)
  }
}
