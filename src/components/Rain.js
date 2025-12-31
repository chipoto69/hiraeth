import * as THREE from 'three';
import gsap from 'gsap';

export class Rain {
  constructor(options = {}) {
    this.group = new THREE.Group();
    
    this.count = options.count || 5000;
    this.area = options.area || { x: 30, y: 20, z: 50 };
    this.speed = options.speed || 15;
    this.frozen = false;
    this.freezeProgress = 0;
    
    this.emissionSource = options.emissionSource || null;
    
    this.createRain();
  }
  
  createRain() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count);
    const sizes = new Float32Array(this.count);
    
    for (let i = 0; i < this.count; i++) {
      if (this.emissionSource) {
        positions[i * 3] = this.emissionSource.x + (Math.random() - 0.5) * 5;
        positions[i * 3 + 1] = this.emissionSource.y + Math.random() * 10;
        positions[i * 3 + 2] = this.emissionSource.z + (Math.random() - 0.5) * 5;
      } else {
        positions[i * 3] = (Math.random() - 0.5) * this.area.x;
        positions[i * 3 + 1] = Math.random() * this.area.y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * this.area.z;
      }
      
      velocities[i] = 0.5 + Math.random() * 0.5;
      sizes[i] = 0.02 + Math.random() * 0.03;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        freezeProgress: { value: 0 },
        inkColor: { value: new THREE.Color(0x0a0a0a) },
        opacity: { value: 0.8 }
      },
      vertexShader: `
        attribute float velocity;
        attribute float size;
        
        uniform float time;
        uniform float freezeProgress;
        
        varying float vVelocity;
        varying float vFreeze;
        
        void main() {
          vVelocity = velocity;
          vFreeze = freezeProgress;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          float streakLength = mix(1.0, 0.1, freezeProgress);
          gl_PointSize = size * 1000.0 * streakLength / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 inkColor;
        uniform float opacity;
        uniform float freezeProgress;
        
        varying float vVelocity;
        varying float vFreeze;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          
          float streakShape = mix(
            abs(center.y) * 2.0,
            length(center) * 2.0,
            vFreeze
          );
          
          if (streakShape > 0.5) discard;
          
          float alpha = (1.0 - streakShape * 2.0) * opacity;
          alpha *= mix(vVelocity, 0.8, vFreeze);
          
          vec3 color = inkColor;
          float highlight = 1.0 - streakShape * 1.5;
          color += highlight * 0.1 * (1.0 - vFreeze);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }
  
  update(delta, time, cameraZ = 0) {
    if (!this.particles) return;
    
    this.particles.material.uniforms.time.value = time;
    this.particles.material.uniforms.freezeProgress.value = this.freezeProgress;
    
    if (this.frozen) return;
    
    const positions = this.particles.geometry.attributes.position.array;
    const velocities = this.particles.geometry.attributes.velocity.array;
    
    const effectiveSpeed = this.speed * (1 - this.freezeProgress);
    
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 1] -= velocities[i] * effectiveSpeed * delta;
      
      if (positions[i * 3 + 1] < 0) {
        if (this.emissionSource) {
          positions[i * 3] = this.emissionSource.x + (Math.random() - 0.5) * 5;
          positions[i * 3 + 1] = this.emissionSource.y + Math.random() * 5 + 10;
          positions[i * 3 + 2] = this.emissionSource.z + (Math.random() - 0.5) * 5;
        } else {
          positions[i * 3 + 1] = this.area.y;
          positions[i * 3] = (Math.random() - 0.5) * this.area.x;
          positions[i * 3 + 2] = cameraZ + (Math.random() - 0.5) * this.area.z;
        }
      }
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
  
  freeze(duration = 2.0) {
    gsap.to(this, {
      freezeProgress: 1.0,
      duration: duration,
      ease: 'power2.out',
      onComplete: () => {
        this.frozen = true;
      }
    });
  }
  
  unfreeze(duration = 1.5) {
    this.frozen = false;
    gsap.to(this, {
      freezeProgress: 0.0,
      duration: duration,
      ease: 'power2.in'
    });
  }
  
  setIntensity(intensity) {
    if (this.particles) {
      this.particles.material.uniforms.opacity.value = intensity * 0.8;
    }
  }
  
  setEmissionSource(position) {
    this.emissionSource = position;
  }
  
  dispose() {
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
  }
}
