var asPositionable = function() {
	this.xOffset = 0;
    this.yOffset = 0;
    this.zOffset = 0;
    
    this.translationMatrix = Matrix.I(4);
    this.mvMatrixHasChanged = true;
    
    this.resetTranslationMatrix = function() {
    	
		this.translationMatrix = create3DTranslationMatrix(Vector.create([this.xOffset, this.yOffset, this.zOffset])).ensure4x4();
    }
    
	this.setXOffet() = function(x) {
		this.xOffset = x;
		this.mvMatrixHasChanged = true;
		this.resetTranslationMatrix();
	}
	
	this.setYOffet() = function(y) {
		this.yOffset = y;
		this.mvMatrixHasChanged = true;
		this.resetTranslationMatrix();
	}
	
	this.setZOffet() = function(z) {
		this.zOffset = z;
		this.mvMatrixHasChanged = true;
		this.resetTranslationMatrix();
	}
}

var asRotatable = function() {
	this.xRotationOffset = 0;
    this.yRotationOffset = 0;
    this.zRotationOffset = 0;
    
    this.rotationMatrix = Matrix.I(4);
    this.mvMatrixHasChanged = true;
    
    this.resetRotationMatrix = function() {
    	
    	
    	var rotX = WebGLBase.createRotationMatrix("x", this.xRotationOffset);
		var rotY = WebGLBase.createRotationMatrix("y", this.yRotationOffset);
		var rotZ = WebGLBase.createRotationMatrix("z", this.zRotationOffset);
		this.rotationMatrix = rotX.x(rotY.x(rotZ));
    	
    }

	this.setXRotationOffet() = function(x) {
		this.xRotationOffset = x;
		this.mvMatrixHasChanged = true;
		this.resetRotationMatrix();
	}
	
	this.setYRotationOffet() = function(y) {
		this.yRotationOffset = y;
		this.mvMatrixHasChanged = true;
		this.resetRotationMatrix();
	}
	
	this.setZRotationOffet() = function(z) {
		this.zRotationOffset = z;
		this.mvMatrixHasChanged = true;
		this.resetRotationMatrix();
	}
}


var asScalable = function() {
	this.xScaleOffset = 0;
    this.yScaleOffset = 0;
    this.zScaleOffset = 0;
    
    this.scalingMatrix = Matrix.I(4);
    
    this.mvMatrixHasChanged = true;
   
    this.resetScalingMatrix = function() {
    	this.mvMatrixHasChanged = true;
		this.scalingMatrix = WebGLBase.createScalingMatrix(xScaleOffset, yScaleOffset, zScaleOffset);
    }

	this.setXScalingOffet() = function(x) {
		this.xScalingOffset = x;
		this.mvMatrixHasChanged = true;
		this.resetScalingMatrix();
	}
	
	this.setYScalingOffet() = function(y) {
		this.yScalingOffset = y;
		this.mvMatrixHasChanged = true;
		this.resetScalingMatrix();
	}
	
	this.setZScalingOffet() = function(z) {
		this.zScalingOffset = z;
		this.mvMatrixHasChanged = true;
		this.resetScalingMatrix();
	}
}

var asTransformable = function() {
	asPositionable.call(Transformable.prototype);
	asScalable.call(Transformable.prototype);
	asRotatable.call(Transformable.prototype);
	this.mvMatrixHasChanged = true;
	this.transformationMatrix = Matrix.I(4);
	
	this.recalculateTransformationMatrix = function() {
		if(this.mvMatrixHasChanged) {
			this.transformationMatrix = Matrix.I(4);
	    	this.transformationMatrix = this.transformationMatrix.x(this.scalingMatrix);
	    	this.transformationMatrix = this.transformationMatrix.x(this.rotationMatrix);
	    	this.transformationMatrix = this.transformationMatrix.x(this.translationMatrix);
    	}
    }
    
    this.refresh = function(transMat) {
		this.recalculateTranslationMatrix();
		return transMat.x(this.translationMatrix);
	}
}

var asMaterial = function() {
	this.shininess = 1;
	this.sheenColor = Vector.create([1,1,1,1]);
	this.sheens = true;
}

