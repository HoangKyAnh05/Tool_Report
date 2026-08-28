export type RepeatType = 'daily' | 'once' | 'weekdays' | 'weekends' | 'custom_days';

export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  time: string; // "HH:mm" (24h format)
  repeatType: RepeatType;
  customDays: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  enabled: boolean;
  
  // Video settings
  videoType: 'local' | 'sample' | 'url';
  videoUrl: string;
  videoName: string;
  videoDuration?: number;
  
  // Voice / TTS settings
  ttsEnabled: boolean;
  ttsMessage: string;
  ttsVoice?: string;
  volume: number; // 0 - 100
  
  // Display & Behavior
  autoFullscreen: boolean;
  autoDismissMinutes?: number; // 0 = don't auto dismiss
  
  createdAt: number;
  lastTriggeredDate?: string; // "YYYY-MM-DD"
}

export interface SampleVideo {
  id: string;
  title: string;
  category: 'exercise' | 'study' | 'relax' | 'reminder' | 'work';
  url: string;
  thumbnail: string;
  duration: string;
  description: string;
}

export interface AppSettings {
  runInBackground: boolean;
  startWithWindows: boolean;
  soundVolume: number;
  theme: 'dark' | 'midnight' | 'cyberpunk';
  voiceRate: number;
  voicePitch: number;
}
