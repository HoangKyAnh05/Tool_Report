// Text-to-Speech and Web Audio Alarm Chime
class AudioTtsManager {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isSpeaking = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      this.loadVoices()
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return
    this.voices = this.synth.getVoices()
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices()
    }
    return this.voices
  }

  // Play pleasant, rich alarm chime with harmonics
  public playChime(volume = 0.85) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return

      const ctx = new AudioContextClass()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime
      const safeVol = Math.max(0.1, Math.min(1.0, volume))

      // Melodic arpeggio chord progression: F5 -> A5 -> C6 -> F6
      const chord = [
        { freq: 698.46, time: 0.0, dur: 0.8 }, // F5
        { freq: 880.00, time: 0.15, dur: 0.9 }, // A5
        { freq: 1046.50, time: 0.30, dur: 1.1 }, // C6
        { freq: 1396.91, time: 0.45, dur: 1.5 }, // F6
      ]

      chord.forEach(({ freq, time, dur }) => {
        // Fundamental tone
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(freq, now + time)

        gain1.gain.setValueAtTime(0.001, now + time)
        gain1.gain.linearRampToValueAtTime(safeVol * 0.4, now + time + 0.03)
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + time + dur)

        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.start(now + time)
        osc1.stop(now + time + dur)

        // Harmonic overtone for rich metallic chime feel
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(freq * 2, now + time)

        gain2.gain.setValueAtTime(0.001, now + time)
        gain2.gain.linearRampToValueAtTime(safeVol * 0.12, now + time + 0.02)
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + time + dur * 0.6)

        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(now + time)
        osc2.stop(now + time + dur * 0.6)
      })
    } catch (e) {
      console.warn('AudioContext chime error:', e)
    }
  }

  // Speak reminder message in Vietnamese or configured voice
  public speak(message: string, options?: { volume?: number; rate?: number; pitch?: number; voiceURI?: string }): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth || !message) {
        resolve()
        return
      }

      this.stop() // Cancel any ongoing speech

      // Clean message string for speech
      const cleanedMessage = message
        .replace(/["“”«»]/g, '')
        .replace(/[\n\r]+/g, '. ')
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanedMessage)
      utterance.volume = (options?.volume ?? 100) / 100
      utterance.rate = options?.rate ?? 0.95
      utterance.pitch = options?.pitch ?? 1.0

      const voices = this.getVoices()
      // Try to find matching voice
      let selectedVoice: SpeechSynthesisVoice | undefined

      if (options?.voiceURI) {
        selectedVoice = voices.find((v) => v.voiceURI === options.voiceURI)
      }

      if (!selectedVoice) {
        // Priority 1: Vietnamese voice (vi-VN, HoaiMy, Nam, Google Tiếng Việt)
        selectedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('vi') ||
            v.lang.toLowerCase().includes('vietnam') ||
            v.name.toLowerCase().includes('vietnam') ||
            v.name.toLowerCase().includes('tiếng việt') ||
            v.name.toLowerCase().includes('hoaimy') ||
            v.name.toLowerCase().includes('nam')
        )
      }

      if (!selectedVoice) {
        // Priority 2: Default or first available voice
        selectedVoice = voices.find((v) => v.default) || voices[0]
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
        utterance.lang = selectedVoice.lang || 'vi-VN'
      } else {
        utterance.lang = 'vi-VN'
      }

      utterance.onend = () => {
        this.isSpeaking = false
        resolve()
      }

      utterance.onerror = (e) => {
        console.warn('TTS speech error:', e)
        this.isSpeaking = false
        resolve()
      }

      this.isSpeaking = true
      this.synth.speak(utterance)
    })
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel()
      } catch (e) {
        // ignore
      }
    }
    this.isSpeaking = false
  }
}

export const audioTts = new AudioTtsManager()
