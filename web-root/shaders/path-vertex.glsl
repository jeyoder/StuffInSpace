attribute vec3 aPos;

uniform mat4 uCamMatrix;
uniform mat4 uMvMatrix;
uniform mat4 uPMatrix;

void main(void) {
  vec4 position = uPMatrix * uCamMatrix *  uMvMatrix * vec4(aPos, 1.0);
  gl_Position = position;
}
