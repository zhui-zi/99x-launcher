import React, { useState } from 'react'
import { Zap, Square, ChevronUp, ChevronDown, Volume2, X } from 'lucide-react'
import type { AutoJoinState } from '../types/server'

interface AutoJoinBarProps {
  state: AutoJoinState
  onStopOne: (serverId: string) => void
  onStopAll: () => void
  onUpdateThreshold: (serverId: string, newThreshold: number) => void
  onTestSound: () => void
}

export const AutoJoinBar: React.FC<AutoJoinBarProps> = ({
  state,
  onStopOne,
  onStopAll,
  onUpdateThreshold,
  onTestSound
}) => {
  const [expanded, setExpanded] = useState(false)
  const taskList = Object.values(state.tasks)

  if (taskList.length === 0) return null

  return (
    <div className="fixed bottom-4 left-[204px] right-5 z-30">
      <div className="rounded-lg bg-white/95 dark:bg-[#2C2C2C]/95 backdrop-blur-md border border-[#0067C0]/40 dark:border-[#60CDFF]/40 shadow-fluent-flyout overflow-hidden">
        {expanded && (
          <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.07] bg-[#F6F6F6] dark:bg-[#242424] space-y-3">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#1A1A1A] dark:text-[#F3F3F3]">
                并发挤服队列 ({taskList.length} 个服务器，任意一服出现空位将自动进服并停止其余队列)
              </span>
              <button
                onClick={onTestSound}
                className="h-7 px-3 fluent-btn-standard text-[12px] inline-flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF]" /> 试听提示音
              </button>
            </div>

            {/* Individual Queue Items */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {taskList.map((t) => {
                const sec = Math.floor(t.elapsedMs / 1000)
                const mm = Math.floor(sec / 60).toString().padStart(2, '0')
                const ss = (sec % 60).toString().padStart(2, '0')
                return (
                  <div
                    key={t.server.id}
                    className="rounded-md bg-white dark:bg-[#1E1E1E] border border-black/[0.06] dark:border-white/[0.07] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[12px]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[#1A1A1A] dark:text-[#F3F3F3] truncate">
                        {t.server.displayName}
                      </div>
                      <div className="text-[11px] font-mono text-[#5D5D5D] dark:text-[#A0A0A0] flex items-center gap-3">
                        <span>
                          人数:{' '}
                          <strong className="text-[#1A1A1A] dark:text-[#F3F3F3]">
                            {t.currentPlayers >= 0 ? `${t.currentPlayers}/${t.maxPlayers}` : '探测中'}
                          </strong>
                        </span>
                        <span>延迟: {t.ping > 0 ? `${t.ping}ms` : '--'}</span>
                        <span>探测: {t.attempts}次</span>
                        <span>耗时: {mm}:{ss}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0]">目标 ≤</span>
                      <input
                        type="number"
                        min={0}
                        max={Math.max(1, t.maxPlayers)}
                        value={t.targetMaxPlayers}
                        onChange={(e) => onUpdateThreshold(t.server.id, Number(e.target.value))}
                        className="w-14 h-6 px-1.5 fluent-input font-mono text-center text-[11.5px]"
                      />
                      <button
                        onClick={() => onStopOne(t.server.id)}
                        className="w-6 h-6 rounded hover:bg-[#C42B1C]/15 text-[#5D5D5D] hover:text-[#C42B1C] flex items-center justify-center"
                        title="移出挤服队列"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Unified Event Log */}
            <div className="max-h-24 overflow-y-auto rounded-md bg-white dark:bg-[#1E1E1E] border border-black/[0.06] dark:border-white/[0.07] p-2 font-mono text-[11px] space-y-0.5">
              {state.logs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.type === 'success'
                      ? 'text-[#0F7B0F] dark:text-[#6CCB5F]'
                      : log.type === 'warn'
                        ? 'text-[#9D5D00] dark:text-[#FCE100]'
                        : 'text-[#5D5D5D] dark:text-[#A0A0A0]'
                  }
                >
                  <span className="opacity-65 mr-2">[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed Summary Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-md bg-[#0067C0]/10 dark:bg-[#60CDFF]/15 text-[#0067C0] dark:text-[#60CDFF] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold">
                  {taskList.length === 1
                    ? `正在挤服：${taskList[0].server.displayName}`
                    : `正在同时挤服 (${taskList.length} 个服务器)`}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {taskList.slice(0, 4).map((t) => (
                    <span
                      key={t.server.id}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#0067C0]/10 text-[#0067C0] dark:bg-[#60CDFF]/15 dark:text-[#60CDFF]"
                    >
                      <span className="max-w-[110px] truncate">{t.server.displayName}</span>
                      <strong>
                        {t.currentPlayers >= 0 ? `${t.currentPlayers}/${t.maxPlayers}` : '...'}
                      </strong>
                      <button
                        onClick={() => onStopOne(t.server.id)}
                        className="hover:text-[#C42B1C] ml-0.5"
                        title="停止此服挤服"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {taskList.length > 4 && (
                    <span className="text-[11px] text-[#5D5D5D] dark:text-[#A0A0A0]">
                      +{taskList.length - 4} 更多
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="h-7 px-2.5 fluent-btn-standard text-[12px] inline-flex items-center gap-1"
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span>{expanded ? '收起' : '队列与日志'}</span>
            </button>
            <button
              onClick={onStopAll}
              className="h-7 px-3.5 rounded-md bg-[#C42B1C] hover:bg-[#A62114] text-white text-[12px] font-medium inline-flex items-center gap-1.5"
            >
              <Square className="w-3 h-3 fill-current" /> 全部停止
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
