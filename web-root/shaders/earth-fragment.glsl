precision mediump float;

uniform vec3 ambientLightColor;
uniform vec3 directionalLightColor;
uniform vec3 lightDirection;

varying vec2 texCoord;
varying vec3 normal;

uniform sampler2D sampler;
uniform sampler2D nightSampler;



void main(void) {
  float directionalLightAmount = max(dot(normal, lightDirection), 0.0);
  vec3 lightColor = ambientLightColor + (directionalLightColor * directionalLightAmount);
  
  vec3 litTexColor = texture2D(sampler, texCoord).rgb * lightColor * 2.0;
  
  vec3 nightLightColor = texture2D(nightSampler, texCoord).rgb * (1.0 - directionalLightAmount);

  gl_FragColor = vec4(litTexColor + nightLightColor, 1.0);
}