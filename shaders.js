/**
 * @author Michael Boehm
 */


ShaderParameterFactory = function() {

}

ShaderParameterFactory.prototype = {
	clone: function(parameter, part) {
		var tmp = new ShaderParameter();
    	for(var i in parameter) {
    		tmp[i] = parameter[i];
    	}
    	tmp.shaderPart = part;
    	return tmp;
	},
	cloneArray: function(parameters, part) {
		var tmp = new Array();
		for(var i = 0;i < parameters.length; i++) {
			tmp.push(this.clone(parameters[i], part));
		}
		return tmp;
	},
	createFromStringArray: function(array, part) {
		var res = new Array();
		for(var i = 0; i<array.length; i++) {
			res.push(this.createFromString(array[i], part));
		}
		return res;
	},
	createFromString: function(string, part) {
		var split = string.split(" ");
		var id=split[2];
		if(id.search(";") >= 0) {
			id = id.substring(0,id.length-1);
		}
		var para = new ShaderParameter(id, split[1], split[0]);
		para.shaderPart = part;
		return para;
	},	
}

ShaderParameterFactory = new ShaderParameterFactory();


/*
 * BEGIN Class ShaderProgramModel
 * 
 * Utility class for shader programs
 */

ShaderProgramBuilder = function() {
	this.cache = null;
}

ShaderProgramBuilder.prototype = {
	
	/**
	 * compiles and links a fragment and a vertex Shader object
	 * 
	 * @param vertexShader a Shader object with the vertex shader source
	 * @param fragmentShader a Shader object with the fragment shader source
	 * @return a ShaderProgram object
	 */
	buildShaderProgram: function(vertexShader, fragmentShader) {
		if(vertexShader.gl != fragmentShader.gl) {
			throw "Shaders must have the same gl context";
		}
		vertexShader.compile();
		fragmentShader.compile();;
		var shaders = new Array();
		shaders.push(vertexShader);
		shaders.push(fragmentShader);
		
		var binary = WebGLBase.createShaderProgram(shaders, vertexShader.gl);
		
		
		// create and initialize a ShaderProgram object
		var program = new ShaderProgram(vertexShader, fragmentShader, vertexShader.gl);
		program.binary = binary;
		//program.vertexPositionAttribute = program.gl.getAttribLocation(program.binary, "aVertexPosition");
    	//program.gl.enableVertexAttribArray(program.vertexPositionAttribute);
		return program;
		
	},
	
	/**
	 * compiles the source of a Shader and returns a reference to the binary
	 * 
	 * @param Shader program
	 */
	compileShader: function(shader) {
		// TODO: im Cache über Hashwert der Source nachsehen, ob schonmal compiliert wurde
		if(!shader.isCompiled) {
			shader.compile();
		}
        return shader.binary;
    },
}
ShaderProgramBuilder = new ShaderProgramBuilder();
/*
 * END Class ShaderProgramModel
 */

ShaderBuilder = function() {};

ShaderBuilder.prototype = {
	buildShaderFromParts: function(parts, type, gl, clone) {
		if(clone == null) clone = true;
		var s = new Shader(type, gl);
		for(var i = 0; i < parts.length; i++) {
			s.addShaderPart(parts[i], clone);
			
		}
		return s;
	},
	buildDefaultShader: function(type, gl) {
		var s = new Shader(type, gl);
		return s;
	}
}
ShaderBuilder = new ShaderBuilder();


/*
 * BEGIN Class ShaderParameter
 * 
 * Represents a parameter of a shader program or program parts
 */
ShaderParameter = function(identifier, type, modifier) {
	// the internal identifier of the parameter
	this.identifier = identifier;
	
	// the identifier in the original source code
	this.originalIdentifier = identifier;
	
	// the datatype (vec2, mat4, float, int etc.)
	this.type = type;
	
	// the modifier (uniform, attribute or varying)
	this.modifier = modifier;
	
	this.shaderPart = null;
}



ShaderParameter.prototype = {
	// the identifier of the parameter
	identifier: "",
	// the datatype (vec2, mat4, float, int etc.)
	type: "",
	// the modifier (uniform, attribute or varying)
	modifier: "",
	part: null,
	getSrc: function() {
		return this.modifier + " " + this.type + " " + this.identifier;
	},
	getUniqueIdentifier: function() {
		return this.shaderPart.id + this.originalIdentifier;
	},
	isStdParameter: function(shaderType) {
		var map;
		if(shaderType == Shader.TYPE_FRAGMENT_SHADER) map = WebGLBase.stdFragParams;
		else if(shaderType == Shader.TYPE_VERTEX_SHADER) map = WebGLBase.stdVertParams;  
		else return false;
		for(var i in map) {
			if(map[i].identifier == this.identifier) return true;
		}
		return false;
	}
};

