import * as THREE from 'three';
import gsap from 'gsap';

export class Face {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.position = options.position || new THREE.Vector3(0, 5, -80);
    this.scale = options.scale || 15;
    this.opacity = 0;
    
    this.group.position.copy(this.position);
    
    this.createFace();
  }
  
  createFace() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
        rainTexture: { value: null }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vUv;
          
          float lines = sin(uv.y * 200.0 + time * 0.5) * 0.5 + 0.5;
          lines *= 0.3;
          
          float noiseVal = noise(uv * 50.0 + time * 0.1) * 0.2;
          
          vec3 color = vec3(0.15, 0.15, 0.18);
          color += lines * 0.1;
          color += noiseVal * 0.05;
          
          float alpha = opacity * 0.4;
          alpha *= smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x);
          alpha *= smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    this.createFaceOutline(material);
    this.createEyes(material);
    this.createNose(material);
    this.createMouth(material);
  }
  
  createFaceOutline(baseMaterial) {
    const curve = new THREE.EllipseCurve(
      0, 0,
      1, 1.3,
      0, Math.PI * 2,
      false,
      0
    );
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0
    });
    
    this.outline = new THREE.Line(geometry, material);
    this.outline.scale.set(this.scale, this.scale, 1);
    this.group.add(this.outline);
    
    this.outlineMaterial = material;
  }
  
  createEyes(baseMaterial) {
    const eyeGeometry = new THREE.CircleGeometry(0.15, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a,
      transparent: true,
      opacity: 0
    });
    
    this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone());
    this.leftEye.position.set(-0.35 * this.scale, 0.2 * this.scale, 0);
    this.leftEye.scale.set(this.scale * 0.4, this.scale * 0.4, 1);
    
    this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone());
    this.rightEye.position.set(0.35 * this.scale, 0.2 * this.scale, 0);
    this.rightEye.scale.set(this.scale * 0.4, this.scale * 0.4, 1);
    
    this.group.add(this.leftEye);
    this.group.add(this.rightEye);
  }
  
  createNose(baseMaterial) {
    const noseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0.05, -0.1, 0),
      new THREE.Vector3(0, -0.2, 0)
    ]);
    
    const points = noseCurve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0
    });
    
    this.nose = new THREE.Line(geometry, material);
    this.nose.scale.set(this.scale, this.scale, 1);
    this.group.add(this.nose);
    
    this.noseMaterial = material;
  }
  
  createMouth(baseMaterial) {
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.3, -0.5, 0),
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(0.3, -0.5, 0)
    );
    
    const points = mouthCurve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0
    });
    
    this.mouth = new THREE.Line(geometry, material);
    this.mouth.scale.set(this.scale, this.scale, 1);
    this.group.add(this.mouth);
    
    this.mouthMaterial = material;
  }
  
  show(duration = 3.0) {
    const elements = [
      this.outlineMaterial,
      this.noseMaterial,
      this.mouthMaterial,
      this.leftEye.material,
      this.rightEye.material
    ];
    
    elements.forEach((material, i) => {
      gsap.to(material, {
        opacity: 0.6,
        duration: duration,
        delay: i * 0.2,
        ease: 'power2.out'
      });
    });
    
    this.opacity = 1;
  }
  
  hide(duration = 2.0) {
    const elements = [
      this.outlineMaterial,
      this.noseMaterial,
      this.mouthMaterial,
      this.leftEye.material,
      this.rightEye.material
    ];
    
    elements.forEach((material) => {
      gsap.to(material, {
        opacity: 0,
        duration: duration,
        ease: 'power2.in'
      });
    });
    
    this.opacity = 0;
  }
  
  update(delta, time) {
    this.group.rotation.y = Math.sin(time * 0.1) * 0.05;
    this.group.rotation.z = Math.cos(time * 0.15) * 0.02;
    
    if (this.leftEye) {
      this.leftEye.position.x = -0.35 * this.scale + Math.sin(time * 0.5) * 0.02 * this.scale;
    }
    if (this.rightEye) {
      this.rightEye.position.x = 0.35 * this.scale + Math.sin(time * 0.5) * 0.02 * this.scale;
    }
  }
  
  lookAt(targetPosition) {
    const direction = new THREE.Vector3()
      .subVectors(targetPosition, this.position)
      .normalize();
    
    gsap.to(this.group.rotation, {
      y: direction.x * 0.3,
      duration: 2.0,
      ease: 'power2.out'
    });
  }
  
  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
