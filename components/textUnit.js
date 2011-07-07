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
	this.currentxOffset = 0;
	this.currentyOffset = 0;
	this.maxWidth = 0;
	this.fontSize = 1;
}

extend(TextUnit, Object3D);

TextUnit.prototype = {
	/**
 	* This method uses the letter information received from a data format to create a suitable tile for a letter and
 	* stretching a texture onto this tile as described in the delivered textureCoordBuffer.
 	* It adds a letter to the textUnit, visually and in the data structure.
 	*/
	addLetter: function(letter){
		this.fontSize=1;
		//Array for vertice collection
		var triangles2 = new Array();
		//Metainformation and textureCoordBuffer for a given letter
		var letterInfo = this.bitmapFontDescriptor.getLetter(letter);	
		letterInfo.aspectX *= this.fontSize;
		letterInfo.aspectY *= this.fontSize;			
		//creating the tile according to given letter size information		
    	//triangles2[0] = createRectangle(new Point3D(-0.5*letterInfo.aspectX,-0.5*letterInfo.aspectY,1), 
    		//new Point3D(0.5*letterInfo.aspectX,-0.5*letterInfo.aspectY,1), 
    		//new Point3D(0.5*letterInfo.aspectX,0.5*letterInfo.aspectY,1), new Point3D(-0.5*letterInfo.aspectX,0.5*letterInfo.aspectY,1)); 
    		
    	triangles2[0] = createRectangle(new Point3D(0,-letterInfo.height/32,1), 
    		new Point3D(letterInfo.width/32,-letterInfo.height/32,1), 
    		new Point3D(letterInfo.width/32,0,1), new Point3D(0,0,1)); 	
    		
    		
    	var tile = WebGLBase.createObject3D(triangles2, this.gl);
    	//Create and fill a textureCoordBuffer
    	tile.texBuffer = new Object();
		tile.texBuffer.values = this.gl.createBuffer();
		tile.texBuffer.buffer = letterInfo.textureBuffer; 
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tile.texBuffer.values);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(tile.texBuffer.buffer), this.gl.STATIC_DRAW);
		tile.texBuffer.itemSize = 2;
		tile.texBuffer.numItems = 6;
		//Place the letter and add it as a child to the textUnit

		tile.yOffset = this.currentyOffset-(letterInfo.yoffset);
		tile.xOffset = this.currentxOffset+(letterInfo.xoffset);
		//tile.yOffset = this.currentyOffset+letterInfo.yoffset; 
		//tile.xOffset = this.currentxOffset+letterInfo.xoffset; 

		
		if (this.currentxOffset+letterInfo.aspectX > this.maxWidth && this.maxWidth != 0){
			//start new line
			this.currentxOffset = 0;
			this.currentyOffset -= 80/32;
			//reset positioning
			tile.yOffset = this.currentyOffset-(letterInfo.yoffset);
			tile.xOffset = this.currentxOffset+(letterInfo.xoffset);
			//increase positioning for next letter
			this.currentxOffset += letterInfo.xadvance;
		}else{
			//increase positioning for next letter
			this.currentxOffset += letterInfo.xadvance;
		}
		
		this.add(tile);	
		//Add the letter to the data structure (Array containing all letters within the textUnit)	
		this.letters.push(letter);
		tile.setShaderProgram(this.shaderProgram);
		tile.addTexture(this.bitmapFont, "randomTextureCoord", "uSampler" ,this.gl); 
		
		//is called if any of the tiles is beeing clicked
		tile.clicked =  function(){
		console.log("textUnit clicked");
		};
	},
	/**
	 * Method to set the content of the textUnit.
	 * Resets the content and then adds all letters passed in 
	 * iterative.
	 */
	setText: function(text){
		this.children = new Array();
		this.letters = new Array();
		this.currentxOffset = 0;
		this.currentyOffset = 0;
		for (var i = 0; i<text.length; i++){
			this.addLetter(text[i]);
		}
	},
	/**
	 * Sets the bitmapFont(Texture) which shall be used to create
	 * the letter tiles
	 */
	setBitmapFont: function(bitmapFont,bitmapFontDescriptor){
		this.bitmapFont = bitmapFont;
		this.bitmapFontDescriptor = bitmapFontDescriptor;
	},
	setMaxWidth: function(maxWidth){
		this.maxWidth = maxWidth;
	},
	setFontSize: function(fontSize){
		this.fontSize = fontSize;
	}
}