function Tile(gl){
	Tile.superclass.constructor.call(this, gl);
}

extend(Tile, Object3D);
/*
	Tile.prototype.refresh = function(transMat){
		Tile.superclass.refresh(transMat);
		console.log("extend :D");
	}
	*/
	
