attribute vec3 aVertexPosition;

attribute vec2 aTexCoord;
attribute vec3 aVertexNormal;

uniform mat4 pMatrix;
uniform mat4 camMatrix;
uniform mat4 mvMatrix;
uniform mat3 normalMatrix;


varying vec2 texCoord;
varying vec3 normal;
varying float directionalLightAmount;

void main(void) {
  gl_Position = pMatrix * camMatrix * mvMatrix * vec4(aVertexPosition, 1.0);
  texCoord = aTexCoord;
  
  normal = normalMatrix * aVertexNormal;
}
