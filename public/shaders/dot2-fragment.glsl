uniform vec3 color;
uniform sampler2D pointTexture;

varying vec4 vColor;
void main() {
  vec2 ptCoord = gl_PointCoord * 2.0 - vec2(1.0, 1.0);
  float r = 1.0 - min(abs(length(ptCoord)), 1.0);
  float alpha = pow(r + 0.1, 3.0);
  alpha = min(alpha, 1.0);

  gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);
  // gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
}