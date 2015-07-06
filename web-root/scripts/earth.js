/* global satellite */
//earth.js
(function() {
var earth = {};

var R2D = 180 / Math.PI;
var D2R = Math.PI / 180;

var NUM_LAT_SEGS = 64;
var NUM_LON_SEGS = 64;
var pos = [3.0, 0.0, 1.0];
var radius = 6371.0;

var vertPosBuf, vertNormBuf, texCoordBuf, vertIndexBuf; //GPU mem buffers, data and stuff?
var vertCount;

var earthShader;

earth.pos = [0, 0, 0];

var texture, nightTexture;

var texLoaded = false, nightLoaded = false;
var loaded = false;

function onImageLoaded() {
  if (texLoaded && nightLoaded) {
    loaded = true;
    $('#loader-text').text('Downloading satellites...');
  }
}

earth.init = function() {
  var startTime = new Date().getTime();	
 
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  var fragCode = shaderLoader.getShaderCode('earth-fragment.glsl');
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);
  
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  var vertCode = shaderLoader.getShaderCode('earth-vertex.glsl');
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);
  
  earthShader = gl.createProgram();
  gl.attachShader(earthShader, vertShader);
  gl.attachShader(earthShader, fragShader);
  gl.linkProgram(earthShader);
  
  earthShader.aVertexPosition  =        gl.getAttribLocation(earthShader, 'aVertexPosition');
  earthShader.aTexCoord =               gl.getAttribLocation(earthShader, 'aTexCoord');
  earthShader.aVertexNormal =           gl.getAttribLocation(earthShader, 'aVertexNormal');
  earthShader.uPMatrix =                gl.getUniformLocation(earthShader, 'uPMatrix');
  earthShader.uCamMatrix =              gl.getUniformLocation(earthShader, 'uCamMatrix');
  earthShader.uMvMatrix =               gl.getUniformLocation(earthShader, 'uMvMatrix');
  earthShader.uNormalMatrix =           gl.getUniformLocation(earthShader, 'uNormalMatrix');
  earthShader.uLightDirection =         gl.getUniformLocation(earthShader, 'uLightDirection');
  earthShader.uAmbientLightColor =      gl.getUniformLocation(earthShader, 'uAmbientLightColor');
  earthShader.uDirectionalLightColor =  gl.getUniformLocation(earthShader, 'uDirectionalLightColor');
  earthShader.uSampler =                gl.getUniformLocation(earthShader, 'uSampler');
  earthShader.uNightSampler =           gl.getUniformLocation(earthShader, 'uNightSampler');
  
  texture = gl.createTexture();
  var img = new Image();
  img.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT	);
    console.log('earth.js loaded texture');
    texLoaded = true;
    onImageLoaded();
  };
  img.src = '/mercator-tex.jpg';
//  img.src = '/mercator-tex-512.jpg';
  
  nightTexture = gl.createTexture();
  var nightImg = new Image();
  nightImg.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, nightTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nightImg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT	);
    console.log('earth.js loaded nightearth');
    nightLoaded = true;
    onImageLoaded();
  };
  nightImg.src = '/nightearth-4096.png';
 // nightImg.src = '/nightearth-512.jpg';
  
  //generate a uvsphere bottom up, CCW order
  var vertPos = [];
  var vertNorm = [];
  var texCoord = [];
  var i = 0;
  for (var lat = 0; lat <= NUM_LAT_SEGS; lat++) { 
    var latAngle = (Math.PI / NUM_LAT_SEGS) * lat - (Math.PI / 2);
    var diskRadius = Math.cos(Math.abs(latAngle));
    var z = Math.sin(latAngle);
 //   console.log('LAT: ' + latAngle * R2D + ' , Z: ' + z);
    for(var lon = 0; lon <= NUM_LON_SEGS; lon++) { //add an extra vertex for texture funness
      var lonAngle = (Math.PI * 2 / NUM_LON_SEGS) * lon;
      var x = Math.cos(lonAngle) * diskRadius;
      var y = Math.sin(lonAngle) * diskRadius;
  //      console.log('i: ' + i + '    LON: ' + lonAngle * R2D + ' X: ' + x + ' Y: ' + y)
      
      //mercator cylindrical projection (simple angle interpolation)
      var v = 1-(lat / NUM_LAT_SEGS);
      var u = 0.5 + (lon / NUM_LON_SEGS); //may need to change to move map
  //    console.log('u: ' + u + ' v: ' + v);
      //normals: should just be a vector from center to point (aka the point itself!
      
      vertPos.push(x * radius);
      vertPos.push(y * radius);
      vertPos.push(z * radius);
      texCoord.push(u);
      texCoord.push(v);
      vertNorm.push(x);
      vertNorm.push(y);
      vertNorm.push(z);
      
      i++;
    }
  } 

  //ok let's calculate vertex draw orders.... indiv triangles
  var vertIndex = [];
  for(var lat=0; lat < NUM_LAT_SEGS; lat++) { //this is for each QUAD, not each vertex, so <
    for(var lon=0; lon < NUM_LON_SEGS; lon++) {
      var blVert = lat * (NUM_LON_SEGS+1) + lon; //there's NUM_LON_SEGS + 1 verts in each horizontal band
      var brVert = blVert + 1;
      var tlVert = (lat + 1) * (NUM_LON_SEGS+1) + lon; 
      var trVert = tlVert + 1;
  //    console.log('bl: ' + blVert + ' br: ' + brVert +  ' tl: ' + tlVert + ' tr: ' + trVert);
      vertIndex.push(blVert);
      vertIndex.push(brVert);
      vertIndex.push(tlVert);
      
      vertIndex.push(tlVert);
      vertIndex.push(trVert);
      vertIndex.push(brVert);
    }
  }
  vertCount = vertIndex.length;
  
  
  vertPosBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
  
  vertNormBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertNormBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertNorm), gl.STATIC_DRAW);
  
  texCoordBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.STATIC_DRAW);
  
  vertIndexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertIndexBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertIndex), gl.STATIC_DRAW);
 
  
  var end = new Date().getTime() - startTime;
  console.log('earth init: ' + end + ' ms');
};

