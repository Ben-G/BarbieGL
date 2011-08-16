function BarbieButton(gl,maxWidth,maxHeight){
	BarbieButton.superclass.constructor.call(this,gl);
	asTextField.call(BarbieButton.prototype); 
	asGroupedClickable.call(BarbieButton.prototype);
	//asClickableAndMarkable.call(Label.prototype); 
	//asEditableTextField.call(Label.prototype);
	
	this.initialize(gl,maxWidth,maxHeight);
	
	this.setColor = function(color){
		Object3D.prototype.setColor.call(this,color);
		this.backgroundField.color = color;	
	}
}

extend(BarbieButton, Object3D); 

