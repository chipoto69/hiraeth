import * as THREE from 'three';
import gsap from 'gsap';
import { createNoise2D } from 'simplex-noise';

export class Scribbles {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.position = options.position || new THREE.Vector3(0, 2, -60);
    this.intensity = options.intensity || 1.0;
    this.chaotic = options.chaotic || false;
    
    this.lines = [];
    this.noise2D = createNoise2D();
    
    this.group.position.copy(this.position);
    
    this.createScribbles();
  }
  
  createScribbles() {
    const lineCount = this.chaotic ? 50 : 20;
    
    for (let i = 0; i < lineCount; i++) {
      this.createScribbleLine(i / lineCount);
    }
  }
  
  createScribbleLine(seed) {
    const points = [];
    const segmentCount = this.chaotic ? 30 : 15;
    
    let x = (Math.random() - 0.5) * 10;
    let y = (Math.random() - 0.5) * 6;
    let z = (Math.random() - 0.5) * 5;
    
    for (let i = 0; i < segmentCount; i++) {
      const t = i / segmentCount;
      
      if (this.chaotic) {
        x += (Math.random() - 0.5) * 1.5;
        y += (Math.random() - 0.5) * 1.0;
        z += (Math.random() - 0.5) * 0.5;
      } else {
        x += this.noise2D(seed * 10, t * 5) * 0.5;
        y += this.noise2D(seed * 10 + 100, t * 5) * 0.3;
        z += this.noise2D(seed * 10 + 200, t * 5) * 0.2;
      }
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
    
    const randomOffsets = new Float32Array(51);
    for (let i = 0; i < 51; i++) {
      randomOffsets[i] = Math.random();
    }
    geometry.setAttribute('randomOffset', new THREE.BufferAttribute(randomOffsets, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        lineColor: { value: new THREE.Color(0xaaaaaa) },
        displacement: { value: this.chaotic ? 0.05 : 0.01 },
        speed: { value: this.chaotic ? 2.0 : 0.5 }
      },
      vertexShader: `
        uniform float time;
        uniform float displacement;
        uniform float speed;
        
        attribute float randomOffset;
        
        varying float vIntensity;
        
        void main() {
          vec3 pos = position;
          
          float wiggle = sin(time * speed + position.x * 5.0 + randomOffset * 10.0) * displacement;
          wiggle += cos(time * speed * 0.7 + position.y * 4.0 + randomOffset * 8.0) * displacement * 0.5;
          
          pos.x += wiggle;
          pos.y += wiggle * 0.8;
          pos.z += wiggle * 0.3;
          
          vIntensity = 0.5 + wiggle * 5.0;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float opacity;
        uniform vec3 lineColor;
        
        varying float vIntensity;
        
        void main() {
          vec3 color = lineColor * (0.8 + vIntensity * 0.4);
          gl_FragColor = vec4(color, opacity);
        }
      `,
      transparent: true,
      depthWrite: false
    });
    
    const line = new THREE.Line(geometry, material);
    this.lines.push(line);
    this.group.add(line);
  }
  
  show(duration = 2.0) {
    this.lines.forEach((line, i) => {
      gsap.to(line.material.uniforms.opacity, {
        value: 0.7,
        duration: duration,
        delay: i * 0.03,
        ease: 'power2.out'
      });
    });
  }
  
  hide(duration = 1.5) {
    this.lines.forEach((line, i) => {
      gsap.to(line.material.uniforms.opacity, {
        value: 0,
        duration: duration,
        delay: i * 0.01,
        ease: 'power2.in'
      });
    });
  }
  
  erupt(duration = 3.0) {
    this.lines.forEach((line, i) => {
      gsap.to(line.material.uniforms.displacement, {
        value: 0.3,
        duration: duration * 0.3,
        ease: 'power4.out'
      });
      
      gsap.to(line.material.uniforms.speed, {
        value: 8.0,
        duration: duration * 0.3,
        ease: 'power2.out'
      });
      
      gsap.to(line.position, {
        x: line.position.x + (Math.random() - 0.5) * 3,
        y: line.position.y + (Math.random() - 0.5) * 2,
        z: line.position.z + (Math.random() - 0.5) * 2,
        duration: duration,
        ease: 'power2.out'
      });
    });
  }
  
  calm(duration = 2.0) {
    this.lines.forEach((line) => {
      gsap.to(line.material.uniforms.displacement, {
        value: 0.02,
        duration: duration,
        ease: 'power2.out'
      });
      
      gsap.to(line.material.uniforms.speed, {
        value: 1.0,
        duration: duration,
        ease: 'power2.out'
      });
    });
  }
  
  update(delta, time) {
    this.lines.forEach((line) => {
      line.material.uniforms.time.value = time;
    });
  }
  
  setIntensity(intensity) {
    this.intensity = intensity;
    this.lines.forEach((line) => {
      line.material.uniforms.displacement.value = 0.02 + intensity * 0.2;
      line.material.uniforms.speed.value = 1.0 + intensity * 5.0;
    });
  }
  
  dispose() {
    this.lines.forEach((line) => {
      line.geometry.dispose();
      line.material.dispose();
    });
  }
}
