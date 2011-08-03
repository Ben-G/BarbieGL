function ScrollableTextUnit(gl,maxWidth,maxHeight){
	ScrollableTextUnit.superclass.constructor.call(this,gl);
	asTextField.call(ScrollableTextUnit.prototype); 
	asClickableAndMarkable.call(ScrollableTextUnit.prototype);  
	asEditableTextField.call(ScrollableTextUnit.prototype);
	this.initialize(gl,maxWidth,maxHeight);
	this.scrollbarInitialize();
	
	this.setText = function(text){
		ScrollableTextUnit.prototype.setText.call(this,text);
		this.add(this.scrollUpButton);
		this.add(this.scrollDownButton);
		this.hideScrolledOutLetters();
	}
	
	this.setBitmapFont = function(bitmapFont,bitmapFontDescriptor){
		ScrollableTextUnit.prototype.setBitmapFont.call(this,bitmapFont,bitmapFontDescriptor);
		this.scrollStep = this.bitmapFontDescriptor.lineHeight/this.minSize;
	}
	
	this.setFontSize = function(fontSize){
		ScrollableTextUnit.prototype.setFontSize.call(this,fontSize);
		this.scrollStep = this.bitmapFontDescriptor.lineHeight/this.minSize;
	}
}

extend(ScrollableTextUnit, Object3D); 

ScrollableTextUnit.prototype.scrollbarInitialize = function(){
	var scrollUpButton = new BarbieButton(this.gl,1.4,1); 
	scrollUpButton.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderText);
	scrollUpButton.backgroundField.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderBack);
	scrollUpButton.name = "Button";				
	scrollUpButton.setBitmapFont(WebGLBase.UIDelegate.bmFontTexture,WebGLBase.UIDelegate.bmFontDescriptor);
	scrollUpButton.setFontSize(1);
	scrollUpButton.setText("^");
	scrollUpButton.xOffset = this.maxWidth;
	this.scrollUpButton = scrollUpButton;
	
	var scrollDownButton = new BarbieButton(this.gl,1.4,1); 
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
		if (closure.scrolledLines > 0){
			closure.scrolledLines -= 1;
			closure.label.yOffset = closure.scrollStep*closure.scrolledLines;
			closure.moveCursorToTile(closure.cursor.positionId);
			closure.hideScrolledOutLetters();
			WebGLBase.UIDelegate.reportFocus(closure);
		}
	}
	scrollDownButton.clicked = function(){
			closure.scrolledLines += 1;
			closure.label.yOffset = closure.scrollStep*closure.scrolledLines;
			closure.moveCursorToTile(closure.cursor.positionId);
			closure.hideScrolledOutLetters();
			WebGLBase.UIDelegate.reportFocus(closure);
	}
		
}

ScrollableTextUnit.prototype.hideScrolledOutLetters = function(){
	for(var i=0; i<this.tiles.length; i++){
		if (this.tiles[i].currentyOffset + this.label.yOffset > 0 || 
			this.tiles[i].currentyOffset + this.label.yOffset <= -this.maxHeight+this.scrollStep){
			this.tiles[i].visible = false;
		}else
			this.tiles[i].visible = true; 
	}
	this.checkCursorVisibility();
}

