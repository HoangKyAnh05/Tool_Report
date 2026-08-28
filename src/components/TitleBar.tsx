import React from 'react'
import { BellRing, Minus, Square, X, ArrowDownToLine, Sparkles } from 'lucide-react'

interface TitleBarProps {
  onOpenSettings: () => void
  onOpenMobileGuide: () => void
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenSettings, onOpenMobileGuide }) => {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimize()
    }
  }

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximize()
    }
  }

  const handleClose = () => {
    if (window.electronAPI) {
      // Hide to system tray instead of killing app
      window.electronAPI.hideToTray()
    }
  }

  return (
    <header className="h-10 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-3 select-none app-drag-region z-50">
      {/* Brand & App Info */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-sm shadow-indigo-500/30">
          <BellRing className="w-3.5 h-3.5 text-white animate-pulse" />
        </div>
        <span className="text-xs font-bold tracking-wide bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
          VIDEO REMINDER
        </span>
        <span className="hidden sm:inline-flex text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          v1.0.0 Pro
        </span>
      </div>

      {/* Quick Actions & Window Controls */}
      <div className="flex items-center gap-1.5 no-drag">
        <button
          onClick={onOpenMobileGuide}
          className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 transition cursor-pointer"
          title="Xem hướng dẫn cài đặt & dùng trên điện thoại"
        >
          <Sparkles className="w-3 h-3" />
          <span className="text-[11px] font-medium hidden md:inline">Dùng trên điện thoại</span>
        </button>

        {isElectron && (
          <div className="flex items-center ml-2 space-x-1">
            <button
              onClick={handleMinimize}
              className="w-7 h-7 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Thu nhỏ"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-7 h-7 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Phóng to"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
              title="Ẩn xuống khay hệ thống (Tiếp tục chạy ngầm)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
