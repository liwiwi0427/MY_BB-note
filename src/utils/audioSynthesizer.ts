class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private whiteNoiseNode: AudioNode | null = null;
  private isWhiteNoisePlaying: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play subtle feedback chime when saving diary or completing vaccine
  public playSuccessChime() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio play notice:', e);
    }
  }

  // Pure Web Audio white noise generator (womb / ocean soothing for infant sleep)
  public toggleWhiteNoise(start: boolean) {
    try {
      const ctx = this.getContext();

      if (!start) {
        if (this.whiteNoiseNode) {
          this.whiteNoiseNode.disconnect();
          this.whiteNoiseNode = null;
        }
        this.isWhiteNoisePlaying = false;
        return;
      }

      if (this.isWhiteNoisePlaying) return;

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      // Pink/Brown noise filter simulation for soothing womb rhythm
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      this.whiteNoiseNode = gain;
      this.isWhiteNoisePlaying = true;
    } catch (e) {
      console.warn('White noise play warning:', e);
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer();
