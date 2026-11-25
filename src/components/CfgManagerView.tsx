import React, { useEffect, useMemo, useState } from 'react'
import {
  FileCode2,
  Save,
  FolderOpen,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Keyboard,
  Sliders,
  Copy,
  Search,
  ExternalLink,
  FilePlus2,
  X
} from 'lucide-react'
import type { CfgFileInfo, CommunityId } from '../types/server'
import {
  buildEffectiveCs2Binds,
  formatCs2CommandLabel,
  keyboardEventToCs2Key,
  mouseButtonToCs2Key
} from '../utils/cs2Keys'
import {
  CFG_PRESETS,
  EXG_CATEGORIES,
  EXG_CFG_REFERENCE_URL,
  EXG_ZE_RECOMMENDED_BUNDLE,
  FYS_CATEGORIES,
  FYS_REFERENCE_URL,
  FYS_ZE_RECOMMENDED_BUNDLE,
  communityToCfgProfile,
  type CfgCmdPreset,
  type CfgProfileId
} from '../data/cfgPresets'

interface CfgManagerViewProps {
  cs2Path: string
  steamPath: string
  activeCommunity: CommunityId
  onPickCs2Path: () => Promise<void>
}

interface ParsedBind {
  key: string
  command: string
  lineIndex: number
}

function parseExistingBinds(cfgText: string): {
  binds: Map<string, ParsedBind>
  duplicateKeys: string[]
} {
  const binds = new Map<string, ParsedBind>()
  const counts = new Map<string, number>()
  const lines = cfgText.split(/\r?\n/)
  const bindRe = /^\s*bind\s+"?([^"\s]+)"?\s+(?:"([^"]*)"|(\S+))/i
  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) return
    const m = bindRe.exec(trimmed)
    if (m) {
      const lower = m[1].toLowerCase()
      counts.set(lower, (counts.get(lower) || 0) + 1)
      binds.set(lower, {
        key: m[1],
        command: m[2] !== undefined ? m[2] : m[3] || '',
        lineIndex: idx
      })
    }
  })
  const duplicateKeys = Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key]) => key)
  return { binds, duplicateKeys }
}

