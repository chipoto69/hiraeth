import * as THREE from 'three';
import { Stage } from './Stage.js';
import { KineticText } from '../components/KineticText.js';
import { Rain } from '../components/Rain.js';

export class StageI extends Stage {
  constructor(manager) {
    super(manager);
    
    this.texts = [];
    this.rain = null;
    this.sicknessEmissionStarted = false;
  }
  
  async preload() {
    this.createTexts();
    this.createRain();
  }
  
  createTexts() {
    this.saveMe = new KineticText({
      text: 'Save me',
      position: new THREE.Vector3(0, 1.8, -8),
      fontSize: 0.4,
      glowing: true
    });
    this.texts.push(this.saveMe);
    
    this.fromThe = new KineticText({
      text: 'from the',
      position: new THREE.Vector3(0, 1.6, -12),
      fontSize: 0.35
    });
    this.texts.push(this.fromThe);
    
    this.sickness = new KineticText({
      text: 'SICKNESS',
      position: new THREE.Vector3(0, 1.8, -18),
      fontSize: 0.7,
      glowing: true,
      hasCollision: true
    });
    this.texts.push(this.sickness);
    
    this.forAHome = new KineticText({
      text: 'for a home',
      position: new THREE.Vector3(0, 1.6, -22),
      fontSize: 0.35
    });
    this.texts.push(this.forAHome);
    
    this.thatDoesntBelong = new KineticText({
      text: "that doesn't belong",
      position: new THREE.Vector3(0, 1.6, -26),
      fontSize: 0.35,
      flickering: true
    });
    this.texts.push(this.thatDoesntBelong);
  }
  
  createRain() {
    this.rain = new Rain({
      count: 3000,
      area: { x: 30, y: 25, z: 40 },
      speed: 12
    });
    
    this.rain.group.position.z = -15;
  }
  
  enter() {
    super.enter();
    
    this.texts.forEach(text => this.addObject(text));
    this.addObject(this.rain);
    
    this.manager.experience.audioManager.startAmbient();
    
    this.saveMe.show(2.0, 0);
    this.fromThe.show(1.5, 0.5);
    this.sickness.show(2.0, 1.0);
    this.forAHome.show(1.5, 2.0);
    this.thatDoesntBelong.show(1.5, 2.5);
    
    this.manager.experience.audioManager.playPenScratch(3000);
  }
  
  update(delta, progress) {
    if (!this.isActive) return;
    
    const time = performance.now() * 0.001;
    
    this.texts.forEach(text => text.update(delta, time));
    
    const cameraZ = this.manager.experience.cameraController.position.z;
    this.rain.update(delta, time, cameraZ);
    
    if (progress > 0.3 && !this.sicknessEmissionStarted) {
      this.sicknessEmissionStarted = true;
      this.rain.setEmissionSource({
        x: this.sickness.position.x,
        y: this.sickness.position.y + 5,
        z: this.sickness.position.z
      });
      this.manager.experience.audioManager.playRainHeavy();
    }
    
    if (progress > 0.5) {
      const weight = (progress - 0.5) * 1.5;
      this.manager.setEmotionalWeight(Math.min(weight, 0.8));
    }
    
    if (progress > 0.7) {
      this.thatDoesntBelong.setFlickering(true);
      
      const jitter = Math.sin(time * 15) * 0.1;
      this.thatDoesntBelong.textMesh.position.x = 
        this.thatDoesntBelong.position.x + jitter;
    }
  }
  
  exit() {
    super.exit();
    
    this.texts.forEach(text => {
      text.hide(1.5);
    });
    
    this.manager.experience.audioManager.stopRainHeavy();
    this.manager.setEmotionalWeight(0);
  }
  
  onBreathComplete() {
    this.manager.setEmotionalWeight(0);
  }
}
