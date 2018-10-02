/* global browserUnsupported */
/* global satellite */
/* global mat4 */
/* global shaderLoader */
/* global gl */
/* global ColorScheme */
/* global $ */
(function() {
  var satSet = {};
  
  var dotShader;

  var satPosBuf;
  var satColorBuf;
  var pickColorBuf;
  var pickableBuf;
  
  var currentColorScheme;
  
  var shadersReady = false;
  
  var satPos;
  var satVel;
  var satAlt;
  
  var satData;
  var satExtraData;
  
  var hoveringSat = -1;
  var selectedSat = -1;
  
  var hoverColor =   [0.1, 1.0, 0.0, 1.0];
  var selectedColor = [0.0, 1.0, 1.0, 1.0];
  

  
  try {
    var satCruncher = new Worker('/scripts/sat-cruncher.js');
  } catch (E) {
    browserUnsupported();
  }
  
  var cruncherReady = false;
  var lastDrawTime = 0;
  
  var cruncherReadyCallback;
  
  var gotExtraData = false;
  satCruncher.onmessage = function(m) {
    
    if(!gotExtraData) { // store extra data that comes from crunching     
      var start = performance.now();
      
      satExtraData = JSON.parse(m.data.extraData);
      
      for(var i=0; i < satSet.numSats; i++) {
        satData[i].inclination = satExtraData[i].inclination;
        satData[i].eccentricity = satExtraData[i].eccentricity;
        satData[i].raan = satExtraData[i].raan;
        satData[i].argPe = satExtraData[i].argPe;
        satData[i].meanMotion = satExtraData[i].meanMotion;
        
        satData[i].semiMajorAxis = satExtraData[i].semiMajorAxis;
        satData[i].semiMinorAxis = satExtraData[i].semiMinorAxis;
        satData[i].apogee = satExtraData[i].apogee;
        satData[i].perigee = satExtraData[i].perigee;
        satData[i].period = satExtraData[i].period;
      }
      
      console.log('sat.js copied extra data in ' + (performance.now() - start) + ' ms');
      gotExtraData = true;
      return;
    }
     
    satPos = new Float32Array(m.data.satPos);
    satVel = new Float32Array(m.data.satVel);
    satAlt = new Float32Array(m.data.satAlt);
       
    if(!cruncherReady) {
      $('#load-cover').fadeOut();
      satSet.setColorScheme(currentColorScheme); //force color recalc
       cruncherReady = true;
       if(cruncherReadyCallback) {
        cruncherReadyCallback(satData);
       }
    }
    
  };
  
  satSet.init = function(satsReadyCallback) {
    
    dotShader = gl.createProgram();
   
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, shaderLoader.getShaderCode('dot-vertex.glsl'));
    gl.compileShader(vertShader);
    
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, shaderLoader.getShaderCode('dot-fragment.glsl'));
    gl.compileShader(fragShader);
    
    gl.attachShader(dotShader, vertShader);
    gl.attachShader(dotShader, fragShader);
    gl.linkProgram(dotShader);
   
    dotShader.aPos = gl.getAttribLocation(dotShader, 'aPos');
    dotShader.aColor = gl.getAttribLocation(dotShader, 'aColor');
    dotShader.uMvMatrix = gl.getUniformLocation(dotShader, 'uMvMatrix');
    dotShader.uCamMatrix = gl.getUniformLocation(dotShader, 'uCamMatrix');
    dotShader.uPMatrix = gl.getUniformLocation(dotShader, 'uPMatrix');
    
    $.get('/TLE.json?fakeparameter=to_avoid_browser_cache2', function(resp) {
      var startTime = new Date().getTime();
      
     
      console.log('sat.js downloaded data');
      $('#loader-text').text('Crunching numbers...');
      
      satData = resp;
      satSet.satDataString = JSON.stringify(satData);
      
      var postStart = performance.now();
        satCruncher.postMessage(satSet.satDataString); //kick off satCruncher
      var postEnd = performance.now();
      
      //do some processing on our satData response
      for(var i = 0; i < satData.length; i++) {     

        if(satData[i].INTLDES !== null) {
            var year = satData[i].INTLDES.substring(0,2); //clean up intl des for display
            var prefix = (year > 50) ? '19' : '20';
            year = prefix + year;
            var rest = satData[i].INTLDES.substring(2);
            satData[i].intlDes = year + '-' + rest;   
        } else {
            satData[i].intlDes = '(unknown)';    
        }
      
        
        satData[i].id = i;
      
      }
      
      //populate GPU mem buffers, now that we know how many sats there are
      
      satPosBuf = gl.createBuffer();
      satPos = new Float32Array(satData.length * 3);
      
      var pickColorData = [];
      pickColorBuf = gl.createBuffer();
      for(var i = 0; i < satData.length; i++) {
        var byteR = (i+1) & 0xff;
        var byteG = ((i+1) & 0xff00) >> 8;
        var byteB = ((i+1) & 0xff0000) >> 16;
        pickColorData.push(byteR / 255.0);
        pickColorData.push(byteG / 255.0);
        pickColorData.push(byteB / 255.0);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, pickColorBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pickColorData), gl.STATIC_DRAW);
      
      satSet.numSats = satData.length;
      
      satSet.setColorScheme(ColorScheme.default);
     // satSet.setColorScheme(ColorScheme.apogee);
   //  satSet.setColorScheme(ColorScheme.velocity);   
    
       var end = new Date().getTime();
      console.log('sat.js init: ' + (end - startTime) + ' ms (incl post: ' + (postEnd - postStart) + ' ms)');
      
      shadersReady = true;
      if(satsReadyCallback) {
        satsReadyCallback(satData);
      }
      
    });
  };