export const CfgManagerView: React.FC<CfgManagerViewProps> = ({
  cs2Path,
  steamPath,
  activeCommunity,
  onPickCs2Path
}) => {
  const [profile, setProfile] = useState<CfgProfileId>(() =>
    communityToCfgProfile(activeCommunity)
  )
  const [cfgDir, setCfgDir] = useState('')
  const [files, setFiles] = useState<CfgFileInfo[]>([])
  const [activeFile, setActiveFile] = useState('autoexec.cfg')
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'warn' | 'error'
    text: string
  } | null>(null)
  const [cs2UserOverrides, setCs2UserOverrides] = useState<Record<string, string>>({})
  const [cs2KeysLoaded, setCs2KeysLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newFileOpen, setNewFileOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [capturingTarget, setCapturingTarget] = useState<{
    presetId: string
    field: 'key' | 'param'
  } | null>(null)

  const isDirty = content !== savedContent

  const categories = profile === 'fys' ? FYS_CATEGORIES : EXG_CATEGORIES
  const [activeCategory, setActiveCategory] = useState<string>(categories[0])

  const [keyMap, setKeyMap] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const p of CFG_PRESETS) init[p.id] = p.defaultKey
    return init
  })

  const [paramMap, setParamMap] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const p of CFG_PRESETS) {
      if (p.hasParam) init[p.id] = p.defaultParam ?? ''
    }
    return init
  })

  // Keep category valid when switching community profile
  useEffect(() => {
    const nextCats = profile === 'fys' ? FYS_CATEGORIES : EXG_CATEGORIES
    if (!(nextCats as readonly string[]).includes(activeCategory)) {
      setActiveCategory(nextCats[0])
    }
  }, [profile])

  const { binds: existingBinds, duplicateKeys: cfgDuplicateKeys } = useMemo(
    () => parseExistingBinds(content),
    [content]
  )

  const effectiveCs2Binds = useMemo(
    () => buildEffectiveCs2Binds(cs2UserOverrides),
    [cs2UserOverrides]
  )

  // Read player's real CS2 keybindings (cs2_user_keys_0_slot0.vcfg) if Steam path is available
  useEffect(() => {
    if (!window.cs2Api || !steamPath) {
      setCs2UserOverrides({})
      setCs2KeysLoaded(false)
      return
    }
    window.cs2Api.cfg.readCs2Keys(steamPath).then((res) => {
      if (res?.found) {
        setCs2UserOverrides(res.bindings || {})
        setCs2KeysLoaded(true)
      } else {
        setCs2UserOverrides({})
        setCs2KeysLoaded(false)
      }
    })
  }, [steamPath])

  const visiblePresets = useMemo(() => {
    const pool = CFG_PRESETS.filter(
      (p) => p.profile === profile || p.profile === 'common'
    )
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      return pool.filter(
        (p) =>
          p.cmdDisplay.toLowerCase().includes(q) ||
          p.command.toLowerCase().includes(q) ||
          p.label.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          (p.subGroup && p.subGroup.toLowerCase().includes(q)) ||
          (p.note && p.note.toLowerCase().includes(q))
      )
    }
    return pool.filter((p) => p.category === activeCategory)
  }, [profile, activeCategory, searchQuery])

  // Group visible presets by subGroup (or category when searching)
  const groupedPresets = useMemo(() => {
    const groups: Array<{ title: string; items: CfgCmdPreset[] }> = []
    const indexByTitle = new Map<string, number>()
    const isSearching = searchQuery.trim().length > 0

    for (const item of visiblePresets) {
      const title = isSearching
        ? item.subGroup
          ? `${item.category} · ${item.subGroup}`
          : item.category
        : item.subGroup || ''
      const existingIdx = indexByTitle.get(title)
      if (existingIdx !== undefined) {
        groups[existingIdx].items.push(item)
      } else {
        indexByTitle.set(title, groups.length)
        groups.push({ title, items: [item] })
      }
    }
    return groups
  }, [visiblePresets, searchQuery])

  const refreshFiles = async () => {
    if (!window.cs2Api || !cs2Path) return
    setLoading(true)
    try {
      const res = await window.cs2Api.cfg.list(cs2Path)
      setCfgDir(res.cfgDir || '')
      setFiles(res.files || [])
    } finally {
      setLoading(false)
    }
  }

  const loadFile = async (fileName: string) => {
    if (!window.cs2Api || !cs2Path) return
    setActiveFile(fileName)
    setStatusMsg(null)
    const res = await window.cs2Api.cfg.read(cs2Path, fileName)
    if (res.exists) {
      setContent(res.content)
      setSavedContent(res.content)
    } else {
      const tag = profile === 'fys' ? 'FYS 风云社' : 'EXG / ZED 社区'
      const initial = `// 99x launcher - CS2 ${tag} 自动加载配置 (${fileName})\n// 请确保 Steam 启动项包含 +exec ${fileName}\n\n`
      setContent(initial)
      setSavedContent('')
    }
  }

  useEffect(() => {
    if (cs2Path) {
      refreshFiles()
      loadFile('autoexec.cfg')
    }
  }, [cs2Path])

  const getCs2Conflict = (key: string, expectedCmd = ''): string | null => {
    const k = key.trim().toLowerCase()
    if (!k) return null
    const cs2Cmd = effectiveCs2Binds[k]
    if (!cs2Cmd) return null
    const lowerExpected = expectedCmd.trim().toLowerCase()
    const lowerCs2 = cs2Cmd.trim().toLowerCase()
    // Intentional enhancements (e.g. "+reload; fov_cs_debug 110" on R, "+duck; +jump" on Space) are not conflicts
    if (lowerExpected && (lowerExpected === lowerCs2 || lowerExpected.includes(lowerCs2))) {
      return null
    }
    return cs2Cmd
  }

  const buildCommandText = (preset: CfgCmdPreset): string | null => {
    if (!preset.hasParam) return preset.command
    const param = (paramMap[preset.id] ?? preset.defaultParam ?? '').trim()
    if (preset.paramRequired && !param) {
      setStatusMsg({
        type: 'error',
        text: `指令「${preset.cmdDisplay}」需要填写${preset.paramLabel || '参数'}（例如：${preset.paramPlaceholder || preset.defaultParam}）`
      })
      return null
    }
    if (preset.command.includes('{{PARAM}}')) {
      return preset.command.replace(/\{\{PARAM\}\}/g, param)
    }
    if (preset.isDirectCvar) return preset.command
    return param ? `${preset.command} ${param}` : preset.command
  }

  const appendLines = (
    lines: string,
    label: string,
    warnText?: string
  ) => {
    setContent((prev) => {
      const sep = prev.endsWith('\n') || !prev ? '' : '\n'
      return `${prev}${sep}// ${label}\n${lines}\n`
    })
    setStatusMsg(
      warnText
        ? { type: 'warn', text: warnText }
        : {
            type: 'success',
            text: `已将「${label}」写入编辑器，点击「保存 ${activeFile}」或按 Ctrl+S 写入磁盘`
          }
    )
  }

  const handleInsertPreset = (preset: CfgCmdPreset) => {
    const cmdText = buildCommandText(preset)
    if (cmdText === null) return

    if (preset.isDirectCvar) {
      appendLines(cmdText, preset.label)
      return
    }

    const key = (keyMap[preset.id] ?? preset.defaultKey).trim()
    if (!key) {
      setStatusMsg({
        type: 'error',
        text: `请先点击「${preset.label}」右侧按键框并按下要绑定的按键（支持键盘、鼠标侧键/中键/右键、滚轮）`
      })
      setCapturingTarget({ presetId: preset.id, field: 'key' })
      return
    }

    const existing = existingBinds.get(key.toLowerCase())
    const expectedCheck = preset.isKeyTemplate ? preset.bindMatchCmd || '' : cmdText
    const cs2Conflict = getCs2Conflict(key, expectedCheck)

    if (preset.isKeyTemplate) {
      const rendered = cmdText.replace(/\{\{KEY\}\}/g, key)
      const warnings: string[] = []
      if (
        existing &&
        existing.command.trim().toLowerCase() !== (preset.bindMatchCmd || '').trim().toLowerCase()
      ) {
        warnings.push(`当前 CFG 中「${key}」已有绑定 "${existing.command}"`)
      }
      if (cs2Conflict) {
        warnings.push(`CS2 原绑定为「${formatCs2CommandLabel(cs2Conflict)}」`)
      }
      const warnMsg =
        warnings.length > 0
          ? `已写入「${preset.label} (${key})」，但注意重复按键冲突：${warnings.join('；')}，请检查或更换按键`
          : undefined
      appendLines(rendered, `${preset.label} (${key})`, warnMsg)
      return
    }

    const newBindLine = `bind "${key}" "${cmdText}"`

    if (existing) {
      // Replace existing bind for the same key in-place to avoid duplicate conflicting binds
      setContent((prev) => {
        const lines = prev.split(/\r?\n/)
        if (existing.lineIndex >= 0 && existing.lineIndex < lines.length) {
          lines[existing.lineIndex] = newBindLine
        }
        return lines.join('\n')
      })
      setStatusMsg(
        cs2Conflict
          ? {
              type: 'warn',
              text: `已将「${key}」替换为 ${cmdText}；注意 CS2 原绑定为「${formatCs2CommandLabel(cs2Conflict)}」，请确认是否需要换键`
            }
          : {
              type: 'success',
              text: `已更新按键「${key}」绑定为 ${cmdText}（已自动替换原绑定，记得保存）`
            }
      )
      return
    }

    const warnMsg = cs2Conflict
      ? `已写入「${preset.label} (${key})」，但注意 CS2 原绑定为「${formatCs2CommandLabel(cs2Conflict)}」，避免误覆盖游戏按键`
      : undefined
    appendLines(newBindLine, `${preset.label} (${preset.cmdDisplay})`, warnMsg)
  }

  const handleInsertBundle = () => {
    if (profile === 'fys') {
      appendLines(FYS_ZE_RECOMMENDED_BUNDLE, 'FYS 风云社 ZE v5 推荐套装')
    } else {
      appendLines(EXG_ZE_RECOMMENDED_BUNDLE, 'EXG ZE 完整推荐绑定套装')
    }
  }

  const handleCreateNewFile = () => {
    const raw = newFileName.trim().replace(/[\\/:*?"<>|]/g, '')
    if (!raw) return
    const finalName = raw.toLowerCase().endsWith('.cfg') ? raw : `${raw}.cfg`
    setNewFileOpen(false)
    setNewFileName('')
    loadFile(finalName)
  }

  const handleSave = async () => {
    if (!window.cs2Api) return
    if (!cs2Path) {
      setStatusMsg({ type: 'error', text: '尚未配置 CS2 安装目录，请先选择 CS2 路径后再保存' })
      await onPickCs2Path()
      return
    }
    setSaving(true)
    try {
      const res = await window.cs2Api.cfg.write(cs2Path, activeFile, content)
      if (res.success) {
        setSavedContent(content)
        setStatusMsg({
          type: 'success',
          text: `已保存至 ${res.filePath}（已自动保留首次 .bak 备份）`
        })
        await refreshFiles()
      } else {
        setStatusMsg({ type: 'error', text: res.error || '保存失败' })
      }
    } finally {
      setSaving(false)
    }
  }

  // Global press-to-bind capture listener (keyboard, mouse buttons, mouse wheel)
  useEffect(() => {
    if (!capturingTarget) return

    const commitKey = (cs2Key: string) => {
      const targetPreset = CFG_PRESETS.find((p) => p.id === capturingTarget.presetId)
      if (capturingTarget.field === 'key') {
        setKeyMap((prev) => ({ ...prev, [capturingTarget.presetId]: cs2Key }))
      } else {
        setParamMap((prev) => ({ ...prev, [capturingTarget.presetId]: cs2Key }))
      }
      setCapturingTarget(null)

      // Immediate conflict check against current CFG and CS2 keybindings
      const lower = cs2Key.toLowerCase()
      const cfgExisting = existingBinds.get(lower)
      const expectedCmd =
        capturingTarget.field === 'key' && targetPreset
          ? targetPreset.isKeyTemplate
            ? targetPreset.bindMatchCmd || ''
            : targetPreset.command
          : ''
      const isSameCfgBind =
        cfgExisting &&
        expectedCmd &&
        cfgExisting.command.trim().toLowerCase() === expectedCmd.trim().toLowerCase()
      const cs2Conflict = getCs2Conflict(cs2Key, expectedCmd)

      const reasons: string[] = []
      if (cfgExisting && !isSameCfgBind) {
        reasons.push(`当前 CFG 已绑定为「${cfgExisting.command}」`)
      }
      if (cs2Conflict) {
        reasons.push(
          `CS2 ${cs2KeysLoaded ? '本地键位' : '默认键位'}已绑定为「${formatCs2CommandLabel(cs2Conflict)}」`
        )
      }

      if (reasons.length > 0) {
        setStatusMsg({
          type: 'warn',
          text: `重复按键提醒：按键「${cs2Key}」${reasons.join('，且')}，建议换一个空闲按键避免冲突`
        })
      } else {
        setStatusMsg({
          type: 'success',
          text: `已录制按键「${cs2Key}」（未与当前 CFG 或 CS2 键位冲突）`
        })
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.code === 'Escape') {
        setCapturingTarget(null)
        return
      }
      const mapped = keyboardEventToCs2Key(e)
      if (mapped) {
        commitKey(mapped)
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      // Left-click outside capture buttons cancels capture; capture button's own onClick handles toggle/switch
      if (e.button === 0) {
        const targetEl = (e.target as HTMLElement | null)?.closest('[data-keybind-capture]')
        if (targetEl) return
        setCapturingTarget(null)
        return
      }
      const mapped = mouseButtonToCs2Key(e.button)
      if (mapped) {
        e.preventDefault()
        e.stopPropagation()
        commitKey(mapped)
      }
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      e.stopPropagation()
      commitKey(e.deltaY < 0 ? 'mwheelup' : 'mwheeldown')
    }

    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('mousedown', onMouseDown, true)
    window.addEventListener('contextmenu', onContextMenu, true)
    window.addEventListener('wheel', onWheel, { capture: true, passive: false })

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('mousedown', onMouseDown, true)
      window.removeEventListener('contextmenu', onContextMenu, true)
      window.removeEventListener('wheel', onWheel, true)
    }
  }, [capturingTarget, existingBinds, effectiveCs2Binds, cs2KeysLoaded])

  // Support Ctrl+S / Cmd+S quick save
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (capturingTarget) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (!saving) handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const allFileOptions = useMemo(() => {
    const names = new Set<string>(['autoexec.cfg'])
    for (const f of files) names.add(f.name)
    if (activeFile) names.add(activeFile)
    return Array.from(names)
  }, [files, activeFile])

  return (
    <div className="p-6 space-y-5 max-w-[1440px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A1A] dark:text-[#F3F3F3]">
            CFG 配置与社区指令绑定
          </h1>
          <p className="text-[12.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-0.5">
            可视化生成并管理 CS2 <code className="font-mono">autoexec.cfg</code>，内置{' '}
            <span className="font-medium text-[#1A1A1A] dark:text-[#E6E6E6]">
              FYS 风云社 v5 全模式指令（.前缀）
            </span>{' '}
            与 EXG / ZED 指令库（.前缀）
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleInsertBundle}
            className="h-8 px-3.5 fluent-btn-standard text-[12.5px] inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF]" />
            {profile === 'fys' ? '一键生成 FYS 推荐配置' : '一键生成 EXG 推荐配置'}
          </button>
          {cfgDir && (
            <button
              onClick={() => window.cs2Api?.maps.openFolder(cfgDir)}
              className="h-8 px-3 fluent-btn-standard text-[12.5px] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5" /> 打开 cfg 目录
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-4 fluent-btn-accent text-[12.5px] inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
            title={cs2Path ? `保存 ${activeFile} (Ctrl+S)` : '点击先选择 CS2 安装路径并保存'}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? '保存中...' : `保存 ${activeFile}`}
            {isDirty && !saving && (
              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#001F33]" title="有未保存修改" />
            )}
          </button>
        </div>
      </div>

      {!cs2Path && (
        <div className="fluent-card px-4 py-3 border-l-4 border-l-[#9D5D00] dark:border-l-[#FCE100] flex items-center justify-between gap-3 text-[12.5px]">
          <div className="flex items-center gap-2 text-[#9D5D00] dark:text-[#FCE100]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>未配置 CS2 安装目录，无法读写 game/csgo/cfg 文件。</span>
          </div>
          <button onClick={onPickCs2Path} className="h-7 px-3 fluent-btn-standard text-[12px]">
            选择 CS2 路径
          </button>
        </div>
      )}

      {statusMsg && (
        <div
          className={`fluent-card px-4 py-2.5 text-[12.5px] flex items-center justify-between gap-2 border-l-4 ${
            statusMsg.type === 'success'
              ? 'border-l-[#0F7B0F] dark:border-l-[#6CCB5F] text-[#0F7B0F] dark:text-[#6CCB5F]'
              : statusMsg.type === 'warn'
                ? 'border-l-[#9D5D00] dark:border-l-[#FCE100] text-[#9D5D00] dark:text-[#FCE100]'
                : 'border-l-[#C42B1C] dark:border-l-[#FF99A4] text-[#C42B1C] dark:text-[#FF99A4]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate" title={statusMsg.text}>
              {statusMsg.text}
            </span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="opacity-70 hover:opacity-100 shrink-0"
            title="关闭提示"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Community Command & Keybind Studio */}
        <div className="lg:col-span-6 fluent-card p-4 flex flex-col gap-3">
          {/* Profile Switcher + Reference Link */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[14px] font-semibold">
              <Keyboard className="w-4 h-4 text-[#0067C0] dark:text-[#60CDFF]" />
              <span>社区快捷指令库</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="inline-flex rounded-md p-0.5 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]">
                <button
                  onClick={() => setProfile('fys')}
                  className={`px-2.5 py-1 rounded text-[11.5px] font-medium transition-colors ${
                    profile === 'fys'
                      ? 'bg-white dark:bg-[#2C2C2C] text-[#0067C0] dark:text-[#60CDFF] shadow-sm'
                      : 'text-[#5D5D5D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F3F3F3]'
                  }`}
                >
                  FYS 风云社 (v5)
                </button>
                <button
                  onClick={() => setProfile('exg')}
                  className={`px-2.5 py-1 rounded text-[11.5px] font-medium transition-colors ${
                    profile === 'exg'
                      ? 'bg-white dark:bg-[#2C2C2C] text-[#0067C0] dark:text-[#60CDFF] shadow-sm'
                      : 'text-[#5D5D5D] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F3F3F3]'
                  }`}
                >
                  EXG / ZED
                </button>
              </div>

              {profile === 'fys' ? (
                <button
                  onClick={() => window.cs2Api?.shell.openExternal(FYS_REFERENCE_URL)}
                  className="h-7 px-2 fluent-btn-standard text-[11px] inline-flex items-center gap-1 text-[#5D5D5D] dark:text-[#A0A0A0]"
                  title="查看风云社官方《玩家指令v5最终修订版[全模式]》帖子"
                >
                  <ExternalLink className="w-3 h-3" /> v5原帖
                </button>
              ) : (
                <button
                  onClick={() => window.cs2Api?.shell.openExternal(EXG_CFG_REFERENCE_URL)}
                  className="h-7 px-2 fluent-btn-standard text-[11px] inline-flex items-center gap-1 text-[#5D5D5D] dark:text-[#A0A0A0]"
                  title="查看 EXG 论坛《EXG专用CFG大合集》帖子"
                >
                  <ExternalLink className="w-3 h-3" /> CFG原帖
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5D5D5D] dark:text-[#A0A0A0] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                profile === 'fys'
                  ? '搜索风云社指令，如 .hide、.nade、.bizon、血针、魔兽、指挥官...'
                  : '搜索 EXG 指令，如 tp、.hide、.xz、越肩、灵魂出窍、后视镜、一键开枪、夜视仪...'
              }
              className="w-full h-8 pl-8 pr-7 fluent-input text-[12px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5D5D5D] hover:text-[#1A1A1A] dark:hover:text-[#F3F3F3]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs (Fluent Pivot) */}
          {!searchQuery.trim() && (
            <div className="flex flex-wrap gap-1 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
              {categories.map((cat) => {
                const active = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                      active
                        ? 'bg-black/[0.05] dark:bg-white/[0.08] text-[#0067C0] dark:text-[#60CDFF]'
                        : 'text-[#5D5D5D] dark:text-[#A0A0A0] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {cat}
                    {active && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full bg-[#0067C0] dark:bg-[#60CDFF]" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Preset List */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {groupedPresets.length === 0 ? (
              <div className="py-12 text-center text-[12.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
                未找到匹配「{searchQuery}」的指令
              </div>
            ) : (
              groupedPresets.map((group) => (
                <div key={group.title || 'default'} className="space-y-1.5">
                  {group.title && (
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5D5D5D] dark:text-[#9A9A9A] px-1 pt-1">
                      {group.title}
                    </div>
                  )}
                  {group.items.map((preset) => {
                    const currentKey = (keyMap[preset.id] ?? preset.defaultKey).trim()
                    const existing = currentKey
                      ? existingBinds.get(currentKey.toLowerCase())
                      : undefined
                    const currentParam = preset.hasParam
                      ? (paramMap[preset.id] ?? preset.defaultParam ?? '').trim()
                      : ''
                    const expectedCmd = preset.isKeyTemplate
                      ? preset.bindMatchCmd || ''
                      : preset.hasParam && currentParam
                        ? `${preset.command} ${currentParam}`
                        : preset.command
                    const isSameBound =
                      !preset.isDirectCvar &&
                      Boolean(expectedCmd) &&
                      existing &&
                      existing.command.trim().toLowerCase() === expectedCmd.trim().toLowerCase()
                    const isConflictBound =
                      !preset.isDirectCvar && !preset.isKeyTemplate && existing && !isSameBound
                    const isTemplateKeyUsed =
                      Boolean(preset.isKeyTemplate) && existing && !isSameBound
                    const cs2Conflict =
                      !preset.isDirectCvar && currentKey
                        ? getCs2Conflict(currentKey, expectedCmd)
                        : null

                    return (
                      <div
                        key={preset.id}
                        className="rounded-md bg-[#F9F9F9] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] p-2.5 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F3F3F3]">
                                {preset.label}
                              </span>
                              <code className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-[11px] text-[#0067C0] dark:text-[#60CDFF]">
                                {preset.cmdDisplay}
                              </code>
                              {isSameBound && (
                                <span className="px-1.5 py-0.5 rounded bg-[#0F7B0F]/10 dark:bg-[#6CCB5F]/15 text-[#0F7B0F] dark:text-[#6CCB5F] text-[10px] font-medium">
                                  已绑定
                                </span>
                              )}
                              {isConflictBound && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-[#9D5D00]/10 dark:bg-[#FCE100]/15 text-[#9D5D00] dark:text-[#FCE100] text-[10px] font-medium inline-flex items-center gap-0.5"
                                  title={`当前 CFG 中 ${existing.key} 已绑定为 "${existing.command}"，避免重复按键；点击替换将覆盖原绑定`}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  CFG 冲突 ({existing.key})
                                </span>
                              )}
                              {isTemplateKeyUsed && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-[#9D5D00]/10 dark:bg-[#FCE100]/15 text-[#9D5D00] dark:text-[#FCE100] text-[10px] font-medium inline-flex items-center gap-0.5"
                                  title={`当前 CFG 中按键 ${existing.key} 已有绑定 "${existing.command}"，请勿重复绑定`}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  CFG 已占用 ({existing.key})
                                </span>
                              )}
                              {cs2Conflict && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-[#C42B1C]/10 dark:bg-[#FF99A4]/15 text-[#C42B1C] dark:text-[#FF99A4] text-[10px] font-medium inline-flex items-center gap-0.5"
                                  title={`CS2 ${cs2KeysLoaded ? '本地按键配置' : '默认键位'}已将 ${currentKey} 绑定为「${formatCs2CommandLabel(cs2Conflict)}」，建议更换按键避免冲突`}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  CS2 已绑: {formatCs2CommandLabel(cs2Conflict)}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-0.5 leading-snug">
                              {preset.desc}
                              {preset.note && (
                                <span className="ml-1.5 text-[#0067C0]/80 dark:text-[#60CDFF]/80">
                                  ({preset.note})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!preset.isDirectCvar && (() => {
                              const isCapturingKey =
                                capturingTarget?.presetId === preset.id &&
                                capturingTarget.field === 'key'
                              const boundKey = keyMap[preset.id] ?? ''
                              return (
                                <div className="relative flex items-center">
                                  <button
                                    type="button"
                                    data-keybind-capture={`${preset.id}:key`}
                                    onClick={() =>
                                      setCapturingTarget(
                                        isCapturingKey
                                          ? null
                                          : { presetId: preset.id, field: 'key' }
                                      )
                                    }
                                    className={`min-w-[74px] h-7 px-2 rounded-md border font-mono text-[11.5px] transition-colors flex items-center justify-center ${
                                      isCapturingKey
                                        ? 'border-[#0067C0] dark:border-[#60CDFF] bg-[#0067C0]/10 dark:bg-[#60CDFF]/15 text-[#0067C0] dark:text-[#60CDFF] animate-pulse'
                                        : boundKey
                                          ? 'fluent-input text-[#1A1A1A] dark:text-[#F3F3F3] hover:border-[#0067C0]/60 dark:hover:border-[#60CDFF]/60 pr-5'
                                          : 'fluent-input text-[#5D5D5D] dark:text-[#8E8E8E] hover:border-[#0067C0]/60 dark:hover:border-[#60CDFF]/60'
                                    }`}
                                    title={
                                      isCapturingKey
                                        ? '请按下键盘任意键、鼠标中键/右键/侧键或滚轮（按 Esc 取消）'
                                        : '点击后按下要绑定的按键（支持键盘、鼠标中键/右键/侧键、滚轮）'
                                    }
                                  >
                                    {isCapturingKey ? '请按键...' : boundKey || '点击按键'}
                                  </button>
                                  {boundKey && !isCapturingKey && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setKeyMap((prev) => ({ ...prev, [preset.id]: '' }))
                                      }}
                                      className="absolute right-1 text-[#767676] hover:text-[#1A1A1A] dark:hover:text-[#F3F3F3] p-0.5"
                                      title="清除按键"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              )
                            })()}
                            <button
                              onClick={() => handleInsertPreset(preset)}
                              className="h-7 px-2.5 fluent-btn-accent text-[11.5px] inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> {isConflictBound ? '替换' : '写入'}
                            </button>
                          </div>
                        </div>

                        {preset.hasParam && (
                          <div className="flex items-center gap-2 pl-0.5">
                            <span className="text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0] shrink-0">
                              {preset.paramLabel || '参数'}:
                            </span>
                            {preset.paramIsKey ? (() => {
                              const isCapturingParam =
                                capturingTarget?.presetId === preset.id &&
                                capturingTarget.field === 'param'
                              const paramKey = paramMap[preset.id] ?? ''
                              const paramCfgExisting = paramKey
                                ? existingBinds.get(paramKey.toLowerCase())
                                : undefined
                              const paramCs2Conflict = paramKey ? getCs2Conflict(paramKey) : null
                              return (
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <div className="relative flex items-center">
                                    <button
                                      type="button"
                                      data-keybind-capture={`${preset.id}:param`}
                                      onClick={() =>
                                        setCapturingTarget(
                                          isCapturingParam
                                            ? null
                                            : { presetId: preset.id, field: 'param' }
                                        )
                                      }
                                      className={`min-w-[92px] h-6.5 px-2.5 rounded-md border font-mono text-[11.5px] transition-colors flex items-center justify-center ${
                                        isCapturingParam
                                          ? 'border-[#0067C0] dark:border-[#60CDFF] bg-[#0067C0]/10 dark:bg-[#60CDFF]/15 text-[#0067C0] dark:text-[#60CDFF] animate-pulse'
                                          : paramKey
                                            ? 'fluent-input text-[#1A1A1A] dark:text-[#F3F3F3] hover:border-[#0067C0]/60 dark:hover:border-[#60CDFF]/60 pr-5'
                                            : 'fluent-input text-[#5D5D5D] dark:text-[#8E8E8E] hover:border-[#0067C0]/60 dark:hover:border-[#60CDFF]/60'
                                      }`}
                                      title={
                                        isCapturingParam
                                          ? '请按下键盘任意键、鼠标中键/右键/侧键或滚轮（按 Esc 取消）'
                                          : '点击后按下要绑定的按键'
                                      }
                                    >
                                      {isCapturingParam ? '请按键...' : paramKey || '点击按键'}
                                    </button>
                                    {paramKey && !isCapturingParam && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setParamMap((prev) => ({ ...prev, [preset.id]: '' }))
                                        }}
                                        className="absolute right-1 text-[#767676] hover:text-[#1A1A1A] dark:hover:text-[#F3F3F3] p-0.5"
                                        title="清除按键"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                  {paramCfgExisting && (
                                    <span
                                      className="px-1.5 py-0.5 rounded bg-[#9D5D00]/10 dark:bg-[#FCE100]/15 text-[#9D5D00] dark:text-[#FCE100] text-[10px] font-medium"
                                      title={`当前 CFG 已将 ${paramKey} 绑定为 "${paramCfgExisting.command}"`}
                                    >
                                      CFG 已占用
                                    </span>
                                  )}
                                  {paramCs2Conflict && (
                                    <span
                                      className="px-1.5 py-0.5 rounded bg-[#C42B1C]/10 dark:bg-[#FF99A4]/15 text-[#C42B1C] dark:text-[#FF99A4] text-[10px] font-medium"
                                      title={`CS2 已将 ${paramKey} 绑定为「${formatCs2CommandLabel(paramCs2Conflict)}」`}
                                    >
                                      CS2 已绑: {formatCs2CommandLabel(paramCs2Conflict)}
                                    </span>
                                  )}
                                </div>
                              )
                            })() : (
                              <input
                                type="text"
                                value={paramMap[preset.id] ?? ''}
                                onChange={(e) =>
                                  setParamMap((prev) => ({
                                    ...prev,
                                    [preset.id]: e.target.value
                                  }))
                                }
                                placeholder={preset.paramPlaceholder || '输入参数'}
                                className="flex-1 h-6.5 px-2 fluent-input font-mono text-[11.5px]"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: CFG File Switcher + Code Editor */}
        <div className="lg:col-span-6 fluent-card p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-[#0067C0] dark:text-[#60CDFF]" />
              <select
                value={activeFile}
                onChange={(e) => loadFile(e.target.value)}
                className="h-8 px-2.5 fluent-input text-[12.5px] font-mono"
              >
                {allFileOptions.map((name) => (
                  <option key={name} value={name}>
                    {name === 'autoexec.cfg' ? 'autoexec.cfg（推荐自动加载）' : name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setNewFileName(profile === 'fys' ? 'fys_ze.cfg' : 'exg_ze.cfg')
                  setNewFileOpen((v) => !v)
                }}
                className="h-8 px-2.5 fluent-btn-standard text-[11.5px] inline-flex items-center gap-1"
                title="新建独立 CFG 文件（例如按社区拆分 fys_ze.cfg / exg_ze.cfg）"
              >
                <FilePlus2 className="w-3.5 h-3.5" /> 新建
              </button>
              <button
                onClick={refreshFiles}
                className="w-8 h-8 fluent-btn-standard flex items-center justify-center"
                title="刷新 cfg 文件列表"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const arg = `+exec ${activeFile}`
                  navigator.clipboard.writeText(arg)
                  setStatusMsg({ type: 'success', text: `已复制启动项参数：${arg}` })
                }}
                className="h-8 px-2.5 fluent-btn-standard text-[11.5px] inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Copy className="w-3 h-3" /> 复制 +exec
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-8 px-3 fluent-btn-accent text-[11.5px] inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                title={cs2Path ? `保存 ${activeFile} (Ctrl+S)` : '点击先选择 CS2 安装路径并保存'}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? '保存中...' : '保存'}
                {isDirty && !saving && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#001F33]" title="有未保存修改" />
                )}
              </button>
            </div>
          </div>

          {newFileOpen && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNewFile()
                }}
                placeholder="输入文件名，如 fys_ze.cfg"
                className="flex-1 h-7 px-2 fluent-input font-mono text-[12px]"
                autoFocus
              />
              <button
                onClick={handleCreateNewFile}
                className="h-7 px-3 fluent-btn-accent text-[11.5px]"
              >
                创建并打开
              </button>
              <button
                onClick={() => setNewFileOpen(false)}
                className="h-7 px-2 fluent-btn-standard text-[11.5px]"
              >
                取消
              </button>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="w-full h-[520px] p-3.5 rounded-md bg-[#FAFAFA] dark:bg-[#1C1C1C] border border-black/[0.08] dark:border-white/[0.08] font-mono text-[12.5px] leading-relaxed text-[#1A1A1A] dark:text-[#E6E6E6] outline-none focus:border-[#0067C0] dark:focus:border-[#60CDFF] resize-none"
            placeholder="// 在此编写或点击左侧社区快捷指令自动生成 CFG 配置..."
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
            <span className="inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              按 <code className="font-mono">Ctrl+S</code> 保存，CS2 控制台输入{' '}
              <code className="font-mono">exec {activeFile}</code> 生效
              <span className="opacity-75">
                · {cs2KeysLoaded ? '已加载 CS2 本地键位检测' : '已启用 CS2 默认键位检测'}
              </span>
            </span>
            <span className="font-mono inline-flex flex-wrap items-center gap-2">
              {cfgDuplicateKeys.length > 0 && (
                <span
                  className="text-[#9D5D00] dark:text-[#FCE100] font-sans font-medium inline-flex items-center gap-1"
                  title={`当前 CFG 内存在重复 bind 按键：${cfgDuplicateKeys.join(', ')}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  重复绑定: {cfgDuplicateKeys.join(', ')}
                </span>
              )}
              {isDirty && (
                <span className="text-[#9D5D00] dark:text-[#FCE100] font-sans font-medium">未保存</span>
              )}
              <span>
                {existingBinds.size} 个绑定 · {content.split('\n').length} 行
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
