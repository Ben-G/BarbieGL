function Object3D(gl){
	this.gl = gl;
	this.buffer = new Object();
	this.texBuffer = null;
    this.children = new Array();
    this.vertices = new Array();
    this.boundings = new Array();
    this.textures = new Array();
    //this.boundingBox
    //this.lastTranslMatrix
    //this.minPoint;
    //this.maxPoint;
    this.normals = new Array();
    //Front Face
    this.normals[0] = Vector.create([0,0,1]);
    //Back Face
    this.normals[1] = Vector.create([0,0,-1]);
    //Top 
    this.normals[2] = Vector.create([0,1,0]);
    //Bottom
    this.normals[3] = Vector.create([0,-1,0]);
    //Right
    this.normals[5] = Vector.create([1,0,0]);
    //Left
    this.normals[4] = Vector.create([-1,0,0]);
    




    this.xOffset = 0;
    this.yOffset = 0;
    this.zOffset = 0;

    this.currentX = 0;
    this.currentY = 0;
    this.currentZ = 0;
	
	this.rotationMatrix;
    this.rotationAxis = "y";
	this.rotValue = 0;
	this.rotation = 0;
	this.animationspeed = 0;
	
	this.setShaderProgram = function(program) {
		this.shaderProgram = program;	     	
	    this.shaderProgram.vertexPositionAttribute = shaderProgram.gl.getAttribLocation(shaderProgram.binary, WebGLBase.stdParamNames["VERTEX_POSITION"]);
    	this.shaderProgram.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	}
	
	
	this.connectTexture = function(texture, shaderAttrib, samplerID, gl){
		if (this.shaderProgram === null)
			throw "ConnectWithoutShaderException";
			
		texture.attribLocation = gl.getAttribLocation(this.shaderProgram.binary, shaderAttrib);
        gl.enableVertexAttribArray(texture.attribLocation); 
        texture.sampler =  gl.getUniformLocation(this.shaderProgram.binary, samplerID); 
	}
	
	
	this.rotate = function(degree,axis)
	{
		this.rotValue += degree;
	}

    /*  This method is called, before the object is redrawn.
        This is the place for animation and translation.
        
        @param transMat is the translation- and rotation matrix of
        the parent-element. It is used for relational placing of child 
        objects
    */
	
	this.refresh = function(gl, shaderProgram, transMat) {
		    var translationMatrix = Matrix.I(4);
            //translationMatrix = WebGLBase.pMatrix;

            if (transMat == null)
		        translationMatrix = translationMatrix.x(create3DTranslationMatrix(Vector.create([this.currentX, this.currentY, this.currentZ])).ensure4x4());
            else{
                translationMatrix = transMat;
                translationMatrix = translationMatrix.x(create3DTranslationMatrix(Vector.create([this.xOffset, this.yOffset, this.zOffset])).ensure4x4());
            }
    
		    if (this.rotation == true){
			    this.rotValue += this.animationspeed;
		    }
		    this.rotationMatrix = WebGLBase.createRotationMatrix(this.rotationAxis, this.rotValue);
		    translationMatrix = translationMatrix.x(this.rotationMatrix);

		    var mvUniform = gl.getUniformLocation(shaderProgram.binary, "uMVMatrix");
		    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(translationMatrix.flatten()));


            return this.lastTranslMatrix = translationMatrix;
    }

	/*  Will let the object rotate with specified angle speed, around the specified axis    
        which must either equal "x","y" or "z"
    */

	this.startRotation = function(speed, axis){
        this.rotationAxis = axis;		
        this.rotationMatrix = WebGLBase.createRotationMatrix(axis, this.rotValue);
		this.rotation = true;
		this.animationspeed = speed;
	}

    /*  Adds a child to this element in order to be drawn.
        Returns the added object, so the client can manipulate it, if
        necessary       
    */
    this.add = function(object){
        this.children[this.children.length] = object;
        return object;
    }


    /*  Is called before redraw. Updates the BoundingBoxes of the object
        regarding the childrens boundings.    
    */
    this.updateBoundingBox = function(gl, shaderProgram){
        
    
        var VMin = $V([5000,5000,5000,1]);
        var VMax = $V([-5000,-5000,-5000,1]);

        if (this.vertices.length > 0){
       
            //Determine the Min and Max Points, because the Bounding Box is defined by them
            for (var i=0; i<(this.vertices.length/3); i++){
                /*  Create a Vector describing a Point by walking through the vertice buffer
                    Use translation and perspective Matrix on this point to determine the "real" rendering
                    position of the boundingBox (important for collission detection!)
                */
                var Vvertice = $V([ this.vertices[i*3],this.vertices[i*3+1],this.vertices[i*3+2],1 ]);
                Vvertice = this.lastTranslMatrix.x(Vvertice);
                Vvertice = WebGLBase.pMatrix.x(Vvertice);                      
          
                //for each coordinate of all of the points: check if they are the new smallest/largest points                

                if (Vvertice.elements[0] < VMin.elements[0])
                    VMin.elements[0] = Vvertice.elements[0];
                if (Vvertice.elements[1] < VMin.elements[1])
                    VMin.elements[1] = Vvertice.elements[1];
                if (Vvertice.elements[2] < VMin.elements[2])
                    VMin.elements[2] = Vvertice.elements[2];

                if (Vvertice.elements[0] > VMax.elements[0])
                    VMax.elements[0] = Vvertice.elements[0];
                if (Vvertice.elements[1] > VMax.elements[1])
                    VMax.elements[1] = Vvertice.elements[1];
                if (Vvertice.elements[2] > VMax.elements[2])
                    VMax.elements[2] = Vvertice.elements[2];
            }
        }
            
        /*  Check if the childrens min and maxes are larger or smaller than the own ones (determined in the loop above), and if than choose
            the childrens one as new bounding, so that parents encapsulate children
        */
           
             for (var i=0; i < this.children.length; i++){
    
                
                var V1 = $V([this.children[i].minPoint.x,this.children[i].minPoint.y,this.children[i].minPoint.z,1]);
               
                var V2 = $V([this.children[i].maxPoint.x,this.children[i].maxPoint.y,this.children[i].maxPoint.z,1]);
       
                if (V1.elements[0] < VMin.elements[0])
                    VMin.elements[0] = V1.elements[0];
                if (V1.elements[1] < VMin.elements[1])
                    VMin.elements[1] = V1.elements[1];
                if (V1.elements[2] < VMin.elements[2])
                    VMin.elements[2] = V1.elements[2];

                if (V2.elements[0] > VMax.elements[0])
                    VMax.elements[0] = V2.elements[0];
                if (V2.elements[1] > VMax.elements[1])
                    VMax.elements[1] = V2.elements[1];
                if (V2.elements[2] > VMax.elements[2])
                    VMax.elements[2] = V2.elements[2];

            }
                   
                 
        this.minPoint = new Point3D(VMin.elements[0],VMin.elements[1],VMin.elements[2]);
        this.maxPoint = new Point3D(VMax.elements[0],VMax.elements[1],VMax.elements[2]);

        this.boundings[0] = createBoundingBox(this.minPoint, this.maxPoint);
        this.boundingBox = WebGLBase.createBoundingBox(this.boundings, this.boundingBox , gl); 

        //Override the translationMatrix in the Shader because here the translation is applied
        //to the vertices directly
        
        var mvUniform = gl.getUniformLocation(shaderProgram.binary, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(Matrix.I(4).flatten()));

        //var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		//gl.uniformMatrix4fv(mvUniform, false, new Float32Array(WebGLBase.pMatrix.flatten()));
    }
}