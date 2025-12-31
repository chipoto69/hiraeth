uniform float time;
uniform float wiggleAmount;
uniform float wiggleSpeed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main() {
  vUv = uv;
  vNormal = normal;
  vPosition = position;
  
  vec3 pos = position;
  
  float wiggle = sin(time * wiggleSpeed * 0.5 + position.x * 2.0) * wiggleAmount * 0.5;
  wiggle += cos(time * wiggleSpeed * 0.35 + position.y * 1.5) * wiggleAmount * 0.25;
  
  pos.x += wiggle;
  pos.y += wiggle * 0.5;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
