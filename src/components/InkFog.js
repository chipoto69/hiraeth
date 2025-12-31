import * as THREE from 'three';

export class InkFog {
  constructor() {
    this.group = new THREE.Group();
    this.particles = [];
    this.particleCount = 100;
    
    this.createFog();
  }
  
  createFog() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    const alphas = new Float32Array(this.particleCount);
    
    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50;
      
      sizes[i] = Math.random() * 5 + 2;
      alphas[i] = Math.random() * 0.3 + 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x0a0a0a) }
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        
        varying float vAlpha;
        
        uniform float time;
        
        void main() {
          vAlpha = alpha;
          
          vec3 pos = position;
          pos.x += sin(time * 0.1 + position.z * 0.05) * 2.0;
          pos.y += cos(time * 0.15 + position.x * 0.05) * 0.5;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = (1.0 - dist * 2.0) * vAlpha;
          alpha = smoothstep(0.0, 0.5, alpha);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    this.points = new THREE.Points(geometry, material);
    this.group.add(this.points);
  }
  
  update(delta, time) {
    if (this.points) {
      this.points.material.uniforms.time.value = time;
      
      const positions = this.points.geometry.attributes.position.array;
      for (let i = 0; i < this.particleCount; i++) {
        positions[i * 3 + 2] += 0.05;
        
        if (positions[i * 3 + 2] > 50) {
          positions[i * 3 + 2] = -100;
          positions[i * 3] = (Math.random() - 0.5) * 50;
        }
      }
      this.points.geometry.attributes.position.needsUpdate = true;
    }
  }
  
  setIntensity(intensity) {
    if (this.points) {
      this.points.material.opacity = intensity;
    }
  }
}
