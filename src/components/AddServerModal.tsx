import React, { useEffect, useState } from 'react'
import { X, Search, CheckCircle2, AlertCircle } from 'lucide-react'
import type { CommunityId, CustomServerConfig } from '../types/server'

interface AddServerModalProps {
  open: boolean
  activeCommunity: CommunityId
  existingGroups: string[]
  onClose: () => void
  onSave: (server: CustomServerConfig) => void
}

export const AddServerModal: React.FC<AddServerModalProps> = ({
  open,
  activeCommunity,
  existingGroups,
  onClose,
  onSave
}) => {
  const [rawAddr, setRawAddr] = useState('')
  const [name, setName] = useState('')
  const [community, setCommunity] = useState<CommunityId | 'custom'>(activeCommunity)
  const [group, setGroup] = useState('自定义服务器')
  const [region, setRegion] = useState('自定义')
  const [notes, setNotes] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    if (open) setCommunity(activeCommunity)
  }, [open, activeCommunity])

  if (!open) return null

  const parseAddress = (input: string): { ip: string; port: number } | null => {
    const cleaned = input.trim().replace(/^connect\s+/i, '').replace(/^steam:\/\/connect\//i, '')
    const parts = cleaned.split(':')
    if (!parts[0]) return null
    const port = parts[1] ? Number(parts[1]) : 27015
    if (Number.isNaN(port) || port < 1 || port > 65535) return null
    return { ip: parts[0].trim(), port }
  }

  const handleTest = async () => {
    const parsed = parseAddress(rawAddr)
    if (!parsed) {
      setTestResult({ ok: false, msg: '地址格式错误，请输入如 202.189.4.124:27001' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await window.cs2Api?.a2s.info(parsed.ip, parsed.port)
      if (res?.online) {
        if (!name.trim() && res.name) {
          setName(res.name)
        }
        setTestResult({
          ok: true,
          msg: `连接成功！${res.map} · ${res.players}/${res.maxPlayers} 人 · ${res.ping}ms`
        })
      } else {
        setTestResult({ ok: false, msg: 'A2S 探测无响应（服务器可能离线或屏蔽查询，但仍可保存）' })
      }
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseAddress(rawAddr)
    if (!parsed) {
      setTestResult({ ok: false, msg: '请输入有效的 IP:端口 或 connect 指令' })
      return
    }
    onSave({
      id: `custom_${Date.now()}`,
      community,
      name: name.trim() || `${parsed.ip}:${parsed.port}`,
      ip: parsed.ip,
      port: parsed.port,
      group: group.trim() || '自定义服务器',
      region: region.trim() || '自定义',
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    })
    setRawAddr('')
    setName('')
    setNotes('')
    setTestResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="w-[480px] max-w-[92vw] rounded-[28px] bg-white dark:bg-[#1E1F20] border border-[#E8EAED] dark:border-[#303134] shadow-m3-3 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#E8EAED] dark:border-[#303134]">
          <div>
            <h2 className="text-[18px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              添加自定义服务器
            </h2>
            <p className="text-[12px] text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
              支持直接粘贴 IP:端口 或 connect 指令，自动实时 A2S 查询状态与地图难度
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F1F3F4] dark:hover:bg-[#282A2C] flex items-center justify-center text-[#5F6368]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#3C4043] dark:text-[#BDC1C6] mb-1.5">
              服务器地址 (IP:端口 或 connect 指令) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={rawAddr}
                onChange={(e) => setRawAddr(e.target.value)}
                placeholder="例如: 202.189.4.124:27001 或 connect 1.2.3.4:27015"
                className="flex-1 h-10 px-3.5 rounded-xl bg-[#F8F9FA] dark:bg-[#282A2C] border border-[#DADCE0] dark:border-[#3C4043] focus:border-[#1A73E8] dark:focus:border-[#A8C7FA] text-[13px] font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="h-10 px-4 rounded-xl bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] dark:bg-[#004A77] dark:text-[#C2E7FF] text-[12.5px] font-medium inline-flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                {testing ? '探测中...' : '探测信息'}
              </button>
            </div>
            {testResult && (
              <div
                className={`mt-2 text-[12px] flex items-center gap-1.5 ${
                  testResult.ok
                    ? 'text-[#1E8E3E] dark:text-[#81C995]'
                    : 'text-[#E37400] dark:text-[#FDD663]'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{testResult.msg}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#3C4043] dark:text-[#BDC1C6] mb-1.5">
                所属社区标签页
              </label>
              <select
                value={community}
                onChange={(e) => setCommunity(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-[#F8F9FA] dark:bg-[#282A2C] border border-[#DADCE0] dark:border-[#3C4043] text-[13px] outline-none"
              >
                <option value="exg">EXG 社区</option>
                <option value="zed">ZED 僵尸乐园</option>
                <option value="fys">FYS 风云社</option>
                <option value="custom">全社区可见</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3C4043] dark:text-[#BDC1C6] mb-1.5">
                显示名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="留空自动使用探测名"
                className="w-full h-10 px-3.5 rounded-xl bg-[#F8F9FA] dark:bg-[#282A2C] border border-[#DADCE0] dark:border-[#3C4043] focus:border-[#1A73E8] text-[13px] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#3C4043] dark:text-[#BDC1C6] mb-1.5">
                分组名称
              </label>
              <input
                type="text"
                list="group-suggestions"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#F8F9FA] dark:bg-[#282A2C] border border-[#DADCE0] dark:border-[#3C4043] focus:border-[#1A73E8] text-[13px] outline-none"
              />
              <datalist id="group-suggestions">
                <option value="自定义服务器" />
                <option value="好友私服" />
                {existingGroups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#3C4043] dark:text-[#BDC1C6] mb-1.5">
                节点地区
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="例如: 山东 / 香港"
                className="w-full h-10 px-3.5 rounded-xl bg-[#F8F9FA] dark:bg-[#282A2C] border border-[#DADCE0] dark:border-[#3C4043] focus:border-[#1A73E8] text-[13px] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-5 rounded-full hover:bg-[#F1F3F4] dark:hover:bg-[#282A2C] text-[13px] font-medium text-[#5F6368] dark:text-[#BDC1C6]"
            >
              取消
            </button>
            <button
              type="submit"
              className="h-9 px-6 rounded-full bg-[#1A73E8] hover:bg-[#1765CC] dark:bg-[#A8C7FA] dark:text-[#041E49] text-white text-[13px] font-medium shadow-sm"
            >
              保存并添加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
