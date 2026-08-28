import React, { useState, useEffect } from 'react'
import { AppSettings, ReminderItem } from '../types'
import { audioTts } from '../utils/audioTts'
import {
  X,
  Settings,
  Volume2,
  Mic,
  Download,
  Upload,
  Sparkles,
  Shield,
  Monitor,
  ExternalLink,
  Globe,
} from 'lucide-react'
import { GithubIcon } from './GithubIcon'
import { openExternalUrl, GITHUB_REPO_URL, GITHUB_PAGES_URL } from '../utils/openExternal'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings
  onSaveSettings: (settings: AppSettings) => void
  reminders: ReminderItem[]
  onImportReminders: (reminders: ReminderItem[]) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  reminders,
  onImportReminders,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('')

  useEffect(() => {
    setLocalSettings(settings)
    const voices = audioTts.getVoices()
    setAvailableVoices(voices)
  }, [settings, isOpen])

  if (!isOpen) return null

  const handleExportData = () => {
    const dataStr = JSON.stringify(
      {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        reminders,
        settings: localSettings,
      },
      null,
      2
    )
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `video_reminders_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)
        if (parsed.reminders && Array.isArray(parsed.reminders)) {
          onImportReminders(parsed.reminders)
          alert(`Đã nhập thành công ${parsed.reminders.length} nhắc hẹn!`)
          onClose()
        }
      } catch (err) {
        alert('File không hợp lệ hoặc bị lỗi định dạng JSON!')
      }
    }
    reader.readAsText(file)
  }

  const handleTestVoice = () => {
    audioTts.speak('Xin chào, đây là giọng đọc thử nghiệm nhắc hẹn của ứng dụng.', {
      rate: localSettings.voiceRate,
      pitch: localSettings.voicePitch,
      voiceURI: selectedVoiceUri,
    })
  }

  const handleSave = () => {
    onSaveSettings(localSettings)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Cài Đặt Hệ Thống</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300">
          {/* Cấu hình Giọng đọc */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tùy chỉnh giọng đọc Text-to-Speech</span>
              </span>
              <button
                type="button"
                onClick={handleTestVoice}
                className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition cursor-pointer"
              >
                Thử giọng
              </button>
            </div>

            {/* Select Voice */}
            {availableVoices.length > 0 && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Chọn giọng đọc hệ thống:
                </label>
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => setSelectedVoiceUri(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="">Tự động nhận diện (Tiếng Việt ưu tiên)</option>
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Voice Rate */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Tốc độ nói:</span>
                <span className="font-mono text-indigo-300 font-bold">{localSettings.voiceRate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={localSettings.voiceRate}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, voiceRate: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Sao lưu & Phục hồi */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sao lưu & Đồng bộ dữ liệu</span>
            </span>

            <p className="text-slate-400">
              Xuất toàn bộ danh sách lịch nhắc hẹn ra file để chuyển sang máy tính khác hoặc điện thoại.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất file Backup (JSON)</span>
              </button>

              <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-2 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Nhập từ file</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* GitHub Page & Source Code */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <GithubIcon size={14} className="text-indigo-400" />
                <span>Mã nguồn & GitHub Page</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">HoangKyAnh05/Tool_Report</span>
            </div>

            <p className="text-slate-400">
              Truy cập trang dự án trên GitHub để cập nhật phiên bản mới, xem hướng dẫn chi tiết hoặc đóng góp tính năng.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openExternalUrl(GITHUB_REPO_URL)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-2 transition cursor-pointer hover:border-slate-500"
              >
                <GithubIcon size={15} />
                <span>Mở GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => openExternalUrl(GITHUB_PAGES_URL)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-2 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Mở GitHub Page Web</span>
                <ExternalLink className="w-3 h-3 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition cursor-pointer"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  )
}
