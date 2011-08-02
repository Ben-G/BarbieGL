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
		//this.add(this.scroll)
	}
	//this.text= "abc";
}

extend(ScrollableTextUnit, Object3D); 

ScrollableTextUnit.prototype.scrollbarInitialize = function(){
	console.log(WebGLBase.UIDelegate);
	var scrollUpButton = new BarbieButton(this.gl,1.4,1); 
	scrollUpButton.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderText);
	scrollUpButton.backgroundField.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderBack);
	scrollUpButton.name = "Button";				
	scrollUpButton.setBitmapFont(WebGLBase.UIDelegate.bmFontTexture,WebGLBase.UIDelegate.bmFontDescriptor);
	scrollUpButton.setFontSize(1);
	scrollUpButton.setText("^");
	scrollUpButton.xOffset = this.maxWidth;
	//scrollUpButton.zOffset = 5;
	this.scrollUpButton = scrollUpButton;
	this.add(scrollUpButton);
	this.text = "false";
	
	var closure = this;
	scrollUpButton.clicked = function(){closure.yOffset += 1;}

	
	
}


