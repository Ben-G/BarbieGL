function WebGLBase(){
    this.shaderPartFactory = ShaderPartFactory;
    this.objectModel = ObjectModel;
    this.textureModel = TextureModel;
    this.CONTEXTNAME = "experimental-webgl";
    this.event = eventManager;
    //Camera is fixed to 0,0,0
    this.cameraVector = $V([0,0,0,1]);
    
    this.stdParams["VERTEX_POSITION"] = new ShaderParameter("aVertexPosition", "vec3","attribute");
    this.stdParams["MV_MATRIX"] = new ShaderParameter("uMVMatrix", "mat4","uniform");
    this.stdParams["P_MATRIX"] = new ShaderParameter("uPMatrix", "mat4","uniform");
    this.stdParams["DEFAULT_SAMPLER"] = new ShaderParameter("aVertexPosition", "sampler2D","uniform");
    this.stdParams["NORMAL_DIRECTION"] = new ShaderParameter("aNormalDirection", "vec3","attribute");
    this.stdParams["TEXTURE_COORD"] = new ShaderParameter("aTextureCoord", "vec2","attribute");
}


WebGLBase.prototype = {
	stdParams: new Object(),
	
    createShaderProgram: function(shaderArray, gl){
        shaderA = shaderArray[0].binary;
        shaderB = shaderArray[1].binary;
        var newShaderProgram = gl.createProgram();
        gl.attachShader(newShaderProgram, shaderA);
        gl.attachShader(newShaderProgram, shaderB);
        gl.linkProgram(newShaderProgram);    
     
        if (!gl.getProgramParameter(newShaderProgram, gl.LINK_STATUS)) {
          console.log("Could not initialise shaders");
        }
        return newShaderProgram;
    },
    /**
        Uses some mathematical magic to calculate the intercept point between the mouse pointer "beam"
        and a surface (currently explicitly a bounding Box surface)
    */
    calculateClickVector: function (x,y,object,surfaceID){
        z = object.minPoint.z;
        var g_nCanvasWidth = 512;
        var g_nCanvasHeight = 512;
        var g_fOpenViewAngle = 45;   
        var g_xCamTrans = 0;
        var g_yCamTrans = 0;
        var g_zCamTrans = 0;
        //Because of the offset of the HTML-Canvas-Tag        
        x = x-8;
        y = y-8;

	    var x3D = (x-(g_nCanvasWidth  / 2))*1*Math.tan(g_fOpenViewAngle*Math.PI/180.0)/(g_nCanvasWidth / 2);
        var y3D = (y-(g_nCanvasHeight / 2))*1*Math.tan(g_fOpenViewAngle*Math.PI/180.0)/(g_nCanvasHeight / 2);
        var vTempVector4D;
	    var vTempVector3D;
	    var vKlick4DVector;
	    var camera = Vector.create([0,0,0]);
	     
        vTempVector4D = Vector.create([+0,0,0,0]);
	    vLineStart = vTempVector4D.add(Vector.create([-g_xCamTrans,-g_yCamTrans,-g_zCamTrans,0.0]));
		var vLineStart3D = Vector.create([vLineStart.e(1),vLineStart.e(2),vLineStart.e(3)]);	
	    vKlick4DVector = Vector.create([x3D,-y3D,1,0.0]); 
	    vTempVector4D = vKlick4DVector;
	    var directionVector = (Vector.create([vKlick4DVector.e(1),vKlick4DVector.e(2),vKlick4DVector.e(3)]));
        //factor
        var a = 1;
        var h = camera.subtract(Vector.create([object.boundingBox.vertices[surfaceID*12],object.boundingBox.vertices[(surfaceID*12)+1],object.boundingBox.vertices[(surfaceID*12)+2]]));
        var zaehler = - (h.dot(object.normals[surfaceID]));
		var nenner  = (directionVector.dot(object.normals[surfaceID]));
        a = zaehler/nenner;

        //p = o+a*r --> a is chosen in a way, that p will lie on the mesh
        var hitPoint =  camera.add(directionVector.x(a));   
        return hitPoint;
    },
 
    initGL: function(canvas){
        var newGL =  canvas.getContext(this.CONTEXTNAME);
        newGL.viewportWidth = canvas.width;
        newGL.viewportHeight = canvas.height;
        if(!newGL) {
        console.log("Error initialising WebGL!");
        }
        return newGL;
    },
    createObject3D: function(polygons, gl){
        var newObject = new Object3D();
        newObject.gl = gl;
        newObject.buffer.values = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, newObject.buffer.values);
        var totalItemSize = 0;	
        for (var i=0; i<polygons.length; i++){
	        newObject.vertices = newObject.vertices.concat(polygons[i]);
	        totalItemSize+=polygons[i].length;
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newObject.vertices), gl.STATIC_DRAW);
        newObject.buffer.itemSize = 3;
        newObject.buffer.numItems = totalItemSize/3;
        return newObject;
    },
    createBoundingBox: function(polygons, box ,gl){
    	if(box == null) return this.createObject3D(polygons, gl);
    	
        newObject = box;
	    gl.bindBuffer(gl.ARRAY_BUFFER, newObject.buffer.values);
        var totalItemSize = 0;	
        for (var i=0; i<polygons.length; i++){
	        newObject.vertices = newObject.vertices.concat(polygons[i]);
	        totalItemSize+=polygons[i].length;
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newObject.vertices), gl.STATIC_DRAW);
        newObject.buffer.itemSize = 3;
        newObject.buffer.numItems = totalItemSize/3;
        return newObject;
    },
       /**
            privat method; Used by "CreateObjectFromFile". Differs from "createObject3D" because
            it isn't used for Objects built together out of several vertex buffers
        */
    createObject3DFromFile: function(obj, gl){
        var newObject = new Object3D();
        newObject.gl = gl;
        newObject.buffer.values = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, newObject.buffer.values);
        newObject.vertices = obj.buffer.values;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newObject.vertices), gl.STATIC_DRAW);
        newObject.buffer.itemSize = obj.buffer.itemSize;
        newObject.buffer.numItems = obj.buffer.numItems;
        //texture part
        if (obj.texBuffer != null){
        	newObject.texBuffer = new Object();
	        newObject.texBuffer.values = gl.createBuffer();
	   	    gl.bindBuffer(gl.ARRAY_BUFFER, newObject.texBuffer.values);
	   	    newObject.texBuffer.buffer = obj.texBuffer.values;
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newObject.texBuffer.buffer), gl.STATIC_DRAW);
	        newObject.texBuffer.itemSize = obj.texBuffer.itemSize;
	        newObject.texBuffer.numItems = obj.texBuffer.numItems;
	        }
	    else{
			newObject.texBuffer = null;	        	
	    }
        return newObject;
    },

    compileShader: function(src, type, gl) {
	    var shader;
        if (type == Shader.TYPE_FRAGMENT_SHADER) {
          shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == Shader.TYPE_VERTEX_SHADER) {
          shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
          return null;
        }
 
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
     
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.log(gl.getShaderInfoLog(shader));
          return null;
        }
 
        return shader;
    },
    /**
        Creates a Object3D-Object from a specified JSON files
    */
    createObjectFromFile: function(finishedObj, gl){
        var obj = JSON.parse(finishedObj);  
        var object3d = this.createObject3DFromFile(obj, gl);
        return object3d;          
    },
    /**
        Creates and returns a Rotation matrix, which describes a rotation around the defined axis.
    */
    createRotationMatrix: function(axis, degrees) {
        var mvMatrix =Matrix.I(4);
	    if(axis == "y") {
		return mvMatrix.x(Matrix.Rotation(degrees*Math.PI / 180.0, Vector.create([0,1,0])).ensure4x4());
        }
        if(axis == "x") {
		return mvMatrix.x(Matrix.Rotation(degrees*Math.PI / 180.0, Vector.create([1,0,0])).ensure4x4());
        }
        if(axis == "z") {
		return mvMatrix.x(Matrix.Rotation(degrees*Math.PI / 180.0, Vector.create([0,0,1])).ensure4x4());
        }
	},    
    perspective: function(fovy, aspect, znear, zfar) {
        this.pMatrix = makePerspective(fovy, aspect, znear, zfar);
    }
}    


