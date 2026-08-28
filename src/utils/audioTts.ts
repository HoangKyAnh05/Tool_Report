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

  // Play high-volume, punchy rhythmic alarm beeps (urgent wake-up pattern)
  public playAlarmBeeps(volume = 1.0) {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      const safeVol = Math.max(0.5, Math.min(1.0, volume))

      // Master compressor to maximize acoustic loudness without distortion
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.setValueAtTime(-10, now)
      compressor.knee.setValueAtTime(30, now)
      compressor.ratio.setValueAtTime(10, now)
      compressor.attack.setValueAtTime(0.002, now)
      compressor.release.setValueAtTime(0.2, now)
      compressor.connect(ctx.destination)

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(safeVol * 1.5, now)
      masterGain.connect(compressor)

      // 5 urgent high-impact alarm beeps with harmonic layering
      const beeps = [
        { time: 0.00, dur: 0.14, freq: 1174.66 }, // D6
        { time: 0.17, dur: 0.14, freq: 1479.98 }, // F#6
        { time: 0.36, dur: 0.14, freq: 1174.66 }, // D6
        { time: 0.54, dur: 0.20, freq: 1760.00 }, // A6
        { time: 0.82, dur: 0.70, freq: 2349.32 }, // D7 loud resonant finish
      ]

      beeps.forEach(({ time, dur, freq }) => {
        // 1. Primary square/triangle wave for sharp, loud acoustic presence
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'triangle'
        osc1.frequency.setValueAtTime(freq, now + time)

        gain1.gain.setValueAtTime(0.001, now + time)
        gain1.gain.linearRampToValueAtTime(0.9, now + time + 0.02)
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + time + dur)

        osc1.connect(gain1)
        gain1.connect(masterGain)

        osc1.start(now + time)
        osc1.stop(now + time + dur)

        // 2. High sine harmonic for piercing clarity
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(freq * 1.5, now + time)

        gain2.gain.setValueAtTime(0.001, now + time)
        gain2.gain.linearRampToValueAtTime(0.5, now + time + 0.02)
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + time + dur * 0.8)

        osc2.connect(gain2)
        gain2.connect(masterGain)

        osc2.start(now + time)
        osc2.stop(now + time + dur * 0.8)
      })
    } catch (e) {
      console.warn('Alarm beep audio error:', e)
    }
  }

  // Play pleasant, rich alarm chime with harmonics
  public playChime(volume = 1.0) {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime
      const safeVol = Math.max(0.5, Math.min(1.0, volume))

      const chord = [
        { freq: 698.46, time: 0.0, dur: 0.8 }, // F5
        { freq: 880.00, time: 0.15, dur: 0.9 }, // A5
        { freq: 1046.50, time: 0.30, dur: 1.1 }, // C6
        { freq: 1396.91, time: 0.45, dur: 1.5 }, // F6
      ]

      chord.forEach(({ freq, time, dur }) => {
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'triangle'
        osc1.frequency.setValueAtTime(freq, now + time)

        gain1.gain.setValueAtTime(0.001, now + time)
        gain1.gain.linearRampToValueAtTime(safeVol * 0.8, now + time + 0.03)
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + time + dur)

        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.start(now + time)
        osc1.stop(now + time + dur)

        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(freq * 2, now + time)

        gain2.gain.setValueAtTime(0.001, now + time)
        gain2.gain.linearRampToValueAtTime(safeVol * 0.4, now + time + 0.02)
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + time + dur * 0.7)

        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(now + time)
        osc2.stop(now + time + dur * 0.7)
      })
    } catch (e) {
      console.warn('AudioContext chime error:', e)
    }
  }

  // Speak reminder message in Vietnamese or configured voice with maximum clarity
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
      // Force 1.0 (100% max volume)
      utterance.volume = 1.0
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
   * 1. Plays loud urgent ringing alarm sound
   * 2. Reads reminder message with AI voice
   * 3. Pauses briefly (1.8s)
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
    // Force maximum volume 1.0
    const vol = 1.0

    const runLoop = async () => {
      while (this.isAlarmLoopRunning) {
        // Step 1: Play loud alarm sound if not muted
        if (!options.isMuted || !options.isMuted()) {
          this.playAlarmBeeps(vol)
        }

        // Wait for alarm beeps to finish
        await new Promise((r) => setTimeout(r, 1500))
        if (!this.isAlarmLoopRunning) break

        // Step 2: Speak message with full volume if not muted
        if (!options.isMuted || !options.isMuted()) {
          options.onSpeechChange?.(true)
          await this.speak(message, { volume: 100 })
          options.onSpeechChange?.(false)
        }

        if (!this.isAlarmLoopRunning) break

        // Step 3: Brief interval before ringing again
        await new Promise((r) => setTimeout(r, 1800))
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
