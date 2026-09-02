// Web Audio API Synthesizer for Soothing White Noise & Lullaby Chimes
// Runs entirely offline in the browser without any external audio asset dependencies.

export type SoundType = 'heartbeat' | 'rain' | 'shushing' | 'lullaby';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private currentType: SoundType | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private intervalId: any = null;
  private isPlaying = false;
  private volume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public play(type: SoundType) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentType = type;

    // Master Gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    switch (type) {
      case 'heartbeat':
        this.startHeartbeat();
        break;
      case 'rain':
        this.startRain();
        break;
      case 'shushing':
        this.startShushing();
        break;
      case 'lullaby':
        this.startLullaby();
        break;
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.gainNode = null;
    }
    this.isPlaying = false;
    this.currentType = null;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentType(): SoundType | null {
    return this.currentType;
  }

  // 1. Womb Heartbeat (Lub-Dub rhythmic pulses)
  private startHeartbeat() {
    if (!this.ctx || !this.gainNode) return;
    const playThud = (freq: number, dur: number, gainVal: number) => {
      if (!this.ctx || !this.gainNode || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, this.ctx.currentTime);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + dur);

      oscGain.gain.setValueAtTime(gainVal * this.volume * 1.5, this.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.gainNode);

      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    };

    // ~68 bpm: Lub at 0, Dub at 280ms, repeat every 900ms
    const beat = () => {
      if (!this.isPlaying) return;
      playThud(75, 0.18, 0.9); // Lub
      setTimeout(() => {
        if (this.isPlaying) {
          playThud(65, 0.15, 0.6); // Dub
        }
      }, 260);
    };

    beat();
    this.intervalId = setInterval(beat, 920);
  }

  // 2. Gentle Pink Rain Noise
  private startRain() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  // 3. Soft Shushing / White Noise
  private startShushing() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.18;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // Rhythmically modulate amplitude to create gentle rhythmic "shh... shh..."
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.35, this.ctx.currentTime); // ~20 breaths/min

    lfoGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    lfo.connect(lfoGain.gain);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  // 4. Lullaby Music Box Chimes (Twinkle Twinkle / Brahms melody arpeggios)
  private startLullaby() {
    if (!this.ctx || !this.gainNode) return;

    // Pentatonic scale notes (Hz): C5, D5, E5, G5, A5, C6
    const notes = [
      523.25, 587.33, 659.25, 783.99, 880.00, 1046.50,
      880.00, 783.99, 659.25, 587.33, 523.25, 659.25,
      783.99, 1046.50, 783.99, 659.25, 587.33, 523.25
    ];
    let noteIdx = 0;

    const playBell = (freq: number) => {
      if (!this.ctx || !this.gainNode || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Sweet music box bell envelope
      const now = this.ctx.currentTime;
      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.35 * this.volume, now + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 1.25);
    };

    const nextTone = () => {
      if (!this.isPlaying) return;
      const freq = notes[noteIdx % notes.length];
      noteIdx++;
      playBell(freq);
    };

    nextTone();
    this.intervalId = setInterval(nextTone, 800);
  }
}

export const audioSynthesizer = new SoundSynthesizer();
