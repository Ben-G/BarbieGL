#ifdef GL_ES
	precision highp float;
#endif

attribute vec3 aVertexPosition;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main(void) {
	const vec3 originalPosition = aVertexPosition;
	/* code */
	gl_Position = uPMatrix * (uMVMatrix * vec4(aVertexPosition, 1.0));
}
