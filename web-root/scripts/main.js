/* global vec3 */
/* global mat3 */
/* global earth */
/* global searchBox */
/* global Spinner */
/* global sun */
/* global orbitDisplay */
var gl;
var cubeVertIndexBuffer;
var camX = 0;
var camY = -10000;
var camZ = 0;
var camSpeedX = 0;
var camSpeedY = 0;
var camSpeedZ = 0;
var camRotSpeedX = 0;
var camRotSpeedY = 0;
var camRotSpeedZ = 0;
var camPitch = 0;
var camYaw = 0;
var camRoll = 0;

var groundVertPositionBuffer, groundTexCoordBuffer;
var cubeVertPositionBuffer, cubeVertIndexBuffer, cubeVertColorBuffer, cubeVertNormalBuffer;
var vertexPositionAttrib, vertexColorAttrib, texCoordAttrib, vertexNormalAttrib;

var pickFb, pickTex;
var pickColorMap;

var mouseX = 0, mouseY = 0, mouseSat = -1;

var debugContext, debugImageData;

var spinner;
$(document).ready(function() {
  var opts = {
    lines: 11, // The number of lines to draw
    length: 8, // The length of each line
    width: 5, // The line thickness
    radius: 8, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#fff', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 50, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };
  var target = document.getElementById('spinner');
  spinner = new Spinner(opts).spin(target);
  
	satSet.onLoadSatData(searchBox.init);
  
  var can = $('#canvas')[0];    
  gl = webGlInit(can);
  earth.init();
  satSet.init();
  orbitDisplay.init();
    
    var keySpeed = 15;
    var rotSpeed = 0.0025;
    $(document).keydown(function(evt) {
      if(evt.which === 69) camSpeedZ = keySpeed; //E
      if(evt.which === 81) camSpeedZ = -keySpeed; //Q
      if(evt.which === 83) camSpeedY = -keySpeed; //S
      if(evt.which === 87) camSpeedY = keySpeed; //W
      if(evt.which === 68) camSpeedX = keySpeed; //D
      if(evt.which === 65) camSpeedX = -keySpeed; //A
      if(evt.which === 37) camRotSpeedZ = -rotSpeed; //Left
      if(evt.which === 39) camRotSpeedZ =  rotSpeed; //Right
      if(evt.which === 38) camRotSpeedX = -rotSpeed; //Up
      if(evt.which === 40) camRotSpeedX =  rotSpeed; //Down
 //     console.log(evt.which);
    });
    
    $(document).keyup(function (evt) {
      if(evt.which === 69) camSpeedZ = 0; //E
      if(evt.which === 81) camSpeedZ = 0; //Q
      if(evt.which === 87) camSpeedY = 0;//lW
      if(evt.which === 83) camSpeedY = 0; //S
      if(evt.which === 65) camSpeedX = 0; //D
      if(evt.which === 68) camSpeedX = 0; //A
      if(evt.which === 37) camRotSpeedZ = 0; //Left
      if(evt.which === 39) camRotSpeedZ = 0; //Right
      if(evt.which === 38) camRotSpeedX = 0; //Up
      if(evt.which === 40) camRotSpeedX = 0; //Down
    });
    
    $('#canvas').mousemove(function(evt) {
      mouseX = evt.offsetX;
      mouseY = evt.offsetY;
    });
    
    $('#canvas').click(function(evt) {
      var clickedSat = getSatIdFromCoord(evt.offsetX, evt.offsetY);
      selectSat(clickedSat);
      $('#search-results').slideUp();
    });
    
 //   debugContext = $('#debug-canvas')[0].getContext('2d');
 //   debugImageData = debugContext.createImageData(debugContext.canvas.width, debugContext.canvas.height);
  drawLoop(); //kick off the animationFrame()s
});

function selectSat(satId) {
  if(satId === -1) {
    $('#sat-infobox').fadeOut();
     orbitDisplay.clearSelectOrbit();
  } else {
    satSet.selectSat(satId);
    var sat = satSet.getSat(satId);
    if(!sat) return;
    orbitDisplay.setSelectOrbit(satId);
    $('#sat-infobox').fadeIn();
    $('#sat-info-title').html(sat.OBJECT_NAME);
    $('#sat-intl-des').html(sat.intlDes);
    $('#sat-type').html(sat.OBJECT_TYPE);
       
  }
}


function webGlInit(can) {
  var gl = can.getContext('webgl', {alpha: false}) || can.getContext('experimental-webgl', {alpha: false});
  if(!gl) {
      alert('No Webgl!');
  }
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  // init shaders
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  var fragCode = shaderLoader.getShaderCode('earth-fragment.glsl');
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);
  
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  var vertCode = shaderLoader.getShaderCode('earth-vertex.glsl');
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);
  
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  gl.shaderProgram = shaderProgram;
  
  vertexPositionAttrib = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.vertexPositionAttrib = vertexPositionAttrib;
  gl.enableVertexAttribArray(vertexPositionAttrib);
  
  texCoordAttrib = gl.getAttribLocation(shaderProgram, 'aTexCoord');
  gl.texCoordAttrib = texCoordAttrib;
  gl.enableVertexAttribArray(texCoordAttrib);
  
  vertexNormalAttrib = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  gl.vertexNormalAttrib = vertexNormalAttrib;
  gl.enableVertexAttribArray(vertexNormalAttrib);
  
  gl.enable(gl.DEPTH_TEST);
  
  gl.setMvMatrix = function(mvMatrix) {
    var mvMatrixUniform = gl.getUniformLocation(gl.shaderProgram, 'mvMatrix');
    var normalMatrixUnif = gl.getUniformLocation(gl.shaderProgram, 'normalMatrix');
    
    var nMatrix = mat3.create();
    mat3.normalFromMat4(nMatrix, mvMatrix);
    
    gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix3fv(normalMatrixUnif, false, nMatrix);
  };
  
  var pFragShader = gl.createShader(gl.FRAGMENT_SHADER);
  var pFragCode = shaderLoader.getShaderCode('pick-fragment.glsl');
  gl.shaderSource(pFragShader, pFragCode);
  gl.compileShader(pFragShader);
  
  var pVertShader = gl.createShader(gl.VERTEX_SHADER);
  var pVertCode = shaderLoader.getShaderCode('pick-vertex.glsl');
  gl.shaderSource(pVertShader, pVertCode);
  gl.compileShader(pVertShader);
  
  var pickShaderProgram = gl.createProgram();
  gl.attachShader(pickShaderProgram, pVertShader);
  gl.attachShader(pickShaderProgram, pFragShader);
  gl.linkProgram(pickShaderProgram);
  
  pickShaderProgram.aPos = gl.getAttribLocation(pickShaderProgram, 'aPos');
  pickShaderProgram.aColor = gl.getAttribLocation(pickShaderProgram, 'aColor');
  pickShaderProgram.uCamMatrix = gl.getUniformLocation(pickShaderProgram, 'uCamMatrix');
  pickShaderProgram.uMvMatrix = gl.getUniformLocation(pickShaderProgram, 'uMvMatrix');
  pickShaderProgram.uPMatrix = gl.getUniformLocation(pickShaderProgram, 'uPMatrix');
  
  gl.pickShaderProgram = pickShaderProgram;
  
  pickFb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickFb);
  
  pickTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, pickTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //makes clearing work
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  
  var rb = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.drawingBufferWidth, gl.drawingBufferHeight);
  
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickTex, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
  
  gl.pickFb = pickFb;
  
  pickColorMap = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  
  return gl;
}
 

