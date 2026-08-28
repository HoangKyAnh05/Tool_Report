import React, { useEffect, useRef, useState } from 'react'
import { ReminderItem } from '../types'
import { audioTts } from '../utils/audioTts'
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
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!reminder) return

    // Trigger celebratory sound chime & TTS speech
    const triggerAudio = async () => {
      audioTts.playChime((reminder.volume || 85) / 100)
      if (reminder.ttsEnabled && reminder.ttsMessage) {
        setIsTtsSpeaking(true)
        await audioTts.speak(reminder.ttsMessage, {
          volume: reminder.volume || 85,
        })
        setIsTtsSpeaking(false)
      }
    }

    triggerAudio()

    // Confetti effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    })

    // If local file on electron, handle source
    if (videoRef.current) {
      videoRef.current.volume = (reminder.volume || 85) / 100
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented or video load error:', err)
      })
    }

    return () => {
      audioTts.stop()
    }
  }, [reminder])

  if (!reminder) return null

  // Determine safe video source URL
  let videoSrc = reminder.videoUrl
  if (reminder.videoType === 'local') {
    // If electron, load via custom media protocol or file URL
    videoSrc = `media:///${encodeURIComponent(reminder.videoUrl.replace(/\\/g, '/'))}`
  }

  const handleDismiss = () => {
    audioTts.stop()
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
    })
    onDismiss()
  }

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
      {/* Top Floating Notification Banner */}
      <div className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 py-3 px-6 shadow-2xl flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-rose-100 font-bold flex items-center gap-2">
              <span>ĐẾN GIỜ NHẮC HẸN: {reminder.time}</span>
              {isTtsSpeaking && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white animate-pulse">
                  <Volume2 className="w-3 h-3" /> Đang đọc lời nhắc...
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

      {/* Main Video & Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Glowing Ambient Background */}
        <div className="absolute inset-0 bg-radial from-indigo-900/30 via-slate-950/80 to-slate-950 pointer-events-none" />

        <div className="relative w-full max-w-4xl h-[65vh] rounded-2xl overflow-hidden border border-indigo-500/30 shadow-2xl bg-black flex items-center justify-center">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              playsInline
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <Clock className="w-16 h-16 mx-auto mb-3 text-indigo-400 animate-bounce" />
              <p className="text-lg font-bold text-white">Đến giờ hẹn: {reminder.title}</p>
            </div>
          )}

          {/* Subtitle / TTS Message Overlay */}
          {reminder.ttsMessage && (
            <div className="absolute bottom-14 left-6 right-6 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-center shadow-lg pointer-events-none">
              <p className="text-sm sm:text-base font-semibold text-emerald-300">
                "{reminder.ttsMessage}"
              </p>
            </div>
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
            onClick={() => onSnooze(5)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hoãn 5 phút</span>
          </button>

          {/* Snooze 10 mins */}
          <button
            onClick={() => onSnooze(10)}
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
