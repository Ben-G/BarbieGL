function Drawer(){
    //this.currentObject;  <-- rootNode of the scene
    //this.currentGl
    //this.currentShaderProgram
    this.shaders = new Array();
    this.fpsLimit = 60;
    this.rootElement;
    this.drawables = new Array();
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
    	this.rootElement = this.currentObject;
    	this.drawables = new Array();
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
    	shaderProgram = obj.shaderProgram;
    	gl.useProgram(shaderProgram.binary);
    	var translationMat = obj.refresh(transMat);	

    	
        //console.log("  " +   obj.name + " " + (new Date().getTime() - anfang) + " ms");
        if (obj.children.length > 0){
            for (var i=0; i<obj.children.length;i++){
            	 this.currentShaderProgram = obj.children[i].shaderProgram;
                 this.drawElement(obj.children[i],gl,this.currentShaderProgram, translationMat);
                
            }
        }
        
        //this.drawObject(obj,gl,shaderProgram);
        if (obj != this.rootElement){
        	this.drawables.push(obj);
        }else{
        	//sort elements by z-value to ensure correct transparency calculation	

       		this.drawables.sort(zSort);

        	for (var i=0; i < this.drawables.length; i++){
        		this.drawObject(this.drawables[i],gl,shaderProgram);
        	}
        }
       
        
       	//gl.useProgram(shaderProgram.binary);
        obj.updateBoundingBox(gl, shaderProgram);
        
        //console.log(obj.name + " " + (new Date().getTime() - anfang) + " ms");
        /*gl.bindBuffer(gl.ARRAY_BUFFER, obj.boundingBox.buffer.values);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, obj.boundingBox.buffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINE_LOOP, 0, obj.boundingBox.buffer.numItems);   
        */
       
        
    },
    drawObject: function(obj,gl,shaderProgram){
    	var gl = obj.gl;
    	var shaderProgram = obj.shaderProgram;
    	gl.useProgram(shaderProgram.binary);

    	
    	if(obj.visible) {
    		obj.prepareDrawing();
	    	if (obj.buffer.itemSize != null) {
	    		//console.log("drawing ", obj.name, obj.shaderProgram);
	    		this.drawLights(obj, translationMat);
	    		
	    		//console.log(obj.name, shaderProgram);
	    		if(obj.perspectiveHasChanged) {
		     		shaderProgram.setParameter(WebGLBase.stdVertParams["P_MATRIX"], new Float32Array(WebGLBase.pMatrix.flatten()));
					obj.perspectiveHasChanged = false;
				}
				//if(obj.mvMatrixHasChanged) {
					shaderProgram.setParameter(WebGLBase.stdVertParams["MV_MATRIX"], new Float32Array(obj.lastTranslMatrix.flatten()));
					obj.mvMatrixHasChanged = false;
					
					if(obj.normalMatrix != null) {
						shaderProgram.setParameter(WebGLBase.stdVertParams["N_MATRIX"], new Float32Array(obj.normalMatrix.flatten()));
						obj.mvMatrixHasChanged = false;
					}
					
					if(obj.normalsBuffer != null) {
						shaderProgram.setBuffer(WebGLBase.stdVertParams["NORMALS"], obj.normalsBuffer, new Float32Array(obj.normalsBuffer.buffer));
						obj.normalsHaveChanged = false;
					}
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
			    gl.getUniformLocation(shaderProgram.binary, "drawing " + obj.name);

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
       
        
    },
    drawLights: function(obj, transMat) {
    	var lights = obj.getAllLights();
    	var pointCount = dirCount = ambCount = 0;
    	var part = obj.shaderProgram.fragmentShader.getPartsByName("lighting")[0];
    	
    	if(lights.length > 0) {
	    	
	    	for(var i = 0; i < lights.length; i++) {
	    		var light = lights[i];
			light.refresh(transMat);
	    		
	    		switch(light.type) {
	    			case Light.TYPE_AMBIENT_LIGHT:
	    				obj.shaderProgram.setParameter(part.getParameterById("uAmbientColor" + ambCount), light.color.flatten());
	    				ambCount++;
						break;
					case Light.TYPE_DIRECTIONAL_LIGHT:
						obj.shaderProgram.setParameter(part.getParameterById("uDirectionalColor"+ dirCount), light.color.flatten());
						obj.shaderProgram.setParameter(part.getParameterById("uDirectionalDirection" +dirCount), light.direction.flatten());
						dirCount++;
						break;
					case Light.TYPE_POINT_LIGHT:
						obj.shaderProgram.setParameter(part.getParameterById("uPointColor"+pointCount), light.color.flatten());
						obj.shaderProgram.setParameter(part.getParameterById("uPointPosition"+pointCount), light.position.flatten());
						pointCount++;
						break;
					case Light.TYPE_SPOT_LIGHT:
						break;
	    		}
	    	}
    	}
    	
		//var s = (pointCount > 0);
		//obj.shaderProgram.setParameter(part.getParameterById("usePointLights"), s);
		obj.shaderProgram.setParameter(part.getParameterById("uPointLightsCount"), pointCount);
		
		//s = (dirCount>0);
		//obj.shaderProgram.setParameter(part.getParameterById("useDirectionalLights"), s);
		obj.shaderProgram.setParameter(part.getParameterById("uDirectionalLightsCount"), dirCount);
		
		//s = (ambCount>0);
		//obj.shaderProgram.setParameter(part.getParameterById("useAmbientLights"), s);
		obj.shaderProgram.setParameter(part.getParameterById("uAmbientLightsCount"), ambCount);
		
		if(obj.sheen && pointCount > 0) {
    		obj.shaderProgram.setParameter(part.getParameterById("useSpecularLights"), true);
			obj.shaderProgram.setParameter(part.getParameterById("uSpecularColor"), obj.sheenColor.flatten());
			obj.shaderProgram.setParameter(part.getParameterById("uShininess"), obj.shininess);		
    	} else {
    		obj.shaderProgram.setParameter(part.getParameterById("useSpecularLights"), false);
    	}
    }
}

