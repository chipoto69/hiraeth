export class Debug {
  constructor(experience) {
    this.experience = experience;
    this.isEnabled = false;
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    
    this.createElement();
    this.setupKeyboardShortcuts();
  }
  
  createElement() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'debug-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px 15px;
      border-radius: 4px;
      z-index: 9999;
      display: none;
      min-width: 200px;
      line-height: 1.6;
    `;
    document.body.appendChild(this.overlay);
    
    this.helpOverlay = document.createElement('div');
    this.helpOverlay.id = 'help-overlay';
    this.helpOverlay.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.6);
      color: #888;
      font-family: monospace;
      font-size: 11px;
      padding: 8px 12px;
      border-radius: 4px;
      z-index: 9998;
      line-height: 1.5;
    `;
    this.helpOverlay.innerHTML = `
      <div style="color: #666; margin-bottom: 4px;">Shortcuts:</div>
      <div>D - Debug | M - Mute | R - Restart</div>
    `;
    document.body.appendChild(this.helpOverlay);
    
    setTimeout(() => {
      this.helpOverlay.style.transition = 'opacity 2s ease';
      this.helpOverlay.style.opacity = '0';
      setTimeout(() => {
        this.helpOverlay.style.display = 'none';
      }, 2000);
    }, 5000);
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'd' || e.key === 'D') {
        this.toggle();
      }
      
      if (e.key === 'm' || e.key === 'M') {
        this.toggleMute();
      }
      
      if (e.key === 'r' || e.key === 'R') {
        if (e.shiftKey) {
          this.restart();
        }
      }
      
      if (e.key === 'Escape') {
        if (this.isEnabled) {
          this.toggle();
        }
      }
    });
  }
  
  toggle() {
    this.isEnabled = !this.isEnabled;
    this.overlay.style.display = this.isEnabled ? 'block' : 'none';
  }
  
  toggleMute() {
    if (this.experience.audioManager) {
      const isMuted = this.experience.isMuted || false;
      if (isMuted) {
        this.experience.audioManager.unmute();
        this.experience.isMuted = false;
      } else {
        this.experience.audioManager.mute();
        this.experience.isMuted = true;
      }
    }
  }
  
  restart() {
    if (this.experience.stageManager) {
      this.experience.stageManager.stages[4]?.restart?.();
    }
  }
  
  update() {
    if (!this.isEnabled) return;
    
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }
    
    const camera = this.experience.cameraController;
    const stageManager = this.experience.stageManager;
    const movement = this.experience.movementController;
    
    const pos = camera?.position || { x: 0, y: 0, z: 0 };
    const currentStage = stageManager?.currentStageIndex ?? -1;
    const progress = stageManager?.getProgress?.() ?? 0;
    const resistance = movement?.resistance ?? 0;
    const speed = movement?.currentSpeed ?? 0;
    
    this.overlay.innerHTML = `
      <div style="color: #0f0; font-weight: bold; margin-bottom: 5px;">HIRAETH DEBUG</div>
      <div>FPS: ${this.fps}</div>
      <div>───────────────</div>
      <div>Camera Z: ${pos.z.toFixed(2)}</div>
      <div>Stage: ${currentStage + 1} / 5</div>
      <div>Progress: ${(progress * 100).toFixed(1)}%</div>
      <div>───────────────</div>
      <div>Resistance: ${(resistance * 100).toFixed(0)}%</div>
      <div>Speed: ${(speed * 1000).toFixed(2)}</div>
      <div>───────────────</div>
      <div style="color: #888; font-size: 10px;">
        D=close | M=mute | Shift+R=restart
      </div>
    `;
  }
}
