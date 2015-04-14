(function() {
  var satSet = {};
  
  var dotSize = 1000;
  var sats = [];
  var satVerts = [];
  var dotShader;
  
 // var NUM_SATS = 2;
  
  var satPosBuf;
  var satColorBuf;
  var pickColorBuf;
  
  var shadersReady = false;
  
  var satPos = [];
  var tleData;
  
  var hoveringSat = -1;
  var selectedSat = -1;
  
  var defaultColor = [1.0, 0.1, 0.0];
  var hoverColor =   [0.1, 1.0, 0.0];
  var selectedColor = [0.0, 1.0, 1.0];
  
  satSet.init = function() {
    
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
      console.log('sat.js loaded data');
      
      tleData = tleResp[0];
      for(var i = 0; i < tleData.length; i++) {
        sats.push(satellite.twoline2satrec(
          tleData[i].TLE_LINE1, tleData[i].TLE_LINE2
        ));
        var year = tleData[i].INTLDES.substring(0,2); //clean up intl des for display
        var prefix = (year > 50) ? '19' : '20';
        year = prefix + year;
        var rest = tleData[i].INTLDES.substring(2);
        tleData[i].intlDes = year + '-' + rest;
      }
      console.log('sat.js processed TLEs');
      
      satPosBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(satPos), gl.STREAM_DRAW);
      
      var pickColorData = [];
      pickColorBuf = gl.createBuffer();
      for(var i = 0; i < sats.length; i++) {
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
      for(var i = 0; i < sats.length; i++) {
        satColorData.push(defaultColor[0]);
        satColorData.push(defaultColor[1]);
        satColorData.push(defaultColor[2]);
      }
      satColorBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(satColorData), gl.STATIC_DRAW);
      
      var end = new Date().getTime();
      console.log('sat.js init: ' + (end - startTime) + ' ms');
      shadersReady = true;
    });
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

  
satSet.draw = function(pMatrix, camMatrix) {
    if(!shadersReady) return;
    
    var now = new Date();   
    var j = jday(now.getUTCFullYear(), 
                 now.getUTCMonth() + 1, // Note, this function requires months in range 1-12. 
                 now.getUTCDate(),
                 now.getUTCHours(), 
                 now.getUTCMinutes(), 
                 now.getUTCSeconds());
    j += now.getUTCMilliseconds() * 1.15741e-8; //days per millisecond     
    
    for(var i=0; i < sats.length; i++) {
      
      var m = (j - sats[i].jdsatepoch) * 1440.0; //minutes_per_day
      var pv = satellite.sgp4(sats[i], m);
      
      try{
        var x = pv.position.x; // translate axes from earth-centered inertial
        var y = pv.position.z; // to OpenGL
        var z = -pv.position.y;
      } catch(e) {
        var x = 0;
        var y = 0;
        var z = 0;
      }
  //    console.log('x: ' + x + ' y: ' + y + ' z: ' + z);
      satPos[i*3] = x;
      satPos[i*3+1] = y;
      satPos[i*3+2] = z;
    }
    
    gl.useProgram(dotShader);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 //   gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
    
    gl.uniformMatrix4fv(dotShader.uMvMatrix, false, mat4.identity(mat4.create()));
    gl.uniformMatrix4fv(dotShader.uCamMatrix, false, camMatrix);
    gl.uniformMatrix4fv(dotShader.uPMatrix, false, pMatrix);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(satPos), gl.STREAM_DRAW);
    gl.vertexAttribPointer(dotShader.aPos, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    gl.enableVertexAttribArray(dotShader.aColor);
    gl.vertexAttribPointer(dotShader.aColor, 3, gl.FLOAT, false, 0, 0);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);
    gl.depthMask(false);
    
     gl.drawArrays(gl.POINTS, 0, sats.length); //draw 
     
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
      
    gl.drawArrays(gl.POINTS, 0, sats.length); //draw pick
  };
  
  satSet.getSat = function(i) {
    if(!tleData) return null;
    return tleData[i];
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
  
  window.satSet = satSet;
 
})();