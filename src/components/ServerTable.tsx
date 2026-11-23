import React from 'react'
import { Star, Bell, Play, Zap, Info, Copy, Trash2 } from 'lucide-react'
import type { ServerItem } from '../types/server'
import { DIFFICULTY_STYLES, getPingColor } from '../utils/grouping'

interface ServerTableProps {
  servers: ServerItem[]
  favorites: Set<string>
  watched: Set<string>
  autoJoinServerIds: Set<string>
  onToggleFavorite: (id: string) => void
  onToggleWatch: (id: string) => void
  onJoin: (server: ServerItem) => void
  onAutoJoin: (server: ServerItem) => void
  onInspect: (server: ServerItem) => void
  onCopyAddress: (server: ServerItem) => void
  onDeleteCustom?: (id: string) => void
}

export const ServerTable: React.FC<ServerTableProps> = ({
  servers,
  favorites,
  watched,
  autoJoinServerIds,
  onToggleFavorite,
  onToggleWatch,
  onJoin,
  onAutoJoin,
  onInspect,
  onCopyAddress,
  onDeleteCustom
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E8EAED] dark:border-[#303134] bg-[#F8F9FA] dark:bg-[#282A2C]/60 text-[11.5px] font-medium text-[#5F6368] dark:text-[#9AA0A6]">
            <th className="py-2.5 pl-4 pr-2 w-16" />
            <th className="py-2.5 px-3">服务器</th>
            <th className="py-2.5 px-3">当前地图</th>
            <th className="py-2.5 px-3 w-24">难度</th>
            <th className="py-2.5 px-3 w-28">人数</th>
            <th className="py-2.5 px-3 w-20">延迟</th>
            <th className="py-2.5 pl-3 pr-4 text-right w-48">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F3F4] dark:divide-[#2D2E30] text-[13px]">
          {servers.map((server) => {
            const diff = DIFFICULTY_STYLES[server.mapDifficulty]
            const isFav = favorites.has(server.id)
            const isWatch = watched.has(server.id)
            const isQueueing = autoJoinServerIds.has(server.id)
            const isFull = server.online && server.maxPlayers > 0 && server.players >= server.maxPlayers
            return (
              <tr
                key={server.id}
                className={`hover:bg-[#F8F9FA] dark:hover:bg-[#282A2C]/70 transition-colors ${
                  isQueueing ? 'bg-[#E8F0FE]/50 dark:bg-[#004A77]/20' : ''
                }`}
              >
                <td className="py-2.5 pl-4 pr-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleFavorite(server.id)}
                      className={`${isFav ? 'text-[#F9AB00]' : 'text-[#DADCE0] hover:text-[#9AA0A6]'}`}
                      title="收藏"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => onToggleWatch(server.id)}
                      className={`${isWatch ? 'text-[#1A73E8] dark:text-[#A8C7FA]' : 'text-[#DADCE0] hover:text-[#9AA0A6]'}`}
                      title="监控换图"
                    >
                      <Bell className={`w-3.5 h-3.5 ${isWatch ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        !server.online ? 'bg-[#9AA0A6]' : isFull ? 'bg-[#EA4335]' : 'bg-[#34A853]'
                      }`}
                    />
                    <button
                      onClick={() => onInspect(server)}
                      className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3] hover:text-[#1A73E8] dark:hover:text-[#A8C7FA] truncate max-w-[220px]"
                    >
                      {server.displayName}
                    </button>
                    {server.source === 'custom' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E8F0FE] text-[#1967D2] dark:bg-[#1967D2]/30 dark:text-[#A8C7FA]">
                        自定义
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5 mt-0.5">
                    <span>{server.address}</span>
                    <button
                      onClick={() => onCopyAddress(server)}
                      className="hover:text-[#1A73E8]"
                      title="复制 connect 指令"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3] truncate max-w-[220px]">
                    {server.mapDisplayName || server.map || '--'}
                  </div>
                  <div className="text-[11px] font-mono text-[#5F6368] dark:text-[#9AA0A6] truncate max-w-[220px]">
                    {server.map}
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${diff.bg} ${diff.text} ${diff.border}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diff.dot }} />
                    {diff.label}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono font-medium">
                  <span className={isFull ? 'text-[#D93025] dark:text-[#F28B82]' : ''}>
                    {server.players} / {server.maxPlayers}
                  </span>
                </td>
                <td className={`py-2.5 px-3 font-mono font-medium ${getPingColor(server.ping)}`}>
                  {server.ping > 0 ? `${server.ping}ms` : '--'}
                </td>
                <td className="py-2.5 pl-3 pr-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onJoin(server)}
                      disabled={!server.online}
                      className="h-7 px-3 rounded-full bg-[#1A73E8] hover:bg-[#1765CC] disabled:opacity-40 dark:bg-[#A8C7FA] dark:text-[#041E49] text-white text-[11.5px] font-medium inline-flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      加入
                    </button>
                    <button
                      onClick={() => onAutoJoin(server)}
                      disabled={!server.online}
                      className={`h-7 px-2.5 rounded-full text-[11.5px] font-medium inline-flex items-center gap-1 ${
                        isQueueing
                          ? 'bg-[#FCE8E6] text-[#C5221F] dark:bg-[#C5221F]/30 dark:text-[#F28B82]'
                          : 'bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] dark:bg-[#004A77] dark:text-[#C2E7FF]'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      {isQueueing ? '挤服中' : '挤服'}
                    </button>
                    <button
                      onClick={() => onInspect(server)}
                      className="w-7 h-7 rounded-full hover:bg-[#E8EAED] dark:hover:bg-[#3C4043] text-[#5F6368] dark:text-[#BDC1C6] flex items-center justify-center"
                      title="详情"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {server.source === 'custom' && onDeleteCustom && (
                      <button
                        onClick={() => onDeleteCustom(server.id)}
                        className="w-7 h-7 rounded-full hover:bg-[#FCE8E6] text-[#9AA0A6] hover:text-[#D93025] flex items-center justify-center"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
