import * as THREE from 'three';
import gsap from 'gsap';
import { Stage } from './Stage.js';
import { KineticText } from '../components/KineticText.js';
import { HiraethPortal } from '../components/HiraethPortal.js';

export class StageV extends Stage {
  constructor(manager) {
    super(manager);
    
    this.texts = [];
    this.portal = null;
    this.portalActivated = false;
    this.loopTriggered = false;
  }
  
  async preload() {
    this.createTexts();
    this.createPortal();
  }
  
  createTexts() {
    this.thisSearch = new KineticText({
      text: 'This search that I\'m on',
      position: new THREE.Vector3(0, 1.8, -118),
      fontSize: 0.4
    });
    this.texts.push(this.thisSearch);
    
    this.forAHome = new KineticText({
      text: 'for a home that doesn\'t belong',
      position: new THREE.Vector3(0, 1.6, -125),
      fontSize: 0.35
    });
    this.texts.push(this.forAHome);
    
    this.isThis = new KineticText({
      text: 'Is this the feeling',
      position: new THREE.Vector3(0, 1.8, -132),
      fontSize: 0.4
    });
    this.texts.push(this.isThis);
    
    this.thatTheyCall = new KineticText({
      text: 'that they call',
      position: new THREE.Vector3(0, 1.6, -138),
      fontSize: 0.35,
      glowing: true
    });
    this.texts.push(this.thatTheyCall);
  }
  
  createPortal() {
    this.portal = new HiraethPortal({
      position: new THREE.Vector3(0, 2, -148),
      scale: 6
    });
  }
  
  enter() {
    super.enter();
    
    this.texts.forEach(text => this.addObject(text));
    this.addObject(this.portal);
    
    this.manager.scene.updateFog(0.008);
    
    this.thisSearch.show(2.0, 0);
    this.forAHome.show(2.0, 1.0);
    this.isThis.show(2.0, 2.0);
    this.thatTheyCall.show(2.0, 3.0);
    
    setTimeout(() => {
      this.portal.show(4.0);
    }, 4000);
  }
  
  update(delta, progress) {
    if (!this.isActive) return;
    
    const time = performance.now() * 0.001;
    
    this.texts.forEach(text => text.update(delta, time));
    this.portal.update(delta, time);
    
    if (progress > 0.6 && !this.portalActivated) {
      this.portalActivated = true;
      this.portal.activatePortal();
      
      this.manager.experience.cameraController.setFOV(55, 2.0);
    }
    
    const cameraPos = this.manager.experience.cameraController.position;
    
    if (progress > 0.85 && !this.loopTriggered) {
      if (this.portal.isPlayerInPortal(cameraPos)) {
        this.loopTriggered = true;
        this.triggerLoop();
      }
    }
  }
  
  triggerLoop() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f5f5f0;
      opacity: 0;
      z-index: 2000;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    
    gsap.to(overlay, {
      opacity: 1,
      duration: 3,
      ease: 'power2.in',
      onComplete: () => {
        this.showEndScreen(overlay);
      }
    });
    
    this.manager.experience.movementController.disable();
    
    this.manager.experience.audioManager.fadeAmbient(0, 3000);
  }
  
  showEndScreen(overlay) {
    overlay.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-family: 'Cormorant Garamond', serif;
        color: #1a1a1a;
      ">
        <h1 style="
          font-size: 4rem;
          font-weight: 300;
          letter-spacing: 0.5em;
          margin-bottom: 2rem;
          opacity: 0;
        ">HIRAETH</h1>
        <p style="
          font-size: 1.2rem;
          font-style: italic;
          letter-spacing: 0.2em;
          opacity: 0;
        ">the home that never was</p>
        <button id="restart-btn" style="
          margin-top: 4rem;
          padding: 1rem 2rem;
          background: transparent;
          border: 1px solid #1a1a1a;
          color: #1a1a1a;
          font-family: inherit;
          font-size: 1rem;
          letter-spacing: 0.3em;
          cursor: pointer;
          opacity: 0;
          transition: background 0.3s, color 0.3s;
        ">EXPERIENCE AGAIN</button>
      </div>
    `;
    
    const h1 = overlay.querySelector('h1');
    const p = overlay.querySelector('p');
    const btn = overlay.querySelector('#restart-btn');
    
    gsap.to(h1, { opacity: 1, duration: 2, delay: 0.5 });
    gsap.to(p, { opacity: 0.7, duration: 2, delay: 1 });
    gsap.to(btn, { opacity: 0.8, duration: 1.5, delay: 2 });
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#1a1a1a';
      btn.style.color = '#f5f5f0';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
      btn.style.color = '#1a1a1a';
    });
    
    btn.addEventListener('click', () => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 1.5,
        onComplete: () => {
          overlay.remove();
          this.restart();
        }
      });
    });
  }
  
  restart() {
    this.manager.restart();
    
    this.manager.experience.cameraController.position.set(0, 1.6, 0);
    this.manager.experience.cameraController.targetPosition.set(0, 1.6, 0);
    this.manager.experience.cameraController.camera.position.set(0, 1.6, 0);
    this.manager.experience.cameraController.setFOV(60, 0);
    
    this.manager.scene.updateFog(0.015);
    
    this.manager.experience.movementController.enable();
    this.manager.experience.audioManager.startAmbient();
    
    this.manager.start();
  }
  
  exit() {
    super.exit();
    
    this.texts.forEach(text => text.hide(1.0));
  }
  
  onBreathComplete() {
    this.manager.setEmotionalWeight(0);
  }
}
