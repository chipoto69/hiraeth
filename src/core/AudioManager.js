import { Howl, Howler } from 'howler';
import { SyntheticAudio } from './SyntheticAudio.js';

export class AudioManager {
  constructor() {
    this.sounds = {};
    this.syntheticSounds = {};
    this.isLoaded = false;
    this.masterVolume = 1.0;
    this.useSynthetic = false;
    
    this.synthetic = new SyntheticAudio();
    
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
    
    const audioExists = await this.checkAudioFiles();
    
    if (!audioExists) {
      console.log('Audio files not found - using synthetic audio');
      this.useSynthetic = true;
      this.synthetic.init();
    } else {
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
    }
    
    this.isLoaded = true;
  }
  
  async checkAudioFiles() {
    try {
      const response = await fetch('/audio/rain-light.mp3', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  createSound(src, options = {}) {
    const sound = new Howl({
      src: [src],
      loop: options.loop || false,
      volume: options.volume || 0.5,
      preload: true,
      html5: options.spatial ? false : true,
      onloaderror: () => {
        console.warn(`Audio not found: ${src} - using synthetic fallback`);
        this.useSynthetic = true;
        this.synthetic.init();
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
    if (this.useSynthetic) {
      this.synthetic.resume();
      this.syntheticSounds.rain = this.synthetic.createRainSound();
      this.syntheticSounds.rain.fadeIn(2);
    } else if (this.sounds.rainLight) {
      this.sounds.rainLight.play();
      this.sounds.rainLight.fade(0, 0.4, 2000);
    }
  }
  
  fadeAmbient(targetVolume, duration = 500) {
    if (this.useSynthetic) {
      if (this.syntheticSounds.rain) {
        this.syntheticSounds.rain.setVolume(targetVolume);
      }
    } else if (this.sounds.rainLight) {
      const currentVol = this.sounds.rainLight.volume();
      this.sounds.rainLight.fade(currentVol, targetVolume * 0.4, duration);
    }
  }
  
  playRainHeavy() {
    if (this.useSynthetic) {
      this.syntheticSounds.heavyRain = this.synthetic.createHeavyRainSound();
      this.syntheticSounds.heavyRain.fadeIn(1.5);
    } else if (this.sounds.rainHeavy) {
      this.sounds.rainHeavy.play();
      this.sounds.rainHeavy.fade(0, 0.6, 1500);
    }
  }
  
  stopRainHeavy() {
    if (this.useSynthetic) {
      if (this.syntheticSounds.heavyRain) {
        this.syntheticSounds.heavyRain.fadeOut(1.5);
      }
    } else if (this.sounds.rainHeavy) {
      this.sounds.rainHeavy.fade(0.6, 0, 1500);
    }
  }
  
  playPenScratch(duration = 500) {
    if (this.useSynthetic) {
      this.synthetic.playPenScratch(duration / 1000);
    } else if (this.sounds.penScratch) {
      this.sounds.penScratch.play();
      
      setTimeout(() => {
        this.sounds.penScratch.fade(0.3, 0, 200);
      }, duration);
    }
  }
  
  playInkDrop() {
    if (this.useSynthetic) {
      this.synthetic.playInkDrop();
    } else if (this.sounds.inkDrop) {
      const id = this.sounds.inkDrop.play();
      this.sounds.inkDrop.rate(0.8 + Math.random() * 0.4, id);
    }
  }
  
  playWhisper(position = { x: 0, y: 0, z: -5 }) {
    if (this.useSynthetic) {
      this.synthetic.playWhisper();
    } else if (this.sounds.whisper) {
      this.sounds.whisper.pos(position.x, position.y, position.z);
      this.sounds.whisper.play();
    }
  }
  
  playDissonance() {
    if (this.useSynthetic) {
      this.syntheticSounds.dissonance = this.synthetic.createDissonance();
      this.syntheticSounds.dissonance.fadeIn(2);
    } else if (this.sounds.dissonance) {
      this.sounds.dissonance.play();
      this.sounds.dissonance.fade(0, 0.5, 2000);
    }
  }
  
  stopDissonance() {
    if (this.useSynthetic) {
      if (this.syntheticSounds.dissonance) {
        this.syntheticSounds.dissonance.fadeOut(1.5);
      }
    } else if (this.sounds.dissonance) {
      this.sounds.dissonance.fade(0.5, 0, 1500);
    }
  }
  
  playHeartbeat() {
    if (this.useSynthetic) {
      this.syntheticSounds.heartbeat = this.synthetic.createHeartbeat();
      this.syntheticSounds.heartbeat.start();
    } else if (this.sounds.heartbeat) {
      this.sounds.heartbeat.play();
      this.sounds.heartbeat.fade(0, 0.4, 1000);
    }
  }
  
  stopHeartbeat() {
    if (this.useSynthetic) {
      if (this.syntheticSounds.heartbeat) {
        this.syntheticSounds.heartbeat.stop();
      }
    } else if (this.sounds.heartbeat) {
      this.sounds.heartbeat.fade(0.4, 0, 2000);
    }
  }
  
  setListenerPosition(position) {
    Howler.pos(position.x, position.y, position.z);
  }
  
  setMasterVolume(volume) {
    this.masterVolume = volume;
    Howler.volume(volume);
    if (this.useSynthetic) {
      this.synthetic.setMasterVolume(volume);
    }
  }
  
  mute() {
    Howler.mute(true);
    if (this.useSynthetic) {
      this.synthetic.mute();
    }
  }
  
  unmute() {
    Howler.mute(false);
    if (this.useSynthetic) {
      this.synthetic.unmute();
    }
  }
}
