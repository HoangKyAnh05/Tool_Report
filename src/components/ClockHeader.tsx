import React, { useState, useEffect } from 'react'
import { Clock, Play, Radio, Calendar, Flame, Volume2 } from 'lucide-react'
import { ReminderItem } from '../types'

interface ClockHeaderProps {
  reminders: ReminderItem[]
  onTriggerTestAlarm: () => void
  onAddNewReminder: () => void
}

export const ClockHeader: React.FC<ClockHeaderProps> = ({
  reminders,
  onTriggerTestAlarm,
  onAddNewReminder,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format time HH:mm:ss
  const timeString = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // Format date
  const dateString = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Calculate next alarm
  const activeReminders = reminders.filter((r) => r.enabled)
  const currentMinutesNow = currentTime.getHours() * 60 + currentTime.getMinutes()

  let nextReminder: { reminder: ReminderItem; diffMinutes: number } | null = null

  if (activeReminders.length > 0) {
    for (const rem of activeReminders) {
      const [h, m] = rem.time.split(':').map(Number)
      const targetMinutes = h * 60 + m
      let diff = targetMinutes - currentMinutesNow
      if (diff <= 0) {
        diff += 24 * 60 // Next day
      }
      if (!nextReminder || diff < nextReminder.diffMinutes) {
        nextReminder = { reminder: rem, diffMinutes: diff }
      }
    }
  }

  const formatCountdown = (diffMinutes: number) => {
    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    if (hours > 0) return `${hours} giờ ${mins} phút nữa`
    return `${mins} phút nữa`
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-purple-950/40 p-6 border border-indigo-500/20 shadow-xl backdrop-blur-xl mb-6">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Realtime Clock */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Hệ Thống Nhắc Hẹn Trực Tuyến</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-medium">Chạy ngầm liên tục</span>
          </div>

          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white drop-shadow-sm">
              {timeString}
            </h1>
            <span className="text-sm font-medium text-slate-400 capitalize flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {dateString}
            </span>
          </div>
        </div>

        {/* Next Alarm Card & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {nextReminder ? (
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-3 shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  Nhắc hẹn tiếp theo: <span className="text-indigo-300 font-bold">{nextReminder.reminder.time}</span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate max-w-[160px]">
                  {nextReminder.reminder.title}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  (Còn {formatCountdown(nextReminder.diffMinutes)})
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Chưa có nhắc hẹn nào đang bật</span>
            </div>
          )}

          {/* Quick Test Alarm Button */}
          <button
            onClick={onTriggerTestAlarm}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
            title="Thử nghiệm bật ngay màn hình video và đọc thông báo"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Thử Chuông Ngay</span>
          </button>

          {/* Add New Reminder Button */}
          <button
            onClick={onAddNewReminder}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>Tạo Nhắc Hẹn Mới</span>
          </button>
        </div>
      </div>
    </div>
  )
}
