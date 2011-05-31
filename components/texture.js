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
		}
	 }
}
			