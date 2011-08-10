/**
 * Class TextUnit
 * 
 * represents a displayable unit, organizing several
 * letters to a block of text
 */

function TextUnit(gl,maxWidth,maxHeight){
	TextUnit.superclass.constructor.call(this,gl);
	asTextField.call(TextUnit.prototype); 
	asClickableAndMarkable.call(TextUnit.prototype);  
	asEditableTextField.call(TextUnit.prototype);
	asDraggable.call(TextUnit.prototype); 
	this.initialize(gl,maxWidth,maxHeight);
}

extend(TextUnit, Object3D); 

/**
 	* This method uses the letter information received from a data format to create a suitable tile for a letter and
 	* stretching a texture onto this tile as described in the delivered textureCoordBuffer.
 	* It adds a letter to the textUnit, visually and in the data structure.
 	*/
	/*TextUnit.prototype.addLetter = function(letter){
		
	}*/
	
	
	

	
	

