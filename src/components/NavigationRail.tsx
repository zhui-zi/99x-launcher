import React from 'react'
import {
  Server,
  Bell,
  FileCode2,
  HardDrive,
  BarChart3,
  Settings,
  ExternalLink,
  Github
} from 'lucide-react'
import type { CommunityId } from '../types/server'

export type NavTab = 'servers' | 'monitor' | 'cfg' | 'cleaner' | 'analytics' | 'settings'

interface NavigationRailProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  activeCommunity: CommunityId
  autoJoinActive: boolean
  watchedCount: number
  appVersion: string
  hasUpdate: boolean
}

const TOP_ITEMS: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'servers', label: '服务器列表', icon: Server },
  { id: 'monitor', label: '换图监控', icon: Bell },
  { id: 'cfg', label: 'CFG 配置', icon: FileCode2 },
  { id: 'cleaner', label: '地图清理', icon: HardDrive },
  { id: 'analytics', label: '数据与统计', icon: BarChart3 }
]

const PORTALS: Record<CommunityId, { label: string; url: string }> = {
  exg: { label: 'EXG 社区官网', url: 'https://darkrp.cn/servers' },
  zed: { label: 'ZED 僵尸乐园', url: 'https://s.zombieden.cn/' },
  fys: { label: 'FYS 风云社', url: 'https://fyscs.cn/' }
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  onSelectTab,
  activeCommunity,
  autoJoinActive,
  watchedCount,
  appVersion,
  hasUpdate
}) => {
  const portal = PORTALS[activeCommunity]

  const renderItem = (item: {
    id: NavTab
    label: string
    icon: React.ComponentType<{ className?: string }>
  }) => {
    const Icon = item.icon
    const active = activeTab === item.id
    return (
      <button
        key={item.id}
        onClick={() => onSelectTab(item.id)}
        className={`relative w-full h-9 px-3 rounded-md flex items-center gap-3 text-[13px] transition-colors ${
          active
            ? 'bg-black/[0.05] dark:bg-white/[0.06] font-medium text-[#1A1A1A] dark:text-[#F3F3F3]'
            : 'text-[#3B3B3B] dark:text-[#D0D0D0] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
        }`}
      >
        {/* Signature WinUI 3 Left Vertical Accent Pill */}
        {active && (
          <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#0067C0] dark:bg-[#60CDFF]" />
        )}
        <Icon
          className={`w-4 h-4 shrink-0 ${
            active ? 'text-[#0067C0] dark:text-[#60CDFF]' : 'text-[#5D5D5D] dark:text-[#A0A0A0]'
          }`}
        />
        <span className="truncate flex-1 text-left">{item.label}</span>
        {item.id === 'servers' && autoJoinActive && (
          <span className="w-2 h-2 rounded-full bg-[#C42B1C] animate-ping" />
        )}
        {item.id === 'monitor' && watchedCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#0067C0] dark:bg-[#60CDFF] text-white dark:text-[#001F33] text-[10px] font-mono font-semibold flex items-center justify-center">
            {watchedCount}
          </span>
        )}
        {item.id === 'settings' && hasUpdate && (
          <span className="w-2 h-2 rounded-full bg-[#0067C0] dark:bg-[#60CDFF]" title="发现新版本" />
        )}
      </button>
    )
  }

  return (
    <aside className="w-[188px] shrink-0 bg-[#F3F3F3] dark:bg-[#202020] border-r border-black/[0.05] dark:border-white/[0.06] flex flex-col justify-between p-2">
      <nav className="space-y-1">{TOP_ITEMS.map(renderItem)}</nav>

      <div className="space-y-1 pt-2 border-t border-black/[0.06] dark:border-white/[0.07]">
        <button
          onClick={() => window.cs2Api?.shell.openExternal(portal.url)}
          className="w-full h-8 px-3 rounded-md flex items-center gap-3 text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
          title={portal.url}
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{portal.label}</span>
        </button>
        <button
          onClick={() => window.cs2Api?.shell.openExternal('https://github.com/zhui-zi/99x-launcher')}
          className="w-full h-8 px-3 rounded-md flex items-center justify-between text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
          title="打开 GitHub 仓库 (github.com/zhui-zi/99x-launcher)"
        >
          <span className="inline-flex items-center gap-3 truncate">
            <Github className="w-3.5 h-3.5 shrink-0" />
            <span>GitHub</span>
          </span>
          <span className="text-[10.5px] font-mono opacity-75">v{appVersion}</span>
        </button>
        {renderItem({ id: 'settings', label: '设置', icon: Settings })}
      </div>
    </aside>
  )
}
