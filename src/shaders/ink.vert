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
  
  float wiggle = sin(time * wiggleSpeed + position.x * 3.0) * wiggleAmount;
  wiggle += cos(time * wiggleSpeed * 0.7 + position.y * 2.0) * wiggleAmount * 0.5;
  
  pos.x += wiggle;
  pos.y += wiggle * 0.5;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
