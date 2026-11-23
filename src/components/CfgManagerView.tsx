import React, { useEffect, useState } from 'react'
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
  Copy
} from 'lucide-react'
import type { CfgFileInfo } from '../types/server'

interface CfgManagerViewProps {
  cs2Path: string
  onPickCs2Path: () => Promise<void>
}

interface ExgCmdPreset {
  id: string
  category: 'EXG 快捷买枪' | 'EXG ZE 核心指令' | '游戏优化与操作'
  label: string
  desc: string
  defaultKey: string
  command: string // if empty key => direct console cvar/alias, else bind "<key>" "<command>"
  isDirectCvar?: boolean
}

const EXG_PRESETS: ExgCmdPreset[] = [
  // EXG 快捷买枪
  { id: 'bizon', category: 'EXG 快捷买枪', label: '买野牛 (!bizon)', desc: 'ZE 守点常用高弹容冲锋枪', defaultKey: 'F1', command: 'say !bizon' },
  { id: 'p90', category: 'EXG 快捷买枪', label: '买 P90 (!p90)', desc: '高机动守点冲锋枪', defaultKey: 'F2', command: 'say !p90' },
  { id: 'negev', category: 'EXG 快捷买枪', label: '买内格夫 (!negev)', desc: '火力压制机枪', defaultKey: 'F3', command: 'say !negev' },
  { id: 'he', category: 'EXG 快捷买枪', label: '买高爆手雷 (!he)', desc: '一键购买高爆雷减速僵尸', defaultKey: 'F4', command: 'say !he' },
  { id: 'kevlar', category: 'EXG 快捷买枪', label: '买护甲 (!kevlar)', desc: '快速补充护甲防抓', defaultKey: 'F5', command: 'say !kevlar' },
  { id: 'ammo', category: 'EXG 快捷买枪', label: '补充弹药 (!ammo)', desc: '一键补满当前武器备弹', defaultKey: 'v', command: 'say !ammo' },
  { id: 'ak', category: 'EXG 快捷买枪', label: '买 AK47 (!ak)', desc: '步枪火力输出', defaultKey: 'kp_1', command: 'say !ak' },
  { id: 'm4', category: 'EXG 快捷买枪', label: '买 M4A1 (!m4a1)', desc: '稳定精准步枪', defaultKey: 'kp_2', command: 'say !m4a1' },

  // EXG ZE 核心指令
  { id: 'hide', category: 'EXG ZE 核心指令', label: '隐藏队友 (!hide)', desc: '大幅提升帧数并防止队友挡视线', defaultKey: 'h', command: 'say !hide' },
  { id: 'ztele', category: 'EXG ZE 核心指令', label: '卡住回城 (!ztele)', desc: '卡模型/卡地形时紧急传送回出生点', defaultKey: 'z', command: 'say !ztele' },
  { id: 'tp', category: 'EXG ZE 核心指令', label: '第三人称 (!tp)', desc: '切换第一/第三人称视角（跳刀必备）', defaultKey: 't', command: 'say !tp' },
  { id: 'rtv', category: 'EXG ZE 核心指令', label: '投票换图 (!rtv)', desc: '发起或参与本图提前换图投票', defaultKey: 'F6', command: 'say !rtv' },
  { id: 'nominate', category: 'EXG ZE 核心指令', label: '预定地图 (!nominate)', desc: '打开 EXG 预定下一张地图菜单', defaultKey: 'F7', command: 'say !nominate' },
  { id: 'shop', category: 'EXG ZE 核心指令', label: '社区商店 (!shop)', desc: '打开 EXG 积分商城与模型菜单', defaultKey: 'F8', command: 'say !shop' },
  { id: 'stopsound', category: 'EXG ZE 核心指令', label: '静音枪声 (!stopsound)', desc: '屏蔽队友枪声，清晰听清指挥语音', defaultKey: 'n', command: 'say !stopsound' },
  { id: 'hud', category: 'EXG ZE 核心指令', label: '开关 HUD (!hud)', desc: '切换 EXG 社区状态栏显示', defaultKey: 'j', command: 'say !hud' },
  { id: 'spec', category: 'EXG ZE 核心指令', label: '切换观察者 (!spec)', desc: '快速进入观察者挂机/观战', defaultKey: 'F9', command: 'say !spec' },
  { id: 'zclass', category: 'EXG ZE 核心指令', label: '僵尸皮肤 (!zclass)', desc: '切换僵尸模型或职业菜单', defaultKey: 'F10', command: 'say !zclass' },

  // 游戏优化与操作
  { id: 'mwheel', category: '游戏优化与操作', label: '滚轮跳', desc: '上下滚轮绑定跳跃，ZE 滑翔/连跳必备', defaultKey: '', command: 'bind "mwheelup" "+jump"\nbind "mwheeldown" "+jump"', isDirectCvar: true },
  { id: 'fps', category: '游戏优化与操作', label: 'FPS 上限与网络优化', desc: 'fps_max 0 + 满带宽 rate + 帧率显示', defaultKey: '', command: 'fps_max "0"\nrate "786432"\ncl_showfps "1"\ncq_netgraph "1"', isDirectCvar: true },
  { id: 'voice', category: '游戏优化与操作', label: '切屏不断音 + 指挥语音', desc: '切回桌面保持声音，清晰接收 ZE 指挥', defaultKey: '', command: 'snd_mute_losefocus "0"\nsnd_voipvolume "0.85"', isDirectCvar: true },
  { id: 'jumpthrow', category: '游戏优化与操作', label: '大跳 / 蹲跳辅助', desc: '空格一键蹲跳，轻松上高箱子', defaultKey: 'space', command: '+duck; +jump', isDirectCvar: false }
]