/*
 * END Class ShaderParameter
 */



/*
 * BEGIN Class ShaderProgram
 * 
 * Represents a single shader (fragment or vertex)
 */

Shader = function(type, gl) {
	
	this.gl = gl;
	this.parts = new Array();
	if(type != null) {
		this.type = type;
	} else (this.type = 0);

/*
	var tmp = new Array();	
	if(this.type == Shader.TYPE_VERTEX_SHADER) {
		for (var i in WebGLBase.stdVertParams) {
			tmp.push(WebGLBase.stdVertParams[i]);
		}
	} else if(this.type == Shader.TYPE_FRAGMENT_SHADER) {
		for (var i in WebGLBase.stdFragParams) {
			tmp.push(WebGLBase.stdFragParams[i]);
		}
	}
	
	this._defaultParameters = ShaderParameterFactory.cloneArray(tmp, null);
	*/
}

// Constants for the 2 possible types of a Shader
Shader.TYPE_VERTEX_SHADER = 0;
Shader.TYPE_FRAGMENT_SHADER = 1;

Shader.prototype = {
	// the gl-context the program is meant for
	gl: null,
	// the type of the shader program (vertex/fragmentshader)
	type: Shader.TYPE_VERTEX_SHADER,
	// an array of ShaderPart objects representing the parts the program consists of
	parts: new Array(),
	// a reference to the compiled binary of the program
	binary: null,
	// states wether the shader is compiled or not
	isCompiled: false,
	
	_defaultParameters: new Array(),
	/**
	 * returns the shaders ShaderParameter object with the given identifier, if there is one
	 */
	getParameters: function() {
		var tmp = new Array();
		for(var i = 0; i<this.parts.length; i++) {
			tmp = tmp.concat(this.parts[i].parameters);
		}
		tmp = tmp.concat(this._defaultParameters);
		return tmp;
	},
	getParameterById: function(id) {
		for(var i = 0;i<this.parts.length;i++) {
			var p1 = this.parts[i].getParameterById(id);
			if(p1 != null) return p1;		
		}
		for(var i = 0;i<this._defaultParameters.length;i++) {
			if(this._defaultParameters[i].identifier == id) return this._defaultParameters[i];
		}
		return null;
	},
	/*
	 * compiles this shader and saves the compiled program in this.binary
	 * if the shader is not yet compiled yet
	 */
	compile: function() {
		if(!this.isCompiled) {
			var bin;
			bin = WebGLBase.compileShader(this.getSrc(), this.type, this.gl);
			if(bin != null) {
				this.binary = bin;
				this.isCompiled = true;
				return bin;
			} else {
				throw "Error compiling shader !";
			}
		} else return this.binary;
		
	},
	/*
	 * Add a ShaderPart to the shader program
	 * The sources will be merged
	 * 
	 * @param ShaderPart part : the part to be added  
	 * @param boolean clone: states if the part have to be cloned, default is true
	 */
	addShaderPart: function(part, clone) {
		if(part.type != this.type) throw "Cannot add a different shader type";
		
		if(clone == null || clone == true) {
			var id = part.id;
			part = ShaderPartFactory.clone(part, this);
			//console.log("cloned ", id, " to ", part.id);
		} else {
			part.shader = this;
			//console.log("not cloned ", part.id);
			//console.trace();
		}
		this.parts.push(part);
		this.renameDoubleIdentifiers();
		this.isCompiled = false;
	},
	renameDoubleIdentifiers: function() {
		var doubles = getDoubleIdentifiers(this.getParameters());
		var replaced = new Array();
		for(var i = 0; i<doubles.length; i++) {
			if(!doubles[i].isStdParameter()) {
				doubles[i].identifier = doubles[i].getUniqueIdentifier();
				replaced.push(doubles[i]);
			}
		}
		var c = replaced.length;
		for(var i = 0; i<c; i++) {
			var pos = getLongestIdentifierPosition(replaced);
			replaced[pos].shaderPart.replaceIdentifier(replaced[pos]);
			replaced.splice(pos,1);
		}
	},
	_partIsContained: function(part) {
		for(var i = 0;i<this.parts.length;i++) {
			if(this.parts[i].name == part.name) return true;
		}
		return false;
	},
	getTextureSamplerNames: function() {
		var names = new Array();
		for(var i = 0; i < this.parts.length; i++) {
			names = names.concat(this.parts[i].getTextureSamplerNames());
		}
		return names;
	},
	/*
	 * Generates and returns the source code
	 */
	getSrc: function() {
		var precomp_src = 	"#ifdef GL_ES\n" +
							"precision highp float;\n" +
							"precision highp int;\n" +
							"#endif\n\n";
		var para_src = "";
		if(this.type == Shader.TYPE_VERTEX_SHADER) {
			para_src = 	"attribute vec3 aVertexPosition;\n" +
						"uniform mat4 uMVMatrix;\n"+
						"uniform mat4 uPMatrix;\n\n";
		}
		var func_src = "";
		var main_src = "void main(void) {\n";
		
		if(this.type == Shader.TYPE_VERTEX_SHADER) {
			main_src += "\tvec4 originalPosition = vec4(aVertexPosition,1.0);\n";
			main_src += "\tvec4 vertexPosition = vec4(aVertexPosition,1.0);\n";
		} else {
			main_src += "\tvec4 fragColor = vec4(1.0,1.0,1.0,1.0);\n"
		}
		
		for(var i = 0; i < this.parts.length; i++) {
			var part = this.parts[i];
			para_src += "uniform bool isActive_" + part.id + ";\n";
			para_src += part.getParameterSrc() + "\n";
			func_src += part.getFunctionSrc() + "\n";
			main_src += "\tif(isActive_" + part.id + ") {\n\t" + part.src_main + "\t}\n";
		}

		if(this.type == Shader.TYPE_VERTEX_SHADER) {
			main_src += "\tgl_Position = uPMatrix * (uMVMatrix * vertexPosition);\n"
		} else {
			main_src += "\tgl_FragColor = fragColor;\n"
		}
		main_src += "}";
		var src = precomp_src + para_src + func_src + main_src;
		return src;
	}
}

