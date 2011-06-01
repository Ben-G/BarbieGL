/**
 * @author Michael Boehm
 */


ShaderParameterFactory = function() {

}

ShaderParameterFactory.prototype = {
	createFromStringArray: function(array) {
		var res = new Array();
		for(var i = 0; i<array.length; i++) {
			res.push(this.createFromString(array[i]));
		}
		return res;
	},
	createFromString: function(string) {
		var split = string.split(" ");
		var id=split[2];
		if(id.search(";") >= 0) {
			id = id.substring(0,id.length-1);
		}
		var para = new ShaderParameter(id, split[1], split[0]);
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
	buildShaderFromParts: function(parts, type, gl) {
		var s = new Shader(type, gl);
		for(var i = 0; i < parts.length; i++) {
			s.addShaderPart(parts[i]);
		}
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
	// the identifier of the parameter
	this.identifier = identifier;
	
	// the datatype (vec2, mat4, float, int etc.)
	this.type = type;
	
	// the modifier (uniform, attribute or varying)
	this.modifier = modifier;
}



ShaderParameter.prototype = {
	// the identifier of the parameter
	identifier: "",
	// the datatype (vec2, mat4, float, int etc.)
	type: "",
	// the modifier (uniform, attribute or varying)
	modifier: "",
	// a pointer to the parameters location in the GPU Memory (a WebGL specific object)
	location: null,
	getSrc: function() {
		return this.modifier + " " + this.type + " " + this.identifier;
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
	}
	
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
	 */
	addShaderPart: function(part) {
		if(part.type != this.type) throw "Cannot add a different shader type";
		this.parts.push(part);
		this.isCompiled = false;
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
							"#endif\n";
		var para_src = "";
		var func_src = "";
		var main_src = "void main(void) {\n";
		for(var i = 0; i < this.parts.length; i++) {
			var part = this.parts[i];
			para_src += part.getParameterSrc() + "\n\n";
			func_src += part.getFunctionSrc() + "\n\n";
			main_src += part.src_main + "\n";
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
	/**
	 * sets a buffer
	 * @param para a ShaderParameter object
	 * @param values the array to be set
	 */
	setBuffer: function(para, buffer, values) {
		if(buffer == null) return;
		var location;
		var gl = this.gl;
		location = gl.getAttribLocation(this.binary, para.identifier);
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
		var location; 
		if(para.modifier.search("varying") >= 0) {
			throw "Varying parameters can only be set inside shaders!"
		} else if(para.modifier.search("uniform") >= 0) {
					location = this.gl.getUniformLocation(this.binary, para.identifier);
					
		} else if (para.modifier.search("attribute") >= 0) {
					location = this.gl.getAttribLocation(this.binary, para.identifier);
		}
		
		
		switch(para.type) {
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
			case "vec3":{
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
			}
			case "mat4":{
				switch(para.modifier) {
					case "uniform": {
						this.gl.uniformMatrix4fv(location, false, value);
						break;
					}
				}
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
	_initializeFromSource: function(src) {
		this.src_main = parseMainFunction(src);
		this.functions = parseFunctions(src);
		this.parameters = ShaderParameterFactory.createFromStringArray(parseParameters(src));
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

