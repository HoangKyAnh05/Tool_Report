import React, { useEffect, useRef, useState } from 'react'
import { analyzeTaskCategory } from '../utils/aiVideoGenerator'
import { Play, Pause, Volume2, VolumeX, Sparkles, RefreshCw, Film, Loader2 } from 'lucide-react'

interface AiVideoPlayerProps {
  src: string
  taskTitle: string
  isLocal?: boolean
  autoPlay?: boolean
  loop?: boolean
  controls?: boolean
  className?: string
  onEnded?: () => void
}

export const AiVideoPlayer: React.FC<AiVideoPlayerProps> = ({
  src,
  taskTitle,
  isLocal = false,
  autoPlay = true,
  loop = true,
  controls = true,
  className = '',
  onEnded,
}) => {
  const [useCanvasFallback, setUseCanvasFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  // Safe source for Electron local paths
  let safeSrc = src
  if (isLocal && src && !src.startsWith('media://') && !src.startsWith('http') && !src.startsWith('blob:') && !src.startsWith('data:')) {
    safeSrc = `media:///${encodeURIComponent(src.replace(/\\/g, '/'))}`
  }

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setUseCanvasFallback(false)
  }, [src])

  // Canvas 60fps Dynamic Animation (Only if explicitly toggled or video cannot be reached)
  useEffect(() => {
    if (!useCanvasFallback && !hasError) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const category = analyzeTaskCategory(taskTitle || 'Nhiệm vụ')
    const colorPalettes: Record<string, { bg1: string; bg2: string; accent: string; icon: string; tag: string }> = {
      swim: { bg1: '#0284c7', bg2: '#082f49', accent: '#38bdf8', icon: '🏊', tag: 'ĐẾN GIỜ ĐI BƠI RÈN LUYỆN' },
      meal: { bg1: '#ea580c', bg2: '#1c0a00', accent: '#fb923c', icon: '🍱', tag: 'ĐẾN GIỜ ĂN UỐNG & NGHỈ NGƠI' },
      exercise: { bg1: '#4f46e5', bg2: '#0b0f19', accent: '#38bdf8', icon: '🏃', tag: 'ĐẾN GIỜ VẬN ĐỘNG & THỂ DỤC' },
      water: { bg1: '#0284c7', bg2: '#031726', accent: '#38bdf8', icon: '💧', tag: 'ĐẾN GIỜ UỐNG NƯỚC BÙ KHOÁNG' },
      study: { bg1: '#7c3aed', bg2: '#110c24', accent: '#c084fc', icon: '📚', tag: 'ĐẾN GIỜ TẬP TRUNG HỌC BÀI' },
      relax: { bg1: '#059669', bg2: '#011c14', accent: '#34d399', icon: '🌿', tag: 'ĐẾN GIỜ THƯ GIÃN MẮT' },
      coding: { bg1: '#0f172a', bg2: '#020617', accent: '#22c55e', icon: '💻', tag: 'ĐẾN GIỜ LẬP TRÌNH & DỰ ÁN' },
      meeting: { bg1: '#be123c', bg2: '#1f0810', accent: '#fb7185', icon: '👥', tag: 'ĐẾN GIỜ HỌP CÔNG VIỆC' },
      sleep: { bg1: '#312e81', bg2: '#030712', accent: '#818cf8', icon: '🌙', tag: 'ĐẾN GIỜ ĐI NGỦ NGHỈ NGƠI' },
    }

    const colors = colorPalettes[category] || colorPalettes['meal']
    const width = canvas.width
    const height = canvas.height
    startTimeRef.current = Date.now()

    const render = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const duration = 6
      const cycleTime = elapsed % duration
      const progress = cycleTime / duration

      // Animated background gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2 + Math.sin(elapsed * 1.5) * 120,
        height / 2 + Math.cos(elapsed * 1.2) * 80,
        50,
        width / 2,
        height / 2,
        width * 0.8
      )
      bgGrad.addColorStop(0, colors.bg1)
      bgGrad.addColorStop(1, colors.bg2)
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Particles
      for (let i = 0; i < 14; i++) {
        const px = (width * 0.1 * i + Math.sin(elapsed * 1.2 + i) * 60) % width
        const py = (height * 0.15 * i + Math.cos(elapsed * 1.4 + i) * 50 + (i % 2 === 0 ? elapsed * 20 : -elapsed * 15)) % height
        const radius = 18 + (i % 5) * 10 + Math.sin(elapsed * 3 + i) * 6

        ctx.beginPath()
        ctx.arc(px < 0 ? px + width : px, py < 0 ? py + height : py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `${colors.accent}22`
        ctx.fill()
      }

      // Center Card
      const cardW = width * 0.88
      const cardH = height * 0.8
      const cardX = (width - cardW) / 2
      const cardY = (height - cardH) / 2

      ctx.save()
      ctx.shadowColor = colors.accent
      ctx.shadowBlur = 35 + Math.sin(elapsed * 4) * 15
      ctx.fillStyle = 'rgba(11, 15, 26, 0.88)'
      ctx.strokeStyle = colors.accent
      ctx.lineWidth = 3

      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardW, cardH, 24)
      ctx.fill()
      ctx.stroke()
      ctx.restore()

      // Emoji
      ctx.font = `${Math.round(height * 0.18)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const iconY = cardY + height * 0.18 + Math.sin(elapsed * 3.5) * 6
      ctx.fillText(colors.icon, width / 2, iconY)

      // Header
      ctx.font = `bold ${Math.round(height * 0.05)}px "Plus Jakarta Sans", sans-serif`
      ctx.fillStyle = colors.accent
      ctx.fillText(`⏰ ${colors.tag}`, width / 2, cardY + height * 0.35)

      // Title
      ctx.font = `bold ${Math.round(height * 0.09)}px "Plus Jakarta Sans", sans-serif`
      ctx.fillStyle = '#ffffff'
      let displayTitle = taskTitle || 'Nhắc hẹn'
      if (displayTitle.length > 28) {
        displayTitle = displayTitle.slice(0, 26) + '...'
      }
      ctx.fillText(displayTitle, width / 2, cardY + height * 0.5)

      // Equalizer Wave
      const barCount = 24
      const barWidth = 8
      const barGap = 6
      const totalWaveWidth = barCount * (barWidth + barGap)
      const waveStartX = (width - totalWaveWidth) / 2
      const waveCenterY = cardY + height * 0.68

      for (let b = 0; b < barCount; b++) {
        const barHeight = 12 + Math.abs(Math.sin(elapsed * 6 + b * 0.35)) * (height * 0.14)
        const bx = waveStartX + b * (barWidth + barGap)
        const by = waveCenterY - barHeight / 2

        ctx.fillStyle = b % 2 === 0 ? colors.accent : '#ffffff'
        ctx.beginPath()
        ctx.roundRect(bx, by, barWidth, barHeight, 4)
        ctx.fill()
      }

      // Progress Bar
      const progressW = (cardW - 60) * progress
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.beginPath()
      ctx.roundRect(cardX + 30, cardY + cardH - 25, cardW - 60, 8, 4)
      ctx.fill()

      ctx.fillStyle = colors.accent
      ctx.beginPath()
      ctx.roundRect(cardX + 30, cardY + cardH - 25, Math.max(8, progressW), 8, 4)
      ctx.fill()

      animFrameIdRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [useCanvasFallback, hasError, taskTitle])

  return (
    <div className={`relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center ${className}`}>
      {/* Switcher & Status Badge */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] shadow-lg">
        <button
          type="button"
          onClick={() => setUseCanvasFallback(!useCanvasFallback)}
          className={`flex items-center gap-1 font-bold transition cursor-pointer ${
            useCanvasFallback ? 'text-indigo-300' : 'text-cyan-300'
          }`}
          title="Chuyển đổi chế độ video"
        >
          {useCanvasFallback ? <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> : <Film className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{useCanvasFallback ? 'Video AI Đồ Họa' : 'Video Clip Thực Tế (HD)'}</span>
        </button>
      </div>

      {/* Loading Spinner */}
      {isLoading && !useCanvasFallback && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
          <span className="text-xs text-slate-300 font-medium">Đang tải video HD...</span>
        </div>
      )}

      {/* Mode 1: Authentic Real HD Stock Video */}
      {!useCanvasFallback && !hasError && safeSrc ? (
        <video
          ref={videoRef}
          key={safeSrc}
          src={safeSrc}
          autoPlay={autoPlay}
          loop={loop}
          controls={controls}
          playsInline
          onLoadedData={() => setIsLoading(false)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
            setUseCanvasFallback(true)
          }}
          onEnded={onEnded}
          className="w-full h-full object-contain"
        />
      ) : (
        /* Mode 2: Dynamic 60fps AI Canvas Video */
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  )
}
