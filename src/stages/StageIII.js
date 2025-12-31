import * as THREE from 'three';
import { Stage } from './Stage.js';
import { KineticText } from '../components/KineticText.js';
import { Face } from '../components/Face.js';
import { Rain } from '../components/Rain.js';

export class StageIII extends Stage {
  constructor(manager) {
    super(manager);
    
    this.texts = [];
    this.face = null;
    this.rain = null;
    this.rainFrozen = false;
    this.whisperPlayed = false;
  }
  
  async preload() {
    this.createTexts();
    this.createFace();
    this.createRain();
  }
  
  createTexts() {
    this.amIYearning = new KineticText({
      text: 'Am I yearning',
      position: new THREE.Vector3(0, 2.0, -60),
      fontSize: 0.5,
      glowing: true
    });
    this.texts.push(this.amIYearning);
    
    this.forAPlace = new KineticText({
      text: 'for a place of the past?',
      position: new THREE.Vector3(0, 1.6, -68),
      fontSize: 0.4
    });
    this.texts.push(this.forAPlace);
  }
  
  createFace() {
    this.face = new Face({
      position: new THREE.Vector3(0, 6, -85),
      scale: 12
    });
  }
  
  createRain() {
    this.rain = new Rain({
      count: 5000,
      area: { x: 50, y: 35, z: 60 },
      speed: 10
    });
    
    this.rain.group.position.z = -70;
  }
  
  enter() {
    super.enter();
    
    this.texts.forEach(text => this.addObject(text));
    this.addObject(this.face);
    this.addObject(this.rain);
    
    this.amIYearning.show(2.0, 0);
    this.forAPlace.show(2.0, 1.0);
    this.face.show(3.0);
  }
  
  update(delta, progress) {
    if (!this.isActive) return;
    
    const time = performance.now() * 0.001;
    
    this.texts.forEach(text => text.update(delta, time));
    this.face.update(delta, time);
    
    const cameraZ = this.manager.experience.cameraController.position.z;
    this.rain.update(delta, time, cameraZ);
    
    if (progress > 0.3 && !this.rainFrozen) {
      this.rainFrozen = true;
      this.rain.freeze(3.0);
      
      this.manager.experience.cameraController.setFOV(50, 2.0);
      
      this.manager.setEmotionalWeight(0.5);
    }
    
    if (progress > 0.5 && !this.whisperPlayed) {
      this.whisperPlayed = true;
      
      this.manager.experience.audioManager.playWhisper({
        x: 0,
        y: 1.6,
        z: cameraZ + 5
      });
    }
    
    if (progress > 0.4) {
      const cameraPos = this.manager.experience.cameraController.position;
      this.face.lookAt(cameraPos);
    }
    
    if (progress > 0.7) {
      const weight = 0.5 + (progress - 0.7) * 1.0;
      this.manager.setEmotionalWeight(Math.min(weight, 0.85));
    }
  }
  
  exit() {
    super.exit();
    
    this.texts.forEach(text => text.hide(1.0));
    this.face.hide(2.0);
    
    if (this.rainFrozen) {
      this.rain.unfreeze(1.5);
    }
    
    this.manager.experience.cameraController.setFOV(60, 1.5);
    this.manager.setEmotionalWeight(0);
  }
  
  onBreathComplete() {
    this.manager.setEmotionalWeight(0.2);
  }
}
