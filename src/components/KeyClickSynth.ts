/**
 * Web Audio API synthesizer for mechanical keyboard sounds
 * Completely offline-capable, zero external assets required.
 */

class KeyClickSynth {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35; // 0.0 to 1.0
  private profile: 'silent' | 'tactile' | 'clicky' | 'bubble' = 'tactile';

  constructor() {
    // Lazy initialization on first keystroke to comply with browser autoplay security policies
  }

  private initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    } catch (e) {
      console.warn("Web Audio API is not supported in this environment", e);
    }
  }

  setMuted(mute: boolean) {
    this.isMuted = mute;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setProfile(profile: 'silent' | 'tactile' | 'clicky' | 'bubble') {
    this.profile = profile;
  }

  getMuted() {
    return this.isMuted;
  }

  getVolume() {
    return this.volume;
  }

  getProfile() {
    return this.profile;
  }

  playClick(type: 'correct' | 'incorrect' | 'space' | 'backspace') {
    if (this.isMuted || this.profile === 'silent') return;
    this.initAudio();
    if (!this.audioCtx) return;

    // Resume context if suspended (common in browser power management)
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(this.volume, now);
    masterGain.connect(this.audioCtx.destination);

    if (type === 'incorrect') {
      // Error sound: low heavy buzz
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now); // Low G
      
      // Pitch drop
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      // Low pass filter to make it sound dull and buzz-like
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.12);
      return;
    }

    // Parameters based on click profile
    let clickFreq = 1600;
    let decayTime = 0.05;
    let noiseRatio = 0.4; // Mix with noise for mechanical slider sound

    switch (this.profile) {
      case 'clicky': // Cherry MX Blue high-pitch clicks
        clickFreq = type === 'space' ? 1000 : 2100;
        decayTime = type === 'space' ? 0.07 : 0.035;
        noiseRatio = 0.65;
        break;
      case 'bubble': // Deep dampened pop
        clickFreq = type === 'space' ? 320 : 680;
        decayTime = type === 'space' ? 0.12 : 0.08;
        noiseRatio = 0.15;
        break;
      case 'tactile': // Standard crispy tactile Switch
      default:
        clickFreq = type === 'space' ? 750 : 1300;
        decayTime = type === 'space' ? 0.08 : 0.045;
        noiseRatio = 0.4;
        break;
    }

    if (type === 'backspace') {
      clickFreq = clickFreq * 0.75;
      decayTime = decayTime * 1.2;
    }

    // 1. Transient Oscillator (The metallic tone)
    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();
    
    // Smooth high Q filter for structural resonance
    const clickRes: BiquadFilterNode = this.audioCtx.createBiquadFilter();
    clickRes.type = 'bandpass';
    clickRes.frequency.setValueAtTime(clickFreq, now);
    clickRes.Q.setValueAtTime(6.0, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(clickFreq, now);
    osc.frequency.exponentialRampToValueAtTime(clickFreq * 0.7, now + decayTime);

    oscGain.gain.setValueAtTime((1 - noiseRatio) * 0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

    osc.connect(clickRes);
    clickRes.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + decayTime);

    // 2. White Noise Source (The mechanical friction friction)
    try {
      const bufferSize = this.audioCtx.sampleRate * decayTime;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;

      const noiseFilter = this.audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(clickFreq * 1.5, now);
      noiseFilter.Q.setValueAtTime(2.0, now);

      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(noiseRatio * 0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noiseNode.start(now);
      noiseNode.stop(now + decayTime);
    } catch (_) {
      // Fallback in case browser buffer allocation fails
    }
  }
}

// Export a single instance to be imports across files
export const synth = new KeyClickSynth();
