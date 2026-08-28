import React from 'react'
import { ReminderItem } from '../types'
import {
  Clock,
  Video,
  Volume2,
  Edit2,
  Trash2,
  Play,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { getThemeImageForTitle } from '../utils/imageThemeEngine'

interface ReminderListProps {
  reminders: ReminderItem[]
  onToggle: (id: string) => void
  onEdit: (reminder: ReminderItem) => void
  onDelete: (id: string) => void
  onTest: (reminder: ReminderItem) => void
  onAddNew: () => void
}

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  onToggle,
  onEdit,
  onDelete,
  onTest,
  onAddNew,
}) => {
  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-1">Chưa có lịch nhắc hẹn nào</h3>
        <p className="text-sm text-slate-400 max-w-md mb-5">
          Tạo lịch nhắc hẹn đầu tiên để ứng dụng tự động phát video và đọc thông báo nhắc nhở khi đến giờ đã hẹn.
        </p>
        <button
          onClick={onAddNew}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
        >
          + Thêm Lịch Nhắc Hẹn Mới
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Danh Sách Nhắc Hẹn Đã Cài Đặt</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300">
            {reminders.length}
          </span>
        </h2>
        <span className="text-xs text-slate-500">
          Đến đúng giờ sẽ tự bung cửa sổ & phát video
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {reminders.map((item) => {
          return (
            <div
              key={item.id}
              className={`glass-card rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border transition-all ${
                item.enabled
                  ? 'border-slate-800 hover:border-indigo-500/40 bg-slate-900/70'
                  : 'border-slate-800/40 opacity-60 bg-slate-950/40'
              }`}
            >
              {/* Left Column: Time & Main Info */}
              <div className="flex items-start gap-4 flex-1">
                {/* Time Display Badge */}
                <div
                  className={`flex flex-col items-center justify-center min-w-[85px] px-3 py-2 rounded-xl font-mono text-center border ${
                    item.enabled
                      ? 'bg-indigo-950/50 border-indigo-500/30 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-2xl font-black tracking-tight">{item.time}</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-400/80 mt-0.5">
                    {item.repeatType === 'daily'
                      ? 'Hàng ngày'
                      : item.repeatType === 'once'
                      ? 'Một lần'
                      : 'Tùy chọn ngày'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {item.title}
                    </h3>
                    {item.autoFullscreen && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        Full-screen
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.description}
                    </p>
                  )}

                  {/* Attached Image Theme & TTS tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-medium max-w-[200px] truncate">
                        {getThemeImageForTitle(item.title).category}
                      </span>
                    </div>

                    {item.ttsEnabled && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-medium">Giọng đọc AI: Có</span>
                      </div>
                    )}

                    {/* Custom days indicators */}
                    {item.repeatType === 'custom_days' && (
                      <div className="flex items-center gap-1">
                        {DAY_LABELS.map((dayLabel, idx) => {
                          const isSelected = item.customDays.includes(idx)
                          return (
                            <span
                              key={idx}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                isSelected
                                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                                  : 'text-slate-600'
                              }`}
                            >
                              {dayLabel}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Toggle & Control Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                {/* Test Trigger Button */}
                <button
                  onClick={() => onTest(item)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Chạy thử báo thức & phát video này"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Chỉnh sửa nhắc hẹn"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Xóa nhắc hẹn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Enable / Disable Switch */}
                <button
                  onClick={() => onToggle(item.id)}
                  className={`ml-2 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    item.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={item.enabled}
                  title={item.enabled ? 'Đang BẬT - Nhấn để TẮT' : 'Đang TẮT - Nhấn để BẬT'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      item.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
