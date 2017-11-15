/* global groups */
/* global ColorScheme */
/* global satSet */
/* global $ */
/* global shaderLoader */
/* global Line */
/* global vec4 */
/* global mat4 */
/* global vec3 */
/* global mat3 */
/* global earth */
/* global searchBox */
/* global Spinner */
/* global sun */
/* global orbitDisplay */
var gl;
var cubeVertIndexBuffer;

var R2D = 180 / Math.PI;

var camYaw = 0;
var camPitch = 0.5;

var camYawTarget = 0;
var camPitchTarget = 0;
var camSnapMode = false;
var camZoomSnappedOnSat = false;
var camAngleSnappedOnSat = false;

var camDistTarget = 10000;
var zoomLevel = 0.5;
var zoomTarget = 0.5;
var ZOOM_EXP = 3;
var DIST_MIN = 6400;
var DIST_MAX = 200000;

var camPitchSpeed = 0;
var camYawSpeed = 0;

var pickFb, pickTex;
var pickColorBuf;

var pMatrix = mat4.create(), camMatrix = mat4.create();

var selectedSat = -1;

var mouseX = 0, mouseY = 0, mouseSat = -1;

var dragPoint = [0,0,0];
var screenDragPoint = [0,0];
var dragStartPitch = 0;
var dragStartYaw = 0;
var isDragging = false;
var dragHasMoved = false;

var initialRotation = true;
var initialRotSpeed = 0.000075;

var debugContext, debugImageData;

var debugLine, debugLine2, debugLine3;
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

  $('#search-results').perfectScrollbar();
 
  var resizing = false;
  
  $(window).resize(function() {
    if(!resizing) {
      window.setTimeout(function() {
        resizing = false;
        webGlInit();
      }, 500);
    } 
    resizing = true;
  });
  
  webGlInit();
  earth.init();
  ColorScheme.init();
  satSet.init(function(satData) {
    orbitDisplay.init();
    groups.init();
    searchBox.init(satData);
    
    debugLine = new Line();
    debugLine2 = new Line();
    debugLine3 = new Line();
  });

  satSet.onCruncherReady(function(satData) {
    //do querystring stuff
    var queryStr = window.location.search.substring(1);
    var params = queryStr.split('&');
    for(var i=0; i < params.length; i++){
      var key = params[i].split('=')[0];
      var val = params[i].split('=')[1];
      if(key === 'intldes') {
        console.log('url snapping to ' + val);
        var urlSatId = satSet.getIdFromIntlDes(val.toUpperCase());
        if(urlSatId !== null) {
          selectSat(urlSatId);
        }
      } else if (key === 'search') {
        console.log('preloading search to ' + val);
        searchBox.doSearch(val);
        $('#search').val(val);
      }
    }

    searchBox.init(satData);
  });
    
	$('#canvas').on('touchmove', function(evt) {
		evt.preventDefault();
	  if(isDragging) {
      dragHasMoved = true;
      camAngleSnappedOnSat = false;
      camZoomSnappedOnSat = false;
    }
      mouseX = evt.originalEvent.touches[0].clientX;
      mouseY = evt.originalEvent.touches[0].clientY;
	});
	
    $('#canvas').mousemove(function(evt) {
      if(isDragging) {
        dragHasMoved = true;
        camAngleSnappedOnSat = false;
        camZoomSnappedOnSat = false;
      }
      mouseX = evt.clientX;
      mouseY = evt.clientY;
    });
    
    $('#canvas').on('wheel', function (evt) {
      var delta = evt.originalEvent.deltaY;
      if(evt.originalEvent.deltaMode === 1) {
        delta *= 33.3333333;
      }
      zoomTarget += delta * 0.0002;
      if(zoomTarget > 1) zoomTarget = 1;
      if(zoomTarget < 0) zoomTarget = 0;
      initialRotation = false;
      camZoomSnappedOnSat = false;
    });
    
    $('#canvas').click(function(evt) {
	  
    
    });
    
    $('#canvas').contextmenu(function() {
     return false; //stop right-click menu
    });
	
    $('#canvas').mousedown(function(evt){
   //   if(evt.which === 3) {//RMB
        dragPoint = getEarthScreenPoint(evt.clientX, evt.clientY);
        screenDragPoint = [evt.clientX, evt.clientY];
        dragStartPitch = camPitch;
        dragStartYaw = camYaw;
     //   debugLine.set(dragPoint, getCamPos());
        isDragging = true;
        camSnapMode = false;
        initialRotation = false;
   //   }
    });
	
	$('#canvas').on('touchstart', function (evt) {
    var x = evt.originalEvent.touches[0].clientX;
    var y = evt.originalEvent.touches[0].clientY;
		dragPoint = getEarthScreenPoint(x,y);
    screenDragPoint = [x,y];
    dragStartPitch = camPitch;
    dragStartYaw = camYaw;
     //   debugLine.set(dragPoint, getCamPos());
    isDragging = true;
    camSnapMode = false;
    initialRotation = false;
	});
    
    $('#canvas').mouseup(function(evt){
   //   if(evt.which === 3) {//RMB
		if(!dragHasMoved) {
		  var clickedSat = getSatIdFromCoord(evt.clientX, evt.clientY);
      if(clickedSat === -1) searchBox.hideResults();
		  selectSat(clickedSat);
	    }
		dragHasMoved = false;
        isDragging = false;
        initialRotation = false;
  //    }
    });
	
	$('#canvas').on('touchend', function(evt) {
		dragHasMoved = false;
    isDragging = false;
    initialRotation = false;
	});
    
    $('.menu-item').mouseover(function(evt){
      $(this).children('.submenu').css({
        display: 'block'
      });
    });
    
    $('.menu-item').mouseout(function(evt){
      $(this).children('.submenu').css({
        display: 'none'
      });
    });
    
    $('#zoom-in').click(function() {
      zoomTarget -= 0.04;
      if(zoomTarget < 0) zoomTarget = 0;
      initialRotation = false;
      camZoomSnappedOnSat = false;
    });
    
    $('#zoom-out').click(function() {
      zoomTarget += 0.04;
      if(zoomTarget > 1) zoomTarget = 1;
      initialRotation = false;
      camZoomSnappedOnSat = false;
    });
 //   debugContext = $('#debug-canvas')[0].getContext('2d');
 //   debugImageData = debugContext.createImageData(debugContext.canvas.width, debugContext.canvas.height);
  drawLoop(); //kick off the animationFrame()s
});

