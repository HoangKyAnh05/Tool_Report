import React, { useState, useEffect } from 'react'
import { ReminderItem, RepeatType } from '../types'
import { SAMPLE_VIDEOS } from '../data/sampleVideos'
import { audioTts } from '../utils/audioTts'
import {
  X,
  Clock,
  Video,
  Volume2,
  FolderOpen,
  Play,
  Sparkles,
  Check,
  Maximize2,
  Mic,
} from 'lucide-react'

interface ReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (reminder: ReminderItem) => void
  initialData?: ReminderItem | null
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 0, label: 'Chủ Nhật' },
]

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [time, setTime] = useState('08:00')
  const [repeatType, setRepeatType] = useState<RepeatType>('daily')
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5])
  
  const [videoType, setVideoType] = useState<'local' | 'sample' | 'url'>('sample')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoName, setVideoName] = useState('')
  
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [ttsMessage, setTtsMessage] = useState('')
  const [volume, setVolume] = useState(85)
  const [autoFullscreen, setAutoFullscreen] = useState(false)
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false)

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description || '')
      setTime(initialData.time)
      setRepeatType(initialData.repeatType)
      setCustomDays(initialData.customDays || [1, 2, 3, 4, 5])
      setVideoType(initialData.videoType)
      setVideoUrl(initialData.videoUrl)
      setVideoName(initialData.videoName)
      setTtsEnabled(initialData.ttsEnabled)
      setTtsMessage(initialData.ttsMessage)
      setVolume(initialData.volume ?? 85)
      setAutoFullscreen(initialData.autoFullscreen ?? false)
    } else {
      // Default new reminder
      const now = new Date()
      now.setMinutes(now.getMinutes() + 2)
      const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`

      setTitle('Nhắc nhở: Đến giờ quan trọng')
      setDescription('')
      setTime(defaultTime)
      setRepeatType('daily')
      setCustomDays([1, 2, 3, 4, 5])
      setVideoType('sample')
      setVideoUrl(SAMPLE_VIDEOS[0].url)
      setVideoName(SAMPLE_VIDEOS[0].title)
      setTtsEnabled(true)
      setTtsMessage('Đã đến giờ rồi! Hãy mở video lên và làm theo hướng dẫn nhé.')
      setVolume(85)
      setAutoFullscreen(false)
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSelectLocalVideo = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.openVideoDialog()
      if (res) {
        setVideoType('local')
        setVideoUrl(res.path)
        setVideoName(res.name)
      }
    } else {
      alert('Vui lòng chọn từ thư viện mẫu hoặc nhập URL video khi chạy trên trình duyệt!')
    }
  }

  const handleTestVoice = async () => {
    if (isPlayingTestVoice) {
      audioTts.stop()
      setIsPlayingTestVoice(false)
      return
    }

    setIsPlayingTestVoice(true)
    audioTts.playChime(volume / 100)
    await audioTts.speak(ttsMessage || title, { volume })
    setIsPlayingTestVoice(false)
  }

  const toggleDay = (dayVal: number) => {
    if (customDays.includes(dayVal)) {
      if (customDays.length > 1) {
        setCustomDays(customDays.filter((d) => d !== dayVal))
      }
    } else {
      setCustomDays([...customDays, dayVal].sort())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const item: ReminderItem = {
      id: initialData?.id || `rem_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      time,
      repeatType,
      customDays: repeatType === 'custom_days' ? customDays : [0, 1, 2, 3, 4, 5, 6],
      enabled: initialData ? initialData.enabled : true,
      videoType,
      videoUrl: videoUrl || SAMPLE_VIDEOS[0].url,
      videoName: videoName || 'Video mặc định',
      ttsEnabled,
      ttsMessage: ttsMessage.trim() || `Đến giờ cho công việc: ${title}`,
      volume,
      autoFullscreen,
      createdAt: initialData?.createdAt || Date.now(),
    }

    onSave(item)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              {initialData ? 'Chỉnh Sửa Nhắc Hẹn' : 'Tạo Nhắc Hẹn Phát Video Mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tiêu đề & Giờ hẹn */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tiêu đề nhắc hẹn *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Tập thể dục vươn vai, Họp dự án..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Thời gian reo *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono text-center font-bold text-indigo-300"
              />
            </div>
          </div>

          {/* Ghi chú thêm */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Ghi chú nội dung (Tùy chọn)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Nhớ mang theo sổ tay, uống 1 cốc nước..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          {/* Lặp lại */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tần suất lặp lại
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'daily', label: 'Hàng ngày' },
                { id: 'once', label: 'Chỉ 1 lần' },
                { id: 'custom_days', label: 'Chọn các thứ' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRepeatType(r.id as RepeatType)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    repeatType === r.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Selector for custom days */}
            {repeatType === 'custom_days' && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = customDays.includes(d.value)
                  return (
                    <button
                      type="button"
                      key={d.value}
                      onClick={() => toggleDay(d.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cấu hình Video */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Video Phát Khi Đến Giờ Báo Thức</span>
              </label>

              {/* Video source tabs */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setVideoType('sample')}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    videoType === 'sample'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mẫu có sẵn
                </button>
                {isElectron && (
                  <button
                    type="button"
                    onClick={() => setVideoType('local')}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                      videoType === 'local'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    File từ PC
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setVideoType('url')}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    videoType === 'url'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Link URL
                </button>
              </div>
            </div>

            {/* Video Type: Sample Grid */}
            {videoType === 'sample' && (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 pt-1">
                {SAMPLE_VIDEOS.map((v) => {
                  const isSelected = videoUrl === v.url
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setVideoUrl(v.url)
                        setVideoName(v.title)
                      }}
                      className={`relative rounded-xl overflow-hidden border p-2 flex items-center gap-2.5 cursor-pointer transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-14 h-11 object-cover rounded-lg shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {v.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {v.description}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Video Type: Local File */}
            {videoType === 'local' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectLocalVideo}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow transition cursor-pointer shrink-0"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Chọn File Video từ máy tính</span>
                  </button>
                  <span className="text-xs text-slate-400 truncate flex-1">
                    {videoName || 'Chưa chọn file video (.mp4, .mkv, .webm)'}
                  </span>
                </div>
                {videoUrl && (
                  <div className="text-[11px] font-mono text-slate-500 truncate bg-slate-900 p-2 rounded-lg border border-slate-800">
                    {videoUrl}
                  </div>
                )}
              </div>
            )}

            {/* Video Type: URL */}
            {videoType === 'url' && (
              <div className="space-y-1.5 pt-1">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value)
                    setVideoName('Video từ liên kết trực tuyến')
                  }}
                  placeholder="https://example.com/my-video.mp4"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Giọng đọc nhắc nhở (Text to Speech) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Giọng Nói Nhắc Nhở (Text-to-Speech)</span>
              </label>

              <button
                type="button"
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  ttsEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    ttsEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {ttsEnabled && (
              <div className="space-y-2.5">
                <textarea
                  rows={2}
                  value={ttsMessage}
                  onChange={(e) => setTtsMessage(e.target.value)}
                  placeholder="Nhập câu nói bạn muốn app đọc khi đến giờ (VD: Đến giờ A, B, C rồi! Hãy chuẩn bị nào)..."
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs resize-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Ứng dụng sẽ tự đọc câu này kết hợp cùng âm thanh chuông.
                  </span>
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{isPlayingTestVoice ? 'Đang đọc...' : 'Nghe thử giọng'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Âm lượng & Tùy chọn hiển thị */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Âm lượng chuông & video ({volume}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-slate-200">
                  Tự động Full-screen
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoFullscreen}
                onChange={(e) => setAutoFullscreen(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
            >
              {initialData ? 'Lưu Thay Đổi' : 'Tạo Nhắc Hẹn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
