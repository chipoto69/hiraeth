import * as THREE from 'three';
import { Stage } from './Stage.js';
import { KineticText } from '../components/KineticText.js';
import { Scribbles } from '../components/Scribbles.js';

export class StageIV extends Stage {
  constructor(manager) {
    super(manager);
    
    this.texts = [];
    this.calmScribbles = null;
    this.chaoticScribbles = null;
    this.chaosTriggered = false;
  }
  
  async preload() {
    this.createTexts();
    this.createScribbles();
  }
  
  createTexts() {
    this.aPlace = new KineticText({
      text: 'A place where I would be',
      position: new THREE.Vector3(0, 1.8, -90),
      fontSize: 0.4
    });
    this.texts.push(this.aPlace);
    
    this.atEase = new KineticText({
      text: 'AT EASE',
      position: new THREE.Vector3(0, 2.0, -95),
      fontSize: 0.7,
      glowing: true,
      color: 0xf5f5f0
    });
    this.texts.push(this.atEase);
    
    this.aPlaceLong = new KineticText({
      text: 'A place I long so much for',
      position: new THREE.Vector3(0, 1.6, -102),
      fontSize: 0.35
    });
    this.texts.push(this.aPlaceLong);
    
    this.cannotHave = new KineticText({
      text: 'CANNOT HAVE',
      position: new THREE.Vector3(0, 1.8, -108),
      fontSize: 0.6,
      flickering: true,
      hasCollision: true
    });
    this.texts.push(this.cannotHave);
  }
  
  createScribbles() {
    this.calmScribbles = new Scribbles({
      position: new THREE.Vector3(0, 2, -93),
      intensity: 0.3,
      chaotic: false
    });
    
    this.chaoticScribbles = new Scribbles({
      position: new THREE.Vector3(0, 2, -106),
      intensity: 1.0,
      chaotic: true
    });
  }
  
  enter() {
    super.enter();
    
    this.texts.forEach(text => this.addObject(text));
    this.addObject(this.calmScribbles);
    this.addObject(this.chaoticScribbles);
    
    this.aPlace.show(1.5, 0);
    this.atEase.show(2.0, 0.5);
    this.calmScribbles.show(2.0);
    
    this.aPlaceLong.show(1.5, 2.0);
  }
  
  update(delta, progress) {
    if (!this.isActive) return;
    
    const time = performance.now() * 0.001;
    
    this.texts.forEach(text => text.update(delta, time));
    this.calmScribbles.update(delta, time);
    this.chaoticScribbles.update(delta, time);
    
    if (progress > 0.4 && !this.chaosTriggered) {
      this.chaosTriggered = true;
      
      this.cannotHave.show(1.5, 0);
      this.chaoticScribbles.show(1.5);
      
      setTimeout(() => {
        this.chaoticScribbles.erupt(2.0);
        this.manager.experience.audioManager.playDissonance();
      }, 500);
      
      this.manager.setEmotionalWeight(0.9);
    }
    
    if (progress > 0.5 && this.chaosTriggered) {
      const chaosIntensity = Math.min(1, (progress - 0.5) * 3);
      this.chaoticScribbles.setIntensity(chaosIntensity);
      
      const weight = 0.7 + chaosIntensity * 0.25;
      this.manager.setEmotionalWeight(weight);
    }
    
    if (progress > 0.85) {
      this.chaoticScribbles.calm(2.0);
      this.manager.experience.audioManager.stopDissonance();
    }
  }
  
  exit() {
    super.exit();
    
    this.texts.forEach(text => text.hide(1.0));
    this.calmScribbles.hide(1.0);
    this.chaoticScribbles.hide(1.5);
    
    this.manager.experience.audioManager.stopDissonance();
    this.manager.setEmotionalWeight(0);
  }
  
  onBreathComplete() {
    if (this.chaosTriggered) {
      this.chaoticScribbles.calm(1.0);
    }
    this.manager.setEmotionalWeight(0.4);
  }
}
