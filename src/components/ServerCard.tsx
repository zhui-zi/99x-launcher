import React from 'react'
import {
  Star,
  Bell,
  Play,
  Zap,
  Info,
  Wifi,
  MapPin,
  Copy,
  Trash2,
  Users
} from 'lucide-react'
import type { ServerItem } from '../types/server'
import { DIFFICULTY_STYLES, getPingColor } from '../utils/grouping'

interface ServerCardProps {
  server: ServerItem
  isFavorite: boolean
  isWatched: boolean
  isAutoJoining: boolean
  onToggleFavorite: (id: string) => void
  onToggleWatch: (id: string) => void
  onJoin: (server: ServerItem) => void
  onAutoJoin: (server: ServerItem) => void
  onInspect: (server: ServerItem) => void
  onCopyAddress: (server: ServerItem) => void
  onDeleteCustom?: (id: string) => void
}

export const ServerCard: React.FC<ServerCardProps> = ({
  server,
  isFavorite,
  isWatched,
  isAutoJoining,
  onToggleFavorite,
  onToggleWatch,
  onJoin,
  onAutoJoin,
  onInspect,
  onCopyAddress,
  onDeleteCustom
}) => {
  const diff = DIFFICULTY_STYLES[server.mapDifficulty]
  const ratio = server.maxPlayers > 0 ? Math.min(1, server.players / server.maxPlayers) : 0
  const isFull = server.online && server.maxPlayers > 0 && server.players >= server.maxPlayers
  const isNearlyFull = server.online && ratio >= 0.85 && !isFull

  const barColor = !server.online
    ? 'bg-black/15 dark:bg-white/15'
    : isFull
      ? 'bg-[#C42B1C] dark:bg-[#FF99A4]'
      : isNearlyFull
        ? 'bg-[#9D5D00] dark:bg-[#FCE100]'
        : 'bg-[#0067C0] dark:bg-[#60CDFF]'

  return (
    <div
      className={`group relative fluent-card p-3.5 flex flex-col justify-between gap-2.5 transition-all hover:bg-white dark:hover:bg-[#323232] ${
        isAutoJoining
          ? 'ring-2 ring-[#0067C0] dark:ring-[#60CDFF]'
          : 'hover:border-black/[0.12] dark:hover:border-white/[0.14]'
      } ${!server.online ? 'opacity-65' : ''}`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                !server.online
                  ? 'bg-[#8A8886]'
                  : isFull
                    ? 'bg-[#C42B1C] dark:bg-[#FF99A4]'
                    : 'bg-[#0F7B0F] dark:bg-[#6CCB5F]'
              }`}
            />
            <h3
              className="text-[13.5px] font-semibold text-[#1A1A1A] dark:text-[#F3F3F3] truncate cursor-pointer hover:text-[#0067C0] dark:hover:text-[#60CDFF]"
              onClick={() => onInspect(server)}
              title={server.fullTitle}
            >
              {server.displayName}
            </h3>
            {server.source === 'custom' && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[#0067C0]/10 text-[#0067C0] dark:bg-[#60CDFF]/15 dark:text-[#60CDFF]">
                自定义
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0]">
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {server.region || '节点'}
            </span>
            <span>·</span>
            <button
              onClick={() => onCopyAddress(server)}
              className="font-mono hover:text-[#0067C0] dark:hover:text-[#60CDFF] inline-flex items-center gap-1"
              title="点击复制 connect 指令"
            >
              {server.address}
              <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[11.5px] font-mono font-medium inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.05] ${getPingColor(
              server.ping
            )}`}
            title="UDP A2S 实时延迟"
          >
            <Wifi className="w-3 h-3" />
            {server.ping > 0 ? `${server.ping}ms` : '--'}
          </span>
          <button
            onClick={() => onToggleWatch(server.id)}
            className={`p-1 rounded transition-colors ${
              isWatched
                ? 'text-[#0067C0] bg-[#0067C0]/10 dark:bg-[#60CDFF]/15 dark:text-[#60CDFF]'
                : 'text-[#8A8886] hover:bg-black/[0.05] dark:hover:bg-white/[0.07]'
            }`}
            title={isWatched ? '已开启换图监控（点击取消）' : '监控此服务器换图'}
          >
            <Bell className={`w-3.5 h-3.5 ${isWatched ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onToggleFavorite(server.id)}
            className={`p-1 rounded transition-colors ${
              isFavorite
                ? 'text-[#9D5D00] dark:text-[#FCE100] bg-[#FCE100]/15'
                : 'text-[#8A8886] hover:bg-black/[0.05] dark:hover:bg-white/[0.07]'
            }`}
            title={isFavorite ? '取消收藏' : '收藏服务器'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          {server.source === 'custom' && onDeleteCustom && (
            <button
              onClick={() => onDeleteCustom(server.id)}
              className="p-1 rounded text-[#8A8886] hover:text-[#C42B1C] hover:bg-[#C42B1C]/10 transition-colors"
              title="删除自定义服务器"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Map Box */}
      <div className="rounded-md bg-[#F6F6F6] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.05] px-2.5 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-[#1A1A1A] dark:text-[#F3F3F3] truncate">
            {server.mapDisplayName || server.map || '未知地图'}
          </div>
          <div className="text-[11px] font-mono text-[#5D5D5D] dark:text-[#A0A0A0] truncate">
            {server.map || '--'}
          </div>
        </div>
        <span
          className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${diff.bg} ${diff.text} ${diff.border}`}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diff.dot }} />
          {diff.label}
        </span>
      </div>

      {/* Occupancy & Fluent Actions */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11.5px] mb-1">
            <span className="inline-flex items-center gap-1 text-[#5D5D5D] dark:text-[#A0A0A0]">
              <Users className="w-3 h-3" />
              <span>在线人数</span>
              {server.bots > 0 && <span className="text-[10px] opacity-75">(+{server.bots} BOT)</span>}
            </span>
            <span
              className={`font-mono font-semibold ${
                isFull
                  ? 'text-[#C42B1C] dark:text-[#FF99A4]'
                  : 'text-[#1A1A1A] dark:text-[#F3F3F3]'
              }`}
            >
              {server.players} / {server.maxPlayers}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-black/[0.07] dark:bg-white/[0.09] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={() => onJoin(server)}
            disabled={!server.online}
            className="flex-1 h-7 fluent-btn-accent text-[12px] inline-flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>加入</span>
          </button>

          <button
            onClick={() => onAutoJoin(server)}
            disabled={!server.online}
            className={`h-7 px-3 rounded-md text-[12px] font-medium inline-flex items-center gap-1 border transition-colors disabled:opacity-40 ${
              isAutoJoining
                ? 'bg-[#C42B1C]/12 border-[#C42B1C]/30 text-[#C42B1C] dark:text-[#FF99A4]'
                : 'fluent-btn-standard'
            }`}
            title="自动监测空位并自动连接"
          >
            <Zap className="w-3 h-3 text-[#0067C0] dark:text-[#60CDFF]" />
            <span>{isAutoJoining ? '挤服中' : '挤服'}</span>
          </button>

          <button
            onClick={() => onInspect(server)}
            className="w-7 h-7 fluent-btn-standard flex items-center justify-center text-[#5D5D5D] dark:text-[#D0D0D0]"
            title="服务器详情"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
