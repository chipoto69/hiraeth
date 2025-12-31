import { Howl, Howler } from 'howler';

export class AudioManager {
  constructor() {
    this.sounds = {};
    this.isLoaded = false;
    this.masterVolume = 1.0;
    
    this.layers = {
      ambient: null,
      rain: null,
      paper: null,
      pen: null,
      whisper: null
    };
  }
  
  async load() {
    Howler.volume(this.masterVolume);
    
    this.sounds.rainLight = this.createSound('/audio/rain-light.mp3', {
      loop: true,
      volume: 0.4
    });
    
    this.sounds.rainHeavy = this.createSound('/audio/rain-heavy.mp3', {
      loop: true,
      volume: 0
    });
    
    this.sounds.paperRustle = this.createSound('/audio/paper-rustle.mp3', {
      volume: 0.2
    });
    
    this.sounds.penScratch = this.createSound('/audio/pen-scratch.mp3', {
      volume: 0.3
    });
    
    this.sounds.inkDrop = this.createSound('/audio/ink-drop.mp3', {
      volume: 0.25
    });
    
    this.sounds.whisper = this.createSound('/audio/whisper.mp3', {
      volume: 0.5,
      spatial: true
    });
    
    this.sounds.dissonance = this.createSound('/audio/dissonance.mp3', {
      loop: true,
      volume: 0
    });
    
    this.sounds.heartbeat = this.createSound('/audio/heartbeat.mp3', {
      loop: true,
      volume: 0
    });
    
    this.isLoaded = true;
  }
  
  createSound(src, options = {}) {
    const sound = new Howl({
      src: [src],
      loop: options.loop || false,
      volume: options.volume || 0.5,
      preload: true,
      html5: options.spatial ? false : true,
      onloaderror: () => {
        console.warn(`Audio not found: ${src} - using silent fallback`);
      }
    });
    
    if (options.spatial) {
      sound.pannerAttr({
        panningModel: 'HRTF',
        refDistance: 1,
        rolloffFactor: 1,
        distanceModel: 'inverse'
      });
    }
    
    return sound;
  }
  
  startAmbient() {
    if (this.sounds.rainLight) {
      this.sounds.rainLight.play();
      this.sounds.rainLight.fade(0, 0.4, 2000);
    }
  }
  
  fadeAmbient(targetVolume, duration = 500) {
    if (this.sounds.rainLight) {
      const currentVol = this.sounds.rainLight.volume();
      this.sounds.rainLight.fade(currentVol, targetVolume * 0.4, duration);
    }
  }
  
  playRainHeavy() {
    if (this.sounds.rainHeavy) {
      this.sounds.rainHeavy.play();
      this.sounds.rainHeavy.fade(0, 0.6, 1500);
    }
  }
  
  stopRainHeavy() {
    if (this.sounds.rainHeavy) {
      this.sounds.rainHeavy.fade(0.6, 0, 1500);
    }
  }
  
  playPenScratch(duration = 500) {
    if (this.sounds.penScratch) {
      this.sounds.penScratch.play();
      
      setTimeout(() => {
        this.sounds.penScratch.fade(0.3, 0, 200);
      }, duration);
    }
  }
  
  playInkDrop() {
    if (this.sounds.inkDrop) {
      const id = this.sounds.inkDrop.play();
      this.sounds.inkDrop.rate(0.8 + Math.random() * 0.4, id);
    }
  }
  
  playWhisper(position = { x: 0, y: 0, z: -5 }) {
    if (this.sounds.whisper) {
      this.sounds.whisper.pos(position.x, position.y, position.z);
      this.sounds.whisper.play();
    }
  }
  
  playDissonance() {
    if (this.sounds.dissonance) {
      this.sounds.dissonance.play();
      this.sounds.dissonance.fade(0, 0.5, 2000);
    }
  }
  
  stopDissonance() {
    if (this.sounds.dissonance) {
      this.sounds.dissonance.fade(0.5, 0, 1500);
    }
  }
  
  playHeartbeat() {
    if (this.sounds.heartbeat) {
      this.sounds.heartbeat.play();
      this.sounds.heartbeat.fade(0, 0.4, 1000);
    }
  }
  
  stopHeartbeat() {
    if (this.sounds.heartbeat) {
      this.sounds.heartbeat.fade(0.4, 0, 2000);
    }
  }
  
  setListenerPosition(position) {
    Howler.pos(position.x, position.y, position.z);
  }
  
  setMasterVolume(volume) {
    this.masterVolume = volume;
    Howler.volume(volume);
  }
  
  mute() {
    Howler.mute(true);
  }
  
  unmute() {
    Howler.mute(false);
  }
}
