import React, { useState } from 'react'
import {
  Bell,
  BellOff,
  Plus,
  X,
  Play,
  Zap,
  Sparkles,
  Trash2,
  ArrowRight,
  Radio
} from 'lucide-react'
import type { MapChangeEvent, ServerItem } from '../types/server'
import { DIFFICULTY_STYLES } from '../utils/grouping'

interface MapMonitorViewProps {
  servers: ServerItem[]
  watchedServerIds: string[]
  watchedKeywords: string[]
  events: MapChangeEvent[]
  onToggleWatchServer: (id: string) => void
  onAddKeyword: (kw: string) => void
  onRemoveKeyword: (kw: string) => void
  onClearEvents: () => void
  onJoinServer: (server: ServerItem) => void
  onAutoJoinServer: (server: ServerItem) => void
  onTestNotify: () => void
}

export const MapMonitorView: React.FC<MapMonitorViewProps> = ({
  servers,
  watchedServerIds,
  watchedKeywords,
  events,
  onToggleWatchServer,
  onAddKeyword,
  onRemoveKeyword,
  onClearEvents,
  onJoinServer,
  onAutoJoinServer,
  onTestNotify
}) => {
  const [kwInput, setKwInput] = useState('')

  const watchedSet = new Set(watchedServerIds)
  const watchedServers = servers.filter((s) => watchedSet.has(s.id))
  const serverById = new Map(servers.map((s) => [s.id, s]))

  const handleAddKw = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = kwInput.trim()
    if (!trimmed) return
    onAddKeyword(trimmed)
    setKwInput('')
  }

  return (
    <div className="p-6 space-y-6 max-w-[1280px] mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3]">
            换图监控与提醒
          </h1>
          <p className="text-[13px] text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
            每 3 秒自动检测服务器地图变更，触发 Windows 桌面通知与清脆提示音
          </p>
        </div>
        <button
          onClick={onTestNotify}
          className="h-9 px-4 rounded-full bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] dark:bg-[#004A77] dark:text-[#C2E7FF] text-[12.5px] font-medium inline-flex items-center gap-1.5"
        >
          <Bell className="w-3.5 h-3.5" /> 测试桌面通知
        </button>
      </div>

      {/* Top Row: Watched Servers + Keyword Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Watched Servers */}
        <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                已监控的服务器 ({watchedServers.length})
              </h2>
              <p className="text-[11.5px] text-[#5F6368] dark:text-[#9AA0A6]">
                在服务器列表点击任意卡片右上角的铃铛图标即可加入/取消监控
              </p>
            </div>
          </div>

          {watchedServers.length === 0 ? (
            <div className="rounded-xl bg-[#F8F9FA] dark:bg-[#282A2C] py-8 text-center text-[12.5px] text-[#5F6368] dark:text-[#9AA0A6]">
              尚未勾选监控的服务器，可在「服务器」页面点击铃铛图标开启
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {watchedServers.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl bg-[#F8F9FA] dark:bg-[#282A2C] px-3.5 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                      {s.displayName}
                    </div>
                    <div className="text-[11.5px] text-[#5F6368] dark:text-[#9AA0A6] truncate font-mono">
                      当前：{s.mapDisplayName ? `${s.mapDisplayName} (${s.map})` : s.map || '--'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onJoinServer(s)}
                      className="h-7 px-2.5 rounded-full bg-[#1A73E8] text-white dark:bg-[#A8C7FA] dark:text-[#041E49] text-[11px] font-medium"
                    >
                      加入
                    </button>
                    <button
                      onClick={() => onToggleWatchServer(s.id)}
                      className="w-7 h-7 rounded-full hover:bg-[#FCE8E6] text-[#5F6368] hover:text-[#D93025] flex items-center justify-center"
                      title="取消监控"
                    >
                      <BellOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keyword Map Watch */}
        <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] p-5 space-y-3">
          <div>
            <h2 className="text-[15px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              地图关键词全服监控 ({watchedKeywords.length})
            </h2>
            <p className="text-[11.5px] text-[#5F6368] dark:text-[#9AA0A6]">
              当当前社区任意服务器切换到包含以下关键词的地图（支持英文原名或中文译名）时立即提醒
            </p>
          </div>

          <form onSubmit={handleAddKw} className="flex gap-2">
            <input
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              placeholder="例如: ze_ffxiv、衔尾蛇、miside、surf_"
              className="flex-1 h-9 px-3.5 rounded-full bg-[#F8F9FA] dark:bg-[#282A2C] border border-[#DADCE0] dark:border-[#3C4043] focus:border-[#1A73E8] text-[12.5px] outline-none"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-full bg-[#1A73E8] hover:bg-[#1765CC] dark:bg-[#A8C7FA] dark:text-[#041E49] text-white text-[12.5px] font-medium inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> 添加
            </button>
          </form>

          {watchedKeywords.length === 0 ? (
            <div className="rounded-xl bg-[#F8F9FA] dark:bg-[#282A2C] py-6 text-center text-[12.5px] text-[#5F6368] dark:text-[#9AA0A6]">
              暂无地图关键词订阅，添加想蹲的神图关键词吧
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {watchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full bg-[#E8F0FE] dark:bg-[#004A77] text-[#1967D2] dark:text-[#C2E7FF] text-[12.5px] font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{kw}</span>
                  <button
                    onClick={() => onRemoveKeyword(kw)}
                    className="w-5 h-5 rounded-full hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Map Change Event Feed */}
      <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#1E8E3E]" />
            <h2 className="text-[15px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              实时换图记录 ({events.length})
            </h2>
          </div>
          {events.length > 0 && (
            <button
              onClick={onClearEvents}
              className="h-8 px-3 rounded-full hover:bg-[#F1F3F4] dark:hover:bg-[#282A2C] text-[12px] text-[#5F6368] inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> 清空记录
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[#9AA0A6]">
            监控运行中，当已订阅的服务器换图或命中地图关键词时，将在此记录并弹出桌面通知
          </div>
        ) : (
          <div className="divide-y divide-[#F1F3F4] dark:divide-[#2D2E30]">
            {events.map((ev) => {
              const diff = DIFFICULTY_STYLES[ev.difficulty]
              const srv = serverById.get(ev.serverId)
              return (
                <div
                  key={ev.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11.5px] font-mono text-[#5F6368] dark:text-[#9AA0A6]">
                        {ev.time}
                      </span>
                      <span className="text-[13.5px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                        {ev.serverName}
                      </span>
                      <span
                        className={`text-[10.5px] px-2 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}
                      >
                        {diff.label}
                      </span>
                      {ev.reason === 'keyword_match' && ev.matchedKeyword && (
                        <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#FEF7E0] text-[#B06000] dark:bg-[#E37400]/30 dark:text-[#FDD663]">
                          命中关键词：{ev.matchedKeyword}
                        </span>
                      )}
                    </div>
                    <div className="text-[12.5px] text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-2 font-mono flex-wrap">
                      <span className="line-through opacity-70">{ev.oldMap || '未知'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1A73E8]" />
                      <span className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                        {ev.newMapDisplayName
                          ? `${ev.newMapDisplayName} (${ev.newMap})`
                          : ev.newMap}
                      </span>
                    </div>
                  </div>

                  {srv && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onJoinServer(srv)}
                        className="h-8 px-3.5 rounded-full bg-[#1A73E8] hover:bg-[#1765CC] dark:bg-[#A8C7FA] dark:text-[#041E49] text-white text-[12px] font-medium inline-flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" /> 加入
                      </button>
                      <button
                        onClick={() => onAutoJoinServer(srv)}
                        className="h-8 px-3 rounded-full bg-[#E8F0FE] text-[#1967D2] dark:bg-[#004A77] dark:text-[#C2E7FF] text-[12px] font-medium inline-flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> 挤服
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
