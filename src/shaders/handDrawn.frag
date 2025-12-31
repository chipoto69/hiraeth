uniform vec3 lineColor;
uniform float opacity;
uniform float thickness;

varying vec2 vUv;
varying float vDisplacement;

void main() {
  float intensity = 1.0 - abs(vDisplacement) * 2.0;
  intensity = clamp(intensity, 0.5, 1.0);
  
  vec3 color = lineColor * intensity;
  
  gl_FragColor = vec4(color, opacity);
}
