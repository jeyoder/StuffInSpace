/* global groups */
(function() {
	
	var ColorScheme = function(colorizer) {
		this.colorizer = colorizer;
		this.colorBuf = gl.createBuffer();
	};
	
	ColorScheme.prototype.calculateColorBuffer = function() {
		var numSats = satSet.numSats;
		var colorData = new Float32Array(numSats*4);
		for(var i=0; i < numSats; i++) {
			var color = this.colorizer(i);
			colorData[i*4] = color[0];  //R
			colorData[i*4+1] = color[1]; //G
			colorData[i*4+2] = color[2]; //B
			colorData[i*4+3] = color[3]; //A
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuf);
		gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
		return this.colorBuf;
	};
	
	ColorScheme.init = function() {
		ColorScheme.default = new ColorScheme(function(satId){
			var sat = satSet.getSat(satId);
			if(sat.OBJECT_TYPE === 'PAYLOAD') {
				return [1.0, 0.2, 0.0, 1.0];
			} else if (sat.OBJECT_TYPE === 'ROCKET BODY'){
				return [0.2, 0.5, 1.0, 0.85];
			//	return [0.6, 0.6, 0.6];
			} else if (sat.OBJECT_TYPE === 'DEBRIS') {
				return [0.5, 0.5, 0.5, 0.85];
			} else {
				return [1.0, 1.0, 0.0, 1.0];
			}
		});
		
		ColorScheme.apogee = new ColorScheme(function(satId) {
			var ap = satSet.getSat(satId).apogee;
			var gradientAmt = Math.min(ap / 45000, 1.0);
			return[1.0 - gradientAmt, gradientAmt, 0.0, 1.0];
		});
		
		ColorScheme.velocity = new ColorScheme(function(satId) {
			var vel = satSet.getSat(satId).velocity;
			var gradientAmt = Math.min(vel / 15, 1.0);
			return[1.0 - gradientAmt, gradientAmt, 0.0, 1.0];
		});
		
		ColorScheme.group = new ColorScheme(function(satId) {
			if(groups.selectedGroup.hasSat(satId)) {
				return [1.0, 0.2, 0.0, 1.0];
			} else {
				return [1.0, 1.0, 1.0, 0.1];
			}
		});
	};
	
	window.ColorScheme = ColorScheme;
})();