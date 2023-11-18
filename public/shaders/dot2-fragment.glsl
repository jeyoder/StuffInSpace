uniform vec3 color;
uniform sampler2D pointTexture;

varying vec3 vColor;

void main() {
  gl_FragColor = vec4( color * vColor, 1.0 );
  gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
}