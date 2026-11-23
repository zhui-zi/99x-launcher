import React, { useMemo, useState } from 'react'
import { Users, Flame, Gauge, Wifi, Clock, History, Play, Trash2 } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'
import type {
  ExgOnlineStatPoint,
  MapPlayRecord,
  PlaySessionLog,
  ServerHistoryPoint,
  ServerItem
} from '../types/server'
import { DIFFICULTY_STYLES, groupServers } from '../utils/grouping'

interface AnalyticsViewProps {
  servers: ServerItem[]
  onlineStats: ExgOnlineStatPoint[]
  mapPlayStats: Record<string, MapPlayRecord>
  playSessions: PlaySessionLog[]
  serverHistory: Record<string, ServerHistoryPoint[]>
  onInspectServer: (server: ServerItem) => void
  onJoinServer: (server: ServerItem) => void
  onClearPlayStats: () => void
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  servers,
  onlineStats,
  mapPlayStats,
  playSessions,
  serverHistory,
  onInspectServer,
  onJoinServer,
  onClearPlayStats
}) => {
  const [historyTarget, setHistoryTarget] = useState<string>('EXG_24H')

  const onlineServers = servers.filter((s) => s.online)
  const totalPlayers = onlineServers.reduce((acc, s) => acc + s.players, 0)
  const totalCapacity = onlineServers.reduce((acc, s) => acc + s.maxPlayers, 0)
  const occupancyPct = totalCapacity > 0 ? Math.round((totalPlayers / totalCapacity) * 100) : 0
  const fullCount = onlineServers.filter((s) => s.maxPlayers > 0 && s.players >= s.maxPlayers).length

  const validPings = onlineServers.filter((s) => s.ping > 0).map((s) => s.ping)
  const avgPing =
    validPings.length > 0
      ? Math.round(validPings.reduce((a, b) => a + b, 0) / validPings.length)
      : 0

  // EXG 24h official online history OR per-server sampled history
  const chartHistoryData = useMemo(() => {
    if (historyTarget === 'EXG_24H') {
      return onlineStats.slice(-60).map((pt) => {
        const d = new Date(pt.timestamp)
        return {
          time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
          players: pt.totalPlayers
        }
      })
    }
    const pts = serverHistory[historyTarget] || []
    return pts.slice(-60).map((pt) => {
      const d = new Date(pt.timestamp)
      return {
        time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d
          .getSeconds()
          .toString()
          .padStart(2, '0')}`,
        players: pt.players
      }
    })
  }, [historyTarget, onlineStats, serverHistory])

  // Group load data
  const groups = groupServers(onlineServers, 'players_desc', true).map((g) => ({
    name: g.name,
    players: g.totalPlayers,
    remaining: Math.max(0, g.totalCapacity - g.totalPlayers)
  }))

  // Difficulty distribution
  const diffCounts = new Map<string, number>()
  for (const s of onlineServers) {
    diffCounts.set(s.mapDifficulty, (diffCounts.get(s.mapDifficulty) || 0) + 1)
  }
  const diffData = Array.from(diffCounts.entries()).map(([name, value]) => ({
    name,
    value,
    color: DIFFICULTY_STYLES[name as keyof typeof DIFFICULTY_STYLES]?.chartColor || '#8A8886'
  }))

  // Personal map play stats Top 8
  const topPlayedMaps = useMemo(() => {
    return Object.values(mapPlayStats)
      .sort((a, b) => b.playCount - a.playCount || b.totalMinutes - a.totalMinutes)
      .slice(0, 8)
      .map((m) => ({
        ...m,
        shortName: (m.mapDisplayName || m.map).slice(0, 14)
      }))
  }, [mapPlayStats])

  const totalPlaySessionsCount = playSessions.length
  const totalPlayMinutes = Object.values(mapPlayStats).reduce((acc, m) => acc + m.totalMinutes, 0)
  const serverById = new Map(servers.map((s) => [s.id, s]))

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto pb-16">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A1A] dark:text-[#F3F3F3]">
          数据总览与游玩统计
        </h1>
        <p className="text-[12.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-0.5">
          服务器历史在线曲线、分组负载、地图难度分布与个人地图游玩统计
        </p>
      </div>

      {/* KPI Cards (WinUI 3 Layer Fill) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="fluent-card p-4">
          <div className="flex items-center justify-between text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">
            <span>当前总在线人数</span>
            <Users className="w-4 h-4 text-[#0067C0] dark:text-[#60CDFF]" />
          </div>
          <div className="mt-2 text-[26px] font-mono font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
            {totalPlayers}
          </div>
          <div className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-1">
            {onlineServers.length} 服在线 · 容量 {totalCapacity}
          </div>
        </div>

        <div className="fluent-card p-4">
          <div className="flex items-center justify-between text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">
            <span>满员热门服</span>
            <Flame className="w-4 h-4 text-[#C42B1C] dark:text-[#FF99A4]" />
          </div>
          <div className="mt-2 text-[26px] font-mono font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
            {fullCount}
          </div>
          <div className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-1">
            全服平均负载 {occupancyPct}%
          </div>
        </div>

        <div className="fluent-card p-4">
          <div className="flex items-center justify-between text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">
            <span>平均 A2S 延迟</span>
            <Wifi className="w-4 h-4 text-[#0F7B0F] dark:text-[#6CCB5F]" />
          </div>
          <div className="mt-2 text-[26px] font-mono font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
            {avgPing > 0 ? `${avgPing}ms` : '--'}
          </div>
          <div className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-1">
            已探测 {validPings.length} 个节点
          </div>
        </div>

        <div className="fluent-card p-4">
          <div className="flex items-center justify-between text-[12px] text-[#5D5D5D] dark:text-[#A0A0A0]">
            <span>个人地图游玩统计</span>
            <Clock className="w-4 h-4 text-[#0067C0] dark:text-[#60CDFF]" />
          </div>
          <div className="mt-2 text-[26px] font-mono font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
            {totalPlaySessionsCount} <span className="text-[13px] font-normal text-[#5D5D5D]">次</span>
          </div>
          <div className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mt-1">
            累计记录 {Object.keys(mapPlayStats).length} 张图 · 约 {totalPlayMinutes} 分钟
          </div>
        </div>
      </div>

      {/* Row 1: Server Historical Online Data + Difficulty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 fluent-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
                服务器历史在线数据
              </h2>
              <p className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
                支持查看 EXG 官方 24 小时社区曲线或任意单服本机实时采样曲线
              </p>
            </div>
            <select
              value={historyTarget}
              onChange={(e) => setHistoryTarget(e.target.value)}
              className="h-8 px-2.5 fluent-input text-[12px]"
            >
              <option value="EXG_24H">EXG 社区 24h 总在线趋势</option>
              {onlineServers.slice(0, 20).map((s) => (
                <option key={s.id} value={s.id}>
                  单服采样：{s.displayName} ({(serverHistory[s.id] || []).length} 点)
                </option>
              ))}
            </select>
          </div>
          <div className="h-60">
            {chartHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartHistoryData}>
                  <defs>
                    <linearGradient id="fluentBlueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0067C0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0067C0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.18} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} width={40} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid rgba(128,128,128,0.2)',
                      fontSize: 12
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="players"
                    name="在线人数"
                    stroke="#0067C0"
                    strokeWidth={2}
                    fill="url(#fluentBlueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[12.5px] text-[#888]">
                正在积累采样数据（软件运行时每分钟自动记录服务器在线人数）...
              </div>
            )}
          </div>
        </div>

        <div className="fluent-card p-5">
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
            当前地图难度分布
          </h2>
          <p className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mb-2">
            按当前社区在线服务器统计
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diffData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {diffData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11.5 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Personal Map Playtime Stats + Recent Play History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="fluent-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
                个人最常游玩地图 Top 8
              </h2>
              <p className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
                通过登录器加入服务器时自动累计地图游玩次数与时长
              </p>
            </div>
            {topPlayedMaps.length > 0 && (
              <button
                onClick={onClearPlayStats}
                className="h-7 px-2.5 fluent-btn-standard text-[11.5px] inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> 清空统计
              </button>
            )}
          </div>
          <div className="h-60">
            {topPlayedMaps.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPlayedMaps} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.18} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis dataKey="shortName" type="category" width={105} tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="playCount" name="游玩次数" fill="#0067C0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[12.5px] text-[#888]">
                暂无游玩记录，通过登录器加入服务器后将自动生成你的专属地图统计
              </div>
            )}
          </div>
        </div>

        <div className="fluent-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#0067C0] dark:text-[#60CDFF]" />
              <h2 className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
                最近进服游玩记录
              </h2>
            </div>
            <span className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
              共 {playSessions.length} 条
            </span>
          </div>

          {playSessions.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-[12.5px] text-[#888]">
              尚未有进服记录
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {playSessions.slice(0, 15).map((ses) => {
                const srv = serverById.get(ses.serverId)
                return (
                  <div
                    key={ses.id}
                    className="rounded-md bg-[#F9F9F9] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] px-3 py-2 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium truncate">
                        {ses.serverName}{' '}
                        <span className="text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0] font-normal">
                          · {ses.mapDisplayName || ses.map}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#5D5D5D] dark:text-[#A0A0A0]">
                        {new Date(ses.joinedAt).toLocaleString()} · {ses.difficulty}
                      </div>
                    </div>
                    {srv && (
                      <button
                        onClick={() => onJoinServer(srv)}
                        className="h-7 px-2.5 fluent-btn-accent text-[11px] inline-flex items-center gap-1 shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" /> 重连
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Group Load */}
      <div className="fluent-card p-5">
        <h2 className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F3F3F3] mb-1">
          各分组人数与剩余空位
        </h2>
        <p className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] mb-3">
          实时对比不同玩法分区的拥挤程度
        </p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.18} />
              <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} width={36} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11.5 }} />
              <Bar dataKey="players" name="在线人数" stackId="a" fill="#0067C0" />
              <Bar dataKey="remaining" name="剩余空位" stackId="a" fill="#99C7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
