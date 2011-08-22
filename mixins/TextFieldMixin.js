var asTextField = function(){
	
	this.initialize = function(gl,maxWidth,maxHeight){
		this.gl = gl;
		this.letters = new Array();
		this.currentxOffset = 0;
		this.currentyOffset = 0;
		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
		this.fontSize = 1;
		this.text = "";
		this.tiles = new Array();
		this.textFrags = new Array();
		
		//TODO Dringend durch default shader programm ersetzen
		this.label = new Object3D(this.gl);
		this.label.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderBack);
		
		this.selectionIndexStart;
		this.selectionIndexEnd;
		this.minSize=96-this.fontSize;
		//indicates the amount of scrolled lines
		this.scrolledLines = 0;
		this.currentLine = 0;
		this.textColor = $V([1.0,1.0,1.0]);

		this.objectHierarchyIdFloat = Math.random();
	   
	   
	
	   
	    	if (this.createCursor != null)
			this.createCursor();
	    
	    var backField = new Array();
	    backField[0] = createRectangle(new Point3D(0,-this.maxHeight,0), new Point3D(this.maxWidth,-this.maxHeight,0), new Point3D(this.maxWidth,0,0), new Point3D(0,0,0));
	    //backField[0] = createRectangle(new Point3D(-5,-5,1), new Point3D(5,-5,1), new Point3D(5,5,1), new Point3D(-5,5,1));
		var backFieldTextureCoord = rectangleTextureCoordBuffer();
	    this.backgroundField = WebGLBase.createObject3D(backField, this.gl, backFieldTextureCoord);
	    //otherwise component has cursor by default
	    if(this.lostFocus != null)
	   		this.lostFocus();
	    
	    var closure = this;
	    
	    this.backgroundField.name = "background";
	    this.backgroundField.objectHierarchyId = this.objectHierarchyIdFloat;
	    
	    
	    this.backgroundField.clicked = function(){
			WebGLBase.UIDelegate.reportFocus(closure);
			if (closure.clicked != null)
				closure.clicked();
		    closure.mouseHeldDown = false; 
		}
		this.backgroundField.mouseDown = function(){
				closure.mouseDown();							
		}
		
		this.backgroundField.mouseUp = function(){
				closure.mouseUp();							
		}
		
		this.backgroundField.mouseMove = function(){			
				if (closure.mouseMove != null)
					closure.mouseMove();								
		}
		
	
		this.setColor = function(color){
			Object3D.prototype.setColor.call(this,color);
			this.backgroundField.setColor(color);
		}	
	    //this.add(this.cursor);
	    //this.add(this.backgroundField);
	}
	
	
	this.addLetter = function(letter, textColor){
		if (letter.charCodeAt(0) == 13){
			this.newline();
		}
		
		//Array for vertice collection
		var triangles2 = new Array();
		//Metainformation and textureCoordBuffer for a given letter
		var letterInfo = this.bitmapFontDescriptor.getLetter(letter);
		
		var xadvance = letterInfo.xadvance/this.minSize;
        var xoffset = letterInfo.xoffset/this.minSize;
        var yoffset = letterInfo.yoffset/this.minSize;
    		
    	triangles2[0] = createRectangle(new Point3D(0,-letterInfo.height/this.minSize,0.1), 
    		new Point3D(letterInfo.width/this.minSize,-letterInfo.height/this.minSize,0.1), 
    		new Point3D(letterInfo.width/this.minSize,0,0.1), new Point3D(0,0,0.1)); 	
    		
    		 
    	var tile = WebGLBase.createTile(triangles2, this.gl);
 
    	//Create and fill a textureCoordBuffer
    	tile.textColor = textColor;
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
		tile.heightOffset = yoffset;
		//tile.yOffset = this.currentyOffset+letterInfo.yoffset; 
		//tile.xOffset = this.currentxOffset+letterInfo.xoffset; 
		
		if (this.tileLayer != null){
			tile.layer = this.tileLayer;
			//console.log("setting tileLayer");
		}
		
		tile.objectHierarchyId = this.objectHierarchyIdFloat;
		tile.name = "tile";
    	
		
		if (tile.xOffset + tile.xadvance > this.maxWidth && this.maxWidth != 0){
			//start new line
			this.newline();
			//reset positioning
			tile.yOffset = this.currentyOffset-(yoffset);
			tile.xOffset = this.currentxOffset+(xoffset);
			tile.currentyOffset = this.currentyOffset;
			tile.currentxOffset = this.currentxOffset;

			//increase positioning for next letter
			this.currentxOffset += xadvance;
		}else{
			//increase positioning for next letter
			this.currentxOffset += xadvance;
		}
		//move cursor
		//this.cursor.xOffset = this.currentxOffset;
		//this.cursor.yOffset = this.currentyOffset;
		
		
		 
		this.label.add(tile);	
		this.text+=letter;
		tile.stringPositionId = this.text.length - 1;
		

		this.tiles[tile.stringPositionId] = tile;
		//Add the letter to the data structure (Array containing all letters within the textUnit)	
		this.letters.push(letter);
		tile.setShaderProgram(this.shaderProgram);
		tile.addTexture(this.bitmapFont, "randomTextureCoord", "uSampler" ,this.gl); 
		var lightpart = tile.shaderProgram.fragmentShader.getPartsByName("lighting")[0];
		if(lightpart != null) {
			lightpart.isActive = false;
	
		}		
		
		//is called if any of the tiles is beeing clicked
		if (this.enableMouseInteraction != null)
			this.enableMouseInteraction(tile);
	}
	
		
	/**
	 * Sets the bitmapFont(Texture) which shall be used to create
	 * the letter tiles
	 */
	this.setBitmapFont = function(bitmapFont,bitmapFontDescriptor){
		this.bitmapFont = bitmapFont;
		this.bitmapFontDescriptor = bitmapFontDescriptor;
		this.lineHeight = this.bitmapFontDescriptor.lineHeight/this.minSize;
	}
	this.setMaxWidth = function(maxWidth){
		this.maxWidth = maxWidth;
	}
	this.setMaxHeight = function(maxHeight){
		this.maxHeight = maxHeight;
	}
	this.setFontSize = function(fontSize){
		this.fontSize = fontSize;
		this.minSize=96-this.fontSize;
		this.lineHeight = this.bitmapFontDescriptor.lineHeight/this.minSize;

		if (this.createCursor != null)
			this.createCursor();
	}
	this.deleteLetterAt = function(positionID){
		if (positionID >= 0){ 
			var newText = this.text.substring(0, positionID)+this.text.substring(positionID+1, this.text.length);
			this.setText(newText);
		    this.moveCursorToTile(positionID);	
		}
	}
	this.insertLetterAt = function(positionID,charCode){
				var letter = String.fromCharCode(charCode);
				var newText = this.text.substring(0, positionID)+letter+this.text.substring(positionID, this.text.length);
				this.setText(newText);
				this.moveCursorToTile(positionID+1);				
	}

	
	this.newline = function(){
		this.currentxOffset = 0;
		this.currentyOffset -= this.bitmapFontDescriptor.lineHeight/this.minSize;
		this.currentLine += 1;
	}

	
	
	/**
	 * Method to set the content of the textUnit.
	 * Resets the content and then adds all letters passed in 
	 * iterative.
	 */
	this.setText = function(text){
		this.children = new Array();
		this.label.children = new Array();
		this.letters = new Array();
		this.tiles = new Array();
		this.currentxOffset = 0;
		this.currentyOffset = 0;
		this.currentLine = 0;
		if (this.cursor != null){
			this.cursor.xOffset = 0;
			this.cursor.yOffset = 0;
		}
		this.text = "";
		
		this.add(this.label);
		this.label.xOffset = 0.2;
		
		for (var i = 0; i<text.length; i++){
			var textColor = this.textColor;
			this.addLetter(text[i], textColor);
		}
		//cursor needs to be readded, because all children are deleted
		//this.createCursor();
		if (this.cursor != null)
			this.add(this.cursor);
		if (this.backgroundField != null)	
			this.add(this.backgroundField);
		if (this.moveCursorToTile != null)
			this.moveCursorToTile(this.text.length);
			
		if (this.scrollToLine != null && this.currentLine >= this.visibleLines)
			this.scrollToLine(this.currentLine-(this.visibleLines-1));
		else if(this.scrollToLine != null)
			this.scrollToLine(0);
	}
	
	this.setTextFrags = function(textFrags){
		this.children = new Array();
		this.label.children = new Array();
		this.letters = new Array();
		this.tiles = new Array();
		this.currentxOffset = 0;
		this.currentyOffset = 0;
		this.currentLine = 0;
		this.textFrags = textFrags;
		if (this.cursor != null){
			this.cursor.xOffset = 0;
			this.cursor.yOffset = 0;
		}
		this.text = "";
		
		this.add(this.label);
		this.label.xOffset = 0.2;
		console.log(textFrags[0]);
		for (var j = 0; j<textFrags.length; j++){
			var text = textFrags[j];
			for (var i = 0; i<text.text.length; i++){
				//var textColor = this.textColor;
				this.addLetter(text.text[i], text.textColor);
			}
		}
		//cursor needs to be readded, because all children are deleted
		//this.createCursor();
		if (this.cursor != null)
			this.add(this.cursor);
		if (this.backgroundField != null)	
			this.add(this.backgroundField);
		if (this.moveCursorToTile != null)
			this.moveCursorToTile(this.text.length);
			
		if (this.scrollToLine != null && this.currentLine >= this.visibleLines)
			this.scrollToLine(this.currentLine-(this.visibleLines-1));
		else if(this.scrollToLine != null)
			this.scrollToLine(0);
	}
	
	this.addTextFragment = function(textFrag){
		//this.text += textFrag.text;
		this.textFrags.push(textFrag);
		this.setTextFragment(this.textFrags);
	}
	
}


