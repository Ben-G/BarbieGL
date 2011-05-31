Effect = function() {
	// an array of strings with the names of the shader parts
	// that are necessary to realize the effect
	this.requiredShaderParts = new Array();
}

Effect.prototype = {
	addShaderPart: function(name) {
		this.requiredShaderParts.push(part)
	},
}