/*
 * END Class Shader
 */


/*
 * BEGIN Class ShaderProgram
 * 
 * Represents a complete, linked shader program consisting of a fragment- and a vertexshader  
 */

ShaderProgram = function(vertexShader, fragmentShader, gl) {
	
	this.gl = gl;

	this.vertexShader = vertexShader;
	
	this.fragmentShader = fragmentShader;

	this.parameterLocations = new Object();
}


ShaderProgram.prototype = {
	// the gl-context the program is meant for
	gl: null,
	// the vertex Shader object
	vertexShader: null,
	// the fragment Shader object
	fragmentShader: null,
	// a reference to the compiled and linked binary of the program
	binary: null,
	parameterLocations: new Object(),
	/**
	 * returns the programs ShaderParameter object wipartsth the given identifier, if there is one
	 */
	getParameterById: function(id) {
		var p1 = this.fragmentShader.getParameterById(id);
		var p2 = this.vertexShader.getParameterById(id);
		if(p1 != null) return p1;
		if(p2 != null) return p2;
		return null;
	},
	/**
	 * sets a buffer
	 * @param para a ShaderParameter object
	 * @param values the array to be set
	 */
	setBuffer: function(para, buffer, values) {
		if(buffer == null) return;
		var location;
		var gl = this.gl;
		if(this.parameterLocations[para.identifier] == null) {
			location = gl.getAttribLocation(this.binary, para.identifier);
			this.parameterLocations[para.identifier] = location;
		} else {
			location = this.parameterLocations[para.identifier];
		}
		
		if(location == -1) return;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.values);
		gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
		gl.vertexAttribPointer(location, buffer.itemSize, gl.FLOAT, false, 0, 0);
	},
	
	/*
	 * sets a shader parameter to a specified value
	 * @param para a ShaderParameter object
	 * @param value the value to be set
	 */
	setParameter: function(para, value) {
		if(para == null) return;
		var location; 
		
		if(para.modifier.search("varying") >= 0) {
			throw "Varying parameters can only be set inside shaders!"
		} 
		if(this.parameterLocations[para.identifier] == null) {
			if(para.modifier.search("uniform") >= 0) {
				location = this.gl.getUniformLocation(this.binary, para.identifier);
				this.parameterLocations[para.identifier] = location;
						
			} else if (para.modifier.search("attribute") >= 0) {
				location = this.gl.getAttribLocation(this.binary, para.identifier);
				this.parameterLocations[para.identifier] = location;
			}	
		} else {
			location = this.parameterLocations[para.identifier];
		}
		if(location == -1) return;
		
		switch(para.type) {
			case "mat4":{
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniformMatrix4fv(location, false, value);
						break;
					}
				}
				break;
			}
			case "vec3":{
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniform3fv(location, value);
						break;
					}
					case "attribute": {
						this.gl.vertexAttrib3f(location, value);
						break;
					}
				}
				break;
			}
			case "sampler2D":
			case "int": {
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniform1i(location, value);
						break;
					}
					// attribute can not be int
				}
			break;
			}	
			case "float": {
				switch(para.modifier) {
					case "uniform": {
						
						this.gl.uniform1f(location, value);
						break;
					}
					case "attribute": {
						this.gl.vertexAttrib1f(location, value);
						break;
					}
				}
			break;
			}		
			case "bool": {
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniform1i(location, value);
						break;
					}
					// attribute can not be bool
				}
			break;
			}

			case "vec2": {
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniform2fv(location, value);
						break;
					}
					case "attribute": {
						this.gl.vertexAttrib2f(location, value);
						break;
					}
				}
			break;
			}
			case "vec4": {
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniform1fv(location, value);
						break;
					}
					case "attribute": {
						this.gl.vertexAttrib1f(location, value);
						break;
					}
				}
			break;
			}
			case "bvec2":
			case "ivec2":  {
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniform2iv(location, value);
						break;
					}
					// attribute can not be uivec
				}
			break;
			}
			case "bvec3":
			case "ivec3": {
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniform3iv(location, value);
						break;
					}
					// attribute can not be uivec
				}
			break;
			}
			case "bvec4":
			case "ivec4": {
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniform4iv(location, value);
						break;
					}
					// attribute can not be uivec
				}
			break;
			}
			case "mat2":{
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniformMatrix2fv(location, false, value);
						break;
					}
				}
			break;
			}
			case "mat3":{
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniformMatrix3fv(location, false, value);
						break;
					}
				}
			break;
			}

		}
	}
}


