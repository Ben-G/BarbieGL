#ifdef GL_ES
	precision highp float;
	precision highp int;
#endif

uniform mat4 rotMatrix;


void main(void) {
	vertexPosition = rotMatrix * vertexPosition;
}
