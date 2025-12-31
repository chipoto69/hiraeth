import gsap from 'gsap';

export class MovementController {
  constructor(cameraController, options = {}) {
    this.cameraController = cameraController;
    
    this.baseSpeed = options.baseSpeed || 0.12;
    this.resistanceMultiplier = options.resistanceMultiplier || 0.3;
    this.smoothing = options.smoothing || 0.2;
    
    this.enabled = false;
    this.isMoving = false;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.resistance = 0;
    
    this.keys = {
      forward: false,
      backward: false
    };
    
    this.scrollVelocity = 0;
    this.scrollDecay = 0.85;
    
    this.setupInputs();
  }
  
  setupInputs() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        this.keys.forward = true;
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        this.keys.backward = true;
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        this.keys.forward = false;
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        this.keys.backward = false;
      }
    });
    
    document.addEventListener('wheel', (e) => {
      if (!this.enabled) return;
      
      this.scrollVelocity += e.deltaY * 0.005;
      this.scrollVelocity = Math.max(-2, Math.min(2, this.scrollVelocity));
    }, { passive: true });
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
    this.keys.forward = false;
    this.keys.backward = false;
    this.scrollVelocity = 0;
  }
  
  setResistance(weight) {
    gsap.to(this, {
      resistance: weight,
      duration: 0.5,
      ease: 'power2.out'
    });
  }
  
  clearResistance() {
    gsap.to(this, {
      resistance: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  }
  
  update(delta) {
    if (!this.enabled) return;
    
    let inputSpeed = 0;
    
    if (this.keys.forward) {
      inputSpeed = 1;
    } else if (this.keys.backward) {
      inputSpeed = -0.3;
    }
    
    inputSpeed += this.scrollVelocity;
    this.scrollVelocity *= this.scrollDecay;
    
    if (Math.abs(this.scrollVelocity) < 0.001) {
      this.scrollVelocity = 0;
    }
    
    const effectiveResistance = 1 - (this.resistance * (1 - this.resistanceMultiplier));
    this.targetSpeed = inputSpeed * this.baseSpeed * effectiveResistance;
    
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * this.smoothing;
    
    this.isMoving = Math.abs(this.currentSpeed) > 0.0001;
    
    if (this.isMoving) {
      this.cameraController.moveForward(this.currentSpeed);
    }
    
    this.cameraController.update(delta, this.isMoving);
    
    this.updateProgressIndicator();
  }
  
  updateProgressIndicator() {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill && window.experience) {
      const progress = window.experience.getProgress();
      progressFill.style.height = `${progress * 100}%`;
    }
  }
  
  getPosition() {
    return this.cameraController.position.z;
  }
}
