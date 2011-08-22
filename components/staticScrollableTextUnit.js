function StaticScrollableTextUnit(gl,maxWidth,maxHeight){
	StaticScrollableTextUnit.superclass.constructor.call(this,gl);
	asTextField.call(StaticScrollableTextUnit.prototype); 
	asClickableAndMarkable.call(StaticScrollableTextUnit.prototype);	
	//asEditableTextField.call(StaticScrollableTextUnit.prototype);	
	asScrollable.call(StaticScrollableTextUnit.prototype);
	//asDraggable.call(StaticScrollableTextUnit.prototype);
	this.initialize(gl,maxWidth,maxHeight);
	this.scrollbarInitialize();
	
	this.setText = function(text){
		StaticScrollableTextUnit.prototype.setText.call(this,text);
		this.add(this.scrollUpButton);
		this.add(this.scrollDownButton);
		this.hideScrolledOutLetters();
	}
	
	this.setTextFrags = function(text){
		StaticScrollableTextUnit.prototype.setTextFrags.call(this,text);
		this.add(this.scrollUpButton);
		this.add(this.scrollDownButton);
		this.hideScrolledOutLetters();
	}
	
	this.setBitmapFont = function(bitmapFont,bitmapFontDescriptor){
		StaticScrollableTextUnit.prototype.setBitmapFont.call(this,bitmapFont,bitmapFontDescriptor);
		this.scrollStep = this.lineHeight;
	}
	
	this.setFontSize = function(fontSize){
		StaticScrollableTextUnit.prototype.setFontSize.call(this,fontSize);
		this.scrollStep = this.lineHeight;
		this.visibleLines = Math.floor(this.maxHeight/this.scrollStep);
		console.log(this.visibleLines);
	}
}

extend(StaticScrollableTextUnit, Object3D); 

