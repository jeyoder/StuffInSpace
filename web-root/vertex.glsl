attribute vec3 aVertexPosition;

attribute vec2 aTexCoord;
attribute vec3 aVertexNormal;

uniform mat4 pMatrix;
uniform mat4 camMatrix;
uniform mat4 mvMatrix;
uniform mat3 normalMatrix;

uniform vec3 ambientLightColor;
uniform vec3 directionalLightColor;
uniform vec3 lightDirection;


varying vec2 texCoord;
varying vec3 lightColor;

void main(void) {
  gl_Position = pMatrix * camMatrix * mvMatrix * vec4(aVertexPosition, 1.0);
  texCoord = aTexCoord;
  
  vec3 normal = normalMatrix * aVertexNormal;
  float directionalLightAmount = max(dot(normal, lightDirection), 0.0);
 lightColor = ambientLightColor + (directionalLightColor * directionalLightAmount);
}
