import React, { useState, useEffect, useRef } from 'react'
import { ReminderItem, RepeatType } from '../types'
import { SAMPLE_VIDEOS } from '../data/sampleVideos'
import { audioTts } from '../utils/audioTts'
import {
  generateAiDynamicVideo,
  CURATED_TASK_VIDEOS,
} from '../utils/aiVideoGenerator'
import {
  searchOnlineVideos,
  SearchVideoResult,
} from '../utils/videoSearchEngine'
import { AiVideoPlayer } from './AiVideoPlayer'
import {
  X,
  Clock,
  Video,
  Volume2,
  FolderOpen,
  Play,
  Pause,
  Sparkles,
  Check,
  Maximize2,
  Mic,
  Loader2,
  Wand2,
  Globe,
  Film,
  Zap,
  Search,
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

const QUICK_TOPICS = [
  { label: '🍱 Ăn uống / Ăn tối', query: 'Đến giờ ăn tối' },
  { label: '💧 Uống nước', query: 'Uống nước nạp năng lượng' },
  { label: '🏃 Tập thể dục', query: 'Tập thể dục giãn cơ' },
  { label: '🌙 Đi ngủ / Nghỉ ngơi', query: 'Đến giờ đi ngủ' },
  { label: '💻 Lập trình / Code', query: 'Lập trình code dự án' },
  { label: '📚 Học bài / Đọc sách', query: 'Tập trung học bài đọc sách' },
  { label: '👥 Họp công ty', query: 'Đến giờ họp công việc' },
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

  // AI & Search States
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [isSearchingOnline, setIsSearchingOnline] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchVideoResult[]>([])
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null)

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
      setSearchResults([])
      setAiSuccessMessage(null)
    } else {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 2)
      const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`

      const defaultTitle = 'Nhắc nhở: Đến giờ ăn tối'
      setTitle(defaultTitle)
      setDescription('')
      setTime(defaultTime)
      setRepeatType('daily')
      setCustomDays([1, 2, 3, 4, 5])
      setVideoType('sample')
      setVideoUrl(CURATED_TASK_VIDEOS.meal.url)
      setVideoName(CURATED_TASK_VIDEOS.meal.title)
      setTtsEnabled(true)
      setTtsMessage('Đã đến giờ ăn tối rồi! Bạn hãy nghỉ ngơi và thưởng thức bữa tối ngon miệng nhé.')
      setVolume(85)
      setAutoFullscreen(false)
      setSearchResults(searchOnlineVideos(defaultTitle))
      setAiSuccessMessage('Đã tự động tìm và chọn video ăn tối phù hợp!')
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  // 1. Generate Custom AI Animated Video (6s)
  const handleGenerateAiVideo = async () => {
    const taskName = title.trim() || 'Nhiệm vụ hàng ngày'
    setIsGeneratingAi(true)
    setAiSuccessMessage(null)
    try {
      const generated = await generateAiDynamicVideo(taskName)
      setVideoType('url')
      setVideoUrl(generated.url)
      setVideoName(generated.title)
      setAiSuccessMessage(`✨ Đã tạo xong Video AI Đồ Họa 6s cho: "${taskName}"!`)

      if (!ttsMessage || ttsMessage.startsWith('Đã đến giờ')) {
        setTtsMessage(`Đã đến giờ cho nhiệm vụ: ${taskName}! Hãy mở video lên và hoàn thành nhé.`)
      }
    } catch (err) {
      alert('Không thể tạo video AI, vui lòng thử lại!')
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // 2. Search Online Videos (returns 4 matching options with live selection)
  const handleSearchOnlineVideos = () => {
    const taskName = title.trim() || 'Nhiệm vụ'
    setIsSearchingOnline(true)
    setAiSuccessMessage(null)

    setTimeout(() => {
      const results = searchOnlineVideos(taskName)
      setSearchResults(results)
      setIsSearchingOnline(false)

      if (results.length > 0) {
        // Automatically select the first best match
        const best = results[0]
        setVideoType('sample')
        setVideoUrl(best.url)
        setVideoName(best.title)
        setAiSuccessMessage(`🌐 Đã tìm thấy ${results.length} video trực tuyến phù hợp cho "${taskName}"!`)

        if (!ttsMessage || ttsMessage.startsWith('Đã đến giờ')) {
          setTtsMessage(`Đến giờ rồi! Hãy thực hiện nhiệm vụ ${taskName} theo video nhé.`)
        }
      }
    }, 400)
  }

  // 3. Quick Topic selection
  const handleQuickTopic = (topicQuery: string) => {
    setTitle(topicQuery)
    const results = searchOnlineVideos(topicQuery)
    setSearchResults(results)
    if (results.length > 0) {
      setVideoType('sample')
      setVideoUrl(results[0].url)
      setVideoName(results[0].title)
      setAiSuccessMessage(`Đã chọn chủ đề: "${topicQuery}"!`)
      setTtsMessage(`Đã đến giờ cho ${topicQuery} rồi, bạn hãy chuẩn bị nhé.`)
    }
  }

  // 4. Select a specific search result card
  const handleSelectSearchResult = (res: SearchVideoResult) => {
    setVideoType('sample')
    setVideoUrl(res.url)
    setVideoName(res.title)
    setAiSuccessMessage(`✓ Đã chọn: "${res.title}"`)
  }

  const handleSelectLocalVideo = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.openVideoDialog()
      if (res) {
        setVideoType('local')
        setVideoUrl(res.path)
        setVideoName(res.name)
        setAiSuccessMessage(`Đã chọn video từ máy tính: ${res.name}`)
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
      videoUrl: videoUrl || CURATED_TASK_VIDEOS.meal.url,
      videoName: videoName || 'Video nhắc hẹn',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Chỉnh Sửa Nhắc Hẹn' : 'Tạo Nhắc Hẹn Phát Video'}
              </h2>
              <p className="text-[11px] text-slate-400">Tự động quét tìm video phù hợp hoặc tạo video AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tiêu đề & Giờ hẹn */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Tiêu đề nhắc hẹn / Tên nhiệm vụ *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Đến giờ ăn tối, Uống nước, Tập thể dục, Họp dự án..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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

          {/* Quick topic chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Gợi ý nhanh theo chủ đề:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_TOPICS.map((topic, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleQuickTopic(topic.query)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500/40 text-[11px] font-medium transition cursor-pointer"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI & ONLINE VIDEO GENERATOR / SEARCH SECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950/90 to-slate-900 border-2 border-indigo-500/60 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Nút Tìm Kiếm & Tạo Video AI Cho: "{title || 'Nhiệm vụ'}"</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-500/40">
                5-10 giây
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Button 1: AI Dynamic Video Generator */}
              <button
                type="button"
                onClick={handleGenerateAiVideo}
                disabled={isGeneratingAi}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/40 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kết xuất Video AI 6s...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>✨ Tạo Video AI Đồ Họa (6s)</span>
                  </>
                )}
              </button>

              {/* Button 2: Online Search Matching */}
              <button
                type="button"
                onClick={handleSearchOnlineVideos}
                disabled={isSearchingOnline}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-cyan-600/40 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
              >
                {isSearchingOnline ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang quét video mạng...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>🌐 Tìm Clip Mạng Khớp Tiêu Đề</span>
                  </>
                )}
              </button>
            </div>

            {/* Success message */}
            {aiSuccessMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {/* SEARCH RESULTS CARDS (Shows 4 matching video options) */}
            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-indigo-500/20">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Kết quả tìm kiếm video phù hợp ({searchResults.length} video):</span>
                  <span className="text-[10px] text-cyan-300 font-medium">Bấm vào để chọn</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {searchResults.map((res) => {
                    const isSelected = videoUrl === res.url
                    return (
                      <div
                        key={res.id}
                        onClick={() => handleSelectSearchResult(res)}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={res.thumbnail}
                          alt={res.title}
                          className="w-12 h-10 object-cover rounded-lg shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">
                            {res.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>{res.category}</span>
                            <span>•</span>
                            <span className="text-cyan-300">{res.duration}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* VIDEO PREVIEW BOX */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4 text-cyan-400" />
                <span>Khung Xem Trước Video Đã Chọn</span>
              </label>

              {/* Source Tabs */}
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
                  Mẫu & AI
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

            {/* Video Player Box with 60fps AI Fallback */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-56 flex items-center justify-center shadow-2xl">
              {videoUrl ? (
                <AiVideoPlayer
                  key={videoUrl}
                  src={videoUrl}
                  taskTitle={title || 'Nhiệm vụ'}
                  isLocal={videoType === 'local'}
                  autoPlay={true}
                  loop={true}
                  controls={true}
                />
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Chưa có video được chọn</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-200 truncate max-w-[280px]">
                {videoName || 'Video đã chọn'}
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">
                ✓ Sẽ tự động phát khi đến {time}
              </span>
            </div>

            {/* Local file picker */}
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
                    {videoName || 'Chưa chọn file (.mp4, .mkv, .webm)'}
                  </span>
                </div>
              </div>
            )}

            {/* URL input */}
            {videoType === 'url' && (
              <div className="space-y-1.5 pt-1">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value)
                    setVideoName('Video từ URL')
                  }}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Lặp lại */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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

          {/* Giọng đọc nhắc nhở (TTS) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
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
                  placeholder="Nhập câu nói bạn muốn app đọc khi đến giờ..."
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs resize-none text-white"
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

          {/* Âm lượng & Fullscreen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
            >
              {initialData ? 'Lưu Thay Đổi' : 'Tạo Nhắc Hẹn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
