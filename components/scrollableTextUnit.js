function ScrollableTextUnit(gl,maxWidth,maxHeight){
	ScrollableTextUnit.superclass.constructor.call(this,gl);
	asTextField.call(ScrollableTextUnit.prototype); 
	asClickableAndMarkable.call(ScrollableTextUnit.prototype);	
	asEditableTextField.call(ScrollableTextUnit.prototype);	
	asScrollable.call(ScrollableTextUnit.prototype);
	//asDraggable.call(ScrollableTextUnit.prototype);
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
		this.scrollStep = this.lineHeight;
	}
	
	this.setFontSize = function(fontSize){
		ScrollableTextUnit.prototype.setFontSize.call(this,fontSize);
		this.scrollStep = this.lineHeight;
		this.visibleLines = Math.floor(this.maxHeight/this.scrollStep);
		console.log(this.visibleLines);
	}
	
}

extend(ScrollableTextUnit, Object3D); 