WebGLBase = new WebGLBase();

    /*  Defines the Class of paintable 3DObjects.
        Object3D can be a leaf or a node containing other leafs
        (Composite Pattern)       
    */


/**
Function will determine which object in object's hierarchy was hit and return it.
*/
function hitTest(x,y, object){

    var hit = new Array();
    var parentHit = null;
    var hitAmount = 0;

    

    for (var i=0; i<1; i++){//Pseudo-Loop, is used so that I can break out of Code when one side was hiten

        /**
            Will calculate the ClickVector for each surface of the boundingBox of the object.
            Then check if the hit Point is on that current surface
            TODO: Check on ALL surfaces
        */        

        var hitPoint = WebGLBase.calculateClickVector(x,y, object,0);//last Parameter is SurfaceID
        
        if ( (hitPoint.e(1) > object.minPoint.x && hitPoint.e(1) < object.maxPoint.x) && (hitPoint.e(2) > object.minPoint.y && hitPoint.e(2) < object.maxPoint.y) ){
            console.log("HIT! Front-Side");
            parentHit = object; 
            break;
        }

        hitPoint = WebGLBase.calculateClickVector(x,y, object,3);

        if ( (hitPoint.e(3) > object.minPoint.z && hitPoint.e(3) < object.maxPoint.z) && (hitPoint.e(1) > object.minPoint.x && hitPoint.e(1) < object.maxPoint.x) ){
            console.log("HIT! Bottom-Side");
            parentHit = object;
            break;
        }

        hitPoint = WebGLBase.calculateClickVector(x,y, object,4);

        if ( (hitPoint.e(3) > object.minPoint.z && hitPoint.e(3) < object.maxPoint.z) && (hitPoint.e(2) > object.minPoint.y && hitPoint.e(2) < object.maxPoint.y) ){
            console.log("HIT! Right-Side");
            parentHit = object;
            break;
        }
 
      
        hitPoint = WebGLBase.calculateClickVector(x,y, object,5);

        if ( (hitPoint.e(3) > object.minPoint.z && hitPoint.e(3) < object.maxPoint.z) && (hitPoint.e(2) > object.minPoint.y && hitPoint.e(2) < object.maxPoint.y) ){
            console.log("HIT! Left-Side");
            parentHit = object;
            break;
        }

    }

    /*  If the object was hit, execute the hitCheck with all of my children.
        If i was hit, but none of them has been hitten either
            a) I have been hitten
            b) Only my Bounding box has been hitten, but not me
        TODO currently b) cannot be checked --> needs to be implemented    
    */
    if (parentHit == object && object.children.length > 0){ 
        for (var i=0; i<object.children.length; i++)
            {
                var tempHit = hitTest(x,y,object.children[i]);
                if (tempHit != null)
                    hit[hitAmount] = tempHit;
                    hitAmount++;
            }
    }
  
    //TODO Call Quicksort on hit elements of one hierarchy to determine which object was closest to the user
 
    //TODO cause event on the specific object, that was hit
    //This requires Event-Handling to support calling events on specified listeners
    if (hit.length > 0)
        return hit[hit.length-1];
    else
        return parentHit;
}
   
