/**
 * Class TextUnit
 * 
 * represents a displayable unit, organizing several
 * letters to a block of text
 */

function TextUnit(gl,maxWidth,maxHeight){
	TextUnit.superclass.constructor.call(this,gl);
	this.gl = gl;
	this.letters = new Array();
	this.currentxOffset = 0;
	this.currentyOffset = 0;
	this.maxWidth = maxWidth;
	this.maxHeight = maxHeight;
	this.fontSize = 1;
	this.text = "";
	this.tiles = new Object();
	this.selectionIndexStart;
	this.selectionIndexEnd;
	//boolean this.focused
	
   
	this.createCursor();
    
    var backField = new Array();
    backField[0] = createRectangle(new Point3D(0,-this.maxHeight,0.95), new Point3D(this.maxWidth,-this.maxHeight,0.95), new Point3D(this.maxWidth,0,0.95), new Point3D(0,0,0.95));
    //backField[0] = createRectangle(new Point3D(-5,-5,1), new Point3D(5,-5,1), new Point3D(5,5,1), new Point3D(-5,5,1));

    this.backgroundField = WebGLBase.createObject3D(backField, this.gl);
    //otherwise component has cursor by default
    this.lostFocus();
    
    var closure = this;
    
    this.backgroundField.clicked = function(){
		WebGLBase.UIDelegate.reportFocus(closure);
	}
    //this.add(this.cursor);
    //this.add(this.backgroundField);
}

extend(TextUnit, Object3D); 

/**
 	* This method uses the letter information received from a data format to create a suitable tile for a letter and
 	* stretching a texture onto this tile as described in the delivered textureCoordBuffer.
 	* It adds a letter to the textUnit, visually and in the data structure.
 	*/
	TextUnit.prototype.addLetter = function(letter){
				
		if (letter.charCodeAt(0) == 13){
			this.newline();
		}
		
		this.minSize=96-this.fontSize;
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
    		
    		 
    	var tile = WebGLBase.createTile(triangles2, this.gl);
 
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
		};
		tile.mouseDown = function(){
			closure.selectionIndexStart = this.stringPositionId;
			for (var i=0; i<=closure.text.length-1;i++){
				closure.tiles[i].marked = false;		
				console.log("delte");
			}
			WebGLBase.UIDelegate.reportFocus(closure);
		};
		tile.mouseUp = function(){
			closure.selectionIndexEnd = this.stringPositionId;
			if (closure.selectionIndexStart == closure.selectionIndexEnd){
				copiedText = "";
				closure.moveCursorToTile(this.stringPositionId);
			}

				else{
					
					if (closure.selectionIndexStart > closure.selectionIndexEnd){
						var temp = closure.selectionIndexStart;
						closure.selectionIndexStart = closure.selectionIndexEnd;
						closure.selectionIndexEnd = temp;
					}
					
					
					var copiedText = closure.text.substring(closure.selectionIndexStart, closure.selectionIndexEnd+1);  
					for (var i=closure.selectionIndexStart; i <= closure.selectionIndexEnd; i++){
					closure.tiles[i].marked = true;
					closure.moveCursorToTile(closure.selectionIndexEnd+1);
				}
			}
			console.log(closure.selectionIndexStart+":"+closure.selectionIndexEnd+":"+copiedText);
		};
	}
	
	TextUnit.prototype.receivedFocus = function(){
		this.focused = true;
		this.cursor.visible = true;
	}
	
	TextUnit.prototype.lostFocus = function(){
		this.focused = false;
		this.cursor.visible = false;
	}
	
	TextUnit.prototype.onKeyDown = function(){
		if (event.keyCode == 46){
			this.deleteLetterAt(this.cursor.positionId);
		}
		if (event.keyCode == 8){
			this.deleteLetterAt(this.cursor.positionId-1);
		}
		if (event.keyCode == 39){ 
			this.moveCursorRight();
		}
		if (event.keyCode == 37){
			this.moveCursorLeft(); 
		}
	}
	
	TextUnit.prototype.onKeyPress = function(){
		this.insertLetterAt(this.cursor.positionId,event.keyCode);
	}
	/**
	 * Method to set the content of the textUnit.
	 * Resets the content and then adds all letters passed in 
	 * iterative.
	 */
	TextUnit.prototype.setText = function(text){
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
		//cursor needs to be readded, because all children are deleted
		//this.createCursor();
		this.add(this.cursor);
		this.add(this.backgroundField);
		this.moveCursorToTile(this.text.length);
	}
	/**
	 * Sets the bitmapFont(Texture) which shall be used to create
	 * the letter tiles
	 */
	TextUnit.prototype.setBitmapFont = function(bitmapFont,bitmapFontDescriptor){
		this.bitmapFont = bitmapFont;
		this.bitmapFontDescriptor = bitmapFontDescriptor;
	}
	TextUnit.prototype.setMaxWidth = function(maxWidth){
		this.maxWidth = maxWidth;
	}
	TextUnit.prototype.setMaxHeight = function(maxHeight){
		this.maxHeight = maxHeight;
	}
	TextUnit.prototype.setFontSize = function(fontSize){
		this.fontSize = fontSize;
	}
	TextUnit.prototype.deleteLetterAt = function(positionID){
		if (positionID >= 0){ 
			var newText = this.text.substring(0, positionID)+this.text.substring(positionID+1, this.text.length);
			this.setText(newText);
		    this.moveCursorToTile(positionID);	
		}
	}
	TextUnit.prototype.insertLetterAt = function(positionID,charCode){
				var letter = String.fromCharCode(charCode);
				var newText = this.text.substring(0, positionID)+letter+this.text.substring(positionID, this.text.length);
				this.setText(newText);
				this.moveCursorToTile(positionID+1);				
	}

	TextUnit.prototype.moveCursorToTile = function(tileId){
		var tile = this.tiles[tileId];	
		if (tile != null){	
			this.cursor.xOffset = tile.currentxOffset;
			this.cursor.yOffset = tile.currentyOffset;
			this.cursor.positionId = tile.stringPositionId;		
		}
		console.log(tileId+":"+this.text.length);
		if ( tileId == this.text.length && this.text.length != 0){
			//move cursor to position right of the last letter
			this.cursor.xOffset = this.tiles[tileId-1].currentxOffset + this.tiles[tileId-1].xadvance;
			this.cursor.yOffset = this.tiles[tileId-1].currentyOffset;
			this.cursor.positionId = tileId;
			console.log("movetoback");
		}
	}
	TextUnit.prototype.moveCursorRight = function(){
		this.moveCursorToTile(this.cursor.positionId+1);
	}
	TextUnit.prototype.moveCursorLeft = function(){
		this.moveCursorToTile(this.cursor.positionId-1);
	}
	TextUnit.prototype.newline = function(){
		this.currentxOffset = 0;
		this.currentyOffset -= this.bitmapFontDescriptor.lineHeight/this.minSize;
	}
	TextUnit.prototype.createCursor = function(){
		
		//shaderProgram needs to be loaded and set here!
		
		var cursorRect = new Array();
    	cursorRect[0] = createRectangle(new Point3D((-0.05/96)*(96-this.fontSize),(-1/96)*(96-this.fontSize),1), 
    	new Point3D((0.05/96)*(96/this.fontSize),(-1/96)*(96/this.fontSize),1), 
    	new Point3D((0.05/96)*(96/this.fontSize),(0/96)*(96/this.fontSize),1), 
    	new Point3D((-0.05/96)*(96/this.fontSize),(0/96)*(96/this.fontSize),1));
    	   
    	this.cursor = WebGLBase.createObject3D(cursorRect, this.gl);
	}
	
	