var asEditableTextField = function(){
	this.onKeyDown = function(){
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
	
	this.onKeyPress = function(){
		this.insertLetterAt(this.cursor.positionId,event.keyCode);
	}
}


var asClickableAndMarkable = function(){
	this.enableMouseInteraction = function(tile){
		
		var closure = this;
		
		//for(var i = 0; i < this.tiles.length;i++){
		//	var tile = this.tiles[i];
				
		
			
					
			
			tile.clicked =  function(){
				this.mouseHeldDown = false;
			};
			tile.mouseDown = function(){
				closure.selectionIndexStart = this.stringPositionId;
				for (var i=0; i<=closure.text.length-1;i++){
					closure.tiles[i].marked = false;		
				}
				WebGLBase.UIDelegate.reportFocus(closure);
			};
			tile.mouseUp = function(){
				closure.mouseHeldDown = false;
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
		this.mouseUp = function(){
			this.mouseHeldDown = false;
		}
		
		this.mouseDown = function(){
			this.mouseHeldDown = true; 
				
				if (this.draggableMouseDown != null)
					this.draggableMouseDown();	
		}
		
		this.moveCursorToTile = function(tileId){
			var tile = this.tiles[tileId];	
			
			
			
			if (tile != null){
				if (tile.visible == false){
					this.cursor.visible = false;
				}else{
					this.cursor.visible = true;
				}	
				this.cursor.xOffset = tile.currentxOffset+this.label.xOffset;
				this.cursor.yOffset = tile.currentyOffset+this.label.yOffset;
				this.cursor.positionId = tile.stringPositionId;		
			}
			if ( tileId == this.text.length && this.text.length != 0){
				this.checkCursorVisibility();
				//move cursor to position right of the last letter
				this.cursor.xOffset = this.tiles[tileId-1].currentxOffset + this.tiles[tileId-1].xadvance + +this.label.xOffset;
				this.cursor.yOffset = this.tiles[tileId-1].currentyOffset + this.label.yOffset;
				this.cursor.positionId = tileId;
			}
		}
		this.moveCursorRight = function(){
			this.moveCursorToTile(this.cursor.positionId+1);
		}
		this.moveCursorLeft = function(){
			this.moveCursorToTile(this.cursor.positionId-1);
		}
		this.receivedFocus = function(){
			this.focused = true;
			if (this.tiles[this.cursor.positionId] != null && this.tiles[this.cursor.positionId].visible == true)
				this.cursor.visible = true;
		}
	
		this.lostFocus = function(){
			this.focused = false;
			this.cursor.visible = false;
		}
		
		this.createCursor = function(){					
			var cursorRect = new Array();
			var cursorScale = 96/this.minSize;
	    	cursorRect[0] = createRectangle(new Point3D(-0.05*cursorScale,-1*cursorScale,0.1), 
	    	new Point3D(0.05*cursorScale,-1*cursorScale,0.1), 
	    	new Point3D(0.05*cursorScale,0*cursorScale,0.1), 
	    	new Point3D(-0.05*cursorScale,0*cursorScale,0.1));
	    	   
	    	this.cursor = WebGLBase.createObject3D(cursorRect, this.gl);
	    	this.cursor.setShaderProgram(WebGLBase.UIDelegate.cursorShaderProgram);
	    	//this.cursor.addAnimationMash(WebGLBase.UIDelegate.cursorAnimationMash);
	    	this.cursor.visible = false;
		}
		
		this.checkCursorVisibility = function(){
			
			if (this.focused == false){
				this.cursor.visible = false;
				return;
			}
			
			if (this.tiles[this.cursor.positionId] != null && this.tiles[this.cursor.positionId].visible == false)
			this.cursor.visible = false;
				else{
			this.cursor.visible = true;
			}
			if (this.cursor.positionId == this.tiles.length && this.tiles.length > 1){
				if (this.tiles[this.tiles.length-2].visible == false)
					this.cursor.visible = false;
			else
				this.cursor.visible = true;
			}
		}
}