/**
The Point 3D Object
*/ 
function Point3D(x,y,z){
	this.x=x;
	this.y=y;
	this.z=z;
}


/**
Takes a shader Source and returns a shader Object
*/
function createShaderProgram(finishedShader,gl){
        var newShader = JSON.parse(finishedShader);
        newShader.compiled = WebGLBase.compileShader(newShader.src,newShader.type,gl); 
        return newShader;
}


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

/*
creates a bounding Box using six Coordinates.
Min and Max for x,y and z
*/


function createBoundingBox(minPoint, maxPoint) {
	return [
    // Front face
    minPoint.x, minPoint.y, minPoint.z,
    maxPoint.x, minPoint.y, minPoint.z,
    maxPoint.x, maxPoint.y,  minPoint.z,
    minPoint.x, maxPoint.y,  minPoint.z,

    // Back face
    minPoint.x,  minPoint.y, minPoint.z,
    minPoint.x,  maxPoint.y, minPoint.z,
    maxPoint.x,  maxPoint.y, minPoint.z,
    maxPoint.x,  minPoint.y, minPoint.z,

    // Top face
    minPoint.x,  maxPoint.y, minPoint.z,
    minPoint.x,  maxPoint.y, maxPoint.z,
    maxPoint.x,  maxPoint.y, maxPoint.z,
    maxPoint.x,  maxPoint.y, minPoint.z,

    // Bottom face
    minPoint.x, minPoint.y, minPoint.z,
    maxPoint.x, minPoint.y, minPoint.z,
    maxPoint.x, minPoint.y,  maxPoint.z,
    minPoint.x, minPoint.y,  maxPoint.z,

    // Right face
    maxPoint.x, minPoint.y, minPoint.z,
    maxPoint.x,  maxPoint.y, minPoint.z,
    maxPoint.x,  maxPoint.y,  maxPoint.z,
    maxPoint.x, minPoint.y,  maxPoint.z,

    // Left face
    minPoint.x, minPoint.y, minPoint.z,
    minPoint.x, minPoint.y,  maxPoint.z,
    minPoint.x,  maxPoint.y, maxPoint.z,
    minPoint.x,  maxPoint.y, minPoint.z,
    ]	
}




 