function selectSat(satId) {
  selectedSat = satId;
  if(satId === -1) {
    $('#sat-infobox').fadeOut();
     orbitDisplay.clearSelectOrbit();
  } else {
    camZoomSnappedOnSat = true;
    camAngleSnappedOnSat = true;

    satSet.selectSat(satId);
 //   camSnapToSat(satId);
    var sat = satSet.getSat(satId);
    if(!sat) return;
    orbitDisplay.setSelectOrbit(satId);
    $('#sat-infobox').fadeIn();
    $('#sat-info-title').html(sat.OBJECT_NAME);
    $('#sat-intl-des').html(sat.intlDes);
    $('#sat-type').html(sat.OBJECT_TYPE);
    $('#sat-apogee').html(sat.apogee.toFixed(0) + ' km');
    $('#sat-perigee').html(sat.perigee.toFixed(0) + ' km');
    $('#sat-inclination').html((sat.inclination * R2D).toFixed(2) + '°');  
    $('#sat-period').html(sat.period.toFixed(2) + ' min');
  }
  updateUrl();
}

function browserUnsupported() {
  $('#canvas-holder').hide();
  $('#no-webgl').css('display', 'block');
}

function webGlInit() {
  var can = $('#canvas')[0];
  
  can.width = window.innerWidth;
  can.height = window.innerHeight;
 
  var gl = can.getContext('webgl', {alpha: false}) || can.getContext('experimental-webgl', {alpha: false});
  if(!gl) {
      browserUnsupported();
  }
  
  gl.viewport(0, 0, can.width, can.height);
  
  gl.enable(gl.DEPTH_TEST);
  gl.enable(0x8642); //enable point sprites(?!) This might get browsers with 
                     // underlying OpenGL to behave
                     //although it's not technically a part of the WebGL standard
  
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
  pickShaderProgram.aPickable = gl.getAttribLocation(pickShaderProgram, 'aPickable');
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
  
  var rb = gl.createRenderbuffer(); //create RB to store the depth buffer
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.drawingBufferWidth, gl.drawingBufferHeight);
  
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickTex, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
  
  gl.pickFb = pickFb;
  
  pickColorBuf = new Uint8Array(4);
  
  pMatrix = mat4.create();
  mat4.perspective(pMatrix, 1.01, gl.drawingBufferWidth / gl.drawingBufferHeight, 20.0, 600000.0);
  var eciToOpenGlMat = [
    1,  0,  0,  0,
    0,  0, -1,  0,
    0,  1,  0,  0,
    0,  0,  0,  1
  ];
  mat4.mul(pMatrix, pMatrix, eciToOpenGlMat); //pMat = pMat * ecioglMat 
  
  window.gl = gl;
}

