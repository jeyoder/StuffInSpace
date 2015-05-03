precision mediump float;

varying vec3 vColor;

void main(void) {
  vec2 ptCoord = gl_PointCoord * 2.0 - vec2(1.0, 1.0);
  float r = 1.0 - min(abs(length(ptCoord)), 1.0);
  
 float alpha = min(pow(r + 0.1, 3.0),1.0);
// float alpha = r;
  gl_FragColor = vec4(vColor, alpha);
}