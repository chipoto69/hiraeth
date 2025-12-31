import * as THREE from 'three';

export class CameraController {
  constructor(aspect) {
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 1.6, 0);
    this.camera.lookAt(0, 1.6, -10);
    
    this.position = this.camera.position;
    this.targetPosition = this.camera.position.clone();
    
    this.headBob = {
      enabled: true,
      amplitude: 0.02,
      frequency: 2.0,
      phase: 0
    };
    
    this.sway = {
      enabled: true,
      amplitude: 0.005,
      frequency: 0.5,
      phase: 0
    };
  }
  
  moveForward(distance) {
    this.targetPosition.z -= distance;
  }
  
  update(delta, isMoving) {
    this.position.lerp(this.targetPosition, 0.1);
    
    if (isMoving && this.headBob.enabled) {
      this.headBob.phase += delta * this.headBob.frequency * Math.PI * 2;
      const bobOffset = Math.sin(this.headBob.phase) * this.headBob.amplitude;
      this.camera.position.y = 1.6 + bobOffset;
    }
    
    if (this.sway.enabled) {
      this.sway.phase += delta * this.sway.frequency;
      const swayX = Math.sin(this.sway.phase) * this.sway.amplitude;
      const swayY = Math.cos(this.sway.phase * 0.7) * this.sway.amplitude * 0.5;
      this.camera.rotation.z = swayX;
      this.camera.rotation.x = swayY;
    }
    
    this.camera.lookAt(this.position.x, 1.6, this.position.z - 10);
  }
  
  setFOV(fov, duration = 1.0) {
    const startFOV = this.camera.fov;
    const startTime = performance.now();
    
    const animateFOV = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      this.camera.fov = startFOV + (fov - startFOV) * eased;
      this.camera.updateProjectionMatrix();
      
      if (progress < 1) {
        requestAnimationFrame(animateFOV);
      }
    };
    
    animateFOV();
  }
}
