uniform vec3 inkColor;
uniform float opacity;
uniform float glossiness;
uniform float time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);
  
  float inkTexture = noise(vUv * 50.0) * 0.1;
  float wetness = sin(vUv.x * 20.0 + time * 0.5) * 0.02 + 0.98;
  
  vec3 baseColor = inkColor * (1.0 - inkTexture);
  
  float gloss = fresnel * glossiness * wetness;
  vec3 highlight = vec3(0.95, 0.95, 0.9) * gloss;
  
  vec3 finalColor = baseColor + highlight;
  
  gl_FragColor = vec4(finalColor, opacity);
}
