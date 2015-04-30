/* global satSet */
/* global mat4 */
/* global shaderLoader */
/* global gl */
(function() {
var NUM_SEGS = 255;

var orbitDisplay = {};

var pathShader;

var selectOrbitBuf;
var hoverOrbitBuf;

var selectColor = [0.0, 1.0, 0.0, 1.0];
var hoverColor =  [0.5, 0.5, 1.0, 1.0];

var currentHoverId = -1;
var currentSelectId = -1;

var orbitMvMat = mat4.create();

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
  
  var time = performance.now() - startTime;
  console.log('orbitDisplay init: ' + time + ' ms');
};

function jday(year, mon, day, hr, minute, sec){ //from satellite.js
  'use strict';
  return (367.0 * year -
        Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
        Math.floor( 275 * mon / 9.0 ) +
        day + 1721013.5 +
        ((sec / 60.0 + minute) / 60.0 + hr) / 24.0  //  ut in days
        //#  - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
        );
}

function calcOrbitPoints(satId) {
  //TODO: figure out how to calculate the orbit points on constant 
  // position slices, not timeslices (ugly perigees on HEOs)
  var satData = satSet.getSat(satId);
  var satrec = satellite.twoline2satrec(
    satData.TLE_LINE1, satData.TLE_LINE2
  );
  var pointsOut = new Float32Array((NUM_SEGS + 1) * 3);
  
  var nowDate = new Date();
  var nowJ = jday(nowDate.getUTCFullYear(), 
               nowDate.getUTCMonth() + 1, 
               nowDate.getUTCDate(),
               nowDate.getUTCHours(), 
               nowDate.getUTCMinutes(), 
               nowDate.getUTCSeconds());
  nowJ += nowDate.getUTCMilliseconds() * 1.15741e-8; //days per millisecond    
  var now = (nowJ - satrec.jdsatepoch) * 1440.0; //in minutes 
  
  var timeslice = satData.period / NUM_SEGS;
  
  for(var i=0; i<NUM_SEGS+1; i++) {
    var t = now + i*timeslice;
    var p = satellite.sgp4(satrec, t).position;
    pointsOut[i*3] = p.x;
    pointsOut[i*3+1] = p.y;
    pointsOut[i*3+2] = p.z;
  }
  
  return pointsOut;
}

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
  var start = performance.now();
  currentSelectId = satId;
  
  var sat = satSet.getSat(satId);
  var pointsOut = calcOrbitPoints(satId);
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, pointsOut, gl.DYNAMIC_DRAW);
  
  console.log('setOrbit(): ' + (performance.now() - start) + ' ms');
};

orbitDisplay.clearSelectOrbit = function() {
  currentSelectId = -1;
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.DYNAMIC_DRAW);
}

orbitDisplay.setHoverOrbit = function(satId) {
  if(satId === currentHoverId) return;
  currentHoverId = satId;
  var start = performance.now();
  
  var pointsOut = calcOrbitPoints(satId);
  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, pointsOut, gl.DYNAMIC_DRAW);
  
  console.log('setOrbit(): ' + (performance.now() - start) + ' ms');
};

orbitDisplay.clearHoverOrbit = function(satId) {
  if(currentHoverId === -1) return;
  currentHoverId = -1;
  
  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array((NUM_SEGS+1)*3), gl.DYNAMIC_DRAW);
}

orbitDisplay.draw = function(pMatrix, camMatrix) { //lol what do I do here
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(pathShader);
  gl.uniformMatrix4fv(pathShader.uMvMatrix, false, orbitMvMat); 
  gl.uniformMatrix4fv(pathShader.uCamMatrix, false, camMatrix);
  gl.uniformMatrix4fv(pathShader.uPMatrix, false, pMatrix);
  
  gl.uniform4fv(pathShader.uColor, selectColor);
  gl.bindBuffer(gl.ARRAY_BUFFER, selectOrbitBuf);
  gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
  
  if(currentHoverId === currentSelectId) return; //avoid z-fighting
  gl.uniform4fv(pathShader.uColor, hoverColor);
  gl.bindBuffer(gl.ARRAY_BUFFER, hoverOrbitBuf);
  gl.vertexAttribPointer(pathShader.aPos, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINE_STRIP, 0, NUM_SEGS + 1);
};

window.orbitDisplay = orbitDisplay;
})();