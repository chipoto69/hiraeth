import * as THREE from 'three';

export class PaperGround {
  constructor() {
    this.geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        paperColor: { value: new THREE.Color(0x1a1a1a) },
        pulseIntensity: { value: 0.3 },
        grainScale: { value: 50.0 }
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
        uniform vec3 paperColor;
        uniform float pulseIntensity;
        uniform float grainScale;
        
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        void main() {
          float grain = fbm(vUv * grainScale);
          
          float pulse = sin(time * 0.5) * pulseIntensity * 0.5 + 0.5;
          pulse *= fbm(vUv * 10.0 + time * 0.1);
          
          float fibers = noise(vUv * 200.0) * 0.05;
          fibers += noise(vUv * 500.0) * 0.02;
          
          vec3 color = paperColor;
          color *= 0.9 + grain * 0.2;
          color += fibers;
          color *= 0.95 + pulse * 0.1;
          
          float distFromCenter = length(vUv - 0.5);
          float vignette = 1.0 - distFromCenter * 0.3;
          color *= vignette;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
    
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0;
    this.mesh.receiveShadow = true;
  }
  
  update(time) {
    this.material.uniforms.time.value = time;
  }
  
  setPulseIntensity(intensity) {
    this.material.uniforms.pulseIntensity.value = intensity;
  }
  
  setColor(color) {
    this.material.uniforms.paperColor.value.set(color);
  }
}
