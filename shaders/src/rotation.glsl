#ifdef GL_ES
	precision highp float;
	precision highp int;
#endif

uniform mat4 uPMatrix;
attribute vec3 aVertexPosition;
uniform mat4 rotMatrix;
uniform mat4 uMVMatrix;
varying vec2 vTextureCoord; 
attribute vec2 randomTextureCoord;


void main(void) {
	vTextureCoord = randomTextureCoord;

	vec4 pos = uPMatrix * (uMVMatrix * rotMatrix * vec4(aVertexPosition, 1.0));
	gl_Position = pos;
}
