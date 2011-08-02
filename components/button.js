function BarbieButton(gl,maxWidth,maxHeight){
	BarbieButton.superclass.constructor.call(this,gl);
	asTextField.call(BarbieButton.prototype); 
	asGroupedClickable.call(BarbieButton.prototype);
	//asClickableAndMarkable.call(Label.prototype); 
	//asEditableTextField.call(Label.prototype);
	
	this.initialize(gl,maxWidth,maxHeight);
}

extend(BarbieButton, Object3D); 

