(function() {
	
	var ColorScheme = function(colorizer) {
		this.colorizer = colorizer;
		this.colorBuf = gl.createBuffer();
	};
	
	ColorScheme.prototype.calculate = function() {
		var numSats = satSet.numSats;
		var colorData = new Float32Array(numSats*3);
		for(var i=0; i < numSats; i++) {
			var color = this.colorizer(satSet.getSat(i));
			colorData[i*3] = color[0];
			colorData[i*3+1] = color[1];
			colorData[i*3+2] = color[2];
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuf);
		gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
	};
	
	ColorScheme.prototype.getColorBuffer = function() {
    return this.colorBuf;
	}
	
	ColorScheme.default = new ColorScheme(function(sat){
		return [1.0, 0.0, 1.0];
	});
	
	window.ColorScheme = ColorScheme;
})();