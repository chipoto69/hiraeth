import { StageI } from './StageI.js';
import { StageII } from './StageII.js';
import { StageIII } from './StageIII.js';
import { StageIV } from './StageIV.js';
import { StageV } from './StageV.js';

export class StageManager {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.sceneManager;
    this.audio = experience.audioManager;
    
    this.stages = [];
    this.currentStageIndex = -1;
    this.totalDistance = 150;
    this.isStarted = false;
    
    this.stagePositions = [
      { start: 0, end: 25 },
      { start: 25, end: 55 },
      { start: 55, end: 85 },
      { start: 85, end: 115 },
      { start: 115, end: 150 }
    ];
    
    this.initStages();
  }
  
  initStages() {
    this.stages = [
      new StageI(this),
      new StageII(this),
      new StageIII(this),
      new StageIV(this),
      new StageV(this)
    ];
  }
  
  async preload(onProgress) {
    const totalStages = this.stages.length;
    let loaded = 0;
    
    for (const stage of this.stages) {
      await stage.preload();
      loaded++;
      if (onProgress) {
        onProgress(loaded / totalStages);
      }
    }
  }
  
  start() {
    this.isStarted = true;
    this.currentStageIndex = 0;
    this.stages[0].enter();
  }
  
  update(delta, cameraZ) {
    if (!this.isStarted) return;
    
    const distance = Math.abs(cameraZ);
    
    const newStageIndex = this.getStageIndexForPosition(distance);
    
    if (newStageIndex !== this.currentStageIndex && newStageIndex >= 0) {
      this.transitionToStage(newStageIndex);
    }
    
    if (this.currentStageIndex >= 0 && this.currentStageIndex < this.stages.length) {
      const stage = this.stages[this.currentStageIndex];
      const stagePos = this.stagePositions[this.currentStageIndex];
      const stageProgress = (distance - stagePos.start) / (stagePos.end - stagePos.start);
      
      stage.update(delta, Math.max(0, Math.min(1, stageProgress)));
    }
  }
  
  getStageIndexForPosition(distance) {
    for (let i = 0; i < this.stagePositions.length; i++) {
      const pos = this.stagePositions[i];
      if (distance >= pos.start && distance < pos.end) {
        return i;
      }
    }
    
    if (distance >= this.stagePositions[this.stagePositions.length - 1].end) {
      return this.stagePositions.length - 1;
    }
    
    return 0;
  }
  
  transitionToStage(newIndex) {
    if (this.currentStageIndex >= 0 && this.currentStageIndex < this.stages.length) {
      this.stages[this.currentStageIndex].exit();
    }
    
    this.currentStageIndex = newIndex;
    
    if (newIndex >= 0 && newIndex < this.stages.length) {
      this.stages[newIndex].enter();
    }
  }
  
  getProgress() {
    if (!this.isStarted) return 0;
    
    const cameraZ = Math.abs(this.experience.cameraController.position.z);
    return Math.min(1, cameraZ / this.totalDistance);
  }
  
  onBreathComplete() {
    if (this.currentStageIndex >= 0 && this.currentStageIndex < this.stages.length) {
      this.stages[this.currentStageIndex].onBreathComplete();
    }
  }
  
  addToScene(object) {
    this.scene.add(object);
  }
  
  removeFromScene(object) {
    this.scene.remove(object);
  }
  
  setEmotionalWeight(weight) {
    this.experience.setEmotionalWeight(weight);
  }
  
  restart() {
    this.stages.forEach(stage => stage.reset());
    this.currentStageIndex = -1;
    this.isStarted = false;
  }
}
