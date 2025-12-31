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
  
  float noiseX = sin(time * speed + position.y * 5.0 + randomOffset) * displacement;
  float noiseY = cos(time * speed * 0.8 + position.x * 4.0 + randomOffset) * displacement;
  float noiseZ = sin(time * speed * 0.6 + position.z * 3.0 + randomOffset) * displacement * 0.5;
  
  pos.x += noiseX;
  pos.y += noiseY;
  pos.z += noiseZ;
  
  vDisplacement = noiseX + noiseY;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
