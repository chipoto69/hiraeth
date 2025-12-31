import * as THREE from 'three';
import gsap from 'gsap';

export class City {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.position = options.position || new THREE.Vector3(0, 0, -100);
    this.buildingCount = options.buildingCount || 30;
    this.buildings = [];
    this.dissolved = false;
    
    this.group.position.copy(this.position);
    
    this.createCity();
  }
  
  createCity() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        dissolveProgress: { value: 0 },
        lineColor: { value: new THREE.Color(0x2a2a2a) }
      },
      vertexShader: `
        uniform float time;
        uniform float dissolveProgress;
        
        attribute float randomSeed;
        
        varying float vDissolve;
        varying vec3 vPosition;
        
        float noise(float x) {
          return fract(sin(x) * 43758.5453);
        }
        
        void main() {
          vDissolve = dissolveProgress;
          vPosition = position;
          
          vec3 pos = position;
          
          float wiggle = sin(time * 0.5 + position.y * 0.5) * 0.02;
          pos.x += wiggle;
          
          if (dissolveProgress > 0.0) {
            float dissolveOffset = noise(randomSeed + position.y) * dissolveProgress;
            pos.x += (noise(randomSeed) - 0.5) * dissolveProgress * 10.0;
            pos.y += dissolveProgress * 5.0 * noise(randomSeed + 1.0);
            pos.z += (noise(randomSeed + 2.0) - 0.5) * dissolveProgress * 5.0;
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 lineColor;
        uniform float dissolveProgress;
        
        varying float vDissolve;
        varying vec3 vPosition;
        
        void main() {
          float opacity = 1.0 - vDissolve;
          opacity *= 0.6;
          
          if (opacity < 0.01) discard;
          
          gl_FragColor = vec4(lineColor, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: true
    });
    
    for (let i = 0; i < this.buildingCount; i++) {
      const width = 1 + Math.random() * 3;
      const height = 3 + Math.random() * 15;
      const depth = 1 + Math.random() * 3;
      
      const geometry = new THREE.BoxGeometry(width, height, depth, 2, 4, 2);
      
      const randomSeeds = new Float32Array(geometry.attributes.position.count);
      for (let j = 0; j < randomSeeds.length; j++) {
        randomSeeds[j] = Math.random();
      }
      geometry.setAttribute('randomSeed', new THREE.BufferAttribute(randomSeeds, 1));
      
      const building = new THREE.Mesh(geometry, material.clone());
      
      const spreadX = 60;
      const spreadZ = 30;
      building.position.x = (Math.random() - 0.5) * spreadX;
      building.position.y = height / 2;
      building.position.z = Math.random() * spreadZ;
      
      building.rotation.y = (Math.random() - 0.5) * 0.1;
      
      this.buildings.push(building);
      this.group.add(building);
    }
    
    this.createGround();
  }
  
  createGround() {
    const geometry = new THREE.PlaneGeometry(80, 50, 20, 20);
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        dissolveProgress: { value: 0 }
      },
      vertexShader: `
        uniform float dissolveProgress;
        
        void main() {
          vec3 pos = position;
          pos.y -= dissolveProgress * 2.0;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float dissolveProgress;
        
        void main() {
          float opacity = (1.0 - dissolveProgress) * 0.2;
          gl_FragColor = vec4(0.15, 0.15, 0.15, opacity);
        }
      `,
      transparent: true,
      wireframe: true
    });
    
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.z = 15;
    this.group.add(this.ground);
  }
  
  update(delta, time) {
    this.buildings.forEach((building, i) => {
      building.material.uniforms.time.value = time;
    });
    
    if (this.ground) {
      this.ground.material.uniforms.time.value = time;
    }
  }
  
  dissolve(duration = 4.0) {
    if (this.dissolved) return;
    this.dissolved = true;
    
    this.buildings.forEach((building, i) => {
      gsap.to(building.material.uniforms.dissolveProgress, {
        value: 1.0,
        duration: duration,
        delay: i * 0.05,
        ease: 'power2.in'
      });
    });
    
    if (this.ground) {
      gsap.to(this.ground.material.uniforms.dissolveProgress, {
        value: 1.0,
        duration: duration * 0.8,
        ease: 'power2.in'
      });
    }
  }
  
  setVisibility(visible) {
    this.group.visible = visible;
  }
  
  getDistanceToCamera(cameraZ) {
    return Math.abs(cameraZ - (this.position.z + 15));
  }
  
  dispose() {
    this.buildings.forEach(building => {
      building.geometry.dispose();
      building.material.dispose();
    });
    
    if (this.ground) {
      this.ground.geometry.dispose();
      this.ground.material.dispose();
    }
  }
}
