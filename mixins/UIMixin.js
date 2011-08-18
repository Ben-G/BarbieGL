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
		document.body.style.cursor = "move"; 
		
		var hitPoint = WebGLBase.calculateClickVector(event.offsetX,event.offsetY, this,0);
		hitPoint = $V([hitPoint.e(1),hitPoint.e(2),hitPoint.e(3),1]);
		hitPoint = WebGLBase.pMatrix.inverse().x(hitPoint);
		if (this.parentDrag == true){
			this.clickOffsetX = hitPoint.e(1) - this.parent.xOffset;
			this.clickOffsetY = hitPoint.e(2) - this.parent.yOffset;
		}else{
			this.clickOffsetX = hitPoint.e(1) - this.xOffset;
			this.clickOffsetY = hitPoint.e(2) - this.yOffset;
		}
	} 
	
	
	this.mouseMove = function(tile){
			if (this.mouseHeldDown){
				//last Parameter is SurfaceID, in this case front surface
		        var hitPoint = WebGLBase.calculateClickVector(event.offsetX,event.offsetY, this,0);
		        hitPoint = $V([hitPoint.e(1),hitPoint.e(2),hitPoint.e(3),1]);
				hitPoint = WebGLBase.pMatrix.inverse().x(hitPoint);
				//var oldxOffset = this.xOffset;
				//var oldyOffset = this.yOffset;
		   		var newxOffset = hitPoint.e(1)- this.clickOffsetX;
		   		var newyOffset = hitPoint.e(2)- this.clickOffsetY;
		   		
		   		
		   		if (this.parentDrag == true){
					this.parent.xOffset = newxOffset;
		   			this.parent.yOffset = newyOffset;
				}else{
					this.xOffset = newxOffset; 
		   			this.yOffset = newyOffset;
				}
		   		
		   		/*
		   		var oldxOffset = this.parent.xOffset;
				var oldyOffset = this.parent.yOffset;
		   				   		
		   		var xChange = newxOffset - oldxOffset;
		   		var yChange = newyOffset - oldyOffset;
		   		
		   		this.parent.xOffset = newxOffset;
		   		this.parent.yOffset = newyOffset;*/
	   		}
	}
}

var asScrollable = function(){
	
	this.scrollbarInitialize = function(){
	var scrollUpButton = new BarbieButton(this.gl,1.4,1);
	scrollUpButton.tileLayer = 1; 
	scrollUpButton.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderText);
	scrollUpButton.backgroundField.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderBack);
	scrollUpButton.name = "Button";				
	scrollUpButton.setBitmapFont(WebGLBase.UIDelegate.bmFontTexture,WebGLBase.UIDelegate.bmFontDescriptor);
	scrollUpButton.setFontSize(1);
	scrollUpButton.setText("^");
	scrollUpButton.xOffset = this.maxWidth;
	this.scrollUpButton = scrollUpButton;
	
	var scrollDownButton = new BarbieButton(this.gl,1.4,1); 
	scrollDownButton.tileLayer = 1;
	scrollDownButton.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderText);
	scrollDownButton.backgroundField.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderBack);
	scrollDownButton.name = "Button";				
	scrollDownButton.setBitmapFont(WebGLBase.UIDelegate.bmFontTexture,WebGLBase.UIDelegate.bmFontDescriptor);
	scrollDownButton.setFontSize(1);
	scrollDownButton.setText("v");
	scrollDownButton.xOffset = this.maxWidth;
	scrollDownButton.yOffset = -(this.maxHeight-scrollDownButton.maxHeight);
	this.scrollDownButton = scrollDownButton;	
	

	
	
	this.scrollStep = 1;
	//this.scrollStep = 2;
	
	this.add(scrollUpButton);
	this.add(scrollDownButton);

	
	var closure = this;
	scrollUpButton.clicked = function(){
		closure.scrollUp();
	}
	scrollDownButton.clicked = function(){
		closure.scrollDown();
			
	}
		
	this.setColor = function(color){
		Object3D.prototype.setColor.call(this,color);
		this.backgroundField.setColor(color);
		this.scrollUpButton.backgroundField.setColor(color);
		this.scrollDownButton.backgroundField.setColor(color);
	}

}

this.hideScrolledOutLetters = function(){
	for(var i=0; i<this.tiles.length; i++){
		if (this.tiles[i].currentyOffset + this.label.yOffset > 0 || 
			this.tiles[i].currentyOffset + this.label.yOffset <= -this.maxHeight+this.scrollStep){
			this.tiles[i].visible = false;
		}else
			this.tiles[i].visible = true; 
	}
	this.checkCursorVisibility();
}


this.scrollDown = function(){
	this.scrolledLines += 1;
	this.scrollToLine(this.scrolledLines);
	this.moveCursorToTile(this.cursor.positionId);
	this.hideScrolledOutLetters();
	WebGLBase.UIDelegate.reportFocus(this);
}

this.scrollUp = function(){
	if (this.scrolledLines > 0){
			this.scrolledLines -= 1;
			this.scrollToLine(this.scrolledLines);
			this.moveCursorToTile(this.cursor.positionId);
			this.hideScrolledOutLetters();
			WebGLBase.UIDelegate.reportFocus(this);
	}
}

this.scrollToLine = function(line){
	this.label.yOffset = this.scrollStep*line;		
	this.scrolledLines = line;
}
	
}
