export class Stage {
  constructor(manager) {
    this.manager = manager;
    this.isActive = false;
    this.hasEntered = false;
    this.objects = [];
  }
  
  async preload() {
  }
  
  enter() {
    this.isActive = true;
    this.hasEntered = true;
  }
  
  exit() {
    this.isActive = false;
  }
  
  update(delta, progress) {
  }
  
  onBreathComplete() {
  }
  
  reset() {
    this.isActive = false;
    this.hasEntered = false;
    
    this.objects.forEach(obj => {
      this.manager.removeFromScene(obj);
      if (obj.dispose) obj.dispose();
    });
    this.objects = [];
  }
  
  addObject(object) {
    this.objects.push(object);
    
    if (object.group) {
      this.manager.addToScene(object.group);
    } else if (object.mesh) {
      this.manager.addToScene(object.mesh);
    } else {
      this.manager.addToScene(object);
    }
  }
  
  removeObject(object) {
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
    
    if (object.group) {
      this.manager.removeFromScene(object.group);
    } else if (object.mesh) {
      this.manager.removeFromScene(object.mesh);
    } else {
      this.manager.removeFromScene(object);
    }
    
    if (object.dispose) object.dispose();
  }
}
