precision mediump float;

varying vec3 vColor;

void main(void) {
  vec2 ptCoord = gl_PointCoord * 2.0 - vec2(1.0, 1.0);
  float r = min(abs(length(ptCoord)), 1.0);
  
  float alpha = pow(1.0 - r, 2.0);
  gl_FragColor = vec4(vColor, alpha);
}