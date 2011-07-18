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
	this.text = "";
	this.tiles = new Object();
	
    var tileRect = new Array();
    tileRect[0] = createRectangle(new Point3D(-0.1,-1,1), new Point3D(0.1,-1,1), new Point3D(0.1,0,1), new Point3D(-0.1,0,1));
    this.cursor = WebGLBase.createObject3D(tileRect, this.gl);
    this.add(this.cursor);
}

extend(TextUnit, Object3D);

TextUnit.prototype = {
	/**
 	* This method uses the letter information received from a data format to create a suitable tile for a letter and
 	* stretching a texture onto this tile as described in the delivered textureCoordBuffer.
 	* It adds a letter to the textUnit, visually and in the data structure.
 	*/
	addLetter: function(letter){
				
		if (letter.charCodeAt(0) == 13){
			this.newline();
		}
		
		this.minSize=96;
		//Array for vertice collection
		var triangles2 = new Array();
		//Metainformation and textureCoordBuffer for a given letter
		var letterInfo = this.bitmapFontDescriptor.getLetter(letter);
		
		var xadvance = letterInfo.xadvance/this.minSize;
        var xoffset = letterInfo.xoffset/this.minSize;
        var yoffset = letterInfo.yoffset/this.minSize;
    		
    	triangles2[0] = createRectangle(new Point3D(0,-letterInfo.height/this.minSize,1), 
    		new Point3D(letterInfo.width/this.minSize,-letterInfo.height/this.minSize,1), 
    		new Point3D(letterInfo.width/this.minSize,0,1), new Point3D(0,0,1)); 	
    		
    		
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

		tile.yOffset = this.currentyOffset-(yoffset);
		tile.xOffset = this.currentxOffset+(xoffset);
		tile.xadvance = xadvance;
		//marks the beginning position of the letter, so that cursor can be placed
		tile.currentyOffset = this.currentyOffset;
		tile.currentxOffset = this.currentxOffset;
		//tile.yOffset = this.currentyOffset+letterInfo.yoffset; 
		//tile.xOffset = this.currentxOffset+letterInfo.xoffset; 

		
		if (this.currentxOffset+xoffset > this.maxWidth && this.maxWidth != 0){
			//start new line
			this.newline();
			//reset positioning
			tile.yOffset = this.currentyOffset-(yoffset);
			tile.xOffset = this.currentxOffset+(xoffset);
			//increase positioning for next letter
			this.currentxOffset += xadvance;
		}else{
			//increase positioning for next letter
			this.currentxOffset += xadvance;
		}
		//move cursor
		//this.cursor.xOffset = this.currentxOffset;
		//this.cursor.yOffset = this.currentyOffset;
		
		
		
		this.add(tile);	
		this.text+=letter;
		tile.stringPositionId = this.text.length - 1;
		

		this.tiles[tile.stringPositionId] = tile;
		//Add the letter to the data structure (Array containing all letters within the textUnit)	
		this.letters.push(letter);
		tile.setShaderProgram(this.shaderProgram);
		tile.addTexture(this.bitmapFont, "randomTextureCoord", "uSampler" ,this.gl); 
		
		
		//is called if any of the tiles is beeing clicked
		var closure = this;
		tile.clicked =  function(){
			closure.moveCursorToTile(this.stringPositionId);
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
		this.tiles = new Object();
		this.currentxOffset = 0;
		this.currentyOffset = 0;
		this.cursor.xOffset = 0;
		this.cursor.yOffset = 0;
		this.text = "";
		
		for (var i = 0; i<text.length; i++){
			this.addLetter(text[i]);
		}
		this.add(this.cursor);
		this.moveCursorToTile(this.text.length);
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
	},
	deleteLetterAt: function(positionID){
			var newText = this.text.substring(0, positionID)+this.text.substring(positionID+1, this.text.length);
			this.setText(newText);
			this.moveCursorToTile(positionID);	
	},
	insertLetterAt: function(positionID,charCode){
				var letter = String.fromCharCode(charCode);
				var newText = this.text.substring(0, positionID)+letter+this.text.substring(positionID, this.text.length);
				this.setText(newText);
				this.moveCursorToTile(positionID+1);				
	},

	moveCursorToTile: function(tileId){
		var tile = this.tiles[tileId];	
		if (tile != null){	
			this.cursor.xOffset = tile.currentxOffset;
			this.cursor.yOffset = tile.currentyOffset;
			this.cursor.positionId = tile.stringPositionId;		
		}
		if (tileId == this.text.length && this.text.length != 0){
			//move cursor to position right of the last letter
			this.cursor.xOffset = this.tiles[tileId-1].currentxOffset + this.tiles[tileId-1].xadvance;
			this.cursor.yOffset = this.tiles[tileId-1].currentyOffset;
			this.cursor.positionId = tileId;
		}
	},
	moveCursorRight: function(){
		this.moveCursorToTile(this.cursor.positionId+1);
	},
	moveCursorLeft: function(){
		this.moveCursorToTile(this.cursor.positionId-1);
	},
	newline: function(){
		this.currentxOffset = 0;
		this.currentyOffset -= this.bitmapFontDescriptor.lineHeight/this.minSize;
	}
}