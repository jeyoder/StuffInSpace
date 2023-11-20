attribute float size;
attribute vec4 color;

varying vec4 vColor;

void main() {
  vec4 position = projectionMatrix * modelViewMatrix * vec4(position,1.);
  gl_PointSize = min(max(320000.0 / position.w, 7.5), 20.0) * 1.0;
  gl_Position = position;
  vColor = color;
}
