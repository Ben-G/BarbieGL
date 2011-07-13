function TextureUnit(unitID, texUnit){
	this.unitIdentifier = unitID;
	this.textureUnit = texUnit;
}


function TextureModel(){
	this.cache = new Object();
	this.currentUnit = 0;
	this.maxUnit = 6;

	this.textureUnitsArray = new Array();
}

TextureModel.prototype = {
	find: function(textureName, gl){
			if (this.cache[textureName] == null){
				var newTexture = new Texture();
            	newTexture.webglTexture = gl.createTexture();
    			newTexture.webglTexture.image = new Image();
    			var closure = this;
  				newTexture.webglTexture.image.onload = function()    {
	    		    gl.enable(gl.TEXTURE_2D);
	    		    var texUnit = closure.getTexUnit(gl);
	    	    	closure.textureUnitsArray[texUnit.unitIdentifier] = newTexture;
				    gl.activeTexture(texUnit.textureUnit);
      				newTexture.textureUnit = texUnit.unitIdentifier;
      				newTexture.texUnit = texUnit.textureUnit;				    
				    gl.bindTexture(gl.TEXTURE_2D, newTexture.webglTexture);
		            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, newTexture.webglTexture.image);
				    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    				}
			   newTexture.webglTexture.image.src = "textures/"+textureName;
           }else{ 
            	
			}
			return newTexture;
    }, 
    _addToCache: function(shaderName,shaderString){
        this.cache[shaderName] = shaderString;
    },
    activate: function(obj){
    	var gl = obj.gl;
    	if(obj.shaderProgram == null) throw "You must set a shader program first"; 	
    	for (i=0; i<obj.textures.length; i++){   	
	    	var newTexture = obj.textures[i];
	    	if(newTexture.samplerParameter != null) {
		    	if (newTexture.textureUnit == null){
		    	
			    	var texUnit = this.getTexUnit(gl);
			    	
					newTexture.textureUnit = texUnit.unitIdentifier;
					this.textureUnitsArray[texUnit.unitIdentifier] = newTexture;
					newTexture.texUnit = texUnit.textureUnit;
				    gl.activeTexture(newTexture.texUnit);
			        gl.bindTexture(gl.TEXTURE_2D, newTexture.webglTexture);
			        console.log("aktualisiereTextur");
	        
	       		}
	       		obj.shaderProgram.setParameter(newTexture.samplerParameter, newTexture.textureUnit);
	       		obj.shaderProgram.setBuffer(newTexture.coordParameter, obj.texBuffer, new Float32Array(obj.texBuffer.buffer))
       		}
            //gl.bindBuffer(gl.ARRAY_BUFFER,obj.texBuffer.values);
			//gl.vertexAttribPointer(obj.textures[i].attribLocation,obj.texBuffer.itemSize, gl.FLOAT, false, 0,0);
       }
    },
    getTexUnit: function(gl){
    	var returnUnit;

    	switch(this.currentUnit)
		{
		case 0:
		  if (this.textureUnitsArray[0]!= null){
		  	console.log("replacing Texture");
		  	this.textureUnitsArray[0].textureUnit = null;
		  }	
		  returnUnit = new TextureUnit(0,gl.TEXTURE0);
		  break;
		case 1:
		  if (this.textureUnitsArray[1]!= null){
		  	console.log("replacing Texture");
		  	this.textureUnitsArray[1].textureUnit = null;
		  }	
		  returnUnit = new TextureUnit(1,gl.TEXTURE1);
		  break;
		case 2:
		  if (this.textureUnitsArray[2]!= null){
		  	console.log("replacing Texture");
		  	this.textureUnitsArray[2].textureUnit = null;
		  }	
		  returnUnit = new TextureUnit(2,gl.TEXTURE2);
		  break;
		case 3:
		  if (this.textureUnitsArray[3]!= null){
		  	console.log("replacing Texture");
		  	this.textureUnitsArray[3].textureUnit = null;
		  }	
		  returnUnit = new TextureUnit(3,gl.TEXTURE3);
		break;
		case 4:
		  if (this.textureUnitsArray[4]!= null){
		  	console.log("replacing Texture");
		  	this.textureUnitsArray[4].textureUnit = null;
		  }	
		  returnUnit = new TextureUnit(4,gl.TEXTURE4);
		break;
		case 5:
		  if (this.textureUnitsArray[5]!= null){
		  	console.log("replacing Texture");
		  	this.textureUnitsArray[5].textureUnit = null;
		  }	
		  returnUnit = new TextureUnit(5,gl.TEXTURE5);
		break;
		case 6:
		  if (this.textureUnitsArray[6]!= null){
		  	console.log("replacing Texture");
		  	this.textureUnitsArray[6].textureUnit = null;
		  }	
		  returnUnit = new TextureUnit(6,gl.TEXTURE6);
		break;
		}
		
		this.currentUnit++;
    	if (this.currentUnit >= this.maxUnit)
    		this.currentUnit = 0;
    		
		
		return returnUnit;
	 }	
    	
}

TextureModel = new TextureModel();