function loadTexture() {
  gl.bindTexture(gl.TEXTURE_2D, groundTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, groundImage);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}

var oldT = new Date();
function drawLoop() {
  var newT = new Date();
  var dt = newT - oldT;
  oldT = newT;
  
 // console.log('th: ' + camYaw + ' x: ' + camX + ' y: ' + camY + ' sy: ' + camSpeedY);
  drawScene();
  camX += ((camSpeedX * Math.cos(camYaw)) + (camSpeedY * Math.sin(camYaw))) * dt; //need to rotate somewhere
  camY += ((camSpeedY * Math.cos(camYaw)) - (camSpeedX * Math.sin(camYaw))) * dt;
  camZ += camSpeedZ * dt;
  camPitch += camRotSpeedX * dt;
  camYaw += camRotSpeedZ * dt;
  camRoll += camRotSpeedY * dt;
  requestAnimationFrame(drawLoop);
}

function drawScene() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  var pMatrixUniform = gl.getUniformLocation(gl.shaderProgram, 'pMatrix'); 
  var camMatrixUniform = gl.getUniformLocation(gl.shaderProgram, 'camMatrix');
 
  var ambientLightUnif = gl.getUniformLocation(gl.shaderProgram, 'ambientLightColor');
  var directionalLightUnif = gl.getUniformLocation(gl.shaderProgram, 'directionalLightColor');
  var lightDirectionUnif = gl.getUniformLocation(gl.shaderProgram, 'lightDirection');
 
  
  var pMatrix = mat4.create();
  mat4.perspective(pMatrix, 1.01, gl.drawingBufferWidth / gl.drawingBufferHeight, 20.0, 300000.0);
 /* var eciToOpenGlMat = [   OpenGL Matrix memory layout is very dumb
  1,  0,  0,  0,
  0,  0,  1,  0,
  0, -1,  0,  0,
  0,  0,  0,  1
  ];*/
  
  var eciToOpenGlMat = [
    1,  0,  0,  0,
    0,  0, -1,  0,
    0,  1,  0,  0,
    0,  0,  0,  1
  ];
 
  mat4.mul(pMatrix, pMatrix, eciToOpenGlMat); //pMat = pMat * ecioglMat 
  var camMatrix = mat4.create();
  mat4.identity(camMatrix);
  mat4.rotateX(camMatrix, camMatrix, camPitch);
  mat4.rotateZ(camMatrix, camMatrix, camYaw);
  mat4.rotateY(camMatrix, camMatrix, camRoll);
  mat4.translate(camMatrix, camMatrix, [-camX, -camY, -camZ]);
 
  var adjustedLightDirection = sun.currentDirection();
 // console.log(sun.currentDirection());
  vec3.normalize(adjustedLightDirection, adjustedLightDirection); //light direction
 // vec3.scale(adjustedLightDirection, adjustedLightDirection, -1); //light vector according to gl points TOWARDS the light

  
  gl.useProgram(gl.shaderProgram);
    gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(camMatrixUniform, false, camMatrix);
    gl.uniform3fv(lightDirectionUnif, adjustedLightDirection);
    gl.uniform3fv(ambientLightUnif, [0.03, 0.03, 0.03]); //RGB ambient light
    gl.uniform3fv(directionalLightUnif, [1, 1, 0.9]); //RGB directional light
    
  gl.useProgram(gl.pickShaderProgram);
    gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(gl.pickShaderProgram.camMatrix, false,camMatrix);
   

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  earth.draw();

  satSet.draw(pMatrix, camMatrix);
  
  orbitDisplay.draw(pMatrix, camMatrix);
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pickColorMap);
  
  /* DEBUG - show the pickbuffer on a canvas */
 // debugImageData.data = pickColorMap;
 /* debugImageData.data.set(pickColorMap);
  debugContext.putImageData(debugImageData, 0, 0);*/
  
 updateHover();
}

