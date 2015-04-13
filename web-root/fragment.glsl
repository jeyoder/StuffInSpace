precision mediump float;

varying vec2 texCoord;
varying vec3 lightColor;

uniform float texAmount; 
uniform sampler2D sampler;

void main(void) {
  vec4 origColor = (texture2D(sampler, texCoord) * texAmount);
  gl_FragColor = vec4(origColor.rgb * lightColor, origColor.a);
 // gl_FragColor = vec4(texture2D(sampler, texCoord).rgb, 1.0);

}