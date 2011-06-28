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
		0.0,0.0,
		1.0,0.0,
		1.0,1.0,
		0.0,1.0]	
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

