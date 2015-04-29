(function() {
var NUM_SEGS = 128;

/*
 * generate a simple circle in 3d space, radius 1, inclination 0
 * later we can build a transformation matrix for the circle
 * to turn it into an orbit to display.
 * (should do this in the shader or precalc)??
 */
var circleCache = []; 

var orbitDisplay = {};

var pathShader;

var posBuf;

orbitDisplay.init = function() {
  
  var startTime = performance.now();
  
  //populate the circleCache
  for(var i=0; i<NUM_SEGS; i++) {
    var angle = ((2 * Math.PI) / NUM_SEGS) * i;
    circleCache.push(Math.cos(angle));  //x
    circleCache.push(Math.sin(angle));  //y
    circleCache.push(0);                //z
  }
  
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, shaderLoader.getShaderCode('path-vertex.glsl'));
  gl.compileShader(vs);
  
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, shaderLoader.getShaderCode('path-fragment.glsl'));
  gl.compileShader(fs);
  
  pathShader = gl.createProgram();
  gl.attachShader(pathShader,vs);
  gl.attachShader(pathShader,fs);
  gl.linkProgram(pathShader);
  
  pathShader.aPos = gl.getAttribLocation(pathShader, 'aPos');
  pathShader.uMvMatrix = gl.getUniformLocation(pathShader, 'uMvMatrix');
  pathShader.uCamMatrix = gl.getUniformLocation(pathShader, 'uCamMatrix');
  pathShader.uPMatrix = gl.getUniformLocation(pathShader, 'uPMatrix');
  
  posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleCache), gl.STATIC_DRAW);
  
  var time = performance.now() - startTime;
  console.log('orbitDisplay init: ' + time + ' ms');
}

orbitDisplay.setOrbit = function() {
  
}

orbitDisplay.draw = function(pMatrix, camMatrix) { //lol what do I do here
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(pathShader);
  gl.uniformMatrix4fv(pathShader.uMvMatrix, false, mat4.create()); //identity mat
  gl.uniformMatrix4fv(pathShader.uCamMatrix, false, camMatrix);
  gl.uniformMatrix4fv(pathShader.uPMatrix, false, pMatrix);
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
  
  gl.drawArrays(gl.LINE_LOOP, 0, NUM_SEGS);
}

window.orbitDisplay = orbitDisplay;
})();