satSet.setColorScheme = function(scheme) {
  currentColorScheme = scheme;
  var buffers = scheme.calculateColorBuffers();
  satColorBuf = buffers.colorBuf;
  pickableBuf = buffers.pickableBuf; 
};
 
satSet.draw = function(pMatrix, camMatrix) {
  if(!shadersReady || !cruncherReady) return;
  
  var now = Date.now();
  var dt = Math.min((now - lastDrawTime) / 1000.0, 1.0);
  for(var i=0; i<(satData.length*3); i++) {
    satPos[i] += satVel[i] * dt;
  }
    
    gl.useProgram(dotShader);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 //   gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
    
    gl.uniformMatrix4fv(dotShader.uMvMatrix, false, mat4.create());
    gl.uniformMatrix4fv(dotShader.uCamMatrix, false, camMatrix);
    gl.uniformMatrix4fv(dotShader.uPMatrix, false, pMatrix);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
    gl.bufferData(gl.ARRAY_BUFFER, satPos, gl.STREAM_DRAW);
    gl.vertexAttribPointer(dotShader.aPos, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    gl.enableVertexAttribArray(dotShader.aColor);
    gl.vertexAttribPointer(dotShader.aColor, 4, gl.FLOAT, false, 0, 0);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.depthMask(false);
    
     gl.drawArrays(gl.POINTS, 0, satData.length); 
     
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    
    // now pickbuffer stuff......
    
    gl.useProgram(gl.pickShaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
 //   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.uniformMatrix4fv(gl.pickShaderProgram.uMvMatrix, false, mat4.create());
      gl.uniformMatrix4fv(gl.pickShaderProgram.uCamMatrix, false, camMatrix);
      gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, satPosBuf);
      gl.enableVertexAttribArray(gl.pickShaderProgram.aPos);
      gl.vertexAttribPointer(gl.pickShaderProgram.aPos, 3, gl.FLOAT, false, 0, 0);
      
      gl.enableVertexAttribArray(gl.pickShaderProgram.aColor);
      gl.bindBuffer(gl.ARRAY_BUFFER, pickColorBuf);
      gl.vertexAttribPointer(gl.pickShaderProgram.aColor, 3, gl.FLOAT, false, 0, 0);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, pickableBuf);
      gl.enableVertexAttribArray(gl.pickShaderProgram.aPickable);
      gl.vertexAttribPointer(gl.pickShaderProgram.aPickable, 1, gl.FLOAT, false, 0, 0);
      
    gl.drawArrays(gl.POINTS, 0, satData.length); //draw pick
    
    lastDrawTime = now;
  };
  
  satSet.getSat = function(i) {
    if(!satData) return null;
    var ret = satData[i];
    if(!ret) return null;
    if(gotExtraData) {
      ret.altitude = satAlt[i];
      ret.velocity = Math.sqrt(
        satVel[i*3] * satVel[i*3] +
        satVel[i*3+1] * satVel[i*3+1] +
        satVel[i*3+2] * satVel[i*3+2]
      );
      ret.position = {
        x : satPos[i*3],
        y : satPos[i*3+1],
        z : satPos[i*3+2]
      };
    }
    return ret;
  };
  
  satSet.getIdFromIntlDes = function(intlDes) {
    for(var i=0; i <satData.length; i++) {
      if(satData[i].INTLDES === intlDes || satData[i].intlDes === intlDes) {
        return i;
      }
    }
    return null;
  };

  satSet.getScreenCoords = function(i, pMatrix, camMatrix) {
    var pos = satSet.getSat(i).position;
    var posVec4 = vec4.fromValues(pos.x, pos.y, pos.z, 1);
    var transform = mat4.create();

    vec4.transformMat4(posVec4, posVec4, camMatrix);
    vec4.transformMat4(posVec4, posVec4, pMatrix);

    var glScreenPos =  {
      x : (posVec4[0] / posVec4[3]),
      y : (posVec4[1] / posVec4[3]),
      z : (posVec4[2] / posVec4[3]),
    };

    return {
      x : (glScreenPos.x + 1) * 0.5 * window.innerWidth,
      y : (-glScreenPos.y + 1) * 0.5 * window.innerHeight,
    };
  }
  
  satSet.searchNameRegex = function(regex) {
    var res = [];
    for(var i=0; i<satData.length; i++) {
      if(regex.test(satData[i].OBJECT_NAME)) {
        res.push(i);
      }
    }
    return res;
  };
  
  
  satSet.setHover = function(i) {
    if (i === hoveringSat) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    if(hoveringSat != -1 && hoveringSat != selectedSat) {
      gl.bufferSubData(gl.ARRAY_BUFFER, hoveringSat * 4 * 4, new Float32Array(currentColorScheme.colorizer(hoveringSat).color));
    }
    if(i != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, i * 4 * 4, new Float32Array(hoverColor));
    }
    hoveringSat = i; 
  };
  
  satSet.selectSat = function(i) {
    if(i === selectedSat) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, satColorBuf);
    if(selectedSat != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, selectedSat * 4 * 4, new Float32Array(currentColorScheme.colorizer(selectedSat).color));
    }
    if(i != -1) {
      gl.bufferSubData(gl.ARRAY_BUFFER, i * 4 * 4, new Float32Array(selectedColor));
    }
    selectedSat = i; 
  };

  satSet.onCruncherReady = function(cb) {
    cruncherReadyCallback = cb;
    if(cruncherReady) cb;
  }
  
  window.satSet = satSet;
 
})();
