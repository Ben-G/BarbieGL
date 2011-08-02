function Drawer(){
    //this.currentObject;  <-- rootNode of the scene
    //this.currentGl
    //this.currentShaderProgram
    this.shaders = new Array();
    this.fpsLimit = 60;
}
var last_frame = 0;
var fpsUpdateTime = 500;
var fpsFramesTime = 0;
var fpsFramesCount = 0;
blah = false;

Drawer.prototype = {
     startDrawing: function(object){
        this.currentObject = object;
        this.currentGl = object.gl;
        this.currentGl.clearColor(0.0, 0.0, 0.0, 1.0);     
        this.currentGl.clearDepth(1.0);
        this.currentGl.enable(this.currentGl.DEPTH_TEST);
        this.currentGl.depthFunc(this.currentGl.LEQUAL);
        
        //TODO klären, warum Semi-Transparenz nicht funktioniert bzw. nur für Texturen funktioniert
        
        //new: blending
    this.currentGl.blendColor(1.0, 1.0, 1.0, 0.0);  
    //this.currentGl.blendEquation(this.currentGl.FUNC_ADD);
    this.currentGl.blendFunc(this.currentGl.SRC_ALPHA, this.currentGl.ONE_MINUS_SRC_ALPHA);
	this.currentGl.enable(this.currentGl.BLEND); 
	
	
	/**this.currentGl.enable( this.currentGl.BLEND );
	this.currentGl.blendEquationSeparate( this.currentGl.FUNC_ADD, this.currentGl.FUNC_ADD );
	this.currentGl.blendFuncSeparate( this.currentGl.SRC_ALPHA, this.currentGl.ONE_MINUS_SRC_ALPHA, this.currentGl.ONE, this.currentGl.ONE_MINUS_SRC_ALPHA );	
		**/
				//this.currentGl.disable(this.currentGl.DEPTH_TEST);


        setInterval(function(){ myDrawer.drawScene() }, 1.0/this.fpsLimit*1000);
     },

    drawScene: function(){
    	
    	this.currentGl.clear(this.currentGl.COLOR_BUFFER_BIT | this.currentGl.DEPTH_BUFFER_BIT);
    	this.currentShaderProgram = this.currentObject.shaderProgram;
    	this.drawElement(this.currentObject, this.currentGl, this.currentShaderProgram);
    	if(fpsFramesTime > fpsUpdateTime) {
    		var div = document.getElementById("fps");
    		var fps = Math.round(1000.0 / (fpsFramesTime / fpsFramesCount) * 100)/100 + " fps";
    		if(div != null) div.innerHTML = fps;
    		fpsFramesTime = 0; 
    		fpsFramesCount = 0;
    	} else {
    		fpsFramesTime += new Date().getTime() - last_frame;
    		fpsFramesCount++;
    	}
    	last_frame = new Date().getTime();
    	//console.log("Frame:" + (new Date().getTime() - last_frame) + " ms");
    },
    drawElement: function(obj, gl, shaderProgram, transMat){
    	gl.useProgram(shaderProgram.binary);
    	var translationMat = obj.refresh(transMat);	

    	if(obj.visible) {
	    	if (obj.buffer.itemSize != null) {
	    		//console.log(obj.name, shaderProgram);
	    		if(obj.perspectiveHasChanged) {
		     		shaderProgram.setParameter(WebGLBase.stdVertParams["P_MATRIX"], new Float32Array(WebGLBase.pMatrix.flatten()));
					obj.perspectiveHasChanged = false;
				}
				//if(obj.mvMatrixHasChanged) {
					shaderProgram.setParameter(WebGLBase.stdVertParams["MV_MATRIX"], new Float32Array(translationMat.flatten()));
					obj.mvMatrixHasChanged = false;
				//}
				//if(obj.vertexPositionsHaveChanged) {
					shaderProgram.setBuffer(WebGLBase.stdVertParams["VERTEX_POSITION"], obj.buffer, new Float32Array(obj.vertices));
					obj.vertexPositionsHaveChanged = false;
				//}
			    if (obj.texBuffer != null) {
			    	//obj has a texture in use COMMIT TEST
			    	//request texture to be hold in place by textureModel
			    	TextureModel.activate(obj);      	              	
			    }
			    // DEBUGGING OUTPUT for webgl inspector
			    //gl.getUniformLocation(shaderProgram.binary, "drawing " + obj.name);

			    gl.drawArrays(gl.TRIANGLES, 0, obj.buffer.numItems);
	        }
       }
        //console.log("  " +   obj.name + " " + (new Date().getTime() - anfang) + " ms");
        if (obj.children.length > 0){
            for (var i=0; i<obj.children.length;i++){
            	 this.currentShaderProgram = obj.children[i].shaderProgram;
                 this.drawElement(obj.children[i],gl,this.currentShaderProgram, translationMat);
                
            }
        }
        
       	//gl.useProgram(shaderProgram.binary);
        obj.updateBoundingBox(gl, shaderProgram);
        
        //console.log(obj.name + " " + (new Date().getTime() - anfang) + " ms");
        /*gl.bindBuffer(gl.ARRAY_BUFFER, obj.boundingBox.buffer.values);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.boundingBox.buffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_LOOP, 0, obj.boundingBox.buffer.numItems);   
        */
       
        
    }
}

