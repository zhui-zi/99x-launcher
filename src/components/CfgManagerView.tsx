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
  CFG_PRESETS,
  EXG_CATEGORIES,
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
  activeCommunity: CommunityId
  onPickCs2Path: () => Promise<void>
}

interface ParsedBind {
  key: string
  command: string
  lineIndex: number
}

function parseExistingBinds(cfgText: string): Map<string, ParsedBind> {
  const map = new Map<string, ParsedBind>()
  const lines = cfgText.split(/\r?\n/)
  const bindRe = /^\s*bind\s+"?([^"\s]+)"?\s+"([^"]*)"/i
  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) return
    const m = bindRe.exec(trimmed)
    if (m) {
      map.set(m[1].toLowerCase(), { key: m[1], command: m[2], lineIndex: idx })
    }
  })
  return map
}

export const CfgManagerView: React.FC<CfgManagerViewProps> = ({
  cs2Path,
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
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newFileOpen, setNewFileOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')

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

  const existingBinds = useMemo(() => parseExistingBinds(content), [content])

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
    } else {
      const tag = profile === 'fys' ? 'FYS 风云社' : 'EXG / ZED 社区'
      setContent(
        `// 99x launcher - CS2 ${tag} 自动加载配置 (${fileName})\n// 请确保 Steam 启动项包含 +exec ${fileName}\n\n`
      )
    }
  }

  useEffect(() => {
    if (cs2Path) {
      refreshFiles()
      loadFile('autoexec.cfg')
    }
  }, [cs2Path])

  const buildCommandText = (preset: CfgCmdPreset): string | null => {
    if (preset.isDirectCvar) return preset.command
    if (!preset.hasParam) return preset.command
    const param = (paramMap[preset.id] ?? preset.defaultParam ?? '').trim()
    if (preset.paramRequired && !param) {
      setStatusMsg({
        ok: false,
        text: `指令「${preset.cmdDisplay}」需要填写参数（例如：${preset.paramPlaceholder || preset.defaultParam}）`
      })
      return null
    }
    return param ? `${preset.command} ${param}` : preset.command
  }

  const appendLines = (lines: string, label: string) => {
    setContent((prev) => {
      const sep = prev.endsWith('\n') || !prev ? '' : '\n'
      return `${prev}${sep}// ${label}\n${lines}\n`
    })
    setStatusMsg({
      ok: true,
      text: `已将「${label}」写入编辑器，记得点击右上角「保存 ${activeFile}」写入磁盘`
    })
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
        ok: false,
        text: `请先为「${preset.label}」输入要绑定的按键（例如 F1、h、v、mouse4、kp_1）`
      })
      return
    }

    const newBindLine = `bind "${key}" "${cmdText}"`
    const existing = existingBinds.get(key.toLowerCase())

    if (existing) {
      // Replace existing bind for the same key in-place to avoid duplicate conflicting binds
      setContent((prev) => {
        const lines = prev.split(/\r?\n/)
        if (existing.lineIndex >= 0 && existing.lineIndex < lines.length) {
          lines[existing.lineIndex] = newBindLine
        }
        return lines.join('\n')
      })
      setStatusMsg({
        ok: true,
        text: `已更新按键「${key}」绑定为 ${cmdText}（已自动替换原绑定，记得保存）`
      })
      return
    }

    appendLines(newBindLine, `${preset.label} (${preset.cmdDisplay})`)
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
    if (!window.cs2Api || !cs2Path) return
    setSaving(true)
    try {
      const res = await window.cs2Api.cfg.write(cs2Path, activeFile, content)
      if (res.success) {
        setStatusMsg({
          ok: true,
          text: `已保存至 ${res.filePath}（已自动保留首次 .bak 备份）`
        })
        await refreshFiles()
      } else {
        setStatusMsg({ ok: false, text: res.error || '保存失败' })
      }
    } finally {
      setSaving(false)
    }
  }

  const allFileOptions = useMemo(() => {
    const names = new Set<string>(['autoexec.cfg'])
    for (const f of files) names.add(f.name)
    if (activeFile) names.add(activeFile)
    return Array.from(names)
  }, [files, activeFile])

  return (
    <div className="p-6 space-y-5 max-w-[1440px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A1A] dark:text-[#F3F3F3]">
            CFG 配置与社区指令绑定
          </h1>
          <p className="text-[12.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-0.5">
            可视化生成并管理 CS2 <code className="font-mono">autoexec.cfg</code>，内置{' '}
            <span className="font-medium text-[#1A1A1A] dark:text-[#E6E6E6]">
              FYS 风云社 v5 全模式指令（.前缀）
            </span>{' '}
            与 EXG / ZED 指令库（!前缀）
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleInsertBundle}
            className="h-8 px-3.5 fluent-btn-standard text-[12.5px] inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF]" />
            {profile === 'fys' ? '一键生成 FYS 风云社 ZE 套装' : '一键生成 EXG 推荐配置'}
          </button>
          {cfgDir && (
            <button
              onClick={() => window.cs2Api?.maps.openFolder(cfgDir)}
              className="h-8 px-3 fluent-btn-standard text-[12.5px] inline-flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" /> 打开 cfg 目录
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !cs2Path}
            className="h-8 px-4 fluent-btn-accent text-[12.5px] inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? '保存中...' : `保存 ${activeFile}`}
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
            statusMsg.ok
              ? 'border-l-[#0F7B0F] dark:border-l-[#6CCB5F] text-[#0F7B0F] dark:text-[#6CCB5F]'
              : 'border-l-[#C42B1C] dark:border-l-[#FF99A4] text-[#C42B1C] dark:text-[#FF99A4]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{statusMsg.text}</span>
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

              {profile === 'fys' && (
                <button
                  onClick={() => window.cs2Api?.shell.openExternal(FYS_REFERENCE_URL)}
                  className="h-7 px-2 fluent-btn-standard text-[11px] inline-flex items-center gap-1 text-[#5D5D5D] dark:text-[#A0A0A0]"
                  title="查看风云社官方《玩家指令v5最终修订版[全模式]》帖子"
                >
                  <ExternalLink className="w-3 h-3" /> v5原帖
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
                  : '搜索 EXG 指令，如 !hide、!bizon、!ztele...'
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
                    const expectedCmd =
                      preset.hasParam && currentParam
                        ? `${preset.command} ${currentParam}`
                        : preset.command
                    const isSameBound =
                      !preset.isDirectCvar &&
                      existing &&
                      existing.command.trim().toLowerCase() === expectedCmd.trim().toLowerCase()
                    const isConflictBound =
                      !preset.isDirectCvar && existing && !isSameBound

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
                                  className="px-1.5 py-0.5 rounded bg-[#9D5D00]/10 dark:bg-[#FCE100]/15 text-[#9D5D00] dark:text-[#FCE100] text-[10px] font-medium"
                                  title={`当前 ${existing.key} 已绑定为 "${existing.command}"，点击写入将自动替换`}
                                >
                                  将替换 {existing.key}
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
                            {!preset.isDirectCvar && (
                              <input
                                type="text"
                                value={keyMap[preset.id] ?? ''}
                                onChange={(e) =>
                                  setKeyMap((prev) => ({
                                    ...prev,
                                    [preset.id]: e.target.value
                                  }))
                                }
                                placeholder="按键"
                                className="w-16 h-7 px-1.5 fluent-input font-mono text-[11.5px] text-center"
                                title="自定义绑定按键，如 F1, h, v, mouse4, kp_1"
                              />
                            )}
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
                              参数:
                            </span>
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const arg = `+exec ${activeFile}`
                  navigator.clipboard.writeText(arg)
                  setStatusMsg({ ok: true, text: `已复制启动项参数：${arg}` })
                }}
                className="h-7 px-2.5 fluent-btn-standard text-[11.5px] inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> 复制 +exec 参数
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
              提示：保存后可在 CS2 控制台输入 <code className="font-mono">exec {activeFile}</code> 立即生效
            </span>
            <span className="font-mono">
              {existingBinds.size} 个绑定 · {content.split('\n').length} 行
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
