var gl;
var rotAngle = 0;
var cubeVertIndexBuffer;
var camX = 0;
var camY = 0;
var camZ = 10000;
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
var vertexPositionAttrib, vertexColorAttrib, texCoordAttrib;

var pickFb, pickTex;
var pickColorMap;

var groundTexture, groundImage;
var mouseX = 0, mouseY = 0, mouseSat = -1;

var debugContext, debugImageData;

$(document).ready(function() {
    var can = $('#canvas')[0];
    var fragGet = $.get('/fragment.glsl');
    var vertGet = $.get('/vertex.glsl');
    var pFragGet = $.get('/pick-fragment.glsl');
    var pVertGet = $.get('/pick-vertex.glsl');
    $.when(fragGet, vertGet, pFragGet, pVertGet).done(function(fragData, vertData, pFragData, pVertData) {
            gl = webGlInit(can, fragData[0], vertData[0], pFragData[0], pVertData[0]);
            earth.init();
            satSet.init();
            drawLoop();
    
    });
    
    var keySpeed = 400;
    var rotSpeed = 0.05;
    $(document).keydown(function(evt) {
      if(evt.which === 69) camSpeedY = keySpeed; //E
      if(evt.which === 81) camSpeedY = -keySpeed; //Q
      if(evt.which === 83) camSpeedZ = keySpeed; //S
      if(evt.which === 87) camSpeedZ = -keySpeed; //W
      if(evt.which === 68) camSpeedX = keySpeed; //D
      if(evt.which === 65) camSpeedX = -keySpeed; //A
      if(evt.which === 37) camRotSpeedY = -rotSpeed; //Left
      if(evt.which === 39) camRotSpeedY =  rotSpeed; //Right
      if(evt.which === 38) camRotSpeedX = -rotSpeed; //Up
      if(evt.which === 40) camRotSpeedX =  rotSpeed; //Down
 //     console.log(evt.which);
    });
    
    $(document).keyup(function (evt) {
      if(evt.which === 69) camSpeedY = 0 //E
      if(evt.which === 81) camSpeedY = 0 //Q
      if(evt.which === 87) camSpeedZ = 0//W
      if(evt.which === 83) camSpeedZ = 0 //S
      if(evt.which === 65) camSpeedX = 0 //D
      if(evt.which === 68) camSpeedX = 0 //A
      if(evt.which === 37) camRotSpeedY = 0; //Left
      if(evt.which === 39) camRotSpeedY = 0; //Right
      if(evt.which === 38) camRotSpeedX = 0; //Up
      if(evt.which === 40) camRotSpeedX = 0; //Down
    });
    
    $('#canvas').mousemove(function(evt) {
      mouseX = evt.offsetX;
      mouseY = evt.offsetY;
    });
    
    $('#canvas').click(function(evt) {
      var clickedSat = getSatIdFromCoord(evt.offsetX, evt.offsetY);
      if(clickedSat === -1) {
        $('#sat-infobox').fadeOut();
      } else {
        var sat = satSet.getSat(clickedSat);
        if(!sat) return;
        $('#sat-infobox').fadeIn();
        $('#sat-info-title').html(sat.OBJECT_NAME);
        $('#sat-intl-des').html(sat.intlDes);
        $('#sat-type').html(sat.OBJECT_TYPE);
      }
    });
    
 //   debugContext = $('#debug-canvas')[0].getContext('2d');
 //   debugImageData = debugContext.createImageData(debugContext.canvas.width, debugContext.canvas.height);
});



function webGlInit(can, fragCode, vertCode, pFragCode, pVertCode) {
  var gl = can.getContext('webgl') || can.getContext('experimental-webgl');
  if(!gl) {
      alert('No Webgl!');
  }
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  // init shaders
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);
  
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
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
  
  groundTexture = gl.createTexture();
  groundImage = new Image();
  groundImage.onload = loadTexture;
  groundImage.src = '/ground.jpg';
  
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
  gl.shaderSource(pFragShader, pFragCode);
  gl.compileShader(pFragShader);
  
  var pVertShader = gl.createShader(gl.VERTEX_SHADER);
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

function drawLoop() {
  drawScene();
  rotAngle += 0.05;
  camX += (camSpeedX * Math.cos(camYaw)) + (camSpeedZ * Math.sin(camYaw) * -1); //need to rotate somewhere
  camY += camSpeedY
  camZ += (camSpeedZ * Math.cos(camYaw)) + (camSpeedX * Math.sin(camYaw));
  camPitch += camRotSpeedX;
  camYaw += camRotSpeedY;
  camRoll += camRotSpeedZ;
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
  var texAmountUniform = gl.getUniformLocation(gl.shaderProgram, 'texAmount');
  var samplerUniform = gl.getUniformLocation(gl.shaderProgram, 'sampler');
 
  var ambientLightUnif = gl.getUniformLocation(gl.shaderProgram, 'ambientLightColor');
  var directionalLightUnif = gl.getUniformLocation(gl.shaderProgram, 'directionalLightColor');
  var lightDirectionUnif = gl.getUniformLocation(gl.shaderProgram, 'lightDirection');
 
  
  var pMatrix = mat4.create();
  mat4.perspective(pMatrix, 1.01, gl.drawingBufferWidth / gl.drawingBufferHeight, 20.0, 150000.0);
 
  var camMatrix = mat4.create();
  mat4.identity(camMatrix);
  mat4.rotateX(camMatrix, camMatrix, camPitch);
  mat4.rotateY(camMatrix, camMatrix, camYaw);
  mat4.rotateZ(camMatrix, camMatrix, camRoll);
  mat4.translate(camMatrix, camMatrix, [-camX, -camY, -camZ]);
 
  var adjustedLightDirection = vec3.create();
  vec3.normalize(adjustedLightDirection, [1, 0, 0]); //light direction
  vec3.scale(adjustedLightDirection, adjustedLightDirection, -1); //light vector according to gl points TOWARDS the light

  
  gl.useProgram(gl.shaderProgram);
    gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(camMatrixUniform, false, camMatrix);
    gl.uniform3fv(lightDirectionUnif, adjustedLightDirection);
    gl.uniform3fv(ambientLightUnif, [0.05, 0.05, 0.05]); //RGB ambient light
    gl.uniform3fv(directionalLightUnif, [0.9, 0.9, 0.85]); //RGB directional light
    
  gl.useProgram(gl.pickShaderProgram);
    gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(gl.pickShaderProgram.camMatrix, false,camMatrix);
   

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  earth.draw();

  satSet.draw(pMatrix, camMatrix);
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pickColorMap);
  
  /* DEBUG - show the pickbuffer on a canvas */
 // debugImageData.data = pickColorMap;
 /* debugImageData.data.set(pickColorMap);
  debugContext.putImageData(debugImageData, 0, 0);*/
  
 updateHover();
}

function updateHover() {
  mouseSat = getSatIdFromCoord(mouseX, mouseY);
  
  satSet.setHover(mouseSat);
  
  if(mouseSat === -1) {
    $('#sat-hoverbox').html('(none)');
    $('#sat-hoverbox').css({display: 'none'});
    $('#canvas').css({cursor : 'default'});
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




