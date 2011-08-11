var asGroupedClickable = function(){
	this.enableMouseInteraction = function(tile){
		var closure = this;
		tile.clicked =  function(){
			closure.clicked();	 
		};
		
	}
}

var asDraggable = function(){

	this.draggableMouseDown = function(){
		var hitPoint = WebGLBase.calculateClickVector(event.offsetX,event.offsetY, this,0);
		hitPoint = $V([hitPoint.e(1),hitPoint.e(2),hitPoint.e(3),1]);
		hitPoint = WebGLBase.pMatrix.inverse().x(hitPoint);
		this.clickOffsetX = hitPoint.e(1) - this.xOffset;
		this.clickOffsetY = hitPoint.e(2) - this.yOffset;
		//document.body.style.cursor = "move";
	} 
	
	
	this.mouseMove = function(tile){
			if (this.mouseHeldDown){
				//last Parameter is SurfaceID, in this case front surface
		        var hitPoint = WebGLBase.calculateClickVector(event.offsetX,event.offsetY, this,0);
		        hitPoint = $V([hitPoint.e(1),hitPoint.e(2),hitPoint.e(3),1]);
				hitPoint = WebGLBase.pMatrix.inverse().x(hitPoint);
		   		this.xOffset = hitPoint.e(1) - this.clickOffsetX;
		   		this.yOffset = hitPoint.e(2) - this.clickOffsetY;
   				//document.body.style.cursor = "default";
	   		}
	}
}