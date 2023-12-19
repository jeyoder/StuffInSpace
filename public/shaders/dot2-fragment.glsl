uniform vec3 color;
uniform sampler2D pointTexture;

varying vec4 vColor;
void main() {
  vec2 ptCoord = gl_PointCoord * 2.0 - vec2(1.0, 1.0);
  float r = 0.48 - min(abs(length(ptCoord)), 1.0);
  float alpha = (2.0 * r + 0.4);
  gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);
}