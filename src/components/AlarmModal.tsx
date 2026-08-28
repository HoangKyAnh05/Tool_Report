import React, { useEffect, useState, useRef } from 'react'
import { ReminderItem } from '../types'
import { audioTts } from '../utils/audioTts'
import { getThemeImageForTitle } from '../utils/imageThemeEngine'
import confetti from 'canvas-confetti'
import {
  BellRing,
  Volume2,
  VolumeX,
  CheckCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Mic,
  Music,
} from 'lucide-react'

interface AlarmModalProps {
  reminder: ReminderItem | null
  onDismiss: () => void
  onSnooze: (minutes: number) => void
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  reminder,
  onDismiss,
  onSnooze,
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  // Resolve best matched image for the reminder title
  const themeInfo = reminder ? getThemeImageForTitle(reminder.title) : null
  const displayImageUrl = reminder?.imageUrl || (reminder?.videoUrl?.startsWith('http') && reminder.videoUrl.match(/\.(jpg|jpeg|png|webp|svg)/i) ? reminder.videoUrl : themeInfo?.imageUrl)

  useEffect(() => {
    if (!reminder) return

    const voiceMessage =
      reminder.ttsEnabled && reminder.ttsMessage
        ? reminder.ttsMessage
        : `Đã đến giờ ${reminder.title} rồi! Bạn hãy thực hiện ngay nhé.`

    // Start continuous urgent alarm ringing loop!
    audioTts.startAlarmLoop(voiceMessage, {
      volume: reminder.volume ?? 90,
      isMuted: () => isMutedRef.current,
      onSpeechChange: (speaking) => setIsTtsSpeaking(speaking),
    })

    // Confetti effect
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
    })

    return () => {
      audioTts.stopAlarmLoop()
    }
  }, [reminder])

  if (!reminder) return null

  const handleDismiss = () => {
    audioTts.stopAlarmLoop()
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
    })
    onDismiss()
  }

  const handleSnoozeWithStop = (mins: number) => {
    audioTts.stopAlarmLoop()
    onSnooze(mins)
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const isLocalVideo = reminder.videoType === 'local' && reminder.videoUrl && !reminder.videoUrl.startsWith('http')

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 select-none">
      {/* Top Floating Notification Banner */}
      <div className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 py-3 px-6 shadow-2xl flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse shadow-sm">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-rose-100 font-bold flex items-center gap-2">
              <span>ĐẾN GIỜ NHẮC HẸN: {reminder.time}</span>
              {isTtsSpeaking && (
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium animate-pulse">
                  <Volume2 className="w-3 h-3 text-emerald-300" /> Giọng AI đang đọc...
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white drop-shadow">
              {reminder.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Image & Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Soft Ambient Blurred Background Glow */}
        {displayImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-110 pointer-events-none transition-all duration-1000"
            style={{ backgroundImage: `url(${displayImageUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-radial from-indigo-900/20 via-slate-950/70 to-slate-950 pointer-events-none" />

        {/* Central Display Card */}
        <div className="relative w-full max-w-4xl h-[65vh] rounded-3xl overflow-hidden border border-indigo-500/40 shadow-2xl bg-slate-900 flex flex-col justify-between group">
          {isLocalVideo ? (
            <video
              src={reminder.videoUrl}
              autoPlay
              loop
              controls
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Thematic Content Image */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src={displayImageUrl}
                  alt={reminder.title}
                  className="w-full h-full object-cover transition-transform duration-10000 ease-out hover:scale-105"
                  onError={(e) => {
                    // Fallback image if network fails
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80'
                  }}
                />
                {/* Gradient Overlays for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent" />
              </div>

              {/* Top Card Badge */}
              <div className="relative z-10 p-5 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-300 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{themeInfo?.category || 'Nhắc nhở công việc'}</span>
                </div>

                {isTtsSpeaking && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-xs font-bold text-emerald-300 animate-pulse shadow-md">
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Giọng AI đang phát</span>
                  </div>
                )}
              </div>

              {/* Sound Wave Animation Visualizer Bars */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto px-6 text-center">
                {isTtsSpeaking && (
                  <div className="flex items-center justify-center gap-1.5 h-12 mb-3">
                    {[12, 24, 38, 48, 28, 44, 32, 20, 40, 26, 16].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-indigo-400 to-cyan-300 rounded-full animate-pulse"
                        style={{
                          height: `${h}px`,
                          animationDelay: `${i * 90}ms`,
                          animationDuration: '600ms',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Info & Subtitles */}
              <div className="relative z-10 p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                    {reminder.title}
                  </span>
                </div>

                {/* Subtitle / Voice Message Quote */}
                <div className="p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15 text-center shadow-xl">
                  <p className="text-sm sm:text-base font-bold text-emerald-300 leading-relaxed">
                    "{reminder.ttsMessage || `Đã đến giờ ${reminder.title} rồi! Bạn hãy thực hiện ngay nhé.`}"
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Action Controls Bar */}
      <div className="p-4 sm:p-6 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-between gap-4 z-20">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Thời gian báo: <strong className="text-white font-mono">{reminder.time}</strong></span>
          {reminder.description && (
            <span className="hidden md:inline text-slate-500">| {reminder.description}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Snooze 5 mins */}
          <button
            onClick={() => handleSnoozeWithStop(5)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoãn 5 phút</span>
          </button>

          {/* Snooze 10 mins */}
          <button
            onClick={() => handleSnoozeWithStop(10)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoãn 10 phút</span>
          </button>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 stroke-[2.5]" />
            <span>TẮT BÁO THỨC & HOÀN THÀNH</span>
          </button>
        </div>
      </div>
    </div>
  )
}
