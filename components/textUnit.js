/**
 * Class TextUnit
 * 
 * represents a displayable unit, organizing several
 * letters to a block of text
 */

function TextUnit(gl){
	TextUnit.superclass.constructor.call(this,gl);
	this.gl = gl;
	this.letters = new Array();
	this.currentOffset = 0;
}

extend(TextUnit, Object3D);

TextUnit.prototype = {
	/**
 	* This method uses the letter information received from a data format to create a suitable tile for a letter and
 	* stretching a texture onto this tile as described in the delivered textureCoordBuffer.
 	* It adds a letter to the textUnit, visually and in the data structure.
 	*/
	addLetter: function(letter){
		//Array for vertice collection
		var triangles2 = new Array();
		//Metainformation and textureCoordBuffer for a given letter
		var letterInfo = rectangleTextureCoordBuffer[letter]();		
		//creating the tile according to given letter size information		
    	triangles2[0] = createRectangle(new Point3D(-0.5*letterInfo.aspectX,-0.5*letterInfo.aspectY,1), 
    		new Point3D(0.5*letterInfo.aspectX,-0.5*letterInfo.aspectY,1), 
    		new Point3D(0.5*letterInfo.aspectX,0.5*letterInfo.aspectY,1), new Point3D(-0.5*letterInfo.aspectX,0.5*letterInfo.aspectY,1)); 
    	var tile = WebGLBase.createObject3D(triangles2, this.gl);
    	//Create and fill a textureCoordBuffer
    	tile.texBuffer = new Object();
		tile.texBuffer.values = this.gl.createBuffer();
		tile.texBuffer.buffer = letterInfo.buffer; 
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tile.texBuffer.values);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(tile.texBuffer.buffer), this.gl.STATIC_DRAW);
		tile.texBuffer.itemSize = 2;
		tile.texBuffer.numItems = 6;
		//Place the letter and add it as a child to the textUnit
		tile.xOffset = this.currentOffset;
		this.currentOffset += 1.1*letterInfo.aspectX;
		this.add(tile);	
		//Add the letter to the data structure (Array containing all letters within the textUnit)	
		this.letters.push(letter);
		tile.setShaderProgram(this.shaderProgram);
		tile.addTexture(this.bitmapFont, "randomTextureCoord", "uSampler" ,this.gl); 
	},
	/**
	 * Method to set the content of the textUnit.
	 * Resets the content and then adds all letters passed in 
	 * iterative.
	 */
	setText: function(text){
		this.children = new Array();
		this.letters = new Array();
		this.currentOffset = 0;
		for (var i = 0; i<text.length; i++){
			this.addLetter(text[i]);
		}
	},
	/**
	 * Sets the bitmapFont(Texture) which shall be used to create
	 * the letter tiles
	 */
	setBitmapFont: function(bitmapFont){
		this.bitmapFont = bitmapFont;
	}
	
}