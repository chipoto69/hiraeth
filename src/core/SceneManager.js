import * as THREE from 'three';
import { PaperGround } from '../components/PaperGround.js';
import { InkFog } from '../components/InkFog.js';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1a1a1a, 0.015);
    
    this.setupLighting();
    this.setupEnvironment();
  }
  
  setupLighting() {
    const ambient = new THREE.AmbientLight(0xf5f5f0, 0.15);
    this.scene.add(ambient);
    
    this.mainLight = new THREE.DirectionalLight(0xf5f5f0, 0.4);
    this.mainLight.position.set(0, 10, -5);
    this.scene.add(this.mainLight);
    
    this.rimLight = new THREE.PointLight(0xaabbcc, 0.3, 50);
    this.rimLight.position.set(0, 5, 10);
    this.scene.add(this.rimLight);
  }
  
  setupEnvironment() {
    this.paperGround = new PaperGround();
    this.scene.add(this.paperGround.mesh);
    
    this.inkFog = new InkFog();
    this.scene.add(this.inkFog.group);
  }
  
  update(delta, time) {
    this.paperGround.update(time);
    this.inkFog.update(delta, time);
  }
  
  add(object) {
    this.scene.add(object);
  }
  
  remove(object) {
    this.scene.remove(object);
  }
  
  updateFog(density) {
    this.scene.fog.density = density;
  }
}
