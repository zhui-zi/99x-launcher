import React, { useEffect, useState } from 'react'
import {
  X,
  Play,
  Zap,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Wifi,
  Users,
  Clock,
  Tag
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import type { A2SPlayer, ServerItem } from '../types/server'
import { DIFFICULTY_STYLES, formatDuration, getPingColor } from '../utils/grouping'

interface ServerDetailDrawerProps {
  server: ServerItem | null
  onClose: () => void
  onJoin: (server: ServerItem) => void
  onAutoJoin: (server: ServerItem) => void
  onCopyAddress: (server: ServerItem) => void
}

export const ServerDetailDrawer: React.FC<ServerDetailDrawerProps> = ({
  server,
  onClose,
  onJoin,
  onAutoJoin,
  onCopyAddress
}) => {
  const [liveInfo, setLiveInfo] = useState<any>(null)
  const [players, setPlayers] = useState<A2SPlayer[]>([])
  const [pingHistory, setPingHistory] = useState<Array<{ time: string; ping: number }>>([])
  const [loading, setLoading] = useState(false)

  const probeServer = async (target: ServerItem) => {
    if (!window.cs2Api) return
    setLoading(true)
    try {
      const [infoRes, playersRes] = await Promise.all([
        window.cs2Api.a2s.info(target.ip, target.port),
        window.cs2Api.a2s.players(target.ip, target.port)
      ])
      setLiveInfo(infoRes)
      if (infoRes?.online && infoRes.ping > 0) {
        const now = new Date()
        const label = `${now.getMinutes().toString().padStart(2, '0')}:${now
          .getSeconds()
          .toString()
          .padStart(2, '0')}`
        setPingHistory((prev) => [...prev.slice(-14), { time: label, ping: infoRes.ping }])
      }
      if (playersRes?.online) {
        setPlayers(playersRes.players || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!server) return
    setLiveInfo(null)
    setPlayers([])
    setPingHistory(server.ping > 0 ? [{ time: '初始', ping: server.ping }] : [])
    probeServer(server)

    const timer = setInterval(() => {
      probeServer(server)
    }, 5000)
    return () => clearInterval(timer)
  }, [server?.id])

  if (!server) return null

  const diff = DIFFICULTY_STYLES[server.mapDifficulty]
  const currentPlayers = liveInfo?.online ? liveInfo.players ?? server.players : server.players
  const maxPlayers = liveInfo?.online ? liveInfo.maxPlayers ?? server.maxPlayers : server.maxPlayers
  const currentPing = liveInfo?.online ? liveInfo.ping : server.ping
  const tags = (liveInfo?.keywords || server.keywords || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)

  // Session duration distribution buckets from A2S_PLAYERS
  const durationBuckets = [
    { range: '<5分', count: 0 },
    { range: '5-15分', count: 0 },
    { range: '15-30分', count: 0 },
    { range: '30-60分', count: 0 },
    { range: '1小时+', count: 0 }
  ]
  for (const p of players) {
    const m = p.duration / 60
    if (m < 5) durationBuckets[0].count++
    else if (m < 15) durationBuckets[1].count++
    else if (m < 30) durationBuckets[2].count++
    else if (m < 60) durationBuckets[3].count++
    else durationBuckets[4].count++
  }

  const sortedPlayers = [...players].sort((a, b) => b.duration - a.duration)

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/25 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="w-[500px] max-w-[92vw] h-full bg-white dark:bg-[#1E1F20] border-l border-[#E8EAED] dark:border-[#303134] shadow-m3-3 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8EAED] dark:border-[#303134] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                {server.displayName}
              </h2>
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}
              >
                {diff.label}
              </span>
            </div>
            <p className="text-[12px] text-[#5F6368] dark:text-[#9AA0A6] mt-0.5 truncate">
              {liveInfo?.name || server.fullTitle}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => probeServer(server)}
              className="w-8 h-8 rounded-full hover:bg-[#F1F3F4] dark:hover:bg-[#282A2C] flex items-center justify-center text-[#5F6368]"
              title="重新探测 A2S"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1A73E8]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[#F1F3F4] dark:hover:bg-[#282A2C] flex items-center justify-center text-[#5F6368]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick KPI Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#F8F9FA] dark:bg-[#282A2C] p-3.5">
              <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#1A73E8]" /> 实时人数
              </div>
              <div className="mt-1 text-[20px] font-mono font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {currentPlayers}
                <span className="text-[13px] font-normal text-[#5F6368]">/{maxPlayers}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8F9FA] dark:bg-[#282A2C] p-3.5">
              <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-[#34A853]" /> A2S 延迟
              </div>
              <div className={`mt-1 text-[20px] font-mono font-semibold ${getPingColor(currentPing)}`}>
                {currentPing > 0 ? `${currentPing}ms` : '--'}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8F9FA] dark:bg-[#282A2C] p-3.5">
              <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E8E3E]" /> 保护状态
              </div>
              <div className="mt-1 text-[14px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3] pt-1">
                {liveInfo?.vac !== false ? 'VAC 安全' : '未启用 VAC'}
              </div>
            </div>
          </div>

          {/* Map & Connection Info */}
          <div className="rounded-2xl border border-[#E8EAED] dark:border-[#303134] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">当前运行地图</div>
                <div className="text-[15px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {server.mapDisplayName || server.map}
                </div>
                <div className="text-[12px] font-mono text-[#5F6368] dark:text-[#9AA0A6]">
                  {liveInfo?.map || server.map}
                </div>
              </div>
              {server.mapWorkshopId > 0 && (
                <button
                  onClick={() =>
                    window.cs2Api?.shell.openExternal(
                      `https://steamcommunity.com/sharedfiles/filedetails/?id=${server.mapWorkshopId}`
                    )
                  }
                  className="h-8 px-3 rounded-full bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] dark:bg-[#004A77] dark:text-[#C2E7FF] text-[12px] font-medium inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  创意工坊
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F4] dark:border-[#303134]">
              <code className="text-[12px] font-mono text-[#3C4043] dark:text-[#BDC1C6] selectable">
                connect {server.address}
              </code>
              <button
                onClick={() => onCopyAddress(server)}
                className="text-[12px] text-[#1A73E8] dark:text-[#A8C7FA] hover:underline inline-flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> 复制指令
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.slice(0, 8).map((t: string) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#F1F3F4] dark:bg-[#282A2C] text-[#5F6368] dark:text-[#BDC1C6] inline-flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" /> {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Ping Trend */}
          <div className="rounded-2xl border border-[#E8EAED] dark:border-[#303134] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                实时延迟监控 (ms)
              </span>
              <span className="text-[11px] text-[#5F6368]">每 5 秒自动探测</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pingHistory}>
                  <defs>
                    <linearGradient id="pingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" opacity={0.4} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9AA0A6' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9AA0A6' }} width={32} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      fontSize: 12
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ping"
                    name="延迟 (ms)"
                    stroke="#1A73E8"
                    strokeWidth={2}
                    fill="url(#pingGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* A2S_PLAYERS Session Duration Distribution */}
          <div className="rounded-2xl border border-[#E8EAED] dark:border-[#303134] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                在线玩家时长分布 (A2S_PLAYERS)
              </span>
              <span className="text-[11px] text-[#5F6368]">{players.length} 名在线玩家</span>
            </div>
            {players.length > 0 ? (
              <>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={durationBuckets}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" opacity={0.4} />
                      <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9AA0A6' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9AA0A6' }} width={28} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          fontSize: 12
                        }}
                      />
                      <Bar dataKey="count" name="玩家数" fill="#34A853" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top longest-session players */}
                <div className="mt-3 max-h-40 overflow-y-auto divide-y divide-[#F1F3F4] dark:divide-[#303134] text-[12px]">
                  {sortedPlayers.slice(0, 12).map((p, idx) => (
                    <div key={`${p.index}-${idx}`} className="py-1.5 flex items-center justify-between">
                      <span className="text-[#3C4043] dark:text-[#E3E3E3] truncate max-w-[200px]">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                        {p.score !== 0 && <span>得分 {p.score}</span>}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDuration(p.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-[12px] text-[#9AA0A6]">
                当前无在线玩家或服务器未开放 A2S_PLAYERS 列表
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E8EAED] dark:border-[#303134] flex items-center gap-3 bg-[#F8F9FA] dark:bg-[#131314]">
          <button
            onClick={() => onJoin(server)}
            className="flex-1 h-10 rounded-full bg-[#1A73E8] hover:bg-[#1765CC] dark:bg-[#A8C7FA] dark:text-[#041E49] text-white text-[13.5px] font-medium inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" /> 立即连接服务器
          </button>
          <button
            onClick={() => onAutoJoin(server)}
            className="h-10 px-5 rounded-full bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] dark:bg-[#004A77] dark:text-[#C2E7FF] text-[13.5px] font-medium inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> 自动挤服
          </button>
        </div>
      </div>
    </div>
  )
}
