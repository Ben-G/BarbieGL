function GLWindow(gl,width,height){
	GLWindow.superclass.constructor.call(this,gl);
	asDraggable.call(GLWindow.prototype);	
	this.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderBack);
	this.windowInitialize(width,height);
	
	this.addSubview = function(obj){
		this.backgroundField.add(obj);
	}
	
	this.setColor = function(color) {
		this.backgroundField.setColor(color);
	}
}

extend(GLWindow, Object3D); 


GLWindow.prototype.windowInitialize = function(width, height){
	
	
	var backField = new Array();
	backField[0] = createRectangle(new Point3D(0,-height,0.0), new Point3D(width,-height,0.0), new Point3D(width,0,0.0), new Point3D(0,0,0.0));
	    //backField[0] = createRectangle(new Point3D(-5,-5,1), new Point3D(5,-5,1), new Point3D(5,5,1), new Point3D(-5,5,1));
	var backFieldTextureCoord = rectangleTextureCoordBuffer();
	this.backgroundField = WebGLBase.createObject3D(backField, this.gl,backFieldTextureCoord);
	this.backgroundField.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderBack);
	this.add(this.backgroundField);
	this.backgroundField.yOffset = -1;
	
	
	

	this.titleBar = new Label(this.gl,width,1); 
	this.titleBar.tileLayer = 1;
	this.titleBar.setShaderProgram(WebGLBase.UIDelegate.ButtonShaderText);
	this.titleBar.backgroundField.setShaderProgram(WebGLBase.textureShaderProgram);
	this.titleBar.name = "titleBar";				
	this.titleBar.setBitmapFont(WebGLBase.UIDelegate.bmFontTexture,WebGLBase.UIDelegate.bmFontDescriptor);
	this.titleBar.setFontSize(1);
	this.titleBar.setText("first window");
		
	this.add(this.titleBar);
	
	var closure = this;
	
	this.titleBar.mouseDown = function(){
		closure.mouseHeldDown = true;
		if (closure.draggableMouseDown != null)
					closure.draggableMouseDown();	
	}
	
	this.titleBar.mouseUp = function(){
		closure.mouseHeldDown = false;
	}
	
	this.titleBar.click = function(){
		closure.mouseHeldDown = false;
	}
	
	this.titleBar.mouseMove = function(){
		//console.log("titlemove");
		closure.mouseMove();
	}
}