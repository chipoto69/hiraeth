import * as THREE from 'three';
import { Text } from 'troika-three-text';
import gsap from 'gsap';

export class KineticText {
  constructor(options = {}) {
    this.text = options.text || '';
    this.position = options.position || new THREE.Vector3(0, 1.6, -10);
    this.fontSize = options.fontSize || 0.5;
    this.color = options.color || 0xf5f5f0;
    this.anchor = options.anchor || 'center';
    this.hasCollision = options.hasCollision !== false;
    this.wiggle = options.wiggle !== false;
    this.glowing = options.glowing || false;
    this.flickering = options.flickering || false;
    
    this.group = new THREE.Group();
    this.isVisible = false;
    this.wiggleTime = 0;
    
    this.createText();
    
    if (this.hasCollision) {
      this.createCollider();
    }
  }
  
  createText() {
    this.textMesh = new Text();
    this.textMesh.text = this.text;
    this.textMesh.fontSize = this.fontSize;
    this.textMesh.color = this.color;
    this.textMesh.anchorX = this.anchor;
    this.textMesh.anchorY = 'middle';
    this.textMesh.font = '/fonts/CormorantGaramond-Regular.ttf';
    
    this.textMesh.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        glowIntensity: { value: this.glowing ? 0.3 : 0 },
        flickerIntensity: { value: this.flickering ? 1.0 : 0 },
        baseColor: { value: new THREE.Color(this.color) }
      },
      vertexShader: `
        uniform float time;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          pos.x += sin(time * 2.0 + position.y * 5.0) * 0.002;
          pos.y += cos(time * 1.5 + position.x * 4.0) * 0.002;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        uniform float glowIntensity;
        uniform float flickerIntensity;
        uniform vec3 baseColor;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec3 color = baseColor;
          
          float glow = glowIntensity * (0.5 + 0.5 * sin(time * 0.5));
          color += glow;
          
          float flicker = 1.0;
          if (flickerIntensity > 0.0) {
            flicker = 0.7 + 0.3 * noise(vec2(time * 10.0, vPosition.x));
            flicker *= 0.8 + 0.2 * sin(time * 15.0 + vPosition.y * 10.0);
          }
          
          float inkTexture = noise(vUv * 100.0) * 0.05;
          color *= (1.0 - inkTexture);
          
          float finalOpacity = opacity * flicker;
          
          gl_FragColor = vec4(color, finalOpacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    this.textMesh.position.copy(this.position);
    this.group.add(this.textMesh);
    
    this.textMesh.sync();
  }
  
  createCollider() {
    const width = this.text.length * this.fontSize * 0.6;
    const height = this.fontSize * 1.2;
    const depth = 0.5;
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({
      visible: false
    });
    
    this.collider = new THREE.Mesh(geometry, material);
    this.collider.position.copy(this.position);
    this.group.add(this.collider);
  }
  
  show(duration = 1.5, delay = 0) {
    this.isVisible = true;
    
    gsap.to(this.textMesh.material.uniforms.opacity, {
      value: 1.0,
      duration: duration,
      delay: delay,
      ease: 'power2.out'
    });
    
    if (this.wiggle) {
      gsap.from(this.textMesh.position, {
        y: this.position.y + 0.5,
        duration: duration * 1.5,
        delay: delay,
        ease: 'elastic.out(1, 0.5)'
      });
    }
  }
  
  hide(duration = 1.0) {
    gsap.to(this.textMesh.material.uniforms.opacity, {
      value: 0,
      duration: duration,
      ease: 'power2.in',
      onComplete: () => {
        this.isVisible = false;
      }
    });
  }
  
  typeIn(duration = 2.0) {
    const fullText = this.text;
    this.textMesh.text = '';
    this.textMesh.material.uniforms.opacity.value = 1.0;
    this.isVisible = true;
    
    const chars = fullText.split('');
    const charDuration = duration / chars.length;
    
    chars.forEach((char, i) => {
      gsap.delayedCall(i * charDuration, () => {
        this.textMesh.text += char;
        this.textMesh.sync();
      });
    });
  }
  
  dissolve(duration = 2.0) {
    const words = this.text.split(' ');
    
    gsap.to(this.textMesh.position, {
      y: this.position.y + 2,
      duration: duration,
      ease: 'power1.in'
    });
    
    gsap.to(this.textMesh.material.uniforms.opacity, {
      value: 0,
      duration: duration,
      ease: 'power2.in'
    });
    
    gsap.to(this.textMesh.rotation, {
      z: (Math.random() - 0.5) * 0.5,
      duration: duration,
      ease: 'power1.in'
    });
  }
  
  setFlickering(enabled) {
    this.flickering = enabled;
    this.textMesh.material.uniforms.flickerIntensity.value = enabled ? 1.0 : 0;
  }
  
  setGlowing(intensity) {
    this.textMesh.material.uniforms.glowIntensity.value = intensity;
  }
  
  update(delta, time) {
    if (!this.isVisible) return;
    
    this.textMesh.material.uniforms.time.value = time;
    
    if (this.wiggle) {
      this.wiggleTime += delta;
      this.textMesh.position.x = this.position.x + Math.sin(this.wiggleTime * 2) * 0.01;
      this.textMesh.position.y = this.position.y + Math.cos(this.wiggleTime * 1.5) * 0.005;
    }
  }
  
  checkCollision(cameraPosition) {
    if (!this.collider) return false;
    
    const distance = cameraPosition.distanceTo(this.collider.position);
    const collisionRadius = this.text.length * this.fontSize * 0.3 + 1;
    
    return distance < collisionRadius;
  }
  
  dispose() {
    if (this.textMesh) {
      this.textMesh.dispose();
    }
    if (this.collider) {
      this.collider.geometry.dispose();
      this.collider.material.dispose();
    }
  }
}
