/*function Tile(gl){
	Tile.superclass.constructor.call(this, gl);
}

extend(Tile, Object3D);

/*	Tile.prototype.refresh = function(transMat){
		Tile.shaderProgram = new ShaderProgram();
		Tile.superclass.refresh.call(this,transMat);		
		console.log("extend :D");
	}*/
	
	
Tile = function(gl) {
	Object3D.call(this,gl);
	this.textColor = $V([1,1,1]);
	this.cache = new Object();
	this.cache.lastMarked = null;
	this.cache.lastTextColor = null;
}

Tile.prototype = new Object3D();

Tile.prototype.prepareDrawing = function(transMat) {
	//if (this.cache.lastMarked != this.marked) {
		this.shaderProgram.setParameter(this.shaderProgram.fragmentShader.getPartsByName("textshader")[0].getParameterById("marked"), this.marked);
	//	this.cache.lastMarked = this.marked;
	//}

	//if (this.cache.lastTextColor != this.textColor){ 
		this.shaderProgram.setParameter(this.shaderProgram.fragmentShader.getPartsByName("textshader")[0].getParameterById("textColor"), this.textColor.flatten());
	//	this.cache.lastTextColor = this.textColor;
	//}
}
