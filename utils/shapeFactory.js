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


function createMash(width, height, rectsPerSide, gl) {
	var rectWidth = width / rectsPerSide;
	var rectHeight = height / rectsPerSide;
	var vertices = new Array();
	for(var i = 0;i<rectsPerSide;i++) {
		for(var j = 0;j<rectsPerSide;j++) {
			var base = i*18*(rectsPerSide)+j*18;
			// p1.x
			vertices[base+0] = j*(rectWidth)-width/2;
			// p1.y
			vertices[base+1] = 0;
			// p1.z
			vertices[base+2] = -i*(rectHeight)+height/2;
			// p2.x
			vertices[base+3] = j*(rectWidth)+rectWidth-width/2;
			// p2.y
			vertices[base+4] = 0;
			// p2.z
			vertices[base+5] = -i*(rectHeight)+height/2;
			// p3.x
			vertices[base+6] = j*(rectWidth)+rectWidth-width/2;
			// p3.y
			vertices[base+7] = 0;
			// p3.z
			vertices[base+8] = -i*(rectHeight)-rectHeight+height/2;
			// p4.x
			vertices[base+9] = j*(rectWidth)-width/2;
			// p4.y
			vertices[base+10] = 0;
			// p4.z
			vertices[base+11] = -i*(rectHeight)+height/2;
			// p5.x
			vertices[base+12] = j*(rectWidth)-width/2;
			// p5.y
			vertices[base+13] = 0;
			// p5.z
			vertices[base+14] =-i*(rectHeight)-rectHeight+height/2;
			// p6.x
			vertices[base+15] = j*(rectWidth)+rectWidth-width/2;
			// p6.y
			vertices[base+16] = 0;
			// p6.z
			vertices[base+17] = -i*(rectHeight)-rectHeight+height/2;
		}
	}

	textureCoords = new Array();
	for(var i = 0;i<rectsPerSide;i++) {
		for(var j = 0;j<rectsPerSide;j++) {
			var base = i*12*(rectsPerSide)+j*12;
			// p1.x
			textureCoords[base+0] = j*(1/rectsPerSide);
			// p1.y
			textureCoords[base+1] = 1-i*(1/rectsPerSide);
			// p2.x
			textureCoords[base+2] = j*(1/rectsPerSide)+1/rectsPerSide;
			// p2.y
			textureCoords[base+3] = 1-i*(1/rectsPerSide);
			// p3.x
			textureCoords[base+4] = j*(1/rectsPerSide)+1/rectsPerSide;
			// p3.y
			textureCoords[base+5] = 1-(i*(1/rectsPerSide)+1/rectsPerSide);
			// p4.x
			textureCoords[base+6] = j*(1/rectsPerSide);
			// p4.y
			textureCoords[base+7] = 1-i*(1/rectsPerSide);
			// p5.x
			textureCoords[base+8] = j*(1/rectsPerSide);
			// p5.y
			textureCoords[base+9] = 1-(i*(1/rectsPerSide)+1/rectsPerSide);
			// p6.x
			textureCoords[base+10] = j*(1/rectsPerSide)+1/rectsPerSide;
			// p6.y
			textureCoords[base+11] =1- (i*(1/rectsPerSide)+1/rectsPerSide);
		}
	}

	normals = new Array();
	for(var i = 0;i<6*(rectsPerSide)*(rectsPerSide);i++) {
		var base = i*3;
		normals[base + 0] = 0;
		normals[base + 1] = 0;
		normals[base + 2] = 1;
	}	
	
	
	var newObject = new Object3D();
    newObject.gl = gl;
    newObject.buffer.values = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, newObject.buffer.values);
    newObject.vertices = vertices;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newObject.vertices), gl.STATIC_DRAW);
    newObject.buffer.itemSize = 3;
    newObject.buffer.numItems = 6*(rectsPerSide)*(rectsPerSide);

	newObject.texBuffer = new Object();
    newObject.texBuffer.values = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, newObject.texBuffer.values);
    newObject.texBuffer.buffer = textureCoords;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newObject.texBuffer.buffer), gl.STATIC_DRAW);
    newObject.texBuffer.itemSize = 2;
    newObject.texBuffer.numItems = 6*(rectsPerSide)*(rectsPerSide);
       
    /*   
    newObject.normalsBuffer = new Object();
    newObject.normalsBuffer.values = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, newObject.texBuffer.values);
    newObject.normals = normals;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newObject.normals), gl.STATIC_DRAW);
    newObject.normalsBuffer.itemSize = 3;
    newObject.normalsBuffer.numItems = 6*(rectsPerSide)*(rectsPerSide); 
*/
    return newObject;
	
}