/*function getSunAngle() {
  var now = new Date();   
  var j = 	jday(now.getUTCFullYear(), 
               now.getUTCMonth() + 1, // Note, this function requires months in range 1-12. 
               now.getUTCDate(),
               now.getUTCHours(), 
               now.getUTCMinutes(), 
               now.getUTCSeconds());
  j += now.getUTCMilliseconds() * 1.15741e-8; //days per millisecond
  var n = j - 245145.0;
  var L = 
}*/

function updateHover() {
  mouseSat = getSatIdFromCoord(mouseX, mouseY);
  
  satSet.setHover(mouseSat);
  
  if(mouseSat === -1) {
    $('#sat-hoverbox').html('(none)');
    $('#sat-hoverbox').css({display: 'none'});
    $('#canvas').css({cursor : 'default'});
    orbitDisplay.clearHoverOrbit();
  } else {
   try{
      $('#sat-hoverbox').html(satSet.getSat(mouseSat).OBJECT_NAME);
  // $('#sat-hoverbox').html(satId);
      $('#sat-hoverbox').css({
        display: 'block',
        position: 'absolute',
        left: mouseX + 20,
        top: mouseY - 10
      });
      $('#canvas').css({cursor : 'pointer'});
      orbitDisplay.setHoverOrbit(mouseSat);
    } catch(e){}
  }
}

function getSatIdFromCoord(x, y) {
  var pixelAddress = ((gl.drawingBufferHeight - 1 - y) * gl.drawingBufferWidth + x) * 4;
  var pickR = pickColorMap[pixelAddress];
  var pickG = pickColorMap[pixelAddress+1];
  var pickB = pickColorMap[pixelAddress+2];
  return((pickB << 16) | (pickG << 8) | (pickR)) - 1;
}