/*
 * END Class ShaderProgram
 */

/*
 * BEGIN Class ShaderPart
 * 
 * Represents a fragment of GLSL shader code, that fullfilles a specific task
 * Multiple ShaderPart objects can be merged to a Shader object
 */

ShaderPart = function(src, type) {
	
	this.shader = null;
	this.type = Shader.TYPE_VERTEX_SHADER;
	this.parameters = new Array();
	this.functions = new Array();
	this.src_main = "";
	this.isActive = true;
	
	if(type != null) {
		this.type = type;
	}
	
	if(src != null) {
		this._initializeFromSource(src);
	}
	

}


ShaderPart.prototype = {
	// the unique name of the part
	name: "dummy",
	// the code inside the main method
	src_main: "",
	// an array of strings containing the code of a glsl function
	functions: new Array(),
	// an array of ShaderParameter objects representing the parameters necessary for the part
	parameters: new Array(),
	// the type of the part (vertex/fragmentshader)
	type: Shader.TYPE_VERTEX_SHADER,
	
	parameters: new Array(),
	
	shader: null,
	_initializeFromSource: function(src) {
		this.src_main = parseMainFunction(src);
		this.functions = parseFunctions(src);
		this.parameters = ShaderParameterFactory.createFromStringArray(parseParameters(src), this);
	},
	getParameterById: function(identifier) {
		for(var i = 0; i < this.parameters.length; i++) {
			var p = this.parameters[i];
			if(p.originalIdentifier == identifier) {
				return p;
			}
		}
		console.log(this);
		return null;
	},
	getParameterSrc: function() {
		var par_src = "";
		for(var i = 0; i < this.parameters.length; i++) {
			par_src += this.parameters[i].getSrc() + ";\n";
		}
		return par_src;
	},
	getFunctionSrc: function() {
		var func_src = "";
		for(var i = 0; i < this.functions.length; i++) {
			func_src += this.functions[i] + "\n";
		}
		return func_src;
	},
	getTextureSamplerNames: function() {
		var names = new Array();
		for(var i = 0; i<this.parameters.length; i++) {
			
			if(this.parameters[i].type == "sampler2D") {
				names.push(this.parameters[i].identifier);
			}
		}
		return names;
	},
	replaceIdentifier: function(para) {
		var regexp = new RegExp(para.originalIdentifier, "g");
		this.src_main = this.src_main.replace(regexp, para.identifier)
	},
	/*
	 * Generates and returns the source code
	 */
	getSrc: function() {
		var src = 	this.getParameterSrc() + "\n" +
				    "\nvoid main(void) {" +
				 	this.src_main + "\n}\n" +
				 	this.getFunctionSrc();
		return src;
	}
}

/*
 * END Class ShaderPart
 */

