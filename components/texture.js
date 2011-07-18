function Texture(){
	this.webglTexture = null;	
	this.textureUnit = null;
}


Texture.prototype = {
	setTextureUnit: function(textureUnit,gl){
		switch(textureUnit)
		{
		case gl.TEXTURE0:
		  this.textureUnit = 0;
		  break;
		case gl.TEXTURE1:
		  this.textureUnit = 1;
		  break;
		case gl.TEXTURE2:
		  this.textureUnit = 2;
		  break;
		case gl.TEXTURE3:
		  this.textureUnit = 3;
		  break;
		case gl.TEXTURE4:
		  this.textureUnit = 4;
		  break;
		case gl.TEXTURE5:
		  this.textureUnit = 5;
		  break;
		case gl.TEXTURE6:
		  this.textureUnit = 6;
		  break;
		}
	 }
}
			