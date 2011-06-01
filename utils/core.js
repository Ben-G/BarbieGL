WebGLCore = function() {
	
};

WebGLCore.prototype = {
		createBuffer: function(values, itemSize) {
		buffer = new Object();
		buffer.values = gl.createBuffer();
		buffer.itemSize = itemSize;
		buffer.numItems = values.length / itemSize;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.values);
		gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
		return buffer;
	}
}

WebGLCore = new WebGLCore();
