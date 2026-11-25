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
  Trash2,
  Blocks,
  Code2,
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
  analyzeCfgContent,
  removeLineRangeFromCfg,
  upsertModuleInCfg,
  type InstalledCfgModule
} from '../utils/cfgModules'
import {
  CFG_PRESETS,
  EXG_CATEGORIES,
  EXG_CFG_REFERENCE_URL,
  FYS_CATEGORIES,
  FYS_REFERENCE_URL,
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

const FYS_BUNDLE_IDS = [
  'fys_hide',
  'fys_ztele',
  'fys_tp',
  'fys_stopsound',
  'fys_sm',
  'fys_su',
  'fys_ehud',
  'fys_h',
  'fys_k',
  'fys_if',
  'fys_nade',
  'fys_ices',
  'fys_fire',
  'fys_push',
  'fys_hole',
  'fys_rebuy',
  'fys_bizon',
  'fys_p90',
  'fys_negev',
  'fys_m4a1',
  'fys_ak47',
  'common_mwheel',
  'common_voice',
  'common_fps'
]

const EXG_BUNDLE_IDS = [
  'exg_multi_input',
  'exg_hide',
  'exg_ztele',
  'exg_qs',
  'exg_jy',
  'exg_hud',
  'exg_nv',
  'exg_tp',
  'exg_rtv',
  'exg_nomlist',
  'exg_xz',
  'exg_fdy',
  'exg_mm',
  'exg_he',
  'exg_dec',
  'exg_smoke',
  'exg_bizon',
  'exg_p90',
  'exg_negev',
  'exg_m4s',
  'exg_ak',
  'exg_ysylj',
  'exg_shake_stop',
  'exg_console_clean',
  'common_mwheel',
  'common_voice',
  'common_fps'
]

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
  const [installFilter, setInstallFilter] = useState<'all' | 'installed' | 'uninstalled'>('all')
  const [rightTab, setRightTab] = useState<'modules' | 'code'>('modules')
  const [newFileOpen, setNewFileOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [confirmDeleteFile, setConfirmDeleteFile] = useState(false)
  const [capturingTarget, setCapturingTarget] = useState<{
    presetId: string
    field: 'key' | 'param'
    autoUpdate?: boolean
  } | null>(null)

  const isDirty = content !== savedContent

  const categories = profile === 'fys' ? FYS_CATEGORIES : EXG_CATEGORIES
  const [activeCategory, setActiveCategory] = useState<string>(categories[0])

  // Keybinds start completely empty by default (no pre-filled keys); user presses keys to bind
  const [keyMap, setKeyMap] = useState<Record<string, string>>({})

  // Non-key parameters keep sensible defaults; key-type parameters (paramIsKey) start empty
  const [paramMap, setParamMap] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const p of CFG_PRESETS) {
      if (p.hasParam) {
        init[p.id] = p.paramIsKey ? '' : p.defaultParam ?? ''
      }
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

  // Parse current CFG content into modular blocks, binds, duplicates, and unmatched manual binds
  const cfgAnalysis = useMemo(
    () => analyzeCfgContent(content, CFG_PRESETS, profile),
    [content, profile]
  )
  const existingBinds = cfgAnalysis.binds
  const cfgDuplicateKeys = cfgAnalysis.duplicateKeys
  const installedByPresetId = cfgAnalysis.byPresetId
  const installedModules = cfgAnalysis.installedList
  const unmatchedBinds = cfgAnalysis.unmatchedBinds

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

  const profilePool = useMemo(
    () => CFG_PRESETS.filter((p) => p.profile === profile || p.profile === 'common'),
    [profile]
  )

  const installedCountInProfile = useMemo(
    () => profilePool.filter((p) => installedByPresetId.has(p.id)).length,
    [profilePool, installedByPresetId]
  )

  const visiblePresets = useMemo(() => {
    let pool = profilePool
    if (installFilter === 'installed') {
      pool = pool.filter((p) => installedByPresetId.has(p.id))
    } else if (installFilter === 'uninstalled') {
      pool = pool.filter((p) => !installedByPresetId.has(p.id))
    }

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
    if (installFilter === 'installed') {
      return pool
    }
    return pool.filter((p) => p.category === activeCategory)
  }, [profilePool, activeCategory, searchQuery, installFilter, installedByPresetId])

  // Group visible presets by subGroup (or category when searching / viewing installed filter)
  const groupedPresets = useMemo(() => {
    const groups: Array<{ title: string; items: CfgCmdPreset[] }> = []
    const indexByTitle = new Map<string, number>()
    const showCategoryTitle = searchQuery.trim().length > 0 || installFilter === 'installed'

    for (const item of visiblePresets) {
      const title = showCategoryTitle
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
  }, [visiblePresets, searchQuery, installFilter])

  const getEffectiveKey = (preset: CfgCmdPreset): string => {
    if (Object.prototype.hasOwnProperty.call(keyMap, preset.id)) {
      return (keyMap[preset.id] || '').trim()
    }
    return (installedByPresetId.get(preset.id)?.boundKey || '').trim()
  }

  const getEffectiveParam = (preset: CfgCmdPreset): string => {
    if (!preset.hasParam) return ''
    const installedParam = installedByPresetId.get(preset.id)?.boundParam
    if (preset.paramIsKey) {
      if (Object.prototype.hasOwnProperty.call(paramMap, preset.id) && paramMap[preset.id] !== '') {
        return paramMap[preset.id].trim()
      }
      return (installedParam || '').trim()
    }
    return (paramMap[preset.id] ?? installedParam ?? preset.defaultParam ?? '').trim()
  }

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
    setConfirmDeleteFile(false)
    setKeyMap({})
    const res = await window.cs2Api.cfg.read(cs2Path, fileName)
    if (res.exists) {
      setContent(res.content)
      setSavedContent(res.content)
    } else {
      const tag = profile === 'fys' ? 'FYS 风云社' : 'EXG / ZED 社区'
      const initial = `// 99x launcher - CS2 ${tag} 模块化配置 (${fileName})\n// 请确保 Steam 启动项包含 +exec ${fileName}\n\n`
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
    if (lowerExpected && (lowerExpected === lowerCs2 || lowerExpected.includes(lowerCs2))) {
      return null
    }
    return cs2Cmd
  }

  const buildCommandText = (preset: CfgCmdPreset, overrideParam?: string): string | null => {
    if (!preset.hasParam) return preset.command
    const param = (overrideParam !== undefined ? overrideParam : getEffectiveParam(preset)).trim()
    if (preset.paramRequired && !param) {
      setStatusMsg({
        type: 'error',
        text: `指令「${preset.label}」需要先设置${preset.paramLabel || '参数'}`
      })
      if (preset.paramIsKey) {
        setCapturingTarget({ presetId: preset.id, field: 'param' })
      }
      return null
    }
    if (preset.command.includes('{{PARAM}}')) {
      return preset.command.replace(/\{\{PARAM\}\}/g, param)
    }
    if (preset.isDirectCvar) return preset.command
    return param ? `${preset.command} ${param}` : preset.command
  }

  const applyPresetModule = (
    preset: CfgCmdPreset,
    overrideKey?: string,
    overrideParam?: string
  ) => {
    const cmdText = buildCommandText(preset, overrideParam)
    if (cmdText === null) return

    const existingMod = installedByPresetId.get(preset.id)

    if (preset.isDirectCvar) {
      setContent((prev) => upsertModuleInCfg(prev, preset, cmdText, existingMod))
      setStatusMsg({
        type: 'success',
        text: existingMod
          ? `已更新模块「${preset.label}」，记得按 Ctrl+S 保存`
          : `已添加模块「${preset.label}」，点击「保存 ${activeFile}」或按 Ctrl+S 写入磁盘`
      })
      return
    }

    const key = (overrideKey !== undefined ? overrideKey : getEffectiveKey(preset)).trim()
    if (!key) {
      setStatusMsg({
        type: 'error',
        text: `请先按下要为「${preset.label}」绑定的按键（支持键盘、鼠标中键/右键/侧键、滚轮）`
      })
      setCapturingTarget({ presetId: preset.id, field: 'key' })
      return
    }

    const body = preset.isKeyTemplate
      ? cmdText.replace(/\{\{KEY\}\}/g, key)
      : `bind "${key}" "${cmdText}"`

    const lowerKey = key.toLowerCase()
    const existingBind = existingBinds.get(lowerKey)
    const isSameModuleKey =
      existingMod && existingMod.boundKey.toLowerCase() === lowerKey
    const expectedCheck = preset.isKeyTemplate ? preset.bindMatchCmd || '' : cmdText
    const cs2Conflict = getCs2Conflict(key, expectedCheck)

    setContent((prev) => upsertModuleInCfg(prev, preset, body, existingMod, key))

    const warnings: string[] = []
    if (existingBind && !isSameModuleKey) {
      warnings.push(`当前 CFG 中「${key}」原绑定为 "${existingBind.command}"`)
    }
    if (cs2Conflict) {
      warnings.push(`CS2 原绑定为「${formatCs2CommandLabel(cs2Conflict)}」`)
    }

    if (warnings.length > 0) {
      setStatusMsg({
        type: 'warn',
        text: `${existingMod ? '已更新' : '已添加'}模块「${preset.label} (${key})」，但注意重复按键：${warnings.join('；')}`
      })
    } else {
      setStatusMsg({
        type: 'success',
        text: `${existingMod ? '已更新' : '已添加'}模块「${preset.label} (${key})」，按 Ctrl+S 保存生效`
      })
    }
  }

  const handleRemoveModule = (mod: InstalledCfgModule) => {
    setContent((prev) => removeLineRangeFromCfg(prev, mod.startLine, mod.endLine))
    setKeyMap((prev) => {
      const next = { ...prev }
      delete next[mod.presetId]
      return next
    })
    setStatusMsg({
      type: 'success',
      text: `已移除模块「${mod.preset.label}」，记得按 Ctrl+S 保存 ${activeFile}`
    })
  }

  const handleRemoveManualLine = (lineIndex: number, label: string) => {
    setContent((prev) => removeLineRangeFromCfg(prev, lineIndex, lineIndex))
    setStatusMsg({
      type: 'success',
      text: `已删除手动绑定「${label}」，记得按 Ctrl+S 保存`
    })
  }

  const handleInsertModularBundle = () => {
    const ids = profile === 'fys' ? FYS_BUNDLE_IDS : EXG_BUNDLE_IDS
    const presetMap = new Map(CFG_PRESETS.map((p) => [p.id, p]))
    let added = 0

    setContent((prev) => {
      let next = prev
      const currentAnalysis = analyzeCfgContent(next, CFG_PRESETS, profile)

      for (const id of ids) {
        const preset = presetMap.get(id)
        if (!preset || currentAnalysis.byPresetId.has(id)) continue

        if (preset.isDirectCvar) {
          next = upsertModuleInCfg(next, preset, preset.command)
          added++
          continue
        }

        const key = preset.defaultKey
        if (!key) continue
        const cmdText = preset.hasParam && preset.defaultParam
          ? preset.command.includes('{{PARAM}}')
            ? preset.command.replace(/\{\{PARAM\}\}/g, preset.defaultParam)
            : `${preset.command} ${preset.defaultParam}`
          : preset.command
        const body = preset.isKeyTemplate
          ? cmdText.replace(/\{\{KEY\}\}/g, key)
          : `bind "${key}" "${cmdText}"`
        next = upsertModuleInCfg(next, preset, body, undefined, key)
        added++
      }
      return next
    })

    if (added > 0) {
      setStatusMsg({
        type: 'success',
        text: `已以模块化方式装入 ${added} 个${profile === 'fys' ? ' FYS ' : ' EXG '}推荐模块（可在右侧「已装模块」随时单独改键或删除）`
      })
    } else {
      setStatusMsg({
        type: 'warn',
        text: '当前 CFG 已包含全部推荐套装模块，无需重复添加'
      })
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

  const handleDeleteCurrentFile = async () => {
    if (!window.cs2Api || !cs2Path) return
    const res = await window.cs2Api.cfg.delete(cs2Path, activeFile)
    setConfirmDeleteFile(false)
    if (res.success) {
      setStatusMsg({ type: 'success', text: `已删除 CFG 文件：${activeFile}` })
      await refreshFiles()
      await loadFile('autoexec.cfg')
    } else {
      setStatusMsg({ type: 'error', text: res.error || '删除 CFG 文件失败' })
    }
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
      const shouldAutoUpdate = Boolean(capturingTarget.autoUpdate)
      setCapturingTarget(null)

      if (shouldAutoUpdate && targetPreset) {
        applyPresetModule(
          targetPreset,
          capturingTarget.field === 'key' ? cs2Key : undefined,
          capturingTarget.field === 'param' ? cs2Key : undefined
        )
        return
      }

      // Immediate conflict check against current CFG and CS2 keybindings
      const lower = cs2Key.toLowerCase()
      const cfgExisting = existingBinds.get(lower)
      const installedMod = targetPreset ? installedByPresetId.get(targetPreset.id) : undefined
      const isOwnExistingKey =
        installedMod && installedMod.boundKey.toLowerCase() === lower
      const expectedCmd =
        capturingTarget.field === 'key' && targetPreset
          ? targetPreset.isKeyTemplate
            ? targetPreset.bindMatchCmd || ''
            : targetPreset.command
          : ''
      const cs2Conflict = getCs2Conflict(cs2Key, expectedCmd)

      const reasons: string[] = []
      if (cfgExisting && !isOwnExistingKey) {
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
      if (mapped) commitKey(mapped)
    }

    const onMouseDown = (e: MouseEvent) => {
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
  }, [capturingTarget, existingBinds, effectiveCs2Binds, cs2KeysLoaded, installedByPresetId])

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
            CFG 模块化配置中心
          </h1>
          <p className="text-[12.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-0.5">
            默认空键位按需录制、独立模块块管理（一键增删改）、自动检测 CS2 键位与 CFG 重复冲突
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleInsertModularBundle}
            className="h-8 px-3.5 fluent-btn-standard text-[12.5px] inline-flex items-center gap-1.5 whitespace-nowrap"
            title="以独立可删模块装入社区推荐套装（跳过已装模块）"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF]" />
            {profile === 'fys' ? '一键装入 FYS 推荐套装' : '一键装入 EXG 推荐套装'}
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
        {/* Left: Modular Command & Script Picker */}
        <div className="lg:col-span-6 fluent-card p-4 flex flex-col gap-3">
          {/* Profile Switcher + Reference Link */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[14px] font-semibold">
              <Keyboard className="w-4 h-4 text-[#0067C0] dark:text-[#60CDFF]" />
              <span>CFG 模块选择区</span>
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

          {/* Search Bar + Installed Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#5D5D5D] dark:text-[#A0A0A0] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  profile === 'fys'
                    ? '搜索风云社指令，如 .hide、.nade、.bizon、血针、魔兽...'
                    : '搜索 EXG 指令，如 tp、.bet、.hide、越肩、灵魂出窍、泛光、切T...'
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

            <div className="inline-flex rounded-md p-0.5 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[11px] shrink-0">
              {(
                [
                  { id: 'all', label: '全部' },
                  { id: 'installed', label: `已添加 (${installedCountInProfile})` },
                  { id: 'uninstalled', label: '未添加' }
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setInstallFilter(f.id)}
                  className={`px-2 py-1 rounded transition-colors ${
                    installFilter === f.id
                      ? 'bg-white dark:bg-[#2C2C2C] text-[#0067C0] dark:text-[#60CDFF] shadow-sm font-medium'
                      : 'text-[#5D5D5D] dark:text-[#A0A0A0]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs (Fluent Pivot) */}
          {!searchQuery.trim() && installFilter !== 'installed' && (
            <div className="flex flex-wrap gap-1 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
              {categories.map((cat) => {
                const active = activeCategory === cat
                const catInstalled = profilePool.filter(
                  (p) => p.category === cat && installedByPresetId.has(p.id)
                ).length
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors inline-flex items-center gap-1.5 ${
                      active
                        ? 'bg-black/[0.05] dark:bg-white/[0.08] text-[#0067C0] dark:text-[#60CDFF]'
                        : 'text-[#5D5D5D] dark:text-[#A0A0A0] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{cat}</span>
                    {catInstalled > 0 && (
                      <span className="px-1.5 py-0 rounded-full text-[10px] bg-[#0F7B0F]/15 dark:bg-[#6CCB5F]/20 text-[#0F7B0F] dark:text-[#6CCB5F] font-mono">
                        {catInstalled}
                      </span>
                    )}
                    {active && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full bg-[#0067C0] dark:bg-[#60CDFF]" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Preset List */}
          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {groupedPresets.length === 0 ? (
              <div className="py-12 text-center text-[12.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
                {installFilter === 'installed'
                  ? '当前 CFG 尚未添加任何可识别的社区模块'
                  : searchQuery
                    ? `未找到匹配「${searchQuery}」的指令`
                    : '该分类下暂无未添加模块'}
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
                    const installedMod = installedByPresetId.get(preset.id)
                    const currentKey = getEffectiveKey(preset)
                    const existing = currentKey
                      ? existingBinds.get(currentKey.toLowerCase())
                      : undefined
                    const currentParam = getEffectiveParam(preset)
                    const expectedCmd = preset.isKeyTemplate
                      ? preset.bindMatchCmd || ''
                      : preset.hasParam && currentParam
                        ? preset.command.includes('{{PARAM}}')
                          ? preset.command.replace(/\{\{PARAM\}\}/g, currentParam)
                          : `${preset.command} ${currentParam}`
                        : preset.command

                    const isOwnKey =
                      installedMod &&
                      installedMod.boundKey.toLowerCase() === currentKey.toLowerCase()
                    const isCfgConflict =
                      !preset.isDirectCvar &&
                      Boolean(existing) &&
                      !isOwnKey &&
                      existing!.command.trim().toLowerCase() !== expectedCmd.trim().toLowerCase()
                    const cs2Conflict =
                      !preset.isDirectCvar && currentKey
                        ? getCs2Conflict(currentKey, expectedCmd)
                        : null

                    const keyChanged =
                      Boolean(installedMod) &&
                      !preset.isDirectCvar &&
                      currentKey.toLowerCase() !== (installedMod?.boundKey || '').toLowerCase()
                    const paramChanged =
                      Boolean(installedMod) &&
                      Boolean(preset.hasParam) &&
                      currentParam !== (installedMod?.boundParam || '')

                    return (
                      <div
                        key={preset.id}
                        className={`rounded-md p-2.5 flex flex-col gap-2 border transition-colors ${
                          installedMod
                            ? 'bg-[#0F7B0F]/[0.04] dark:bg-[#6CCB5F]/[0.06] border-[#0F7B0F]/25 dark:border-[#6CCB5F]/25 border-l-[3px] border-l-[#0F7B0F] dark:border-l-[#6CCB5F]'
                            : 'bg-[#F9F9F9] dark:bg-white/[0.03] border-black/[0.05] dark:border-white/[0.06]'
                        }`}
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
                              {installedMod && (
                                <span className="px-1.5 py-0.5 rounded bg-[#0F7B0F]/15 dark:bg-[#6CCB5F]/20 text-[#0F7B0F] dark:text-[#6CCB5F] text-[10px] font-medium inline-flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  {installedMod.boundKey
                                    ? `已添加 · ${installedMod.boundKey}`
                                    : '已添加'}
                                </span>
                              )}
                              {isCfgConflict && existing && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-[#9D5D00]/10 dark:bg-[#FCE100]/15 text-[#9D5D00] dark:text-[#FCE100] text-[10px] font-medium inline-flex items-center gap-0.5"
                                  title={`当前 CFG 中 ${existing.key} 已绑定为 "${existing.command}"，避免重复按键`}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  CFG 冲突 ({existing.key})
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
                                        : currentKey
                                          ? 'fluent-input text-[#1A1A1A] dark:text-[#F3F3F3] hover:border-[#0067C0]/60 dark:hover:border-[#60CDFF]/60 pr-5'
                                          : 'fluent-input text-[#5D5D5D] dark:text-[#8E8E8E] hover:border-[#0067C0]/60 dark:hover:border-[#60CDFF]/60'
                                    }`}
                                    title={
                                      isCapturingKey
                                        ? '请按下键盘任意键、鼠标中键/右键/侧键或滚轮（按 Esc 取消）'
                                        : '点击后按下要绑定的按键（支持键盘、鼠标中键/右键/侧键、滚轮）'
                                    }
                                  >
                                    {isCapturingKey ? '请按键...' : currentKey || '点击按键'}
                                  </button>
                                  {currentKey && !isCapturingKey && (
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

                            {(!installedMod || keyChanged || paramChanged) && (
                              <button
                                onClick={() => applyPresetModule(preset)}
                                className="h-7 px-2.5 fluent-btn-accent text-[11.5px] inline-flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                {installedMod ? '更新' : '添加'}
                              </button>
                            )}

                            {installedMod && (
                              <button
                                onClick={() => handleRemoveModule(installedMod)}
                                className="h-7 px-2 rounded-md bg-[#C42B1C]/10 hover:bg-[#C42B1C]/20 text-[#C42B1C] dark:text-[#FF99A4] text-[11.5px] font-medium inline-flex items-center gap-1 transition-colors"
                                title="从当前 CFG 中一键移除该模块"
                              >
                                <Trash2 className="w-3 h-3" /> 移除
                              </button>
                            )}
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
                              const paramKey = currentParam
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

        {/* Right: Modular Manager & Source Code Editor */}
        <div className="lg:col-span-6 fluent-card p-4 flex flex-col gap-3">
          {/* File Switcher + Save Toolbar */}
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
                    {name === 'autoexec.cfg' ? 'autoexec.cfg（自动加载）' : name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setNewFileName(profile === 'fys' ? 'fys_ze.cfg' : 'exg_ze.cfg')
                  setNewFileOpen((v) => !v)
                }}
                className="h-8 px-2.5 fluent-btn-standard text-[11.5px] inline-flex items-center gap-1"
                title="新建独立 CFG 文件（可按社区或功能拆分模块文件）"
              >
                <FilePlus2 className="w-3.5 h-3.5" /> 新建
              </button>
              {activeFile.toLowerCase() !== 'autoexec.cfg' && (
                confirmDeleteFile ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={handleDeleteCurrentFile}
                      className="h-8 px-2.5 rounded-md bg-[#C42B1C] text-white text-[11.5px] font-medium"
                    >
                      确认删除
                    </button>
                    <button
                      onClick={() => setConfirmDeleteFile(false)}
                      className="h-8 px-2 fluent-btn-standard text-[11.5px]"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteFile(true)}
                    className="w-8 h-8 rounded-md bg-[#C42B1C]/10 hover:bg-[#C42B1C]/20 text-[#C42B1C] dark:text-[#FF99A4] flex items-center justify-center"
                    title={`删除文件 ${activeFile}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )
              )}
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
                <Copy className="w-3 h-3" /> +exec
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
                placeholder="输入文件名，如 exg_ze.cfg"
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

          {/* Right Pane View Mode Switcher: Modular Blocks vs Raw Code */}
          <div className="flex items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
            <div className="inline-flex rounded-md p-0.5 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]">
              <button
                onClick={() => setRightTab('modules')}
                className={`px-3 py-1 rounded text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                  rightTab === 'modules'
                    ? 'bg-white dark:bg-[#2C2C2C] text-[#0067C0] dark:text-[#60CDFF] shadow-sm'
                    : 'text-[#5D5D5D] dark:text-[#A0A0A0]'
                }`}
              >
                <Blocks className="w-3.5 h-3.5" />
                已装模块 ({installedModules.length + unmatchedBinds.length})
              </button>
              <button
                onClick={() => setRightTab('code')}
                className={`px-3 py-1 rounded text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                  rightTab === 'code'
                    ? 'bg-white dark:bg-[#2C2C2C] text-[#0067C0] dark:text-[#60CDFF] shadow-sm'
                    : 'text-[#5D5D5D] dark:text-[#A0A0A0]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                CFG 源码
              </button>
            </div>

            {installedModules.length > 0 && rightTab === 'modules' && (
              <span className="text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0]">
                点击按键框可直接改键，点垃圾桶一键删除模块
              </span>
            )}
          </div>

          {rightTab === 'modules' ? (
            <div className="h-[520px] overflow-y-auto pr-1 space-y-2">
              {installedModules.length === 0 && unmatchedBinds.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-2 text-[#5D5D5D] dark:text-[#A0A0A0]">
                  <Blocks className="w-8 h-8 opacity-40" />
                  <div className="text-[13px] font-medium">当前 {activeFile} 尚未装入任何 CFG 模块</div>
                  <div className="text-[11.5px] max-w-sm">
                    在左侧选择需要的指令或脚本，点击按键框按下你顺手的键再点「添加」，或点击右上角一键装入推荐套装。
                  </div>
                </div>
              ) : (
                <>
                  {installedModules.map((mod) => {
                    const isCapturingMod =
                      capturingTarget?.presetId === mod.presetId &&
                      capturingTarget.field === 'key' &&
                      capturingTarget.autoUpdate
                    const cs2Conflict = mod.boundKey
                      ? getCs2Conflict(
                          mod.boundKey,
                          mod.preset.isKeyTemplate ? mod.preset.bindMatchCmd || '' : mod.preset.command
                        )
                      : null

                    return (
                      <div
                        key={`${mod.presetId}_${mod.startLine}`}
                        className="rounded-md bg-[#F9F9F9] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] px-3 py-2 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[12.5px] font-medium text-[#1A1A1A] dark:text-[#F3F3F3]">
                              {mod.preset.label}
                            </span>
                            <code className="px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-[10.5px] text-[#0067C0] dark:text-[#60CDFF]">
                              {mod.preset.cmdDisplay}
                            </code>
                            {mod.boundParam && (
                              <span className="px-1.5 py-0.2 rounded bg-black/[0.04] dark:bg-white/[0.06] font-mono text-[10.5px] text-[#5D5D5D] dark:text-[#B5B5B5]">
                                {mod.preset.paramLabel || '参数'}: {mod.boundParam}
                              </span>
                            )}
                            {cs2Conflict && (
                              <span
                                className="px-1.5 py-0.2 rounded bg-[#C42B1C]/10 dark:bg-[#FF99A4]/15 text-[#C42B1C] dark:text-[#FF99A4] text-[10px] font-medium"
                                title={`CS2 原绑定为「${formatCs2CommandLabel(cs2Conflict)}」`}
                              >
                                CS2 冲突
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] text-[#5D5D5D] dark:text-[#9A9A9A] mt-0.5 truncate">
                            {mod.preset.category}
                            {mod.isMarked ? ' · 模块化块' : ' · 已识别旧配置'} · 第 {mod.startLine + 1}
                            {mod.endLine > mod.startLine ? `~${mod.endLine + 1}` : ''} 行
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!mod.preset.isDirectCvar && (
                            <button
                              type="button"
                              data-keybind-capture={`${mod.presetId}:key`}
                              onClick={() =>
                                setCapturingTarget(
                                  isCapturingMod
                                    ? null
                                    : { presetId: mod.presetId, field: 'key', autoUpdate: true }
                                )
                              }
                              className={`min-w-[68px] h-7 px-2 rounded-md border font-mono text-[11.5px] transition-colors flex items-center justify-center ${
                                isCapturingMod
                                  ? 'border-[#0067C0] dark:border-[#60CDFF] bg-[#0067C0]/10 dark:bg-[#60CDFF]/15 text-[#0067C0] dark:text-[#60CDFF] animate-pulse'
                                  : 'fluent-input text-[#1A1A1A] dark:text-[#F3F3F3] hover:border-[#0067C0]/60 dark:hover:border-[#60CDFF]/60'
                              }`}
                              title="点击后直接按下新按键立即更新该模块"
                            >
                              {isCapturingMod ? '请按键...' : mod.boundKey || '未绑键'}
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveModule(mod)}
                            className="w-7 h-7 rounded-md bg-[#C42B1C]/10 hover:bg-[#C42B1C]/20 text-[#C42B1C] dark:text-[#FF99A4] flex items-center justify-center transition-colors"
                            title={`移除模块「${mod.preset.label}」`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {unmatchedBinds.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5D5D5D] dark:text-[#9A9A9A] px-1">
                        自定义 / 手动绑定 ({unmatchedBinds.length})
                      </div>
                      {unmatchedBinds.map((b) => (
                        <div
                          key={`${b.key}_${b.lineIndex}`}
                          className="rounded-md bg-[#F9F9F9] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.06] px-3 py-1.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex items-center gap-2 font-mono text-[11.5px]">
                            <span className="px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.08] font-semibold shrink-0">
                              {b.key}
                            </span>
                            <span className="truncate text-[#5D5D5D] dark:text-[#C5C5C5]" title={b.command}>
                              {b.command}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveManualLine(b.lineIndex, `${b.key} → ${b.command}`)}
                            className="w-6.5 h-6.5 rounded bg-[#C42B1C]/10 hover:bg-[#C42B1C]/20 text-[#C42B1C] dark:text-[#FF99A4] flex items-center justify-center shrink-0"
                            title={`删除第 ${b.lineIndex + 1} 行绑定`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="w-full h-[520px] p-3.5 rounded-md bg-[#FAFAFA] dark:bg-[#1C1C1C] border border-black/[0.08] dark:border-white/[0.08] font-mono text-[12.5px] leading-relaxed text-[#1A1A1A] dark:text-[#E6E6E6] outline-none focus:border-[#0067C0] dark:focus:border-[#60CDFF] resize-none"
              placeholder="// 在此编写或从左侧选择模块化 CFG 指令自动装配..."
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
            <span className="inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              按 <code className="font-mono">Ctrl+S</code> 保存，控制台 <code className="font-mono">exec {activeFile}</code> 生效
              <span className="opacity-75">
                · {cs2KeysLoaded ? 'CS2 本地键位检测' : 'CS2 默认键位检测'}
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
                {installedModules.length} 模块 · {existingBinds.size} 绑定
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
