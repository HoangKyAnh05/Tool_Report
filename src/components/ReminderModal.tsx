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
  Image as ImageIcon,
  Music,
  RefreshCw,
  Link as LinkIcon,
} from 'lucide-react'
import {
  getThemeImageForTitle,
  getNextThemeImage,
  searchOnlineImages,
} from '../utils/imageThemeEngine'

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
  { label: '🎤 Học hát / Âm nhạc', query: 'Đến giờ học hát' },
  { label: '📚 Học bài / Đọc sách', query: 'Tập trung học bài đọc sách' },
  { label: '🏃 Tập thể dục', query: 'Tập thể dục giãn cơ' },
  { label: '💧 Uống nước', query: 'Uống nước nạp năng lượng' },
  { label: '🍱 Ăn uống / Ăn tối', query: 'Đến giờ ăn tối' },
  { label: '🌙 Đi ngủ / Nghỉ ngơi', query: 'Đến giờ đi ngủ' },
  { label: '💻 Lập trình / Code', query: 'Lập trình code dự án' },
  { label: '👥 Họp công ty', query: 'Đến giờ họp công việc' },
  { label: '🏊 Đi bơi / Bơi lội', query: 'Đến giờ đi bơi' },
  { label: '💊 Uống thuốc', query: 'Uống thuốc đúng giờ' },
  { label: '🚽 Vệ sinh cá nhân', query: 'Đến giờ đi vệ sinh' },
  { label: '🎮 Giải trí / Game', query: 'Đến giờ giải trí chơi game' },
  { label: '🧹 Dọn dẹp phòng', query: 'Dọn dẹp phòng ngủ gọn gàng' },
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
  const [imageUrl, setImageUrl] = useState('')

  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [ttsMessage, setTtsMessage] = useState('')
  const [isTtsCustomized, setIsTtsCustomized] = useState(false)
  const [volume, setVolume] = useState(100)
  const [autoFullscreen, setAutoFullscreen] = useState(false)
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false)

  // AI & Search States
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [isSearchingOnline, setIsSearchingOnline] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchVideoResult[]>([])
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null)

  // Image Cycling & Online Search States
  const [isChangingImage, setIsChangingImage] = useState(false)
  const [showImageSearch, setShowImageSearch] = useState(false)
  const [imageSearchQuery, setImageSearchQuery] = useState('')
  const [isSearchingImages, setIsSearchingImages] = useState(false)
  const [onlineImageResults, setOnlineImageResults] = useState<Array<{ title: string; imageUrl: string; source: string }>>([])
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [customUrlInput, setCustomUrlInput] = useState('')

  const handleCycleImage = () => {
    setIsChangingImage(true)
    const current = imageUrl || getThemeImageForTitle(title).imageUrl
    const next = getNextThemeImage(title, current)
    setImageUrl(next.imageUrl)
    setAiSuccessMessage(`🖼️ Đã đổi sang ảnh: "${next.title}" (${next.category})`)
    setTimeout(() => setIsChangingImage(false), 200)
  }

  const handleSearchOnlineImages = async (customQuery?: string) => {
    const q = (customQuery !== undefined ? customQuery : (imageSearchQuery || title || 'pubg')).trim()
    if (!q) return
    setIsSearchingImages(true)
    try {
      const results = await searchOnlineImages(q)
      setOnlineImageResults(results)
      if (results.length > 0) {
        setAiSuccessMessage(`🔍 Đã tìm thấy ${results.length} hình ảnh trực tuyến cho: "${q}"!`)
      } else {
        setAiSuccessMessage(`Không tìm thấy ảnh nào cho "${q}", bạn hãy thử từ khóa khác nhé!`)
      }
    } catch (e) {
      console.warn('Image search error:', e)
    } finally {
      setIsSearchingImages(false)
    }
  }

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
      setImageUrl(initialData.imageUrl || getThemeImageForTitle(initialData.title).imageUrl)
      setTtsEnabled(initialData.ttsEnabled)
      setTtsMessage(initialData.ttsMessage)
      setIsTtsCustomized(true)
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

      const defaultTitle = 'Đến giờ nhắc việc'
      setTitle(defaultTitle)
      setDescription('')
      setTime(defaultTime)
      setRepeatType('daily')
      setCustomDays([1, 2, 3, 4, 5])
      setVideoType('sample')
      setVideoUrl(CURATED_TASK_VIDEOS.meal.url)
      setVideoName('Video nhắc nhở')
      setImageUrl(getThemeImageForTitle(defaultTitle).imageUrl)
      setTtsEnabled(true)
      setTtsMessage(`Đã đến giờ ${defaultTitle} rồi! Bạn hãy chuẩn bị thực hiện nhé.`)
      setIsTtsCustomized(false)
      setVolume(100)
      setAutoFullscreen(false)
      setSearchResults(searchOnlineVideos(defaultTitle))
      setAiSuccessMessage(null)
    }
  }, [initialData, isOpen])

  // Live Auto-Search as user types in the title input (ONLY for sample/AI mode, never override local files)
  useEffect(() => {
    if (!isOpen) return
    if (videoType !== 'sample') return

    const timer = setTimeout(() => {
      const trimmed = title.trim()
      if (trimmed.length >= 2) {
        const results = searchOnlineVideos(trimmed)
        setSearchResults(results)
        if (results.length > 0) {
          const best = results[0]
          selectAndCacheVideo(best.url, best.title)
        }
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [title, isOpen, videoType])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    const theme = getThemeImageForTitle(newTitle)
    setImageUrl(theme.imageUrl)
    if (!isTtsCustomized) {
      const trimmed = newTitle.trim()
      if (trimmed) {
        setTtsMessage(`Đã đến giờ ${trimmed} rồi! Bạn hãy thực hiện ngay nhé.`)
      } else {
        setTtsMessage('')
      }
    }
  }

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

  // Helper to select and cache video locally for guaranteed playback
  const selectAndCacheVideo = async (url: string, titleStr: string) => {
    setVideoName(titleStr)
    setVideoUrl(url)
    setVideoType('sample')

    if (window.electronAPI && url.startsWith('http')) {
      try {
        const localCached = await window.electronAPI.cacheRemoteVideo(url)
        if (localCached && localCached !== url) {
          setVideoUrl(localCached)
          setVideoType('local')
        }
      } catch (e) {
        console.warn('Caching remote video error:', e)
      }
    }
  }

  // 2. Search Online Videos (returns 4 matching options with live selection)
  const handleSearchOnlineVideos = () => {
    const taskName = title.trim() || 'Nhiệm vụ'
    setIsSearchingOnline(true)
    setAiSuccessMessage(null)

    setTimeout(async () => {
      const results = searchOnlineVideos(taskName)
      setSearchResults(results)
      setIsSearchingOnline(false)

      if (results.length > 0) {
        const best = results[0]
        await selectAndCacheVideo(best.url, best.title)
        setAiSuccessMessage(`🌐 Đã tìm thấy ${results.length} video trực tuyến phù hợp cho "${taskName}"!`)

        if (!ttsMessage || ttsMessage.startsWith('Đã đến giờ')) {
          setTtsMessage(`Đến giờ rồi! Hãy thực hiện nhiệm vụ ${taskName} theo video nhé.`)
        }
      }
    }, 300)
  }

  // 3. Quick Topic selection
  const handleQuickTopic = async (topicQuery: string) => {
    setTitle(topicQuery)
    setTtsMessage(`Đã đến giờ ${topicQuery} rồi! Bạn hãy chuẩn bị thực hiện nhé.`)
    setIsTtsCustomized(false)
    const results = searchOnlineVideos(topicQuery)
    setSearchResults(results)
    if (results.length > 0) {
      await selectAndCacheVideo(results[0].url, results[0].title)
      setAiSuccessMessage(`Đã chọn chủ đề: "${topicQuery}"!`)
    }
  }

  // 4. Select a specific search result card
  const handleSelectSearchResult = async (res: SearchVideoResult) => {
    await selectAndCacheVideo(res.url, res.title)
    setAiSuccessMessage(`✓ Đã chọn video: "${res.title}"`)
  }

  const handleSelectLocalVideo = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.openVideoDialog()
      if (res) {
        setVideoType('local')
        setVideoUrl(res.path)
        setVideoName(res.name)
        setTtsEnabled(false)
        setAiSuccessMessage(`🎬 Đã chọn video từ máy tính: "${res.name}". Ứng dụng sẽ phát video và âm thanh/giọng nói gốc của file này khi đến giờ.`)
      }
    } else {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/mp4,video/webm,video/mkv,video/ogg'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const blobUrl = URL.createObjectURL(file)
          setVideoType('local')
          setVideoUrl(blobUrl)
          setVideoName(file.name)
          setTtsEnabled(false)
          setAiSuccessMessage(`🎬 Đã chọn video: "${file.name}". Ứng dụng sẽ phát video và âm thanh/giọng nói gốc của file này khi đến giờ.`)
        }
      }
      input.click()
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
      imageUrl: imageUrl || getThemeImageForTitle(title).imageUrl,
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
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="VD: Đến giờ đi vệ sinh, Uống thuốc, Ăn tối, Uống nước..."
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

          {/* IMAGE & VOICE PREVIEW BOX */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Hình Ảnh Chủ Đề & Giọng Đọc AI Khi Báo Thức</span>
              </label>

              <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <span>{getThemeImageForTitle(title).category}</span>
              </div>
            </div>

            {/* Visual Image Preview with direct Change Image button */}
            <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-slate-950 aspect-video max-h-56 flex items-center justify-center shadow-2xl group">
              <img
                src={imageUrl || getThemeImageForTitle(title).imageUrl}
                alt={title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Tag & Floating Change Image Button */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-[11px] font-bold text-indigo-300 max-w-[200px] truncate">
                <span>{getThemeImageForTitle(title).title}</span>
              </div>

              <button
                type="button"
                onClick={handleCycleImage}
                title="Bấm để đổi sang ảnh khác (Click liên tục tới khi bạn ưng ý)"
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-300/40 text-xs font-black text-white flex items-center gap-1.5 backdrop-blur-md shadow-xl transition transform active:scale-95 cursor-pointer z-10"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${isChangingImage ? 'animate-spin' : ''}`} />
                <span>🔄 Đổi ảnh khác</span>
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-white drop-shadow truncate max-w-[300px]">
                  {title || 'Chưa đặt tiêu đề'}
                </div>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition cursor-pointer shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isPlayingTestVoice ? 'Đang đọc...' : 'Thử giọng AI'}</span>
                </button>
              </div>
            </div>

            {/* Quick Action Toolbar for Images */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCycleImage}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer col-span-2 sm:col-span-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChangingImage ? 'animate-spin' : ''}`} />
                <span>Đổi ảnh (Click tiếp)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const willShow = !showImageSearch
                  setShowImageSearch(willShow)
                  if (willShow) {
                    // Extract clean keyword from current reminder title
                    let cleaned = title
                      .replace(/^(Đến giờ|Nhắc nhở:|Nhắc hẹn:|Giờ|Lịch:)\s*/i, '')
                      .replace(/^(hãy|bạn hãy|chuẩn bị)\s*/i, '')
                      .trim()
                    if (!cleaned) cleaned = title.trim() || 'pubg'
                    setImageSearchQuery(cleaned)
                    handleSearchOnlineImages(cleaned)
                  }
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  showImageSearch
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tìm ảnh Google</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  showUrlInput
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Dán link ảnh</span>
              </button>

              <label className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer">
                <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chọn từ máy</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setImageUrl(event.target.result as string)
                          setAiSuccessMessage('📁 Đã chọn ảnh từ máy tính thành công!')
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct URL input bar */}
            {showUrlInput && (
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2">
                <span className="text-[11px] font-bold text-amber-300">Dán trực tiếp URL hình ảnh từ Google / Web:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-... hoặc link ảnh Google"
                    className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setImageUrl(customUrlInput.trim())
                        setAiSuccessMessage('🔗 Đã áp dụng hình ảnh từ URL!')
                        setShowUrlInput(false)
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}

            {/* Online Image Search Drawer */}
            {showImageSearch && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={imageSearchQuery}
                      onChange={(e) => setImageSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearchOnlineImages(imageSearchQuery)
                        }
                      }}
                      placeholder="Nhập từ khóa ảnh (VD: pubg, điện thoại, game, chó con)..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchOnlineImages(imageSearchQuery)}
                    disabled={isSearchingImages}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {isSearchingImages ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Tìm kiếm</span>
                  </button>
                </div>

                {/* Quick query chips */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {['pubg', 'chơi game', 'điện thoại', 'học bài', 'nghe nhạc', 'thể dục', 'uống nước', 'ăn cơm'].map((chip, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setImageSearchQuery(chip)
                        handleSearchOnlineImages(chip)
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-300 border border-slate-700 transition cursor-pointer"
                    >
                      #{chip}
                    </button>
                  ))}
                </div>

                {/* Gallery of online images */}
                {onlineImageResults.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {onlineImageResults.map((imgItem, idx) => {
                      const isChosen = (imageUrl || getThemeImageForTitle(title).imageUrl) === imgItem.imageUrl
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setImageUrl(imgItem.imageUrl)
                            setAiSuccessMessage(`✨ Đã chọn ảnh: "${imgItem.title}"!`)
                          }}
                          className={`relative rounded-xl overflow-hidden aspect-video border-2 transition cursor-pointer group ${
                            isChosen ? 'border-cyan-400 ring-2 ring-cyan-500/40' : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img
                            src={imgItem.imageUrl}
                            alt={imgItem.title}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).parentElement?.remove()
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-1.5">
                            <span className="text-[9px] text-white font-medium truncate drop-shadow">
                              {imgItem.title}
                            </span>
                          </div>
                          {isChosen && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 text-[8px] px-1 py-0.2 rounded bg-slate-950/80 text-cyan-300 font-mono">
                            {imgItem.source}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <span className="text-[11px] text-emerald-400 font-medium">
                ✓ Hình ảnh & giọng đọc AI sẽ tự động kích hoạt liên tục khi đến {time}
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
                <p className="text-[11px] text-cyan-300/90 font-medium bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                  🔊 <strong>Ghi chú:</strong> Video từ máy tính sẽ được ưu tiên phát trọn vẹn cả hình ảnh lẫn âm thanh/giọng nói gốc của video khi chuông reo.
                </p>
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
                  onChange={(e) => {
                    setTtsMessage(e.target.value)
                    setIsTtsCustomized(true)
                  }}
                  placeholder="Nhập câu nói bạn muốn app đọc khi đến giờ..."
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs resize-none text-white"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isTtsCustomized ? 'Đang dùng câu tùy chỉnh của bạn' : 'Tự động đồng bộ theo tên việc'}
                  </span>
                  <div className="flex items-center gap-2">
                    {isTtsCustomized && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsTtsCustomized(false)
                          const trimmed = title.trim() || 'nhắc hẹn'
                          setTtsMessage(`Đã đến giờ ${trimmed} rồi! Bạn hãy thực hiện ngay nhé.`)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                        title="Đặt lại câu đọc tự động theo tên tiêu đề"
                      >
                        🔄 Tự động theo tên
                      </button>
                    )}
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