function getCamPos() {
  var r = getCamDist();
  var z = r * Math.sin(camPitch);
  var rYaw = r * Math.cos(camPitch);
  var x = rYaw * Math.sin(camYaw);
  var y = rYaw * Math.cos(camYaw) * -1;
  return [x, y, z];
}

function unProject(mx, my) {
  var glScreenX = (mx / gl.drawingBufferWidth * 2) - 1.0;
  var glScreenY = 1.0 - (my / gl.drawingBufferHeight * 2);
  var screenVec = [glScreenX, glScreenY, -0.01, 1.0]; //gl screen coords
 
  var comboPMat = mat4.create();
  mat4.mul(comboPMat, pMatrix, camMatrix);
  var invMat = mat4.create();
  mat4.invert(invMat, comboPMat);
  var worldVec = vec4.create();
  vec4.transformMat4(worldVec, screenVec, invMat);
 
  return [worldVec[0] / worldVec[3], worldVec[1] / worldVec[3], worldVec[2] / worldVec[3]];
}

function getEarthScreenPoint(x, y) {
//  var start = performance.now();
  
  var rayOrigin = getCamPos();
  var ptThru = unProject(x, y);

  var rayDir = vec3.create();
  vec3.subtract(rayDir, ptThru, rayOrigin); //rayDir = ptThru - rayOrigin
  vec3.normalize(rayDir, rayDir);

  var toCenterVec = vec3.create();
  vec3.scale(toCenterVec, rayOrigin, -1); //toCenter is just -camera pos because center is at [0,0,0]
  var dParallel = vec3.dot(rayDir, toCenterVec);
  
  var longDir = vec3.create();
  vec3.scale(longDir, rayDir, dParallel); //longDir = rayDir * distParallel
  vec3.add(ptThru, rayOrigin, longDir); //ptThru is now on the plane going through the center of sphere
  var dPerp = vec3.len(ptThru);
  
  var dSubSurf = Math.sqrt(6371*6371 - dPerp*dPerp);
  var dSurf = dParallel - dSubSurf;
  
  var ptSurf = vec3.create();
  vec3.scale(ptSurf, rayDir, dSurf);
  vec3.add(ptSurf, ptSurf, rayOrigin);
  
 // console.log('earthscreenpt: ' + (performance.now() - start) + ' ms');
  
  return ptSurf;
}


function getCamDist() {
  return Math.pow(zoomLevel, ZOOM_EXP) * (DIST_MAX - DIST_MIN) + DIST_MIN;
}

function camSnapToSat(satId) {
  /* this function runs every frame that a satellite is seleected. However, the user might have broken out of the
  zoom snap or angle snap. If so, don't change those targets. */
 
  var sat = satSet.getSat(satId);

  if(camAngleSnappedOnSat) {
    var pos = sat.position;
    var r = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    var yaw = Math.atan2(pos.y, pos.x) + Math.PI/2;
    var pitch = Math.atan2(pos.z, r);
    camSnap(pitch, yaw);
  }
  
  if(camZoomSnappedOnSat) {
    var camDistTarget = sat.altitude + 6371 + 2000;
    zoomTarget = Math.pow((camDistTarget - DIST_MIN) / (DIST_MAX - DIST_MIN), 1/ZOOM_EXP);
  }
}

