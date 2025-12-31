export class BreathMechanic {
  constructor(callbacks = {}) {
    this.onBreathStart = callbacks.onBreathStart || (() => {});
    this.onBreathComplete = callbacks.onBreathComplete || (() => {});
    this.onBreathProgress = callbacks.onBreathProgress || (() => {});
    
    this.enabled = false;
    this.isBreathing = false;
    this.breathProgress = 0;
    this.breathDuration = 2.0;
    this.cooldown = false;
    this.cooldownDuration = 1.0;
    
    this.indicator = document.getElementById('breath-indicator');
    
    this.setupInputs();
  }
  
  setupInputs() {
    document.addEventListener('mousedown', (e) => {
      if (!this.enabled || this.cooldown) return;
      if (e.button !== 0) return;
      
      this.startBreath();
    });
    
    document.addEventListener('mouseup', () => {
      if (this.isBreathing) {
        this.cancelBreath();
      }
    });
    
    document.addEventListener('touchstart', (e) => {
      if (!this.enabled || this.cooldown) return;
      this.startBreath();
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      if (this.isBreathing) {
        this.cancelBreath();
      }
    });
  }
  
  enable() {
    this.enabled = true;
    if (this.indicator) {
      this.indicator.classList.add('active');
    }
  }
  
  disable() {
    this.enabled = false;
    if (this.indicator) {
      this.indicator.classList.remove('active');
    }
    this.cancelBreath();
  }
  
  startBreath() {
    this.isBreathing = true;
    this.breathProgress = 0;
    
    if (this.indicator) {
      this.indicator.classList.add('filling');
    }
    
    this.onBreathStart();
  }
  
  cancelBreath() {
    this.isBreathing = false;
    this.breathProgress = 0;
    
    if (this.indicator) {
      this.indicator.classList.remove('filling');
      this.indicator.style.setProperty('--fill', '0%');
    }
  }
  
  completeBreath() {
    this.isBreathing = false;
    this.breathProgress = 0;
    this.cooldown = true;
    
    if (this.indicator) {
      this.indicator.classList.remove('filling');
      this.indicator.classList.remove('active');
    }
    
    this.onBreathComplete();
    
    setTimeout(() => {
      this.cooldown = false;
    }, this.cooldownDuration * 1000);
  }
  
  update(delta) {
    if (!this.isBreathing) return;
    
    this.breathProgress += delta / this.breathDuration;
    
    if (this.indicator) {
      const size = this.breathProgress * 100;
      this.indicator.style.setProperty('--fill', `${size}%`);
    }
    
    this.onBreathProgress(this.breathProgress);
    
    if (this.breathProgress >= 1) {
      this.completeBreath();
    }
  }
}
