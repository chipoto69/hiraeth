export class SyntheticAudio {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.isInitialized = false;
  }
  
  init() {
    if (this.isInitialized) return;
    
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = 0.5;
    this.isInitialized = true;
  }
  
  resume() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }
  
  createRainSound() {
    if (!this.isInitialized) this.init();
    
    const bufferSize = 2 * this.context.sampleRate;
    const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = this.context.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const lowpass = this.context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;
    
    const highpass = this.context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 100;
    
    const gain = this.context.createGain();
    gain.gain.value = 0;
    
    whiteNoise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.masterGain);
    
    whiteNoise.start();
    
    return {
      source: whiteNoise,
      gain: gain,
      fadeIn: (duration = 2) => {
        gain.gain.linearRampToValueAtTime(0.3, this.context.currentTime + duration);
      },
      fadeOut: (duration = 1) => {
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
      },
      setVolume: (vol) => {
        gain.gain.linearRampToValueAtTime(vol * 0.3, this.context.currentTime + 0.1);
      },
      stop: () => {
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
        setTimeout(() => whiteNoise.stop(), 600);
      }
    };
  }
  
  createHeavyRainSound() {
    if (!this.isInitialized) this.init();
    
    const bufferSize = 2 * this.context.sampleRate;
    const noiseBuffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    
    const whiteNoise = this.context.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const lowpass = this.context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    
    const gain = this.context.createGain();
    gain.gain.value = 0;
    
    whiteNoise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);
    
    whiteNoise.start();
    
    return {
      source: whiteNoise,
      gain: gain,
      fadeIn: (duration = 1.5) => {
        gain.gain.linearRampToValueAtTime(0.5, this.context.currentTime + duration);
      },
      fadeOut: (duration = 1.5) => {
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
      },
      stop: () => {
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
        setTimeout(() => whiteNoise.stop(), 600);
      }
    };
  }
  
  playInkDrop() {
    if (!this.isInitialized) this.init();
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.2);
  }
  
  playPenScratch(duration = 0.5) {
    if (!this.isInitialized) this.init();
    
    const bufferSize = duration * this.context.sampleRate;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.context.sampleRate;
      const scratchFreq = 20 + Math.sin(t * 50) * 10;
      output[i] = (Math.random() * 2 - 1) * Math.sin(t * scratchFreq * Math.PI * 2) * 0.3;
    }
    
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    
    const highpass = this.context.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 2000;
    
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
    
    source.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.masterGain);
    
    source.start();
  }
  
  playWhisper() {
    if (!this.isInitialized) this.init();
    
    const duration = 3;
    const bufferSize = duration * this.context.sampleRate;
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / this.context.sampleRate;
        const envelope = Math.sin(t / duration * Math.PI);
        output[i] = (Math.random() * 2 - 1) * envelope * 0.15;
      }
    }
    
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    
    const bandpass = this.context.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000;
    bandpass.Q.value = 2;
    
    const panner = this.context.createStereoPanner();
    panner.pan.value = -0.8;
    
    source.connect(bandpass);
    bandpass.connect(panner);
    panner.connect(this.masterGain);
    
    source.start();
  }
  
  createDissonance() {
    if (!this.isInitialized) this.init();
    
    const oscs = [];
    const freqs = [110, 116, 123, 130, 138];
    
    const gainNode = this.context.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(this.masterGain);
    
    freqs.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = Math.random() * 20 - 10;
      
      const oscGain = this.context.createGain();
      oscGain.gain.value = 0.1;
      
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();
      
      oscs.push({ osc, oscGain });
    });
    
    return {
      fadeIn: (duration = 2) => {
        gainNode.gain.linearRampToValueAtTime(0.3, this.context.currentTime + duration);
      },
      fadeOut: (duration = 1.5) => {
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
      },
      stop: () => {
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
        setTimeout(() => {
          oscs.forEach(({ osc }) => osc.stop());
        }, 600);
      }
    };
  }
  
  createHeartbeat() {
    if (!this.isInitialized) this.init();
    
    const gainNode = this.context.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(this.masterGain);
    
    let isPlaying = true;
    
    const playBeat = () => {
      if (!isPlaying) return;
      
      const osc = this.context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60;
      
      const beatGain = this.context.createGain();
      beatGain.gain.setValueAtTime(0.5, this.context.currentTime);
      beatGain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
      
      osc.connect(beatGain);
      beatGain.connect(gainNode);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.2);
      
      setTimeout(() => {
        if (!isPlaying) return;
        
        const osc2 = this.context.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 50;
        
        const beat2Gain = this.context.createGain();
        beat2Gain.gain.setValueAtTime(0.3, this.context.currentTime);
        beat2Gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        osc2.connect(beat2Gain);
        beat2Gain.connect(gainNode);
        
        osc2.start();
        osc2.stop(this.context.currentTime + 0.15);
      }, 200);
      
      setTimeout(playBeat, 1000);
    };
    
    return {
      start: () => {
        isPlaying = true;
        gainNode.gain.linearRampToValueAtTime(0.4, this.context.currentTime + 1);
        playBeat();
      },
      stop: () => {
        isPlaying = false;
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 2);
      }
    };
  }
  
  setMasterVolume(vol) {
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(vol, this.context.currentTime + 0.1);
    }
  }
  
  mute() {
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.1);
    }
  }
  
  unmute() {
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.5, this.context.currentTime + 0.1);
    }
  }
}