var asAnimatable = function() {
	asTransformable.call(Animatable.prototype);
	
	this.animationMashs = new Object();
	this.animationRotationMat = Matrix.I(4);
	this.animationTranslationMat = Matrix.I(4);
	this.animationScalingMat = Matrix.I(4);

	this.recalculateTransformationMatrix = function() {
		Transformable.prototype.recalculateTransformationMatrix.call(this);
		if(this.mvMatrixHasChanged) {
			this.transformationMatrix = this.transformationMatrix.x(this.animationRotationMat);
	    	this.transformationMatrix = this.transformationMatrix.x(this.animationScalingMat);
	    	this.transformationMatrix = this.transformationMatrix.x(this.animationTranslationMat);
    	}
	}

	this.refreshAnimations = function() {
		var aniRotMats = new Array();
		var aniTransMats = new Array();
		var aniScaleMats = new Array();
		for(var i in this.animationMashs) {
			var mash = this.animationMashs[i];
			mash.refresh(this);
			aniRotMats = aniRotMats.concat(mash.rotationMatrices);
			aniTransMats = aniTransMats.concat(mash.translationMatrices);
			aniScaleMats = aniScaleMats.concat(mash.scalingMatrices);
		}
		
		if(aniRotMats.length > 0) {
			this.animationRotationMat = Matrix.I(4);
			this.mvMatrixHasChanged = true;
			for(var i = 0;i<aniRotMats.length;i++) {
			    this.animationRotationMat = this.animationRotationMat.x(aniRotMats[i]);
			}	
		}
		if(aniTransMats.length > 0 ) {
			this.animationTranslationMat = Matrix.I(4);
			this.mvMatrixHasChanged = true;
			for(var i = 0;i<aniTransMats.length;i++) { 
		    	this.animationTranslationMat = this.animationTranslationMat.x(aniTransMats[i]);
			}
		}
		if(aniScaleMats.length > 0) {
			this.animationScalingMat = Matrix.I(4);
			this.mvMatrixHasChanged = true;
			for(var i = 0;i<aniScaleMats.length;i++) {
		   		this.animationScalingMat = this.animationScalingMat.x(aniScaleMats[i]);
			}
		}
	}
	
	this.refresh = function(transMat) {
		this.refreshAnimations();
		this.recalculateTranslationMatrix();
		return transMat.x(this.translationMatrix);
	}
	
	this.addAnimationMash = function (animation) {
		if(animation.object != null) throw "This AnimationMash (" + animation.name + ") is already bound to another Object3D (" + animation.object.name + ")";
		this.animationMashs[animation.name] = animation;
		animation.object = this;
		
		//TODO: Object3D rebiuldShaderProgram + super()-call
	}
}

Light = new function() {}
Light.TYPE_AMBIENT_LIGHT = 0;
Light.TYPE_DIRECTIONAL_LIGHT = 1;
Light.TYPE_POINT_LIGHT = 2;
Light.TYPE_SPOT_LIGHT = 3;

AmbientLight = function(color) {
	asAnimatable.call(Light.prototype);
	this.type = Light.TYPE_AMBIENT_LIGHT;
	if(color != null) {
		this.color = color
	} else
		this.color = Vector.create([1.0,1.0,1.0,1.0]);
}


DirectionalLight = function(color, direction, intensity) {
	AmbientLight.call(this,color);
	this.type = Light.TYPE_DIRECTIONAL_LIGHT;
	if(direction != null) {
		this.direction=direction;
	} else
		this.direction = Vector.create([0,-1,0]);
		
	if(intensity != null) {
		this.intensity=intensity;
	} else
		this.intensity = 1;
}

DirectionalLight.prototype = new AmbientLight();

PointLight = function(color, position, intensity) {
	AmbientLight.call(this,color);
	this.type = Light.TYPE_DIRECTIONAL_LIGHT;
	if(intensity != null) {
		this.intensity=intensity;
	} else
		this.intensity = 1;
	if(position != null) {
		this.position=position;
	} else
		this.position = Vector.create([0,0,0]);
}

PointLight.prototype = new AmbientLight();