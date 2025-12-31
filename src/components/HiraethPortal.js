import * as THREE from 'three';
import gsap from 'gsap';

export class HiraethPortal {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.position = options.position || new THREE.Vector3(0, 3, -120);
    this.scale = options.scale || 8;
    
    this.group.position.copy(this.position);
    
    this.createLetters();
    this.createPortalEffect();
  }
  
  createLetters() {
    const letters = 'HIRAETH';
    this.letterMeshes = [];
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        glowColor: { value: new THREE.Color(0xf5f5f0) }
      },
      vertexShader: `
        uniform float time;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          pos.y += sin(time * 0.5 + position.x) * 0.05;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        uniform vec3 glowColor;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          float glow = sin(time * 0.3) * 0.2 + 0.8;
          vec3 color = glowColor * glow;
          
          float edgeGlow = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
          edgeGlow *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
          
          float alpha = opacity * edgeGlow;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    letters.split('').forEach((letter, i) => {
      const geometry = this.createLetterGeometry(letter);
      const mesh = new THREE.Mesh(geometry, material.clone());
      
      const spacing = this.scale * 0.8;
      const totalWidth = (letters.length - 1) * spacing;
      mesh.position.x = i * spacing - totalWidth / 2;
      mesh.position.y = 0;
      
      mesh.scale.set(this.scale, this.scale, 1);
      
      this.letterMeshes.push(mesh);
      this.group.add(mesh);
    });
    
    this.createHPortal();
  }
  
  createLetterGeometry(letter) {
    const shape = new THREE.Shape();
    const width = 0.6;
    const height = 1;
    const thickness = 0.1;
    
    switch(letter) {
      case 'H':
        shape.moveTo(-width/2, -height/2);
        shape.lineTo(-width/2 + thickness, -height/2);
        shape.lineTo(-width/2 + thickness, -thickness/2);
        shape.lineTo(width/2 - thickness, -thickness/2);
        shape.lineTo(width/2 - thickness, -height/2);
        shape.lineTo(width/2, -height/2);
        shape.lineTo(width/2, height/2);
        shape.lineTo(width/2 - thickness, height/2);
        shape.lineTo(width/2 - thickness, thickness/2);
        shape.lineTo(-width/2 + thickness, thickness/2);
        shape.lineTo(-width/2 + thickness, height/2);
        shape.lineTo(-width/2, height/2);
        shape.closePath();
        break;
        
      default:
        shape.moveTo(-width/2, -height/2);
        shape.lineTo(width/2, -height/2);
        shape.lineTo(width/2, height/2);
        shape.lineTo(-width/2, height/2);
        shape.closePath();
        
        const hole = new THREE.Path();
        hole.moveTo(-width/2 + thickness, -height/2 + thickness);
        hole.lineTo(width/2 - thickness, -height/2 + thickness);
        hole.lineTo(width/2 - thickness, height/2 - thickness);
        hole.lineTo(-width/2 + thickness, height/2 - thickness);
        hole.closePath();
        shape.holes.push(hole);
    }
    
    return new THREE.ShapeGeometry(shape);
  }
  
  createHPortal() {
    const portalGeometry = new THREE.PlaneGeometry(
      this.scale * 0.4,
      this.scale * 0.35
    );
    
    const portalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        portalColor: { value: new THREE.Color(0x1a1a1a) }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        uniform vec3 portalColor;
        
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          
          float swirl = atan(center.y, center.x) + time * 0.5;
          float spiral = sin(swirl * 5.0 + dist * 10.0 - time * 2.0) * 0.5 + 0.5;
          
          float n = noise(vUv * 10.0 + time);
          
          vec3 color = portalColor + spiral * 0.1 + n * 0.05;
          
          float alpha = opacity * (1.0 - dist * 1.5);
          alpha = max(0.0, alpha);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    this.portal = new THREE.Mesh(portalGeometry, portalMaterial);
    
    const hIndex = 0;
    const spacing = this.scale * 0.8;
    const totalWidth = 6 * spacing;
    this.portal.position.x = hIndex * spacing - totalWidth / 2;
    this.portal.position.y = this.scale * 0.15;
    this.portal.position.z = 0.1;
    
    this.group.add(this.portal);
  }
  
  createPortalEffect() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.scale * 0.3;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius + this.scale * 0.15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = -Math.random() * 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xf5f5f0,
      size: 0.1,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    
    const hSpacing = this.scale * 0.8;
    const totalWidth = 6 * hSpacing;
    this.particles.position.x = -totalWidth / 2;
    
    this.group.add(this.particles);
  }
  
  show(duration = 3.0) {
    this.letterMeshes.forEach((mesh, i) => {
      gsap.to(mesh.material.uniforms.opacity, {
        value: 1.0,
        duration: duration,
        delay: i * 0.15,
        ease: 'power2.out'
      });
      
      gsap.from(mesh.position, {
        y: mesh.position.y - 2,
        duration: duration * 0.8,
        delay: i * 0.15,
        ease: 'elastic.out(1, 0.5)'
      });
    });
    
    gsap.to(this.portal.material.uniforms.opacity, {
      value: 0.8,
      duration: duration * 1.5,
      delay: 0.5,
      ease: 'power2.out'
    });
    
    gsap.to(this.particles.material, {
      opacity: 0.6,
      duration: duration,
      delay: 1.0,
      ease: 'power2.out'
    });
  }
  
  activatePortal() {
    gsap.to(this.portal.material.uniforms.opacity, {
      value: 1.0,
      duration: 1.0,
      ease: 'power2.out'
    });
    
    gsap.to(this.portal.scale, {
      x: 1.5,
      y: 1.5,
      duration: 2.0,
      ease: 'power2.inOut'
    });
  }
  
  update(delta, time) {
    this.letterMeshes.forEach((mesh) => {
      mesh.material.uniforms.time.value = time;
    });
    
    if (this.portal) {
      this.portal.material.uniforms.time.value = time;
    }
    
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 2] -= 0.02;
        
        if (positions[i * 3 + 2] < -5) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * this.scale * 0.3;
          
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = Math.sin(angle) * radius + this.scale * 0.15;
          positions[i * 3 + 2] = 2;
        }
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }
  
  isPlayerInPortal(cameraPosition) {
    const hSpacing = this.scale * 0.8;
    const totalWidth = 6 * hSpacing;
    const hX = this.position.x - totalWidth / 2;
    const hY = this.position.y + this.scale * 0.15;
    
    const dx = cameraPosition.x - hX;
    const dy = cameraPosition.y - hY;
    const dz = cameraPosition.z - this.position.z;
    
    return Math.abs(dx) < this.scale * 0.2 && 
           Math.abs(dy) < this.scale * 0.2 && 
           Math.abs(dz) < 2;
  }
  
  dispose() {
    this.letterMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    
    if (this.portal) {
      this.portal.geometry.dispose();
      this.portal.material.dispose();
    }
    
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
  }
}
