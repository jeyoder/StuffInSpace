/* global groups */
(function() {
	
	var ColorScheme = function(colorizer) {
		this.colorizer = colorizer;
		this.colorBuf = gl.createBuffer();
    this.pickableBuf = gl.createBuffer();
	};
	
	ColorScheme.prototype.calculateColorBuffers = function() {
		var numSats = satSet.numSats;
		var colorData = new Float32Array(numSats*4);
    var pickableData = new Float32Array(numSats);
		for(var i=0; i < numSats; i++) {
			var colors = this.colorizer(i);
			colorData[i*4] = colors.color[0];  //R
			colorData[i*4+1] = colors.color[1]; //G
			colorData[i*4+2] = colors.color[2]; //B
			colorData[i*4+3] = colors.color[3]; //A
      pickableData[i] = colors.pickable ? 1 : 0;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuf);
		gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pickableBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pickableData, gl.STATIC_DRAW);
		return {
      colorBuf : this.colorBuf,
      pickableBuf : this.pickableBuf
    };
	};
	
	ColorScheme.init = function() {
		ColorScheme.default = new ColorScheme(function(satId){
			var sat = satSet.getSat(satId);
      var color;
			if(sat.OBJECT_TYPE === 'PAYLOAD') {
				color = [1.0, 0.2, 0.0, 1.0];
			} else if (sat.OBJECT_TYPE === 'ROCKET BODY'){
				color = [0.2, 0.5, 1.0, 0.85];
			//	return [0.6, 0.6, 0.6];
			} else if (sat.OBJECT_TYPE === 'DEBRIS') {
				color = [0.5, 0.5, 0.5, 0.85];
			} else {
				color = [1.0, 1.0, 0.0, 1.0];
			}
      return {
        color : color,
        pickable : true
      };
		});
		
		ColorScheme.apogee = new ColorScheme(function(satId) {
			var ap = satSet.getSat(satId).apogee;
			var gradientAmt = Math.min(ap / 45000, 1.0);
			return {
        color : [1.0 - gradientAmt, gradientAmt, 0.0, 1.0],
        pickable : true
      }
		});
		
		ColorScheme.velocity = new ColorScheme(function(satId) {
			var vel = satSet.getSat(satId).velocity;
			var gradientAmt = Math.min(vel / 15, 1.0);
			return {
        color : [1.0 - gradientAmt, gradientAmt, 0.0, 1.0],
        pickable : true 
      };
		});
		
		ColorScheme.group = new ColorScheme(function(satId) {
			if(groups.selectedGroup.hasSat(satId)) {
				return {
          color : [1.0, 0.2, 0.0, 1.0],
          pickable : true 
        };
			} else {
				return {
          color : [1.0, 1.0, 1.0, 0.1],
          pickable : false
			 };
      }
		});
    
    $('#color-schemes-submenu').mouseover(function() {
 
    });
	};
	
	window.ColorScheme = ColorScheme;
})();