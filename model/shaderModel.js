function ShaderPartFactory(){
    this.cache = new Object();
}

var ShaderPartCount = new Object();

ShaderPartFactory.prototype = {
    clone: function(part, shader) {
    	var tmp = new ShaderPart();
    	for(var i in part) {
    		tmp[i] = part[i];
    	}
    	tmp.shader = shader;
    	if(ShaderPartCount[tmp.name] == null) ShaderPartCount[tmp.name] = 0;
    	tmp.id = tmp.name + ShaderPartCount[tmp.name]++;
    	tmp.parameters = ShaderParameterFactory.cloneArray(part.parameters, tmp);
    	return tmp;
    },
    createFromName: function(shaderName){
            if (this.cache[shaderName] == null) {
                var def_load_json = deferredLoadFile("shaders/"+shaderName+".json");
                var def_final = new Deferrable();
                var closure = this;   
                def_load_json.addCallback(function(shaderPartJSON){  
                	closure.createFromJSON(shaderPartJSON, shaderName).addCallback(function(part) {
	                	def_final.callback(part);
	                	}
                	)
            	});           
                   
                return def_final;     
            } else{
                var d = new Deferrable();
                d.data = this.clone(this.cache[shaderName]);
                d.completed = true;
                return d;
            }
    },
    createFromJSON: function(json, shaderName) {
    	var closure = this;
    	var def_final = new Deferrable();
        var newShaderPart = JSON.parse(json);
    	var def_load_source = deferredLoadFile("shaders/src/"+newShaderPart.sourcepath);
    	def_load_source.addCallback(function(src) {
    		// create and initalize a new ShaderPart object
    		var part = new ShaderPart(src);

    		part.name = shaderName;
    		if(ShaderPartCount[part.name] == null) ShaderPartCount[part.name] = 0;
    		part.id = part.name + ShaderPartCount[part.name]++;
    		
    		if(newShaderPart.type == "fragment_shader") {
    			part.type = Shader.TYPE_FRAGMENT_SHADER;
    		} else if(newShaderPart.type == "vertex_shader") {
    			part.type = Shader.TYPE_VERTEX_SHADER;
    		} else throw shaderName + " has an invalid type: " + newShaderPart.type;
    		
    		closure._addToCache(part.name,part);
    		def_final.callback(part); 
    	});
    	return def_final;
    },
    _addToCache: function(shaderName,shaderString){
        this.cache[shaderName] = shaderString;
    }
}

ShaderPartFactory = new ShaderPartFactory();


