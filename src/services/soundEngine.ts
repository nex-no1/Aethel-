/**
 * Web Audio API procedural sound engine for ambient focus sounds.
 * Fully client-side, zero latency, no external mp3 dependencies, and zero bandwidth lag.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundNodes: Map<
    string,
    {
      gainNode: GainNode;
      stopFunc: () => void;
    }
  > = new Map();

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create a 5-second buffer of white noise
  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Set individual sound volume
  public setVolume(id: string, volume: number) {
    if (!this.ctx) return;
    const entry = this.soundNodes.get(id);
    if (entry) {
      const clamped = Math.max(0, Math.min(1, volume));
      entry.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      entry.gainNode.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.05);
    }
  }

  // Stop a specific ambient sound
  public stopSound(id: string) {
    const entry = this.soundNodes.get(id);
    if (entry) {
      if (this.ctx) {
        entry.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      }
      setTimeout(() => {
        try {
          entry.stopFunc();
        } catch {
          // ignore already stopped
        }
        this.soundNodes.delete(id);
      }, 120);
    }
  }

  // Play a specific ambient sound
  public playSound(id: string, volume: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // If already playing, just update volume
    if (this.soundNodes.has(id)) {
      this.setVolume(id, volume);
      return;
    }

    const soundGain = this.ctx.createGain();
    soundGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    soundGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.15);
    soundGain.connect(this.masterGain);

    let stopFunc = () => {};

    if (id === 'rain') {
      // Pink/Brown noise filtered for steady rain
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(800, this.ctx.currentTime);

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'highpass';
      filter2.frequency.setValueAtTime(150, this.ctx.currentTime);

      noise.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(soundGain);
      noise.start();

      // Droplet pop simulation loop
      let timer: number | null = null;
      const makeDrop = () => {
        if (!this.ctx || !this.soundNodes.has('rain')) return;
        const osc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        osc.frequency.setValueAtTime(1200 + Math.random() * 800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
        dropGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(dropGain);
        dropGain.connect(soundGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);

        const nextDelay = 300 + Math.random() * 600;
        timer = window.setTimeout(makeDrop, nextDelay);
      };
      makeDrop();

      stopFunc = () => {
        try {
          noise.stop();
          noise.disconnect();
        } catch {}
        if (timer) clearTimeout(timer);
      };
    } else if (id === 'binaural') {
      // 10Hz Alpha Binaural Beats (210Hz Left, 220Hz Right)
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(210, this.ctx.currentTime);
      oscR.frequency.setValueAtTime(220, this.ctx.currentTime);

      const merger = this.ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0); // channel 0 = Left
      oscR.connect(merger, 0, 1); // channel 1 = Right

      merger.connect(soundGain);
      oscL.start();
      oscR.start();

      stopFunc = () => {
        try {
          oscL.stop();
          oscR.stop();
          oscL.disconnect();
          oscR.disconnect();
        } catch {}
      };
    } else if (id === 'fire') {
      // Warm low frequency rumble + crackle pops
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      const lowFilter = this.ctx.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

      noise.connect(lowFilter);
      lowFilter.connect(soundGain);
      noise.start();

      // Sporadic crackle sparks
      let timer: number | null = null;
      const makeCrackle = () => {
        if (!this.ctx || !this.soundNodes.has('fire')) return;
        const crackleNoise = this.ctx.createBufferSource();
        crackleNoise.buffer = this.createNoiseBuffer();
        const crackleFilter = this.ctx.createBiquadFilter();
        crackleFilter.type = 'bandpass';
        crackleFilter.frequency.setValueAtTime(2000 + Math.random() * 2000, this.ctx.currentTime);
        crackleFilter.Q.setValueAtTime(3, this.ctx.currentTime);

        const crackleGain = this.ctx.createGain();
        const duration = 0.02 + Math.random() * 0.05;
        crackleGain.gain.setValueAtTime(0.08 + Math.random() * 0.08, this.ctx.currentTime);
        crackleGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        crackleNoise.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(soundGain);

        crackleNoise.start();
        crackleNoise.stop(this.ctx.currentTime + duration);

        const nextDelay = 120 + Math.random() * 500;
        timer = window.setTimeout(makeCrackle, nextDelay);
      };
      makeCrackle();

      stopFunc = () => {
        try {
          noise.stop();
          noise.disconnect();
        } catch {}
        if (timer) clearTimeout(timer);
      };
    } else if (id === 'cafe') {
      // Layered warm low murmur with soft acoustic resonance
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      const band1 = this.ctx.createBiquadFilter();
      band1.type = 'bandpass';
      band1.frequency.setValueAtTime(450, this.ctx.currentTime);
      band1.Q.setValueAtTime(0.8, this.ctx.currentTime);

      noise.connect(band1);
      band1.connect(soundGain);
      noise.start();

      // Subtle warm ceramic cup clinks at low random intervals
      let timer: number | null = null;
      const makeClink = () => {
        if (!this.ctx || !this.soundNodes.has('cafe')) return;
        const clinkOsc = this.ctx.createOscillator();
        const clinkGain = this.ctx.createGain();
        clinkOsc.type = 'triangle';
        clinkOsc.frequency.setValueAtTime(1800 + Math.random() * 600, this.ctx.currentTime);

        clinkGain.gain.setValueAtTime(0.025, this.ctx.currentTime);
        clinkGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

        clinkOsc.connect(clinkGain);
        clinkGain.connect(soundGain);
        clinkOsc.start();
        clinkOsc.stop(this.ctx.currentTime + 0.13);

        const nextDelay = 2500 + Math.random() * 4000;
        timer = window.setTimeout(makeClink, nextDelay);
      };
      makeClink();

      stopFunc = () => {
        try {
          noise.stop();
          noise.disconnect();
        } catch {}
        if (timer) clearTimeout(timer);
      };
    } else if (id === 'crickets') {
      // Gentle night breeze and ambient field
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      noise.connect(windFilter);
      windFilter.connect(soundGain);
      noise.start();

      // Cricket chirp pulses
      let timer: number | null = null;
      const makeChirp = () => {
        if (!this.ctx || !this.soundNodes.has('crickets')) return;
        const osc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4500, this.ctx.currentTime);

        chirpGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(chirpGain);
        chirpGain.connect(soundGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.09);

        const nextDelay = 800 + Math.random() * 1200;
        timer = window.setTimeout(makeChirp, nextDelay);
      };
      makeChirp();

      stopFunc = () => {
        try {
          noise.stop();
          noise.disconnect();
        } catch {}
        if (timer) clearTimeout(timer);
      };
    } else if (id === 'brownNoise') {
      // Deep Brown Noise drone
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(140, this.ctx.currentTime);

      noise.connect(filter1);
      filter1.connect(soundGain);
      noise.start();

      stopFunc = () => {
        try {
          noise.stop();
          noise.disconnect();
        } catch {}
      };
    }

    this.soundNodes.set(id, { gainNode: soundGain, stopFunc });
  }

  // Play a soft harmonic Tibetan singing bowl chime when a timer or pomodoro completes
  public playChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const fundamentalFreq = 528; // Harmonic Solfeggio frequency for clarity & peace
    const harmonics = [1, 2.01, 3.02, 4.05];
    const gains = [0.4, 0.2, 0.1, 0.04];

    harmonics.forEach((h, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamentalFreq * h, this.ctx.currentTime);

      const duration = 2.8;
      gain.gain.setValueAtTime(gains[index], this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    });
  }

  // Stop all active ambient sounds
  public stopAll() {
    this.soundNodes.forEach((entry) => {
      try {
        entry.stopFunc();
      } catch {}
    });
    this.soundNodes.clear();
  }
}

export const soundEngine = new SoundEngine();
