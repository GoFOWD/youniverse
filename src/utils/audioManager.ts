class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Initialize on user interaction
  }

  init() {
    if (this.context) return;
    
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = 0.3; // Master volume
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
    
    // White noise buffer
    const bufferSize = this.context.sampleRate * 2;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100;

    const gain = this.context.createGain();
    gain.gain.value = 0.1;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    // Filter sweep
    filter.frequency.exponentialRampToValueAtTime(2000, this.context.currentTime + 0.5);
    filter.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 1);
    
    gain.gain.linearRampToValueAtTime(0.2, this.context.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 1);

    noise.start();
  }
}

export const audioManager = new AudioManager();
