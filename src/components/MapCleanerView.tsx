import React, { useEffect, useMemo, useState } from 'react'
import {
  HardDrive,
  Trash2,
  RefreshCw,
  FolderOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileArchive
} from 'lucide-react'
import type { MapFileEntry, MapScanResult } from '../types/server'
import { buildMapLookupIndex, resolveMapMeta } from '../utils/mapResolver'

interface MapCleanerViewProps {
  cs2Path: string
  mapDict: Record<string, { mapNameCN: string; difficulty: string }>
  onPickCs2Path: () => Promise<void>
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(i >= 2 ? 2 : 0)} ${units[i]}`
}

function formatDate(ms: number): string {
  if (!ms) return '--'
  const d = new Date(ms)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
    .getDate()
    .toString()
    .padStart(2, '0')}`
}

export const MapCleanerView: React.FC<MapCleanerViewProps> = ({
  cs2Path,
  mapDict,
  onPickCs2Path
}) => {
  const [scan, setScan] = useState<MapScanResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'size_desc' | 'date_asc' | 'name'>('size_desc')
  const [resultMsg, setResultMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const runScan = async () => {
    if (!window.cs2Api || !cs2Path) return
    setScanning(true)
    setResultMsg(null)
    try {
      const res = await window.cs2Api.maps.scan(cs2Path)
      setScan(res)
      setSelectedPaths(new Set())
    } finally {
      setScanning(false)
    }
  }

  useEffect(() => {
    if (cs2Path) runScan()
  }, [cs2Path])

  const mapLookupIndex = useMemo(() => buildMapLookupIndex(mapDict), [mapDict])

  const filteredEntries = useMemo(() => {
    const list = scan?.entries || []
    const q = search.trim().toLowerCase()
    const filtered = q
      ? list.filter((e) => {
          const cn = resolveMapMeta(e.name, undefined, undefined, mapLookupIndex).mapDisplayName
          return (
            e.name.toLowerCase().includes(q) ||
            (e.workshopId || '').includes(q) ||
            cn.toLowerCase().includes(q)
          )
        })
      : list

    const sorted = [...filtered]
    if (sortBy === 'size_desc') sorted.sort((a, b) => b.sizeBytes - a.sizeBytes)
    else if (sortBy === 'date_asc') sorted.sort((a, b) => a.mtimeMs - b.mtimeMs)
    else sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [scan, search, sortBy, mapLookupIndex])

  const selectedBytes = useMemo(() => {
    let total = 0
    for (const e of scan?.entries || []) {
      if (selectedPaths.has(e.filePath)) total += e.sizeBytes
    }
    return total
  }, [scan, selectedPaths])

  const toggleSelect = (p: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })
  }

  const selectByPredicate = (fn: (e: MapFileEntry) => boolean) => {
    const next = new Set<string>()
    for (const e of filteredEntries) {
      if (fn(e)) next.add(e.filePath)
    }
    setSelectedPaths(next)
  }

  const handleDelete = async (moveToTrash: boolean) => {
    if (!window.cs2Api || selectedPaths.size === 0) return
    if (!moveToTrash) {
      const confirmed = window.confirm(
        `确定要彻底删除选中的 ${selectedPaths.size} 个地图文件（约 ${formatBytes(
          selectedBytes
        )}）吗？此操作不可恢复。`
      )
      if (!confirmed) return
    }
    setDeleting(true)
    try {
      const res = await window.cs2Api.maps.delete(Array.from(selectedPaths), moveToTrash)
      setResultMsg({
        ok: res.errors.length === 0,
        text:
          res.errors.length === 0
            ? `已${moveToTrash ? '移至回收站' : '彻底删除'} ${res.deletedCount} 个地图项目，释放空间 ${formatBytes(
                res.freedBytes
              )}`
            : `已清理 ${res.deletedCount} 项（释放 ${formatBytes(res.freedBytes)}），${
                res.errors.length
              } 项失败：${res.errors[0]}`
      })
      await runScan()
    } finally {
      setDeleting(false)
    }
  }

  const now = Date.now()
  const DAY = 86400 * 1000

  return (
    <div className="p-6 space-y-5 max-w-[1300px] mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3]">
            CS2 地图文件清理
          </h1>
          <p className="text-[13px] text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
            扫描 Steam 创意工坊 (730) 与本地社区地图文件，一键释放磁盘空间
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPickCs2Path}
            className="h-9 px-3.5 rounded-full bg-white dark:bg-[#1E1F20] border border-[#DADCE0] dark:border-[#3C4043] hover:bg-[#F1F3F4] dark:hover:bg-[#282A2C] text-[12.5px] font-medium inline-flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" /> 选择 CS2 路径
          </button>
          <button
            onClick={runScan}
            disabled={scanning || !cs2Path}
            className="h-9 px-4 rounded-full bg-[#1A73E8] hover:bg-[#1765CC] disabled:opacity-40 dark:bg-[#A8C7FA] dark:text-[#041E49] text-white text-[12.5px] font-medium inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? '扫描中...' : '重新扫描'}
          </button>
        </div>
      </div>

      {!cs2Path && (
        <div className="rounded-2xl bg-[#FEF7E0] dark:bg-[#E37400]/20 border border-[#FEEFC3] dark:border-[#E37400]/40 px-4 py-3.5 text-[13px] text-[#B06000] dark:text-[#FDD663] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>尚未检测到 CS2 安装目录，请点击右上角「选择 CS2 路径」指定 Counter-Strike Global Offensive 目录。</span>
        </div>
      )}

      {resultMsg && (
        <div
          className={`rounded-2xl px-4 py-3 text-[12.5px] flex items-center gap-2 border ${
            resultMsg.ok
              ? 'bg-[#E6F4EA] border-[#CEEAD6] text-[#137333] dark:bg-[#137333]/20 dark:text-[#81C995]'
              : 'bg-[#FEF7E0] border-[#FEEFC3] text-[#B06000] dark:bg-[#E37400]/20 dark:text-[#FDD663]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resultMsg.text}</span>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] p-4">
          <div className="text-[12px] text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-[#1A73E8]" /> 社区/工坊地图总占用
          </div>
          <div className="mt-1.5 text-[24px] font-mono font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {formatBytes(scan?.totalSizeBytes || 0)}
          </div>
          <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] truncate mt-1">
            {scan?.workshopDir || '未发现 workshop/content/730 目录'}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] p-4">
          <div className="text-[12px] text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
            <FileArchive className="w-4 h-4 text-[#34A853]" /> 地图项目数量
          </div>
          <div className="mt-1.5 text-[24px] font-mono font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {scan?.entries.length || 0}
          </div>
          <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] mt-1">
            含创意工坊订阅包与本地社区地图
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] p-4">
          <div className="text-[12px] text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-[#EA4335]" /> 已选可释放空间
          </div>
          <div className="mt-1.5 text-[24px] font-mono font-semibold text-[#D93025] dark:text-[#F28B82]">
            {formatBytes(selectedBytes)}
          </div>
          <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] mt-1">
            已选中 {selectedPaths.size} 个项目
          </div>
        </div>
      </div>

      {/* Filter & Bulk Action Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#5F6368] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="筛选地图名或工坊 ID..."
                className="h-8 pl-8 pr-3 rounded-full bg-[#F8F9FA] dark:bg-[#282A2C] border border-[#DADCE0] dark:border-[#3C4043] text-[12px] outline-none w-52"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2.5 rounded-lg bg-[#F8F9FA] dark:bg-[#282A2C] border border-[#DADCE0] dark:border-[#3C4043] text-[12px] outline-none"
            >
              <option value="size_desc">按体积从大到小</option>
              <option value="date_asc">按修改时间从旧到新</option>
              <option value="name">按名称排序</option>
            </select>

            <button
              onClick={() => selectByPredicate(() => true)}
              className="h-8 px-3 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] dark:bg-[#282A2C] text-[11.5px]"
            >
              全选
            </button>
            <button
              onClick={() => setSelectedPaths(new Set())}
              className="h-8 px-3 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] dark:bg-[#282A2C] text-[11.5px]"
            >
              取消选择
            </button>
            <button
              onClick={() => selectByPredicate((e) => now - e.mtimeMs > 30 * DAY)}
              className="h-8 px-3 rounded-full bg-[#FEF7E0] text-[#B06000] dark:bg-[#E37400]/25 dark:text-[#FDD663] text-[11.5px] font-medium"
            >
              30 天未更新
            </button>
            <button
              onClick={() => selectByPredicate((e) => e.sizeBytes >= 200 * 1024 * 1024)}
              className="h-8 px-3 rounded-full bg-[#FCE8E6] text-[#C5221F] dark:bg-[#C5221F]/25 dark:text-[#F28B82] text-[11.5px] font-medium"
            >
              大于 200MB
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDelete(true)}
              disabled={deleting || selectedPaths.size === 0}
              className="h-8 px-4 rounded-full bg-[#1A73E8] hover:bg-[#1765CC] disabled:opacity-40 dark:bg-[#A8C7FA] dark:text-[#041E49] text-white text-[12px] font-medium inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> 移至回收站 ({selectedPaths.size})
            </button>
            <button
              onClick={() => handleDelete(false)}
              disabled={deleting || selectedPaths.size === 0}
              className="h-8 px-3.5 rounded-full bg-[#FCE8E6] hover:bg-[#FAD2CF] disabled:opacity-40 text-[#C5221F] dark:bg-[#C5221F]/30 dark:text-[#F28B82] text-[12px] font-medium"
            >
              彻底删除
            </button>
          </div>
        </div>
      </div>

      {/* File Table */}
      <div className="rounded-2xl bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-[#9AA0A6]">
            {scanning ? '正在扫描磁盘上的地图文件...' : '未发现可清理的创意工坊或社区地图文件'}
          </div>
        ) : (
          <div className="max-h-[460px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#F8F9FA] dark:bg-[#282A2C] border-b border-[#E8EAED] dark:border-[#303134] text-[11.5px] text-[#5F6368] dark:text-[#9AA0A6]">
                <tr>
                  <th className="py-2.5 pl-4 pr-2 w-10" />
                  <th className="py-2.5 px-3">地图 / 工坊名称</th>
                  <th className="py-2.5 px-3 w-28">来源</th>
                  <th className="py-2.5 px-3 w-28">占用体积</th>
                  <th className="py-2.5 px-3 w-28">最后修改</th>
                  <th className="py-2.5 pl-3 pr-4 text-right w-20">目录</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F4] dark:divide-[#2D2E30] text-[12.5px]">
                {filteredEntries.map((item) => {
                  const checked = selectedPaths.has(item.filePath)
                  const cn = resolveMapMeta(item.name, undefined, undefined, mapLookupIndex).mapDisplayName
                  return (
                    <tr
                      key={item.id}
                      onClick={() => toggleSelect(item.filePath)}
                      className={`cursor-pointer hover:bg-[#F8F9FA] dark:hover:bg-[#282A2C]/60 ${
                        checked ? 'bg-[#E8F0FE]/50 dark:bg-[#004A77]/20' : ''
                      }`}
                    >
                      <td className="py-2.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="accent-[#1A73E8]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                          {cn ? `${cn} (${item.name})` : item.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#5F6368] dark:text-[#9AA0A6]">
                          {item.workshopId ? `Workshop ID: ${item.workshopId}` : item.filePath}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            item.source === 'workshop'
                              ? 'bg-[#E8F0FE] text-[#1967D2] dark:bg-[#004A77] dark:text-[#C2E7FF]'
                              : 'bg-[#E6F4EA] text-[#137333] dark:bg-[#137333]/25 dark:text-[#81C995]'
                          }`}
                        >
                          {item.source === 'workshop' ? '创意工坊' : '本地地图'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium">
                        {formatBytes(item.sizeBytes)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#5F6368] dark:text-[#9AA0A6]">
                        {formatDate(item.mtimeMs)}
                      </td>
                      <td className="py-2.5 pl-3 pr-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.cs2Api?.maps.openFolder(item.filePath)
                          }}
                          className="w-7 h-7 rounded-full hover:bg-[#E8EAED] dark:hover:bg-[#3C4043] inline-flex items-center justify-center text-[#5F6368]"
                          title="在资源管理器中打开"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