function camSnap(pitch, yaw) {
  camPitchTarget = pitch;
  camYawTarget = normalizeAngle(yaw);
  camSnapMode = true;
}

function normalizeAngle(angle) {
  angle %= Math.PI * 2;
  if(angle > Math.PI) angle -= Math.PI*2;
  if(angle < -Math.PI) angle += Math.PI*2;
  return angle;
}


var oldT = new Date();
function drawLoop() {
  var newT = new Date();
  var dt = Math.min(newT - oldT, 1000);
  oldT = newT;
  var dragTarget = getEarthScreenPoint(mouseX, mouseY);
  if(isDragging) {
       if(isNaN(dragTarget[0]) || isNaN(dragTarget[1]) || isNaN(dragTarget[2])
       || isNaN(dragPoint[0]) || isNaN(dragPoint[1]) || isNaN(dragPoint[2])) { //random screen drag
         var xDif = screenDragPoint[0] - mouseX;
         var yDif = screenDragPoint[1] - mouseY;
         var yawTarget = dragStartYaw + xDif*0.005;
         var pitchTarget = dragStartPitch + yDif*-0.005;
         camPitchSpeed = normalizeAngle(camPitch - pitchTarget) * -0.005;
         camYawSpeed = normalizeAngle(camYaw - yawTarget) * -0.005;
       } else {  //earth surface point drag  
        var dragPointR = Math.sqrt(dragPoint[0]*dragPoint[0] + dragPoint[1]*dragPoint[1]);
        var dragTargetR = Math.sqrt(dragTarget[0]*dragTarget[0] + dragTarget[1]*dragTarget[1]);
        
        var dragPointLon =  Math.atan2(dragPoint[1], dragPoint[0]);
        var dragTargetLon = Math.atan2(dragTarget[1], dragTarget[0]);
        
        var dragPointLat = Math.atan2(dragPoint[2] , dragPointR);
        var dragTargetLat = Math.atan2(dragTarget[2] , dragTargetR);
        
        var pitchDif = dragPointLat - dragTargetLat;
        var yawDif = normalizeAngle(dragPointLon - dragTargetLon);
        camPitchSpeed = pitchDif * 0.015;
        camYawSpeed = yawDif * 0.015;
      }
      camSnapMode = false;
  } else {
    camPitchSpeed -= (camPitchSpeed * dt * 0.005); //decay speeds when globe is "thrown"
    camYawSpeed -= (camYawSpeed * dt * 0.005);
  }
  
  camPitch += camPitchSpeed * dt;
  camYaw += camYawSpeed * dt;
  
  if(initialRotation) {
    camYaw += initialRotSpeed * dt;
  }
  
  if(camSnapMode) { 
    camPitch += (camPitchTarget - camPitch) * 0.003 * dt;
    
    var yawErr = normalizeAngle(camYawTarget - camYaw);
    camYaw += yawErr * 0.003 * dt;
    
 /*   if(Math.abs(camPitchTarget - camPitch) < 0.002 && Math.abs(camYawTarget - camYaw) < 0.002 && Math.abs(zoomTarget - zoomLevel) < 0.002) {
      camSnapMode = false; Stay in camSnapMode forever. Is this a good idea? dunno....
    }*/
     zoomLevel = zoomLevel + (zoomTarget - zoomLevel)*dt*0.0025;
  } else {
     zoomLevel = zoomLevel + (zoomTarget - zoomLevel)*dt*0.0075;
  }
  
  if(camPitch > Math.PI/2) camPitch = Math.PI/2;
  if(camPitch < -Math.PI/2) camPitch = -Math.PI/2;
 // camYaw = (camYaw % (Math.PI*2));
 camYaw = normalizeAngle(camYaw);
// console.log(camYaw * R2D);
  if (selectedSat !== -1) {
    var sat = satSet.getSat(selectedSat);
    debugLine.set(sat, [0,0,0]);
    camSnapToSat(selectedSat);
  }

  drawScene();
  updateHover();
  updateSelectBox();
  requestAnimationFrame(drawLoop);
}


