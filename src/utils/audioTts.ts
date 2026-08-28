// Text-to-Speech and Web Audio Alarm Chime

class AudioTtsManager {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private audioCtx: AudioContext | null = null
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

  // Play pleasant wake up chime using Web Audio API
  public playChime(volume = 0.8) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return

      const ctx = new AudioContextClass()
      const now = ctx.currentTime

      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)

        gain.gain.setValueAtTime(0, now + idx * 0.12)
        gain.gain.linearRampToValueAtTime(volume * 0.3, now + idx * 0.12 + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.6)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 0.6)
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

      const utterance = new SpeechSynthesisUtterance(message)
      utterance.volume = (options?.volume ?? 100) / 100
      utterance.rate = options?.rate ?? 1.0
      utterance.pitch = options?.pitch ?? 1.0

      const voices = this.getVoices()
      // Try to find Vietnamese voice or match by voiceURI
      let selectedVoice = voices.find((v) => v.voiceURI === options?.voiceURI)
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.toLowerCase().includes('vi') || v.name.toLowerCase().includes('vietnam'))
      }
      if (!selectedVoice) {
        // Fallback to default or any available voice
        selectedVoice = voices.find((v) => v.default) || voices[0]
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
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
      this.synth.cancel()
    }
    this.isSpeaking = false
  }
}

export const audioTts = new AudioTtsManager()