earth.draw = function(pMatrix, camMatrix) {
  if(!loaded) return;
  
  var now = new Date();   
  var j = 	jday(now.getUTCFullYear(), 
               now.getUTCMonth() + 1, // Note, this function requires months in range 1-12. 
               now.getUTCDate(),
               now.getUTCHours(), 
               now.getUTCMinutes(), 
               now.getUTCSeconds());
  j += now.getUTCMilliseconds() * 1.15741e-8; //days per millisecond   
  
  var era = satellite.gstime_from_jday(j);
  
  var lightDirection = sun.currentDirection();
  vec3.normalize(lightDirection, lightDirection);
  
  var mvMatrix = mat4.create();
  mat4.identity(mvMatrix);
  mat4.rotateZ(mvMatrix, mvMatrix, era);
  mat4.translate(mvMatrix, mvMatrix, earth.pos);
  var nMatrix = mat3.create();
  mat3.normalFromMat4(nMatrix, mvMatrix);
  
  gl.useProgram(earthShader);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  gl.uniformMatrix3fv(earthShader.uNormalMatrix, false, nMatrix);
  gl.uniformMatrix4fv(earthShader.uMvMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(earthShader.uPMatrix, false, pMatrix);
  gl.uniformMatrix4fv(earthShader.uCamMatrix, false, camMatrix);
  gl.uniform3fv(earthShader.uLightDirection, lightDirection);
  gl.uniform3fv(earthShader.uAmbientLightColor, [0.03, 0.03, 0.03]); //RGB ambient light
  gl.uniform3fv(earthShader.uDirectionalLightColor, [1, 1, 0.9]); //RGB directional light
  
  gl.uniform1i(earthShader.uSampler, 0); //point sampler to TEXTURE0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture); //bind texture to TEXTURE0
  
  gl.uniform1i(earthShader.uNightSampler, 1);  //point sampler to TEXTURE1
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, nightTexture); //bind tex to TEXTURE1
  
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuf);
  gl.enableVertexAttribArray(earthShader.aTexCoord);
  gl.vertexAttribPointer(earthShader.aTexCoord, 2, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
  gl.enableVertexAttribArray(earthShader.aVertexPosition);
  gl.vertexAttribPointer(earthShader.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(gl.pickShaderProgram.aPos, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertNormBuf);
   gl.enableVertexAttribArray(earthShader.aVertexNormal);
  gl.vertexAttribPointer(earthShader.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertIndexBuf);
  gl.drawElements(gl.TRIANGLES, vertCount, gl.UNSIGNED_SHORT, 0);
  
  gl.useProgram(gl.pickShaderProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.uniformMatrix4fv(gl.pickShaderProgram.uMvMatrix, false, mvMatrix); //set up picking
  gl.disableVertexAttribArray(gl.pickShaderProgram.aColor);
  gl.enableVertexAttribArray(gl.pickShaderProgram.aPos);
  gl.drawElements(gl.TRIANGLES, vertCount, gl.UNSIGNED_SHORT, 0);
      
}

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


window.earth = earth;
})();