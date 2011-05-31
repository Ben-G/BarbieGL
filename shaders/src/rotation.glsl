#ifdef GL_ES
	precision highp float;
	precision highp int;
#endif

uniform mat4 uPMatrix;
attribute vec3 aVertexPosition;
uniform float start_offset_x;
uniform float start_offset_y;
uniform float start_offset_z;
uniform float end_offset_x;
uniform float end_offset_y;
uniform float end_offset_z;
uniform int current_time_offset;
uniform int duration;
uniform mat4 uMVMatrix;
varying vec2 vTextureCoord; 
attribute vec2 randomTextureCoord;


mat4 xRotMatrix(float x_deg) {
	return mat4(vec4(1.0,0.0,0.0,0.0), vec4(0.0,cos(x_deg),-sin(x_deg),0.0), vec4(0.0,sin(x_deg),cos(x_deg),0.0), vec4(0.0,0.0,0.0,1.0));
}
mat4 yRotMatrix(float y_deg) {
	return mat4(vec4(cos(y_deg),0.0,sin(y_deg),0.0), vec4(0.0,1.0,0.0,0.0), vec4(-sin(y_deg),0.0,cos(y_deg),0.0), vec4(0.0,0.0,0.0,1.0));
}
mat4 zRotMatrix(float z_deg) {
	return mat4(vec4(cos(z_deg),-sin(z_deg),0.0,0.0), vec4(sin(z_deg),cos(z_deg),0.0,0.0), vec4(0.0,0.0,1.0,0.0), vec4(0.0,0.0,0.0,1.0));
}

mat4 calculateRotationMatrix(float x_deg, float y_deg, float z_deg) {
	mat4 rot = xRotMatrix(x_deg) * yRotMatrix(y_deg) * zRotMatrix(z_deg);
	return rot;
}

float calculateAngle(float start,float end,int time,int duration) {
	return float((end-start) * (float(time) / float(duration)));
}

void main(void) {
	vTextureCoord = randomTextureCoord;

	float x_deg = calculateAngle(start_offset_x, end_offset_x, current_time_offset, duration);
	float y_deg = calculateAngle(start_offset_y, end_offset_y, current_time_offset, duration);
	float z_deg = calculateAngle(start_offset_z, end_offset_z, current_time_offset, duration);
	
	mat4 rotMat = calculateRotationMatrix(x_deg, y_deg, z_deg);
	vec4 pos = uPMatrix * (uMVMatrix * rotMat * vec4(aVertexPosition, 1.0));
	gl_Position = pos;
}
