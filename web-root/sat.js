(function() {
  var satSet = {};
  
  var dotSize = 1000;

  var satVerts = [];
  var dotShader;

  var satPosBuf;
  var satColorBuf;
  var pickColorBuf;
  
  var shadersReady = false;
  
  var satPos;
  var satVel;
  var satData;
  
  var hoveringSat = -1;
  var selectedSat = -1;
  
  var defaultColor = [1.0, 0.2, 0.0];
  var hoverColor =   [0.1, 1.0, 0.0];
  var selectedColor = [0.0, 1.0, 1.0];
  
  var satCruncher = new Worker('sat-cruncher.js');
  var cruncherReady = false;
  var lastDrawTime = 0;
  
  var satDataCallback;
  
  satCruncher.onmessage = function(m) {
    if(!cruncherReady) {
      $('#load-cover').fadeOut();
    }
    cruncherReady = true;
    satPos = new Float32Array(m.data.satPos);
    satVel = new Float32Array(m.data.satVel);
  };
  
  satSet.init = function(satsReadyCallback) {
    
    dotShader = gl.createProgram();
    
    var vertGet = $.get('/dot-vertex.glsl');
    var fragGet = $.get('/dot-fragment.glsl');
    var tleGet = $.get('/TLE.json', null, null, 'json');
    $.when(vertGet, fragGet, tleGet).done(function(vertData, fragData, tleResp) { //defer shader compilation until shader code has loaded.
      var startTime = new Date().getTime();
      
      var vertShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertShader, vertData[0]);
      gl.compileShader(vertShader);
      
      var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragShader, fragData[0]);
      gl.compileShader(fragShader);
      
      gl.attachShader(dotShader, vertShader);
      gl.attachShader(dotShader, fragShader);
      gl.linkProgram(dotShader);
     
      dotShader.aPos = gl.getAttribLocation(dotShader, 'aPos');
      dotShader.aColor = gl.getAttribLocation(dotShader, 'aColor');
      dotShader.uMvMatrix = gl.getUniformLocation(dotShader, 'uMvMatrix');
      dotShader.uCamMatrix = gl.getUniformLocation(dotShader, 'uCamMatrix');
      dotShader.uPMatrix = gl.getUniformLocation(dotShader, 'uPMatrix');
      console.log('sat.js downloaded data');
      $('#loader-text').text('Crunching numbers...');
      
      satData = tleResp[0];
      
      for(var i = 0; i < satData.length; i++) {     
        var year = satData[i].INTLDES.substring(0,2); //clean up intl des for display
        var prefix = (year > 50) ? '19' : '20';
        year = prefix + year;
        var rest = satData[i].INTLDES.substring(2);
        satData[i].intlDes = year + '-' + rest;      
        
        satData[i].id = i;
      }
      
      satPosBuf = gl.createBuffer();
      satPos = new Float32Array(satData.length * 3);
      /*gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(satPos), gl.STREAM_DRAW);*/
      
      var pickColorData = [];
      pickColorBuf = gl.createBuffer();
      for(var i = 0; i < satData.length; i++) {
        byteR = (i+1) & 0xff;
        byteG = ((i+1) & 0xff00) >> 8;
        byteB = ((i+1) & 0xff0000) >> 16;
        pickColorData.push(byteR / 255.0);
        pickColorData.push(byteG / 255.0);
        pickColorData.push(byteB / 255.0);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, pickColorBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pickColorData), gl.STATIC_DRAW);
      
      var satColorData = [];
      for(var i = 0; i < satData.length; i++) {
        satColorData.push(defaultColor[0]);
        satColorData.push(defaultColor[1]);
        satColorData.push(defaultColor[2]);
      }
      satColorBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(satColorData), gl.STATIC_DRAW);
      
      satSet.numSats = satData.length;
      
      var end = new Date().getTime();
      console.log('sat.js init: ' + (end - startTime) + ' ms');
      if(satDataCallback) {
        satDataCallback(satData);
      }
      
      shadersReady = true;
      satCruncher.postMessage({ //kick off the BG sat propagation
        satData: satData
      });
      
    });
  };


  
satSet.draw = function(pMatrix, camMatrix) {
  if(!shadersReady || !cruncherReady) return;
  
  var now = Date.now();
  var dt = (now - lastDrawTime) / 1000.0;
  for(var i=0; i<(satData.length*3); i++) {
    satPos[i] += satVel[i] * dt;
  }
  /*    
      try{
        var x = pv.position.x; // translation of axes from earth-centered inertial
        var y = pv.position.y; // to OpenGL is done in shader with projection matrix
        var z = pv.position.z; // so we don't have to worry about it
      } catch(e) {
        var x = 0;
        var y = 0;
        var z = 0;
      }
  //    console.log('x: ' + x + ' y: ' + y + ' z: ' + z);
      satPos[i*3] = x;
      satPos[i*3+1] = y;
      satPos[i*3+2] = z;
    }*/
    
    gl.useProgram(dotShader);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 //   gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
    
    gl.uniformMatrix4fv(dotShader.uMvMatrix, false, mat4.identity(mat4.create()));
    gl.uniformMatrix4fv(dotShader.uCamMatrix, false, camMatrix);
    gl.uniformMatrix4fv(dotShader.uPMatrix, false, pMatrix);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
    gl.bufferData(gl.ARRAY_BUFFER, satPos, gl.STREAM_DRAW);
    gl.vertexAttribPointer(dotShader.aPos, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    gl.enableVertexAttribArray(dotShader.aColor);
    gl.vertexAttribPointer(dotShader.aColor, 3, gl.FLOAT, false, 0, 0);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.depthMask(false);
    
     gl.drawArrays(gl.POINTS, 0, satData.length); //draw 
     
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    
    gl.useProgram(gl.pickShaderProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 //   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.uniformMatrix4fv(gl.pickShaderProgram.uMvMatrix, false, mat4.identity(mat4.create()));
      gl.uniformMatrix4fv(gl.pickShaderProgram.uCamMatrix, false, camMatrix);
      gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
      gl.enableVertexAttribArray(gl.pickShaderProgram.aPos);
      gl.vertexAttribPointer(gl.pickShaderProgram.aPos, 3, gl.FLOAT, false, 0, 0);
      
      gl.enableVertexAttribArray(gl.pickShaderProgram.aColor);
      gl.bindBuffer(gl.ARRAY_BUFFER, pickColorBuf);
      gl.vertexAttribPointer(gl.pickShaderProgram.aColor, 3, gl.FLOAT, false, 0, 0);
      
    gl.drawArrays(gl.POINTS, 0, satData.length); //draw pick
    
    lastDrawTime = now;
  };
  
  satSet.getSat = function(i) {
    if(!satData) return null;
    return satData[i];
  };
  
  satSet.setHover = function(i) {
    if (i === hoveringSat) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    if(hoveringSat != -1 && hoveringSat != selectedSat) {
      gl.bufferSubData(gl.ARRAY_BUFFER, hoveringSat * 3 * 4, new Float32Array(defaultColor));
    }
    if(i != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, i * 3 * 4, new Float32Array(hoverColor));
    }
    hoveringSat = i; 
  };
  
  satSet.selectSat = function(i) {
    if(i === selectedSat) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    if(selectedSat != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, selectedSat * 3 * 4, new Float32Array(defaultColor));
    }
    if(i != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, i * 3 * 4, new Float32Array(selectedColor));
    }
    selectedSat = i; 
  };
  
  satSet.onLoadSatData = function(callback) {
    satDataCallback = callback;
    if(shadersReady) callback(satData);
  }
  
  window.satSet = satSet;
 
})();