import React from 'react'
import {
  Search,
  RefreshCw,
  Plus,
  Sun,
  Moon,
  Monitor,
  Minus,
  Square,
  X,
  Gamepad2
} from 'lucide-react'
import type { CommunityId, ThemeMode } from '../types/server'

interface TitleBarProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  isRefreshing: boolean
  countdownSec: number
  autoRefreshSec: number
  onRefresh: () => void
  onAddServer: () => void
  theme: ThemeMode
  onCycleTheme: () => void
  cs2Running: boolean
  activeCommunity: CommunityId
  totalOnlinePlayers: number
  totalOnlineServers: number
}

const COMMUNITY_BADGE: Record<CommunityId, string> = {
  exg: 'EXG',
  zed: 'ZED',
  fys: 'FYS'
}

export const TitleBar: React.FC<TitleBarProps> = ({
  searchQuery,
  onSearchChange,
  isRefreshing,
  countdownSec,
  autoRefreshSec,
  onRefresh,
  onAddServer,
  theme,
  onCycleTheme,
  cs2Running,
  activeCommunity,
  totalOnlinePlayers,
  totalOnlineServers
}) => {
  const themeTitle =
    theme === 'system'
      ? '主题：跟随系统（点击切换浅色）'
      : theme === 'light'
        ? '主题：浅色模式（点击切换深色）'
        : '主题：深色模式（点击跟随系统）'

  return (
    <header className="app-drag h-12 shrink-0 flex items-center justify-between pl-4 bg-[#F3F3F3] dark:bg-[#202020] border-b border-black/[0.06] dark:border-white/[0.06]">
      {/* Brand (WinUI 3 App Title) */}
      <div className="flex items-center gap-2.5 min-w-[240px]">
        <div className="w-6 h-6 rounded-md bg-[#0067C0] dark:bg-[#60CDFF] text-white dark:text-[#001F33] flex items-center justify-center text-[10px] font-bold tracking-tight shadow-sm">
          99x
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
            99x launcher
          </span>
          <span className="text-[10.5px] font-medium px-1.5 py-0.5 rounded bg-[#0067C0]/10 text-[#0067C0] dark:bg-[#60CDFF]/15 dark:text-[#60CDFF]">
            {COMMUNITY_BADGE[activeCommunity]}
          </span>
          <span className="text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0] hidden xl:inline">
            {totalOnlinePlayers} 人 · {totalOnlineServers} 服
          </span>
          {cs2Running && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#0F7B0F] dark:text-[#6CCB5F] font-medium">
              <Gamepad2 className="w-3 h-3" /> CS2
            </span>
          )}
        </div>
      </div>

      {/* Fluent 2 AutoSuggestBox */}
      <div className="app-no-drag flex-1 max-w-md mx-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索服务器、地图名、中文译名或 IP..."
            className="w-full h-8 pl-3 pr-8 fluent-input text-[12.5px] text-[#1A1A1A] dark:text-[#F3F3F3] placeholder-[#5D5D5D] dark:placeholder-[#9A9A9A]"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[#5D5D5D]"
              title="清除搜索"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-[#5D5D5D] dark:text-[#A0A0A0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Right actions + Native Windows 11 Caption Buttons */}
      <div className="app-no-drag flex items-center h-full">
        <div className="flex items-center gap-1.5 mr-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7 px-2.5 fluent-btn-standard text-[12px] inline-flex items-center gap-1.5"
            title="立即刷新"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="font-mono">{autoRefreshSec > 0 ? `${countdownSec}s` : '刷新'}</span>
          </button>

          <button
            onClick={onAddServer}
            className="h-7 px-3 fluent-btn-accent text-[12px] inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加服务器</span>
          </button>

          <button
            onClick={onCycleTheme}
            className="w-7 h-7 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.07] flex items-center justify-center text-[#5D5D5D] dark:text-[#D0D0D0]"
            title={themeTitle}
          >
            {theme === 'system' ? (
              <Monitor className="w-3.5 h-3.5" />
            ) : theme === 'light' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Native Windows 11 Rectangular Caption Controls */}
        <div className="flex items-center h-full">
          <button
            onClick={() => window.cs2Api?.window.minimize()}
            className="w-[46px] h-full hover:bg-black/[0.06] dark:hover:bg-white/[0.08] flex items-center justify-center text-[#1A1A1A] dark:text-[#F3F3F3] transition-colors"
            title="最小化"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.cs2Api?.window.maximize()}
            className="w-[46px] h-full hover:bg-black/[0.06] dark:hover:bg-white/[0.08] flex items-center justify-center text-[#1A1A1A] dark:text-[#F3F3F3] transition-colors"
            title="最大化 / 还原"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.cs2Api?.window.close()}
            className="w-[46px] h-full hover:bg-[#C42B1C] hover:text-white flex items-center justify-center text-[#1A1A1A] dark:text-[#F3F3F3] transition-colors"
            title="关闭 / 隐藏到系统托盘"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
