/**
Some help functions for creating buffers for different shapes
*/
function createTriangle(p1,p2,p3) {
	return [
		p1.x,  p1.y,  p1.z,
		p2.x,  p2.y,  p2.z,
		p3.x,  p3.y,  p3.z,
	]
}

function createRectangle(p1,p2,p3,p4) {
	return [
		p1.x,  p1.y,  p1.z,
		p2.x,  p2.y,  p2.z,
		p4.x,  p4.y,  p4.z,
		p2.x,  p2.y,  p2.z,
		p3.x,  p3.y,  p3.z,
		p4.x,  p4.y,  p4.z,
		]	
}

function rectangleTextureCoordBuffer(){
	return [
		0.0,1.0,//P1
		1.0,1.0,//P2
		0.0,0.0,//P4
		1.0,1.0,//P2
		1.0,0.0,//P3
		0.0,0.0,]//P4	
}

rectangleTextureCoordBuffer.A = function(){
	letterObj = new Object();
	letterObj.buffer = [
		0.093,0.495,
		0.156,0.495,
		0.093,0.372,
		0.156,0.495,
		0.156,0.372,
		0.093,0.372,];
	letterObj.ratioFactor = 2/ (letterObj.buffer[1]-letterObj.buffer[5]);  
	letterObj.aspectY = 2;
	letterObj.aspectX = (letterObj.buffer[2]-letterObj.buffer[0]) * letterObj.ratioFactor;
	return letterObj;	
}

rectangleTextureCoordBuffer.B = function(){
	letterObj = new Object();
	letterObj.buffer = [
		0.164,0.495,
		0.217,0.495,
		0.164,0.372,
		0.217,0.495,
		0.217,0.372,
		0.164,0.372,];
	letterObj.ratioFactor = 2/ (letterObj.buffer[1]-letterObj.buffer[5]);  
	letterObj.aspectY = 2;
	letterObj.aspectX = (letterObj.buffer[2]-letterObj.buffer[0]) * letterObj.ratioFactor;
	return letterObj;		
}

function createCube() {
	return [
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0, -1.0, -1.0, 

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,
    1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0,  1.0,  1.0,
    1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
    ]	
}

