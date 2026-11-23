import React, { useState } from 'react'
import {
  Volume2,
  FolderOpen,
  Upload,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Power,
  Minimize2
} from 'lucide-react'
import type { LauncherSettings, ThemeMode } from '../types/server'
import { playSuccessSound } from '../utils/sound'

interface SettingsViewProps {
  settings: LauncherSettings
  onChange: (patch: Partial<LauncherSettings>) => void
  onAutoDetectPaths: () => Promise<void>
  onImportExgJson: () => Promise<number>
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onChange,
  onAutoDetectPaths,
  onImportExgJson
}) => {
  const [statusMsg, setStatusMsg] = useState('')

  const pickCs2Dir = async () => {
    const dir = await window.cs2Api?.game.pickDirectory('选择 Counter-Strike Global Offensive 安装目录')
    if (dir) onChange({ cs2Path: dir })
  }

  const themeOptions: Array<{ id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'system', label: '跟随系统', icon: Monitor },
    { id: 'light', label: '浅色', icon: Sun },
    { id: 'dark', label: '深色', icon: Moon }
  ]

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-5 pb-16">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A1A] dark:text-[#F3F3F3]">
          设置
        </h1>
        <p className="text-[12.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-0.5">
          99x launcher · WinUI 3 & Fluent 2
        </p>
      </div>

      {statusMsg && (
        <div className="fluent-card px-4 py-2.5 border-l-4 border-l-[#0F7B0F] dark:border-l-[#6CCB5F] text-[12.5px] text-[#0F7B0F] dark:text-[#6CCB5F] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Appearance & Tray */}
      <section className="fluent-card divide-y divide-black/[0.06] dark:divide-white/[0.07]">
        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[13.5px] font-medium">应用主题</div>
            <div className="text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">
              自动跟随 Windows 深浅色设置或手动指定
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const active = settings.theme === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => onChange({ theme: opt.id })}
                  className={`h-8 px-3 rounded-md text-[12px] font-medium inline-flex items-center gap-1.5 border transition-colors ${
                    active
                      ? 'bg-[#0067C0] dark:bg-[#60CDFF] text-white dark:text-[#001F33] border-transparent'
                      : 'fluent-btn-standard'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[13.5px] font-medium">点击关闭按钮 (✕) 时的行为</div>
            <div className="text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">
              最小化到系统托盘可保持 3 秒换图监控与自动挤服在后台持续运行
            </div>
          </div>
          <select
            value={settings.closeBehavior}
            onChange={(e) => onChange({ closeBehavior: e.target.value as 'tray' | 'exit' })}
            className="h-8 px-3 fluent-input text-[12.5px]"
          >
            <option value="tray">最小化到系统托盘（推荐）</option>
            <option value="exit">直接退出程序</option>
          </select>
        </div>

        <div className="p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[13.5px] font-medium">点击最小化按钮时隐藏到系统托盘</div>
            <div className="text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">
              开启后窗口最小化时不占用任务栏图标，点击右下角托盘图标即可恢复
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.minimizeToTray}
            onChange={(e) => onChange({ minimizeToTray: e.target.checked })}
            className="w-4 h-4 accent-[#0067C0]"
          />
        </div>

        <div className="p-4 flex items-center justify-between gap-3">
          <div className="text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">托盘快捷操作</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.cs2Api?.window.hideToTray()}
              className="h-8 px-3 fluent-btn-standard text-[12px] inline-flex items-center gap-1.5"
            >
              <Minimize2 className="w-3.5 h-3.5" /> 立即隐藏到托盘
            </button>
            <button
              onClick={() => window.cs2Api?.window.quit()}
              className="h-8 px-3 rounded-md bg-[#C42B1C]/10 hover:bg-[#C42B1C]/20 text-[#C42B1C] dark:text-[#FF99A4] text-[12px] font-medium inline-flex items-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" /> 彻底退出
            </button>
          </div>
        </div>
      </section>

      {/* Refresh & Auto-Join */}
      <section className="fluent-card divide-y divide-black/[0.06] dark:divide-white/[0.07]">
        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[13.5px] font-medium">主页自动刷新间隔</div>
            <div className="text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">
              默认每 3 秒自动同步人数、地图与延迟
            </div>
          </div>
          <select
            value={settings.autoRefreshIntervalSec}
            onChange={(e) => onChange({ autoRefreshIntervalSec: Number(e.target.value) })}
            className="h-8 px-3 fluent-input text-[12.5px]"
          >
            <option value={0}>已暂停自动刷新</option>
            <option value={3}>每 3 秒刷新（默认）</option>
            <option value={5}>每 5 秒刷新</option>
            <option value={10}>每 10 秒刷新</option>
            <option value={15}>每 15 秒刷新</option>
            <option value={30}>每 30 秒刷新</option>
          </select>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12.5px]">
          <div>
            <label className="block text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mb-1">
              挤服轮询间隔 (ms，默认 500)
            </label>
            <input
              type="number"
              min={300}
              max={10000}
              step={100}
              value={settings.autoJoinPollDelayMs}
              onChange={(e) => onChange({ autoJoinPollDelayMs: Number(e.target.value) })}
              className="w-full h-8 px-2.5 fluent-input font-mono"
            />
          </div>
          <div>
            <label className="block text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mb-1">
              并发探测通道 (1-3，推荐 1)
            </label>
            <input
              type="number"
              min={1}
              max={3}
              value={settings.autoJoinConcurrency}
              onChange={(e) => onChange({ autoJoinConcurrency: Number(e.target.value) })}
              className="w-full h-8 px-2.5 fluent-input font-mono"
            />
          </div>
          <div>
            <label className="block text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mb-1">
              默认空位偏移 (最大人数 - N)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.autoJoinDefaultThresholdOffset}
              onChange={(e) => onChange({ autoJoinDefaultThresholdOffset: Number(e.target.value) })}
              className="w-full h-8 px-2.5 fluent-input font-mono"
            />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-[12.5px]">
              <label className="inline-flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onChange({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#0067C0]"
                />
                挤服成功播放清脆提示音
              </label>
              <label className="inline-flex items-center gap-2 text-[#5D5D5D] dark:text-[#A0A0A0]">
                <input
                  type="checkbox"
                  checked={settings.mapWatchNotifySound}
                  onChange={(e) => onChange({ mapWatchNotifySound: e.target.checked })}
                  className="w-4 h-4 accent-[#0067C0]"
                />
                换图提醒时同时播放提示音
              </label>
            </div>
            <button
              type="button"
              onClick={() => playSuccessSound(settings.soundVolume)}
              className="h-7 px-3 fluent-btn-standard text-[12px] inline-flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF]" /> 试听提示音
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0] w-14">音量</span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={settings.soundVolume}
              onChange={(e) => onChange({ soundVolume: Number(e.target.value) })}
              className="flex-1 accent-[#0067C0]"
            />
            <span className="text-[12px] font-mono w-10 text-right">
              {Math.round(settings.soundVolume * 100)}%
            </span>
          </div>
        </div>
      </section>

      {/* Steam & CS2 Paths */}
      <section className="fluent-card p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="text-[13.5px] font-medium">CS2 路径与启动参数</div>
          <button
            onClick={async () => {
              await onAutoDetectPaths()
              setStatusMsg('已自动检测本机 Steam 与 CS2 安装路径')
            }}
            className="h-7 px-3 fluent-btn-standard text-[12px] inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF]" /> 自动检测路径
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={settings.cs2Path}
            onChange={(e) => onChange({ cs2Path: e.target.value })}
            placeholder="Counter-Strike Global Offensive 安装目录"
            className="flex-1 h-8 px-2.5 fluent-input font-mono text-[12px]"
          />
          <button
            onClick={pickCs2Dir}
            className="h-8 px-3 fluent-btn-standard text-[12px] inline-flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" /> 浏览
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
          <div>
            <label className="block text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mb-1">
              连接协议模式
            </label>
            <select
              value={settings.launchMode}
              onChange={(e) => onChange({ launchMode: e.target.value as any })}
              className="w-full h-8 px-2.5 fluent-input"
            >
              <option value="steam_connect">steam://connect/IP:Port（快速直连）</option>
              <option value="steam_rungameid">steam://rungameid/730（支持启动参数）</option>
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mb-1">
              区服启动参数
            </label>
            <select
              value={settings.regionFlag}
              onChange={(e) => onChange({ regionFlag: e.target.value as any })}
              className="w-full h-8 px-2.5 fluent-input"
            >
              <option value="worldwide">-worldwide（国际服，防地图错误15）</option>
              <option value="perfectworld">-perfectworld（国服）</option>
              <option value="none">不附加区服参数</option>
            </select>
          </div>
        </div>

        <div className="pt-1">
          <button
            onClick={async () => {
              const count = await onImportExgJson()
              if (count > 0) setStatusMsg(`已从本地 server.json 导入 ${count} 个自定义服务器`)
            }}
            className="h-8 px-3.5 fluent-btn-standard text-[12px] inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> 导入 EXG 小助手 server.json
          </button>
        </div>
      </section>
    </div>
  )
}
