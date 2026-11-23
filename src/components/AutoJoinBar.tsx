import React, { useState } from 'react'
import { Zap, Square, ChevronUp, ChevronDown, Volume2, Sliders } from 'lucide-react'
import type { AutoJoinState } from '../types/server'

interface AutoJoinBarProps {
  state: AutoJoinState
  onStop: () => void
  onUpdateThreshold: (newThreshold: number) => void
  onTestSound: () => void
}

export const AutoJoinBar: React.FC<AutoJoinBarProps> = ({
  state,
  onStop,
  onUpdateThreshold,
  onTestSound
}) => {
  const [expanded, setExpanded] = useState(false)

  if (!state.active || !state.server) return null

  const sec = Math.floor(state.elapsedMs / 1000)
  const mm = Math.floor(sec / 60).toString().padStart(2, '0')
  const ss = (sec % 60).toString().padStart(2, '0')

  return (
    <div className="fixed bottom-4 left-[204px] right-5 z-30">
      <div className="rounded-lg bg-white/95 dark:bg-[#2C2C2C]/95 backdrop-blur-md border border-[#0067C0]/40 dark:border-[#60CDFF]/40 shadow-fluent-flyout overflow-hidden">
        {expanded && (
          <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.07] bg-[#F6F6F6] dark:bg-[#242424] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[12px]">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 text-[#5D5D5D] dark:text-[#A0A0A0]">
                  <Sliders className="w-3.5 h-3.5" /> 触发条件：人数 ≤
                </span>
                <input
                  type="number"
                  min={0}
                  max={Math.max(1, state.maxPlayers)}
                  value={state.targetMaxPlayers}
                  onChange={(e) => onUpdateThreshold(Number(e.target.value))}
                  className="w-16 h-7 px-2 fluent-input font-mono text-center text-[12px]"
                />
                <span className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0]">
                  间隔 {state.pollDelayMs}ms · {state.concurrency} 并发
                </span>
              </div>
              <button
                onClick={onTestSound}
                className="h-7 px-3 fluent-btn-standard text-[12px] inline-flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#60CDFF]" /> 试听提示音
              </button>
            </div>

            <div className="max-h-28 overflow-y-auto rounded-md bg-white dark:bg-[#1E1E1E] border border-black/[0.06] dark:border-white/[0.07] p-2 font-mono text-[11px] space-y-1">
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

        <div className="px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[#0067C0]/10 dark:bg-[#60CDFF]/15 text-[#0067C0] dark:text-[#60CDFF] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold truncate">
                  正在自动挤服：{state.server.displayName}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#0067C0]/10 text-[#0067C0] dark:bg-[#60CDFF]/15 dark:text-[#60CDFF]">
                  目标 ≤ {state.targetMaxPlayers} 人
                </span>
              </div>
              <div className="text-[11.5px] text-[#5D5D5D] dark:text-[#A0A0A0] flex items-center gap-3 font-mono mt-0.5">
                <span>
                  实时:{' '}
                  <strong className="text-[#1A1A1A] dark:text-[#F3F3F3]">
                    {state.currentPlayers >= 0 ? `${state.currentPlayers}/${state.maxPlayers}` : '探测中...'}
                  </strong>
                </span>
                <span>延迟: {state.ping > 0 ? `${state.ping}ms` : '--'}</span>
                <span>探测: {state.attempts} 次</span>
                <span>耗时: {mm}:{ss}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="h-7 px-2.5 fluent-btn-standard text-[12px] inline-flex items-center gap-1"
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span>{expanded ? '收起' : '日志'}</span>
            </button>
            <button
              onClick={onStop}
              className="h-7 px-3.5 rounded-md bg-[#C42B1C] hover:bg-[#A62114] text-white text-[12px] font-medium inline-flex items-center gap-1.5"
            >
              <Square className="w-3 h-3 fill-current" /> 停止挤服
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
