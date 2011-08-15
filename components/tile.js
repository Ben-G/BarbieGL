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
}

Tile.prototype = new Object3D();

Tile.prototype.prepareDrawing = function(transMat) {
	if (this.marked == true){ 
		this.shaderProgram.setParameter(this.shaderProgram.fragmentShader.parts[0].getParameterById("marked"), true);
	}else{
		this.shaderProgram.setParameter(this.shaderProgram.fragmentShader.parts[0].getParameterById("marked"), false);
	}
}