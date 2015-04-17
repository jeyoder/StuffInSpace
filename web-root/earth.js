//earth.js
(function() {
var earth = {};

var R2D = 180 / Math.PI

var NUM_LAT_SEGS = 32;
var NUM_LON_SEGS = 32;
var pos = [3.0, 0.0, 1.0];
var radius = 6371.0;

var vertPosBuf, vertNormBuf, texCoordBuf, vertIndexBuf; //GPU mem buffers, data and stuff?
var vertCount;

earth.pos = [0, 0, 0];

var loaded = false;

earth.init = function() {
  var startTime = new Date().getTime();	
  
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
      var u = 1-(lon / NUM_LON_SEGS); //may need to change to move map
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
  var numTris = 0;
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
  
  this.texture = gl.createTexture();
  var img = new Image();
  img.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, earth.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT	);
  //  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    console.log('earth.js loaded texture');
    $('#loader-text').text('Downloading satellites...');
    loaded = true;
  };
  img.src = '/mercator-tex.jpg';
  
  var end = new Date().getTime() - startTime;
  console.log('earth init: ' + end + ' ms');
};

earth.draw = function() {
  if(!loaded) return;
  gl.useProgram(gl.shaderProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  
  var mvMatrix = mat4.create();
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, mvMatrix, earth.pos);
  gl.setMvMatrix(mvMatrix);
  
  var texAmountUniform = gl.getUniformLocation(gl.shaderProgram, 'texAmount');
  gl.uniform1f(texAmountUniform, 1.0);
  
  var samplerUniform = gl.getUniformLocation(gl.shaderProgram, 'sampler');
  gl.uniform1i(samplerUniform, 0); 
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  
  gl.enableVertexAttribArray(gl.texCoordAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuf);
  gl.vertexAttribPointer(gl.texCoordAttrib, 2, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.vertexPositionAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
  gl.vertexAttribPointer(gl.vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0);
  gl.vertexAttribPointer(gl.pickShaderProgram.aPos, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertNormBuf);
  gl.vertexAttribPointer(gl.vertexNormalAttrib, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertIndexBuf);
  gl.drawElements(gl.TRIANGLES, vertCount, gl.UNSIGNED_SHORT, 0);
  
  gl.useProgram(gl.pickShaderProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.uniformMatrix4fv(gl.pickShaderProgram.uMvMatrix, false, mvMatrix); //set up picking
  gl.disableVertexAttribArray(gl.pickShaderProgram.aColor);
  gl.enableVertexAttribArray(gl.pickShaderProgram.aPos);
  gl.drawElements(gl.TRIANGLES, vertCount, gl.UNSIGNED_SHORT, 0);
      
//gl.drawElements(gl.TRIANGLES, 64, gl.UNSIGNED_SHORT, 0);

}


window.earth = earth;
})();