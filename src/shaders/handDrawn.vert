uniform float time;
uniform float displacement;
uniform float speed;

attribute float randomOffset;

varying vec2 vUv;
varying float vDisplacement;

float noise(float x) {
  return fract(sin(x) * 43758.5453);
}

void main() {
  vUv = uv;
  
  vec3 pos = position;
  
  float noiseX = sin(time * speed * 0.5 + position.y * 3.0 + randomOffset) * displacement * 0.6;
  float noiseY = cos(time * speed * 0.4 + position.x * 2.0 + randomOffset) * displacement * 0.6;
  float noiseZ = sin(time * speed * 0.3 + position.z * 1.5 + randomOffset) * displacement * 0.3;
  
  pos.x += noiseX;
  pos.y += noiseY;
  pos.z += noiseZ;
  
  vDisplacement = noiseX + noiseY;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
