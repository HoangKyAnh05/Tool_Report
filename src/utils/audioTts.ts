// Text-to-Speech and Web Audio Alarm Engine
class AudioTtsManager {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isSpeaking = false
  private isAlarmLoopRunning = false
  private audioCtx: AudioContext | null = null

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

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass()
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
      return this.audioCtx
    } catch (e) {
      return null
    }
  }

  // Play realistic rhythmic alarm beeps (urgent wake-up pattern)
  public playAlarmBeeps(volume = 0.85) {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      const safeVol = Math.max(0.1, Math.min(1.0, volume))

      // 4 quick urgent alarm beeps: beep - beep - beep - beep (two pairs)
      const beeps = [
        { time: 0.00, dur: 0.12, freq: 1046.5 }, // C6
        { time: 0.18, dur: 0.12, freq: 1318.5 }, // E6
        { time: 0.40, dur: 0.12, freq: 1046.5 }, // C6
        { time: 0.58, dur: 0.18, freq: 1567.98 }, // G6
        // Finishing resonant chime
        { time: 0.85, dur: 0.60, freq: 2093.00 }, // C7
      ]

      beeps.forEach(({ time, dur, freq }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + time)

        gain.gain.setValueAtTime(0.001, now + time)
        gain.gain.linearRampToValueAtTime(safeVol * 0.5, now + time + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + time)
        osc.stop(now + time + dur)
      })
    } catch (e) {
      console.warn('Alarm beep audio error:', e)
    }
  }

  // Play pleasant, rich alarm chime with harmonics
  public playChime(volume = 0.85) {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      const safeVol = Math.max(0.1, Math.min(1.0, volume))

      const chord = [
        { freq: 698.46, time: 0.0, dur: 0.8 }, // F5
        { freq: 880.00, time: 0.15, dur: 0.9 }, // A5
        { freq: 1046.50, time: 0.30, dur: 1.1 }, // C6
        { freq: 1396.91, time: 0.45, dur: 1.5 }, // F6
      ]

      chord.forEach(({ freq, time, dur }) => {
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
  public speak(
    message: string,
    options?: { volume?: number; rate?: number; pitch?: number; voiceURI?: string }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth || !message) {
        resolve()
        return
      }

      this.stopSpeechOnly()

      const cleanedMessage = message
        .replace(/["“”«»]/g, '')
        .replace(/[\n\r]+/g, '. ')
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanedMessage)
      utterance.volume = (options?.volume ?? 100) / 100
      utterance.rate = options?.rate ?? 0.95
      utterance.pitch = options?.pitch ?? 1.0

      const voices = this.getVoices()
      let selectedVoice: SpeechSynthesisVoice | undefined

      if (options?.voiceURI) {
        selectedVoice = voices.find((v) => v.voiceURI === options.voiceURI)
      }

      if (!selectedVoice) {
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
        this.isSpeaking = false
        resolve()
      }

      this.isSpeaking = true
      this.synth.speak(utterance)
    })
  }

  /**
   * Start a continuous alarm loop:
   * 1. Plays urgent ringing alarm sound
   * 2. Reads reminder message with AI voice
   * 3. Pauses briefly (2s)
   * 4. Repeats continuously until stopAlarmLoop() is called
   */
  public startAlarmLoop(
    message: string,
    options: {
      volume?: number
      isMuted?: () => boolean
      onSpeechChange?: (isSpeaking: boolean) => void
    }
  ): () => void {
    this.isAlarmLoopRunning = true
    const vol = (options.volume ?? 85) / 100

    const runLoop = async () => {
      while (this.isAlarmLoopRunning) {
        // Step 1: Play urgent alarm sound if not muted
        if (!options.isMuted || !options.isMuted()) {
          this.playAlarmBeeps(vol)
        }

        // Wait 1.4s for alarm beeps to finish
        await new Promise((r) => setTimeout(r, 1400))
        if (!this.isAlarmLoopRunning) break

        // Step 2: Speak message if not muted
        if (!options.isMuted || !options.isMuted()) {
          options.onSpeechChange?.(true)
          await this.speak(message, { volume: options.volume ?? 85 })
          options.onSpeechChange?.(false)
        }

        if (!this.isAlarmLoopRunning) break

        // Step 3: Brief interval before ringing again
        await new Promise((r) => setTimeout(r, 2000))
      }
    }

    runLoop()

    return () => {
      this.stopAlarmLoop()
    }
  }

  public stopSpeechOnly() {
    if (this.synth) {
      try {
        this.synth.cancel()
      } catch (e) {
        // ignore
      }
    }
    this.isSpeaking = false
  }

  public stopAlarmLoop() {
    this.isAlarmLoopRunning = false
    this.stopSpeechOnly()
  }

  public stop() {
    this.stopAlarmLoop()
  }
}

export const audioTts = new AudioTtsManager()
