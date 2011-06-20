#ifdef GL_ES
	precision highp float;
	precision highp int;
#endif

attribute vec2 randomTextureCoord;
varying vec2 vTextureCoord;


void main(void) {
	vTextureCoord = randomTextureCoord;
}