function drawScene() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 // gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 
  camMatrix = mat4.create();
  mat4.identity(camMatrix);
  mat4.translate(camMatrix, camMatrix, [0, getCamDist(), 0]);
  mat4.rotateX(camMatrix, camMatrix, camPitch);
  mat4.rotateZ(camMatrix, camMatrix, -camYaw);
  
  gl.useProgram(gl.pickShaderProgram);
    gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(gl.pickShaderProgram.camMatrix, false,camMatrix);
   

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(debugLine) debugLine.draw();
  if(debugLine2)debugLine2.draw();
  if(debugLine3)debugLine3.draw();
  earth.draw(pMatrix, camMatrix);
  satSet.draw(pMatrix, camMatrix);
  orbitDisplay.draw(pMatrix, camMatrix);
 
  
  /* DEBUG - show the pickbuffer on a canvas */
 // debugImageData.data = pickColorMap;
 /* debugImageData.data.set(pickColorMap);
  debugContext.putImageData(debugImageData, 0, 0);*/
}

function updateSelectBox() {
  if(selectedSat === -1) return;
  var satData = satSet.getSat(selectedSat);
  $('#sat-altitude').html(satData.altitude.toFixed(2) + ' km');
  $('#sat-velocity').html(satData.velocity.toFixed(2) + ' km/s');
}

function updateHover() {
  if(searchBox.isHovering()) {
    var satId =  searchBox.getHoverSat();
    var satPos = satSet.getScreenCoords(satId, pMatrix, camMatrix);
    if(!earthHitTest(satPos.x, satPos.y)) {
      hoverBoxOnSat(satId, satPos.x, satPos.y);
    } else {
      hoverBoxOnSat(-1, 0, 0);
    }
  } else {
    mouseSat = getSatIdFromCoord(mouseX, mouseY);
    if(mouseSat !== -1) {
      orbitDisplay.setHoverOrbit(mouseSat);
    } else {
      orbitDisplay.clearHoverOrbit();
    }
    satSet.setHover(mouseSat);
    hoverBoxOnSat(mouseSat, mouseX, mouseY);
  }
}

function hoverBoxOnSat(satId, satX, satY) {
  if(satId === -1) {
    $('#sat-hoverbox').html('(none)');
    $('#sat-hoverbox').css({display: 'none'});
    $('#canvas').css({cursor : 'default'});
  } else {
   try{
  //    console.log(pos);
      $('#sat-hoverbox').html(satSet.getSat(satId).OBJECT_NAME);
      $('#sat-hoverbox').css({
        display: 'block',
        position: 'absolute',
        left: satX + 20,
        top: satY - 10
      });
      $('#canvas').css({cursor : 'pointer'});
    } catch(e){}
  }
}

function getSatIdFromCoord(x, y) {
 // var start = performance.now();

  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);
  
  var pickR = pickColorBuf[0];
  var pickG = pickColorBuf[1];
  var pickB = pickColorBuf[2];
  
 // console.log('picking op: ' + (performance.now() - start) + ' ms');
  return((pickB << 16) | (pickG << 8) | (pickR)) - 1;
}

function earthHitTest(x, y) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);

  return (pickColorBuf[0] === 0 &&
          pickColorBuf[1] === 0 &&
          pickColorBuf[2] === 0);
}

function updateUrl() {
  var url = '/';
  var paramSlices = [];

  if(selectedSat !== -1){
    paramSlices.push('intldes=' + satSet.getSat(selectedSat).intlDes);
  }

  var currentSearch = searchBox.getCurrentSearch();
  if(currentSearch != null) {
    paramSlices.push('search=' + currentSearch);
  }

  if(paramSlices.length > 0) {
    url += '?' + paramSlices.join('&');
  }

  window.history.replaceState(null, 'Stuff in Space', url);
}




