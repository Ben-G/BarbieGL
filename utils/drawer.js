function Drawer(){
    //this.currentObject;  <-- rootNode of the scene
    //this.currentGl
    //this.currentShaderProgram
    this.shaders = new Array();
}

Drawer.prototype = {
     startDrawing: function(object){
        this.currentObject = object;
        this.currentGl = object.gl;
        this.currentGl.clearColor(0.5, 0.5, 0.5, 1.0);     
        this.currentGl.clearDepth(1.0);
        this.currentGl.enable(this.currentGl.DEPTH_TEST);
        this.currentGl.depthFunc(this.currentGl.LEQUAL);
        setInterval(function(){ myDrawer.drawScene() }, 10);
    },

    drawScene: function(){
    	this.currentGl.clear(this.currentGl.COLOR_BUFFER_BIT | this.currentGl.DEPTH_BUFFER_BIT);
    	this.currentShaderProgram = this.currentObject.shaderProgram;
    	this.drawElement(this.currentObject, this.currentGl, this.currentShaderProgram);
    },
    drawElement : function(obj, gl, shaderProgram, transMat){
    	
    	gl.useProgram(shaderProgram.binary);
    	var lastTranslationMat = obj.refresh(gl,shaderProgram, transMat);	
    	
    	if (obj.buffer.itemSize != null) {
	    	
	    	
	    	WebGLBase.perspective(45, this.currentGl.viewportWidth / this.currentGl.viewportHeight, 0.1, 100.0);
	     	WebGLBase.setMatrixUniforms(this.currentGl, shaderProgram.binary);	
	     	
	        shaderProgram.vertexPositionAttribute = shaderProgram.gl.getAttribLocation(shaderProgram.binary, "aVertexPosition");
    		shaderProgram.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer.values);
        
		    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.buffer.itemSize, gl.FLOAT, false, 0, 0);
		    
		    if (obj.texBuffer != null){
		    	//obj has a texture in use COMMIT TEST
		    	//request texture to be hold in place by textureModel
		    	TextureModel.activate(obj.textures, obj,gl);      	              	
		    	
			  
			  
		    }
		    gl.drawArrays(gl.TRIANGLES, 0, obj.buffer.numItems);
        
        }
        if (obj.children.length > 0){
            for (var i=0; i<obj.children.length;i++){
            	 this.currentShaderProgram = obj.children[i].shaderProgram;
                 this.drawElement(obj.children[i],gl,this.currentShaderProgram, lastTranslationMat);
                
            }
        }
        
       	gl.useProgram(shaderProgram.binary);
        obj.updateBoundingBox(gl, shaderProgram);
        /*gl.bindBuffer(gl.ARRAY_BUFFER, obj.boundingBox.buffer.values);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.boundingBox.buffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_LOOP, 0, obj.boundingBox.buffer.numItems);   
        */
       
        
    }
}
