function Label(gl,maxWidth,maxHeight){
	Label.superclass.constructor.call(this,gl);
	asTextField.call(Label.prototype); 
	//asClickableAndMarkable.call(Label.prototype); 
	//asEditableTextField.call(Label.prototype);
	
	this.initialize(gl,maxWidth,maxHeight);
}

extend(Label, Object3D); 

