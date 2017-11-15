/* global groups */
/* global satSet */
/* global mat4 */
/* global shaderLoader */
/* global gl */
(function() {
var NUM_SEGS = 255;

var glBuffers = [];
var inProgress = [];


var orbitDisplay = {};

var pathShader;

var selectOrbitBuf;
var hoverOrbitBuf;

var selectColor = [0.0, 1.0, 0.0, 1.0];
var hoverColor =  [0.5, 0.5, 1.0, 1.0];
var groupColor = [0.3, 0.5, 1.0, 0.4];

var currentHoverId = -1;
var currentSelectId = -1;

var orbitMvMat = mat4.create();

var orbitWorker = new Worker('scripts/orbit-calculation-worker.js');

var initialized = false;

orbitDisplay.init = function() {

  var startTime = performance.now();

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
  pathShader.uColor = gl.getUniformLocation(pathShader, 'uColor');

  selectOrbitBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.STATIC_DRAW);

  hoverOrbitBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.STATIC_DRAW);

  for(var i=0; i<satSet.numSats; i++) {
    glBuffers.push(allocateBuffer());
  }
  orbitWorker.postMessage({
    isInit : true,
    satData : satSet.satDataString,
    numSegs : NUM_SEGS
  });

  initialized = true;

  var time = performance.now() - startTime;
  console.log('orbitDisplay init: ' + time + ' ms');
};



orbitDisplay.updateOrbitBuffer = function(satId) {
  if(!inProgress[satId]) {
    orbitWorker.postMessage({
      isInit : false,
      satId : satId
    });
    inProgress[satId] = true;
  }
};

orbitWorker.onmessage = function(m) {
  var satId = m.data.satId;
  var pointsOut = new Float32Array(m.data.pointsOut);
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[satId]);
  gl.bufferData(gl.ARRAY_BUFFER, pointsOut, gl.DYNAMIC_DRAW);
  inProgress[satId] = false;
};

/*orbitDisplay.setOrbit = function(satId) {
  var sat = satSet.getSat(satId);
  mat4.identity(orbitMvMat);
  //apply steps in reverse order because matrix multiplication
  // (last multiplied in is first applied to vertex)

  //step 5. rotate to RAAN
  mat4.rotateZ(orbitMvMat, orbitMvMat, sat.raan + Math.PI/2);
  //step 4. incline the plane
  mat4.rotateY(orbitMvMat, orbitMvMat, -sat.inclination);
  //step 3. rotate to argument of periapsis
  mat4.rotateZ(orbitMvMat, orbitMvMat, sat.argPe - Math.PI/2);
  //step 2. put earth at the focus
  mat4.translate(orbitMvMat, orbitMvMat, [sat.semiMajorAxis - sat.apogee - 6371, 0, 0]);
  //step 1. stretch to ellipse
  mat4.scale(orbitMvMat, orbitMvMat, [sat.semiMajorAxis, sat.semiMinorAxis, 0]);

};

orbitDisplay.clearOrbit = function() {
  mat4.identity(orbitMvMat);
}*/

orbitDisplay.setSelectOrbit = function(satId) {
 // var start = performance.now();
  currentSelectId = satId;
  orbitDisplay.updateOrbitBuffer(satId);
 // console.log('setOrbit(): ' + (performance.now() - start) + ' ms');
};

orbitDisplay.clearSelectOrbit = function() {
  currentSelectId = -1;
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.DYNAMIC_DRAW);
};

orbitDisplay.setHoverOrbit = function(satId) {
  if(satId === currentHoverId) return;
  currentHoverId = satId;
  orbitDisplay.updateOrbitBuffer(satId);
};

orbitDisplay.clearHoverOrbit = function(satId) {
  if(currentHoverId === -1) return;
  currentHoverId = -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.DYNAMIC_DRAW);
};

orbitDisplay.draw = function(pMatrix, camMatrix) { //lol what do I do here
  if(!initialized) return;

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(pathShader);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
 // gl.depthMask(false);

  gl.uniformMatrix4fv(pathShader.uMvMatrix, false, orbitMvMat);
  gl.uniformMatrix4fv(pathShader.uCamMatrix, false, camMatrix);
  gl.uniformMatrix4fv(pathShader.uPMatrix, false, pMatrix);

  if(currentSelectId !== -1) {
    gl.uniform4fv(pathShader.uColor, selectColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[currentSelectId]);
    gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
  }

  if(currentHoverId !== -1 && currentHoverId !== currentSelectId) { //avoid z-fighting
    gl.uniform4fv(pathShader.uColor, hoverColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[currentHoverId]);
    gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
  }
  if(groups.selectedGroup !== null) {
    gl.uniform4fv(pathShader.uColor, groupColor);
    groups.selectedGroup.forEach(function(id){
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[id]);
      gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
    });
  }

  //  gl.depthMask(true);
    gl.disable(gl.BLEND);
};

function allocateBuffer() {
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.STATIC_DRAW);
  return buf;
}

orbitDisplay.getPathShader = function() {
  return pathShader;
};

window.orbitDisplay = orbitDisplay;
})();