import { ReminderItem, AppSettings } from '../types'
import { SAMPLE_VIDEOS } from '../data/sampleVideos'

const REMINDERS_KEY = 'video_reminders_data_v1'
const SETTINGS_KEY = 'video_reminders_settings_v1'

export const DEFAULT_SETTINGS: AppSettings = {
  runInBackground: true,
  startWithWindows: true,
  soundVolume: 90,
  theme: 'dark',
  voiceRate: 1.0,
  voicePitch: 1.0,
}

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'sample_rem_1',
    title: 'Nhắc nhở: Giãn cơ & Vận động nhẹ',
    description: 'Đứng dậy đi lại, vươn vai và thư giãn mắt trong 5 phút.',
    time: '15:30',
    repeatType: 'daily',
    customDays: [1, 2, 3, 4, 5], // Mon to Fri
    enabled: true,
    videoType: 'sample',
    videoUrl: SAMPLE_VIDEOS[0].url,
    videoName: SAMPLE_VIDEOS[0].title,
    ttsEnabled: true,
    ttsMessage: 'Đã đến giờ vận động rồi! Bạn hãy đứng dậy vươn vai và tập các động tác nhẹ theo video nhé.',
    volume: 85,
    autoFullscreen: false,
    autoDismissMinutes: 0,
    createdAt: Date.now(),
  },
  {
    id: 'sample_rem_2',
    title: 'Nhắc nhở: Uống nước nạp năng lượng',
    description: 'Uống một cốc nước lọc ấm để giữ ẩm cơ thể.',
    time: '10:00',
    repeatType: 'daily',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    videoType: 'sample',
    videoUrl: SAMPLE_VIDEOS[3].url,
    videoName: SAMPLE_VIDEOS[3].title,
    ttsEnabled: true,
    ttsMessage: 'Đến giờ uống nước rồi, bạn hãy bổ sung một cốc nước để cơ thể luôn tràn đầy năng lượng nhé.',
    volume: 80,
    autoFullscreen: false,
    autoDismissMinutes: 0,
    createdAt: Date.now(),
  },
]

export function loadReminders(): ReminderItem[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY)
    if (!raw) {
      saveReminders(INITIAL_REMINDERS)
      return INITIAL_REMINDERS
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load reminders:', e)
    return INITIAL_REMINDERS
  }
}

export function saveReminders(reminders: ReminderItem[]): void {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
  } catch (e) {
    console.error('Failed to save reminders:', e)
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch (e) {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}
