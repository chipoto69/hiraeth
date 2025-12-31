import * as THREE from 'three';
import { Stage } from './Stage.js';
import { KineticText } from '../components/KineticText.js';
import { City } from '../components/City.js';
import { Rain } from '../components/Rain.js';

export class StageII extends Stage {
  constructor(manager) {
    super(manager);
    
    this.texts = [];
    this.city = null;
    this.rain = null;
    this.cityDissolveTriggered = false;
  }
  
  async preload() {
    this.createTexts();
    this.createCity();
    this.createRain();
  }
  
  createTexts() {
    this.theHome = new KineticText({
      text: 'The home I cannot return to',
      position: new THREE.Vector3(0, 1.8, -35),
      fontSize: 0.4,
      glowing: true
    });
    this.texts.push(this.theHome);
    
    this.theHomeNever = new KineticText({
      text: 'the home that never was',
      position: new THREE.Vector3(0, 1.6, -45),
      fontSize: 0.45,
      flickering: true
    });
    this.texts.push(this.theHomeNever);
  }
  
  createCity() {
    this.city = new City({
      position: new THREE.Vector3(0, 0, -70),
      buildingCount: 35
    });
  }
  
  createRain() {
    this.rain = new Rain({
      count: 4000,
      area: { x: 40, y: 30, z: 50 },
      speed: 15
    });
    
    this.rain.group.position.z = -50;
  }
  
  enter() {
    super.enter();
    
    this.texts.forEach(text => this.addObject(text));
    this.addObject(this.city);
    this.addObject(this.rain);
    
    this.theHome.show(2.0, 0);
    this.theHomeNever.show(2.0, 1.5);
    
    this.manager.experience.audioManager.playRainHeavy();
  }
  
  update(delta, progress) {
    if (!this.isActive) return;
    
    const time = performance.now() * 0.001;
    
    this.texts.forEach(text => text.update(delta, time));
    this.city.update(delta, time);
    
    const cameraZ = this.manager.experience.cameraController.position.z;
    this.rain.update(delta, time, cameraZ);
    
    if (progress > 0.4 && !this.cityDissolveTriggered) {
      this.cityDissolveTriggered = true;
      this.city.dissolve(5.0);
      
      this.theHomeNever.setFlickering(true);
      
      this.manager.setEmotionalWeight(0.6);
    }
    
    if (progress > 0.6) {
      const weight = 0.6 + (progress - 0.6) * 0.5;
      this.manager.setEmotionalWeight(Math.min(weight, 0.8));
    }
    
    if (progress > 0.8) {
      this.theHomeNever.dissolve(2.0);
    }
  }
  
  exit() {
    super.exit();
    
    this.texts.forEach(text => text.hide(1.0));
    
    this.manager.experience.audioManager.stopRainHeavy();
    this.manager.setEmotionalWeight(0);
  }
  
  onBreathComplete() {
    this.manager.setEmotionalWeight(0.3);
  }
}
