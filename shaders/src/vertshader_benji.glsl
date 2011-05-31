attribute vec3 aVertexPosition;
uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;

void main(void) {
	 gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}


