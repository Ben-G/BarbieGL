varying vec4 mvPosition;
varying vec4 transformedNormal;

void main(void)
{
	mvPosition = uMVMatrix * originalPosition;
	transformedNormal = uNMatrix * vec4(aNormals, 1.0);
}
