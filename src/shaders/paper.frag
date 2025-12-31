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
  
  float vignette = 1.0 - length(vUv - 0.5) * 0.5;
  color *= vignette;
  
  gl_FragColor = vec4(color, 1.0);
}
