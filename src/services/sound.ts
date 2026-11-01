// Web Audio API synthesizer + Background Music Manager
// Supports both HTML5 Audio element (/music/bg-music.mp3) AND pure Web Audio synth fallback

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private synthMusicTimer: number | null = null;
  private musicDuckTimer: number | null = null;
  private isUsingSynthMusic = false;
  private synthStep = 0;

  public sfxEnabled = true;
  public musicEnabled = true;
  public musicVolume = 0.45;
  private isMutedByBlur = false;

  private onVisibilityChange = () => {
    if (document.hidden) {
      this.pauseMusic();
    } else if (this.musicEnabled && !this.isMutedByBlur) {
      this.playMusic();
    }
  };

  private onWindowBlur = () => {
    this.isMutedByBlur = true;
    this.pauseMusic();
  };

  private onWindowFocus = () => {
    this.isMutedByBlur = false;
    if (this.musicEnabled) {
      this.playMusic();
    }
  };

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      window.addEventListener('blur', this.onWindowBlur);
      window.addEventListener('focus', this.onWindowFocus);
    }
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      window.removeEventListener('blur', this.onWindowBlur);
      window.removeEventListener('focus', this.onWindowFocus);
    }
    this.stopMusic();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {}
    }
    this.audioCtx = null;
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 1;
        this.masterGain.connect(this.audioCtx.destination);

        this.sfxGain = this.audioCtx.createGain();
        this.sfxGain.gain.value = 1;
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.audioCtx.createGain();
        this.musicGain.gain.value = this.musicVolume;
        this.musicGain.connect(this.masterGain);
      } catch (e) {
        console.warn('AudioContext not available:', e);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public unlockAudioOnUserGesture() {
    this.ensureAudioContext();
    if (this.musicEnabled) {
      this.playMusic();
    }
  }

  // ----------------------------- SFX -----------------------------
  public playTone(freq: number, duration = 0.08, type: OscillatorType = 'sine', volume = 0.18) {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.ensureAudioContext();
      if (!ctx || !this.sfxGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch {}
  }

  public playChord(frequencies: number[], duration = 0.18, type: OscillatorType = 'triangle') {
    if (!this.sfxEnabled) return;
    frequencies.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, duration, type, 0.16), idx * 45);
    });
  }

  public flap() {
    this.playTone(660, 0.05, 'square', 0.15);
  }

  public correct(combo = 0) {
    const freq = Math.min(720 + combo * 35, 1200);
    this.playTone(freq, 0.08, 'triangle', 0.22);
    if (combo >= 3 && combo % 3 === 0) {
      this.playChord([880, 1100, 1320], 0.15);
      this.duckMusic(0.35, 300);
    }
  }

  public wrong() {
    this.playTone(160, 0.35, 'sawtooth', 0.28);
  }

  public victory() {
    this.playChord([523, 659, 784, 1046], 0.22);
  }

  public coin() {
    this.playTone(988, 0.06, 'sine', 0.2);
    setTimeout(() => this.playTone(1318, 0.1, 'sine', 0.22), 60);
  }

  // ----------------------------- Music -----------------------------
  private ensureMusicElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.musicEl) {
      try {
        const el = new Audio('/music/bg-music.mp3');
        el.loop = true;
        el.preload = 'auto';
        el.volume = this.musicVolume;

        el.addEventListener('error', () => {
          // If HTML5 audio element fails to load MP3, fallback to pure Web Audio synth
          this.startSynthMusic();
        });

        this.musicEl = el;
      } catch (e) {
        console.warn('Music element creation error, using synth:', e);
        this.startSynthMusic();
      }
    }
    return this.musicEl;
  }

  public playMusic() {
    if (!this.musicEnabled || typeof window === 'undefined') return;

    const el = this.ensureMusicElement();
    if (el) {
      el.volume = this.musicVolume;
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.stopSynthMusic();
            this.isUsingSynthMusic = false;
          })
          .catch(() => {
            if (!this.musicEl || this.musicEl.paused) {
              this.startSynthMusic();
            }
          });
      }
      return;
    }

    this.startSynthMusic();
  }

  public pauseMusic() {
    if (this.musicEl) {
      try {
        this.musicEl.pause();
      } catch {}
    }
    this.stopSynthMusic();
  }

  public stopMusic() {
    if (this.musicEl) {
      try {
        this.musicEl.pause();
        this.musicEl.currentTime = 0;
      } catch {}
    }
    this.stopSynthMusic();
  }

  // Built-in Pure Web Audio Synth Music Engine (Guaranteed 100% Offline & Fail-Safe)
  private startSynthMusic() {
    if (!this.musicEnabled || this.synthMusicTimer) return;
    this.isUsingSynthMusic = true;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    const chords = [
      [220.0, 261.63, 329.63], // Am
      [174.61, 220.0, 261.63], // F
      [261.63, 329.63, 392.0],  // C
      [196.0, 246.94, 293.66],  // G
    ];
    const bassNotes = [110.0, 87.31, 130.81, 98.0];
    const arpNotes = [0, 1, 2, 1, 0, 2, 1, 2];

    const stepIntervalMs = 125; // 120 BPM 16th notes

    const tick = () => {
      if (!this.musicEnabled || this.isMutedByBlur) return;
      const c = this.ensureAudioContext();
      if (!c || !this.musicGain) return;

      const chordIdx = Math.floor(this.synthStep / 16) % 4;
      const stepInChord = this.synthStep % 16;

      // Bass note on quarter beats
      if (stepInChord % 4 === 0) {
        try {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(bassNotes[chordIdx], c.currentTime);
          gain.gain.setValueAtTime(0.0001, c.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.22, c.currentTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.28);
          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start();
          osc.stop(c.currentTime + 0.3);
        } catch {}
      }

      // Arp melody on 16th notes
      const noteIdx = arpNotes[stepInChord % arpNotes.length];
      const freq = chords[chordIdx][noteIdx] * 2;
      try {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, c.currentTime);
        gain.gain.setValueAtTime(0.0001, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, c.currentTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.11);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start();
        osc.stop(c.currentTime + 0.12);
      } catch {}

      this.synthStep = (this.synthStep + 1) % 64;
    };

    this.synthMusicTimer = window.setInterval(tick, stepIntervalMs);
  }

  private stopSynthMusic() {
    if (this.synthMusicTimer) {
      window.clearInterval(this.synthMusicTimer);
      this.synthMusicTimer = null;
    }
  }

  public duckMusic(factor = 0.35, durationMs = 300) {
    if (this.musicEl && !this.musicEl.paused) {
      try {
        this.musicEl.volume = Math.max(0, this.musicVolume * factor);
        if (this.musicDuckTimer) window.clearTimeout(this.musicDuckTimer);
        this.musicDuckTimer = window.setTimeout(() => {
          if (this.musicEl) this.musicEl.volume = this.musicVolume;
        }, durationMs);
      } catch {}
    } else if (this.musicGain && this.audioCtx) {
      try {
        this.musicGain.gain.setValueAtTime(this.musicVolume * factor, this.audioCtx.currentTime);
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioCtx.currentTime + durationMs / 1000);
      } catch {}
    }
  }

  public setSfx(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public setMusic(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.playMusic();
    } else {
      this.pauseMusic();
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicEl) {
      try {
        this.musicEl.volume = this.musicVolume;
      } catch {}
    }
    if (this.musicGain && this.audioCtx) {
      try {
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioCtx.currentTime);
      } catch {}
    }
  }

  public triggerHaptic(ms = 10) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  }
}

export const soundService = new SoundManager();