const CATEGORIES: Array<ExgCmdPreset['category']> = [
  'EXG 快捷买枪',
  'EXG ZE 核心指令',
  '游戏优化与操作'
]

export const CfgManagerView: React.FC<CfgManagerViewProps> = ({ cs2Path, onPickCs2Path }) => {
  const [cfgDir, setCfgDir] = useState('')
  const [files, setFiles] = useState<CfgFileInfo[]>([])
  const [activeFile, setActiveFile] = useState('autoexec.cfg')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [activeCategory, setActiveCategory] = useState<ExgCmdPreset['category']>('EXG ZE 核心指令')
  const [keyMap, setKeyMap] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const p of EXG_PRESETS) init[p.id] = p.defaultKey
    return init
  })

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
      setContent(
        `// 99x launcher - CS2 EXG 社区自动加载配置 (${fileName})\n// 请确保 Steam 启动项包含 +exec autoexec.cfg\n\n`
      )
    }
  }

  useEffect(() => {
    if (cs2Path) {
      refreshFiles()
      loadFile('autoexec.cfg')
    }
  }, [cs2Path])

  const appendLines = (lines: string, label: string) => {
    setContent((prev) => {
      const sep = prev.endsWith('\n') || !prev ? '' : '\n'
      return `${prev}${sep}// ${label}\n${lines}\n`
    })
    setStatusMsg({ ok: true, text: `已将「${label}」追加到编辑器，记得点击右上角「保存配置」写入磁盘` })
  }

  const handleInsertPreset = (preset: ExgCmdPreset) => {
    if (preset.isDirectCvar) {
      appendLines(preset.command, preset.label)
      return
    }
    const key = (keyMap[preset.id] || preset.defaultKey).trim()
    if (!key) {
      setStatusMsg({ ok: false, text: '请先输入要绑定的按键（例如 F1、h、v、mouse4）' })
      return
    }
    appendLines(`bind "${key}" "${preset.command}"`, preset.label)
  }

  const handleInsertAllExgBundle = () => {
    const bundle = [
      '// === 99x launcher EXG ZE 推荐一键套装 ===',
      'bind "h" "say !hide"',
      'bind "z" "say !ztele"',
      'bind "t" "say !tp"',
      'bind "v" "say !ammo"',
      'bind "n" "say !stopsound"',
      'bind "F1" "say !bizon"',
      'bind "F2" "say !p90"',
      'bind "F3" "say !negev"',
      'bind "F4" "say !he"',
      'bind "F5" "say !kevlar"',
      'bind "F6" "say !rtv"',
      'bind "F7" "say !nominate"',
      'bind "mwheelup" "+jump"',
      'bind "mwheeldown" "+jump"',
      'snd_mute_losefocus "0"',
      'fps_max "0"',
      'host_writeconfig',
      'echo "[99x launcher] EXG autoexec loaded!"'
    ].join('\n')
    appendLines(bundle, 'EXG ZE 完整推荐绑定套装')
  }

  const handleSave = async () => {
    if (!window.cs2Api || !cs2Path) return
    setSaving(true)
    try {
      const res = await window.cs2Api.cfg.write(cs2Path, activeFile, content)
      if (res.success) {
        setStatusMsg({ ok: true, text: `已保存至 ${res.filePath}（已自动保留首次 .bak 备份）` })
        await refreshFiles()
      } else {
        setStatusMsg({ ok: false, text: res.error || '保存失败' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-[1380px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A1A] dark:text-[#F3F3F3]">
            CFG 配置与 EXG 指令绑定
          </h1>
          <p className="text-[12.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-0.5">
            可视化生成并管理 CS2 <code className="font-mono">autoexec.cfg</code>，全面兼容 EXG / ZED / FYS 社区买枪、!hide、!ztele 等指令
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInsertAllExgBundle}
            className="h-8 px-3.5 fluent-btn-standard text-[12.5px] inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF]" /> 一键生成 EXG 推荐配置
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
          className={`fluent-card px-4 py-2.5 text-[12.5px] flex items-center gap-2 border-l-4 ${
            statusMsg.ok
              ? 'border-l-[#0F7B0F] dark:border-l-[#6CCB5F] text-[#0F7B0F] dark:text-[#6CCB5F]'
              : 'border-l-[#C42B1C] dark:border-l-[#FF99A4] text-[#C42B1C] dark:text-[#FF99A4]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: EXG Command & Keybind Studio */}
        <div className="lg:col-span-5 fluent-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[14px] font-semibold">
              <Keyboard className="w-4 h-4 text-[#0067C0] dark:text-[#60CDFF]" />
              <span>EXG 社区快捷指令库</span>
            </div>
          </div>

          {/* Category Tabs (Fluent Pivot) */}
          <div className="flex gap-1 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    active
                      ? 'bg-black/[0.05] dark:bg-white/[0.08] text-[#0067C0] dark:text-[#60CDFF]'
                      : 'text-[#5D5D5D] dark:text-[#A0A0A0] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {cat}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#0067C0] dark:bg-[#60CDFF]" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Preset List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {EXG_PRESETS.filter((p) => p.category === activeCategory).map((preset) => (
              <div
                key={preset.id}
                className="rounded-md bg-[#F9F9F9] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F3F3F3]">
                    {preset.label}
                  </div>
                  <div className="text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-0.5">
                    {preset.desc}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!preset.isDirectCvar && (
                    <input
                      type="text"
                      value={keyMap[preset.id] || ''}
                      onChange={(e) =>
                        setKeyMap((prev) => ({ ...prev, [preset.id]: e.target.value }))
                      }
                      placeholder="按键"
                      className="w-16 h-7 px-2 fluent-input font-mono text-[11.5px] text-center"
                      title="自定义绑定按键，如 F1, h, mouse4, kp_1"
                    />
                  )}
                  <button
                    onClick={() => handleInsertPreset(preset)}
                    className="h-7 px-2.5 fluent-btn-accent text-[11.5px] inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> 写入
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CFG File Switcher + Code Editor */}
        <div className="lg:col-span-7 fluent-card p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-[#0067C0] dark:text-[#60CDFF]" />
              <select
                value={activeFile}
                onChange={(e) => loadFile(e.target.value)}
                className="h-8 px-2.5 fluent-input text-[12.5px] font-mono"
              >
                <option value="autoexec.cfg">autoexec.cfg（推荐自动加载）</option>
                {files
                  .filter((f) => f.name.toLowerCase() !== 'autoexec.cfg')
                  .map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
              </select>
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
                  navigator.clipboard.writeText('+exec autoexec.cfg')
                  setStatusMsg({ ok: true, text: '已复制启动项参数：+exec autoexec.cfg' })
                }}
                className="h-7 px-2.5 fluent-btn-standard text-[11.5px] inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> 复制 +exec 参数
              </button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="w-full h-[460px] p-3.5 rounded-md bg-[#FAFAFA] dark:bg-[#1C1C1C] border border-black/[0.08] dark:border-white/[0.08] font-mono text-[12.5px] leading-relaxed text-[#1A1A1A] dark:text-[#E6E6E6] outline-none focus:border-[#0067C0] dark:focus:border-[#60CDFF] resize-none"
            placeholder="// 在此编写或点击左侧 EXG 快捷指令自动生成 CFG 配置..."
          />

          <div className="flex items-center justify-between text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
            <span className="inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              提示：保存后可在 CS2 控制台输入 <code className="font-mono">exec {activeFile}</code> 立即生效
            </span>
            <span className="font-mono">{content.split('\n').length} 行</span>
          </div>
        </div>
      </div>
    </div>
  )
}
