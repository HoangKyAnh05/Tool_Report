import React, { useState, useEffect, useRef } from 'react'
import { ReminderItem, AppSettings } from './types'
import {
  loadReminders,
  saveReminders,
  loadSettings,
  saveSettings,
} from './utils/storage'
import { TitleBar } from './components/TitleBar'
import { ClockHeader } from './components/ClockHeader'
import { ReminderList } from './components/ReminderList'
import { ReminderModal } from './components/ReminderModal'
import { AlarmModal } from './components/AlarmModal'
import { SettingsModal } from './components/SettingsModal'
import { MobileGuideModal } from './components/MobileGuideModal'
import {
  Plus,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Info,
} from 'lucide-react'

export default function App() {
  const [reminders, setReminders] = useState<ReminderItem[]>(() => loadReminders())
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())

  // Modals state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null)
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<ReminderItem | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileGuideOpen, setIsMobileGuideOpen] = useState(false)

  // Track last triggered alarm time key to prevent duplicate triggering in same minute
  const lastTriggeredMinuteRef = useRef<string>('')

  // Save changes to localStorage whenever reminders state updates
  useEffect(() => {
    saveReminders(reminders)
  }, [reminders])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // Setup background clock scheduler checking every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const currentHours = String(now.getHours()).padStart(2, '0')
      const currentMinutes = String(now.getMinutes()).padStart(2, '0')
      const currentTimeKey = `${currentHours}:${currentMinutes}`
      const currentDayOfWeek = now.getDay() // 0 = Sun, 1 = Mon ...
      const todayDateStr = now.toISOString().slice(0, 10)

      // Only check once per minute
      if (lastTriggeredMinuteRef.current === currentTimeKey) {
        return
      }

      // Check if any enabled reminder matches
      for (const item of reminders) {
        if (!item.enabled) continue

        if (item.time === currentTimeKey) {
          // Check repeat condition
          let shouldTrigger = false

          if (item.repeatType === 'daily') {
            shouldTrigger = true
          } else if (item.repeatType === 'once') {
            if (item.lastTriggeredDate !== todayDateStr) {
              shouldTrigger = true
            }
          } else if (item.repeatType === 'custom_days') {
            if (item.customDays.includes(currentDayOfWeek)) {
              shouldTrigger = true
            }
          }

          if (shouldTrigger) {
            lastTriggeredMinuteRef.current = currentTimeKey
            triggerAlarm(item)

            // If repeatType === 'once', disable it after triggering
            if (item.repeatType === 'once') {
              setReminders((prev) =>
                prev.map((r) =>
                  r.id === item.id ? { ...r, enabled: false, lastTriggeredDate: todayDateStr } : r
                )
              )
            }
            break
          }
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [reminders])

  // Setup Electron tray test trigger listener
  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onTestTrigger(() => {
        if (reminders.length > 0) {
          triggerAlarm(reminders[0])
        }
      })
      return () => unsubscribe()
    }
  }, [reminders])

  // Function to trigger alarm popup and wake up window
  const triggerAlarm = async (reminder: ReminderItem) => {
    setActiveAlarmReminder(reminder)

    if (window.electronAPI) {
      await window.electronAPI.wakeUpAlarm({
        autoFullscreen: !!reminder.autoFullscreen,
      })
    }
  }

  // Handle snooze
  const handleSnooze = (minutes: number) => {
    if (!activeAlarmReminder) return

    const now = new Date()
    now.setMinutes(now.getMinutes() + minutes)
    const snoozeTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`

    const snoozeReminder: ReminderItem = {
      ...activeAlarmReminder,
      id: `snooze_${Date.now()}`,
      title: `[Hoãn ${minutes}p] ${activeAlarmReminder.title}`,
      time: snoozeTime,
      repeatType: 'once',
      enabled: true,
    }

    setReminders((prev) => [snoozeReminder, ...prev])
    handleDismissAlarm()
  }

  // Dismiss active alarm
  const handleDismissAlarm = async () => {
    setActiveAlarmReminder(null)
    if (window.electronAPI) {
      await window.electronAPI.dismissAlarm()
    }
  }

  // Toggle enable/disable
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  // Delete reminder
  const handleDeleteReminder = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch nhắc hẹn này?')) {
      setReminders((prev) => prev.filter((r) => r.id !== id))
    }
  }

  // Save new or edited reminder
  const handleSaveReminder = (reminder: ReminderItem) => {
    setReminders((prev) => {
      const exists = prev.some((r) => r.id === reminder.id)
      if (exists) {
        return prev.map((r) => (r.id === reminder.id ? reminder : r))
      }
      return [reminder, ...prev]
    })
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Frameless Top Window Bar */}
      <TitleBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMobileGuide={() => setIsMobileGuideOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full">
        {/* Clock & Realtime Status Header */}
        <ClockHeader
          reminders={reminders}
          onTriggerTestAlarm={() => {
            if (reminders.length > 0) {
              triggerAlarm(reminders[0])
            } else {
              setIsReminderModalOpen(true)
            }
          }}
          onAddNewReminder={() => {
            setEditingReminder(null)
            setIsReminderModalOpen(true)
          }}
        />

        {/* Reminders List */}
        <ReminderList
          reminders={reminders}
          onToggle={handleToggleReminder}
          onEdit={(rem) => {
            setEditingReminder(rem)
            setIsReminderModalOpen(true)
          }}
          onDelete={handleDeleteReminder}
          onTest={(rem) => triggerAlarm(rem)}
          onAddNew={() => {
            setEditingReminder(null)
            setIsReminderModalOpen(true)
          }}
        />
      </main>

      {/* Sticky Bottom Bar for quick info & settings */}
      <footer className="h-12 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Tự động thức tỉnh từ khay hệ thống khi đến giờ</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Reload & Restart App buttons */}
          <button
            onClick={() => {
              if (window.electronAPI) {
                window.electronAPI.reloadApp()
              } else {
                window.location.reload()
              }
            }}
            className="flex items-center gap-1 text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md border border-indigo-500/30 transition cursor-pointer"
            title="Tải lại giao diện (F5)"
          >
            <span>🔄 Tải lại (F5)</span>
          </button>

          <button
            onClick={() => {
              if (window.electronAPI) {
                window.electronAPI.restartApp()
              } else {
                window.location.reload()
              }
            }}
            className="flex items-center gap-1 text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-md border border-purple-500/30 transition cursor-pointer"
            title="Khởi động lại toàn bộ ứng dụng"
          >
            <span>⚡ Khởi động lại App</span>
          </button>

          <button
            onClick={() => setIsMobileGuideOpen(true)}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hướng dẫn Điện Thoại</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cài đặt</span>
          </button>
        </div>
      </footer>

      {/* Add / Edit Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false)
          setEditingReminder(null)
        }}
        onSave={handleSaveReminder}
        initialData={editingReminder}
      />

      {/* Active Alarm Screen (Fullscreen Overlay) */}
      <AlarmModal
        reminder={activeAlarmReminder}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnooze}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        reminders={reminders}
        onImportReminders={(newReminders) => setReminders(newReminders)}
      />

      {/* Mobile Guide Modal */}
      <MobileGuideModal
        isOpen={isMobileGuideOpen}
        onClose={() => setIsMobileGuideOpen(false)}
      />
    </div>
  )
}
