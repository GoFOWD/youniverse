class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Initialize on user interaction
  }

  init() {
    if (typeof window === 'undefined') return;

    // Create context if it doesn't exist
    if (!this.context) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.3; // Master volume
    }

    // Resume if suspended (browser policy)
    if (this.context.state === 'suspended') {
      this.context.resume().catch(() => { });
    }
  }

  resume() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().catch(() => { });
    }
  }

  playBubble() {
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.frequency.setValueAtTime(400 + Math.random() * 200, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, this.context.currentTime + 0.1);

    gain.gain.setValueAtTime(0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  playSwoosh() {
    if (!this.context) return;

    const now = this.context.currentTime;

    // 1. Sub-bass "Thud" for weight
    const subOsc = this.context.createOscillator();
    const subGain = this.context.createGain();
    subOsc.connect(subGain);
    subGain.connect(this.masterGain!);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(60, now); // Deep 60Hz thud
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    subOsc.start(now);
    subOsc.stop(now + 0.3);

    // 2. Multiple overlapping bubbles (Lower pitch)
    for (let i = 0; i < 7; i++) {
      const osc = this.context.createOscillator();
      const oscGain = this.context.createGain();

      osc.connect(oscGain);
      oscGain.connect(this.masterGain!);

      const startTime = now + (Math.random() * 0.2);
      const duration = 0.1 + (Math.random() * 0.15); // Slightly longer

      osc.type = 'sine';

      // Pitch envelope: Lower range (150-400Hz instead of 400-800Hz)
      const startFreq = 150 + (Math.random() * 250);
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 2.0, startTime + duration);

      // Amplitude envelope
      oscGain.gain.setValueAtTime(0, startTime);
      oscGain.gain.linearRampToValueAtTime(0.4, startTime + (duration * 0.1));
      oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    }
  }
}

export const audioManager = new AudioManager();
