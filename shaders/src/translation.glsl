#ifdef GL_ES
	precision highp float;
	precision highp int;
#endif

uniform mat4 transMatrix;


void main(void) {
	vertexPosition = transMatrix * vertexPosition;
}
