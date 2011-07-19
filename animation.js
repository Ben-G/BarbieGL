animationCount = 0;

Animation = function(type, required_parts, name) {
	if(required_parts == null) return;
	if(type != null) {
		this.type = type;
	}
	if(name != null) {
		this.name = name;
	} else {
		this.name = "Animation" + animationCount++;
	}
	this.parts = new Array();
	this.required_parts = required_parts;
	this.mash = null;
	this.rotationMatrix = null;
	this.translationMatrix = null;
	this.scalingMatrix = null;
	this.changesRotationMatrix = false;
	this.changesTranslationMatrix = false;
	this.changesScalingMatrix = false;
	this.duration = 1000;
	
	
	
	var defs = new Array();
	this.completed = new Deferrable();
    var def = new DeferrableList();
    var tmp_parts = new Array();
    var closure = this;
    
	for(var i = 0; i < required_parts.length; i++) {
		defs[i] = WebGLBase.shaderPartFactory.createFromName(required_parts[i].toString());
		defs[i].addCallback(function(data) { tmp_parts.push(data); });
	}
	def.finalCallback(function(){ 
		closure._setShaderParts(tmp_parts);
		closure.completed.callback();
		
	});
	def.addDeferrables(defs);
}

// animation never ends
Animation.TYPE_ENDLESS = 0;
// animation has a specified end, no repetition
Animation.TYPE_ONCE = 1;
// animation has a specified number of repetitions
Animation.TYPE_NUMBERED = 2;

// animation has just been created, but is not running yet
Animation.STATE_CREATED = 0;
// animation is running
Animation.STATE_RUNNING = 1;
// animation is paused, keeping it's state
Animation.STATE_PAUSED = 2;
// animation is finished or stopped
Animation.STATE_FINISHED = 3;


Animation.prototype = {
	rotationMatrix: null,
	translationMatrix: null,
	scalingMatrix: null,
	changesRotationMatrix: false,
	changesTranslationMatrix: false,
	changesScalingMatrix: false,
	
	completed: new Deferrable(),
	
	// type of the animation (endless, once, numbered)
	type: Animation.TYPE_ONCE,
	
	// if animation is numbered, this is the number of repetitions
	repetitions : 1,
	
	// number of repetitions that have already passed
	_repetitionsCount : 1,
	
	// the current state of the animation
	state : Animation.STATE_CREATED,
	
	// the duration in miliseconds an animation cycle takes
	duration : 0,
	
	// the timestamp in milliseconds, the animation has started
	start_timestamp : 0,
	
	// milliseconds passed, since the start
	time_elapsed : 0,
	
	// timestamp in milliseconds the animation was paused last
	pause_timestamp : 0,
	
	// names of the shader parts the animation needs,
	// used to load ShaderPart objects when the animation is constructed
	required_parts : new Array(),
	
	// this animation will not start until all predecessors are finished
	// endless animations predecessors must be stopped manually!
	predecessors : new Array(),
	
	// this animation will try to start all animations in this array when it finishes
	// endless animations must be stopped manually!
	successors : new Array(),
	
	// this animation will start all animations in this array when it starts
	// and pause / stop them when it's paused / stopped / finishes
	parallels : new Array(),
	
	// all required ShaderPart objects
	parts : new Array(),
	
	// the surrounding animation mash
	mash : null,
	
	finishedStateWasDrawn : true,
	
	stopParallels : true,
	
	// bring the loaded parts in the right order an save them into this.parts
	_setShaderParts: function(tmp_parts) {
		
		for(var j=0;j<tmp_parts.length;j++) {
			for(var i=0;i<this.required_parts.length;i++) {
				if(this.required_parts[i] == tmp_parts[j].name) this.parts[i] = tmp_parts[j];
				this.parts[i].isActive = false;
			}	
		}
	},
	_getPartByName: function(name) {
		for(var i=0;i<this.parts.length;i++) {
			if(this.parts[i].name == name) return this.parts[i];
		}
		return null;
	},
	katze: function() {
		console.log("superClass");
	},
	_activateParts: function() {
		for(var i=0;i<this.parts.length;i++) {
			this.parts[i].isActive = true;
		}
	},
	_deactivateParts: function() {
		for(var i=0;i<this.parts.length;i++) {
			this.parts[i].isActive = false;
		}
	},
	refresh: function(obj) {
		if(this.state == Animation.STATE_RUNNING) {
			this.time_elapsed = new Date().getTime() - this.start_timestamp;
				
			if(this.time_elapsed > this.duration) {
				if(this.type == Animation.TYPE_ENDLESS) {
					this.time_elapsed = 0;
					this.start_timestamp = new Date().getTime();
					
					
				} else if(this.type == Animation.TYPE_NUMBERED) {
					if(this._repetitionsCount >= this.repetitions) {
						this._finish();
					} else {
						this.start_timestamp = new Date().getTime();
						this.time_elapsed = 0;
						this._repetitionsCount++;
					}
				} else if(this.type == Animation.TYPE_ONCE) {
						this._finish();
				}
			}
			
			this._refreshValues(obj);
			this._passParameters(obj.shaderProgram);
		} else if (this.state == Animation.STATE_FINISHED && !this.finishedStateWasDrawn) {
			this.finishedStateWasDrawn = true;
			this._refreshValues(obj);
			this._passParameters(obj.shaderProgram);
		}
	},
	_refreshValues: function(obj, context) {

	},
	_passParameters: function(shaderProgram) {
		
	},
	start: function() {
		this._activateParts();
		this._repetitionsCount = 1;
		this.start_timestamp = new Date().getTime();
		
		this._setState(Animation.STATE_RUNNING);
		this._startActions();
	},
	restart: function() {
		this.start();
	},
	pause: function() {
		if(this.state == Animation.STATE_RUNNING) {
			this.pause_timestamp = new Date().getTime();
			this._setState(Animation.STATE_PAUSED);
		}
	},
	resume: function() {
		if(this.state == Animation.STATE_PAUSED) {
			this._setState(Animation.STATE_RUNNING);
		}
	},
	stop: function() {
		console.log("stop " + this.name);
		this._finish();
		this.finishedStateWasDrawn = false;
	},
	_finishActions: function() {
		return;
	},
	_startActions: function() {
		return;
	},
	_finish: function() {
		this.time_elapsed = this.duration;
		this._refreshValues(this.mash.object);
		this._passParameters(this.mash.object.shaderProgram);
		this._deactivateParts();
		this._setState(Animation.STATE_FINISHED);
		this._finishActions();
	},
	_setState: function(state) {
		var last = this.state;
		this.state = state;
		if(this.mash != null) {
			this.mash._updateAnimationState(this, last);
		}
	}
}


AnimationUtilities = function() {}
AnimationUtilities.prototype = {
	calculateLinearValues: function(start,end,time,duration) {
		return start.add(end.subtract(start).multiply(time / duration));
	},
	oppositeOf: function(original, opposite) {
		opposite.start_offset = original.end_offset.dup();
		opposite.end_offset = original.start_offset.dup();
		opposite.duration = original.duration;
	}
}

AnimationUtilities = new AnimationUtilities();


ColorGradientAnimation = function(type, name) {
	var parts = new Array("fragshader_color");
	Animation.call(this, type, parts, name);
	this.start_offset = Vector.create([0,0,0,0]);
	this.current_offset = Vector.create([0,0,0,0]);
	this.end_offset = Vector.create([0,0,0,0]);
	this.passToChildren = true;
}
ColorGradientAnimation.prototype= new Animation();

ColorGradientAnimation.prototype._refreshValues = function(obj) {
 	this.current_offset = AnimationUtilities.calculateLinearValues(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
}

ColorGradientAnimation.prototype._passParameters = function(program) {
	program.setParameter(this._getPartByName("fragshader_color").getParameterById("color"), new Float32Array(this.current_offset.flatten()));
 	this.current_offset = AnimationUtilities.calculateLinearValues(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
}


RotationAnimation = function(type, name) {
	var parts = new Array();
	Animation.call(this, type, parts, name);
	this.start_offset = Vector.create([0,0,0]);
	this.current_offset = Vector.create([0,0,0]);
	this.end_offset = Vector.create([0,0,0]);
	this.changesRotationMatrix = true;
	this.rotationMatrix = null;
	this.passToChildren = true;
}
RotationAnimation.prototype= new Animation();

RotationAnimation.prototype._calculateRotationMatrix = function(curRotation) {
	var rotX, rotY, rotZ, rotMat;
	rotX = WebGLBase.createRotationMatrix("x", curRotation.e(1));
	rotY = WebGLBase.createRotationMatrix("y", curRotation.e(2));
	rotZ = WebGLBase.createRotationMatrix("z", curRotation.e(3));
	return rotX.x(rotY.x(rotZ));
}

RotationAnimation.prototype._refreshValues = function(obj) {
 	this.current_offset = AnimationUtilities.calculateLinearValues(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
	this.rotationMatrix = this._calculateRotationMatrix(this.current_offset);
}


ScalingAnimation = function(type, name) {
	var parts = new Array();
	Animation.call(this, type, parts, name);
	this.start_offset = Vector.create([0,0,0]);
	this.current_offset = Vector.create([0,0,0]);
	this.end_offset = Vector.create([0,0,0]);
	this.scalingMatrix = null;
	this.changesScalingMatrix = true;
	this.passToChildren = true;
}

ScalingAnimation.prototype= new Animation();

ScalingAnimation.prototype._calculateScalingMatrix = function(scaleVector) {
		return WebGLBase.createScalingMatrix(scaleVector.e(1), scaleVector.e(2), scaleVector.e(3));
}
ScalingAnimation.prototype.setNewEnd = function(newEndVector) {
		curScaleVector = this._calculateScale(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
		this.start_offset = curScaleVector;
		this.end_offset = newEndVector
}
ScalingAnimation.prototype._refreshValues = function(obj) {
	 	this.current_offset = AnimationUtilities.calculateLinearValues(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
		this.scalingMatrix = this._calculateScalingMatrix(this.current_offset);
}



TranslationAnimation = function(type, name) {
	var parts = new Array();
	Animation.call(this, type, parts, name);
	this.start_offset = Vector.create([0,0,0]);
	this.current_offset = Vector.create([0,0,0]);
	this.end_offset = Vector.create([0,0,0]);
	this.translationMatrix = null;
	this.changesTranslationMatrix = true;
	this.passToChildren = true;
}

TranslationAnimation.prototype= new Animation();

TranslationAnimation.prototype._calculateTranslationMatrix = function(transVector) {
		return create3DTranslationMatrix(transVector).ensure4x4();
}

TranslationAnimation.prototype._calculateTranslationVector = function() {
	return AnimationUtilities.calculateLinearValues(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
}

TranslationAnimation.prototype.katze = function() {
	Animation.prototype.katze.call(this);
	console.log("subClass");
}

TranslationAnimation.prototype.setNewEnd = function(newEndVector) {
		curPositionVector = this._calculatePosition(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
		this.start_offset = curPositionVector;
		this.end_offset = newEndVector
}
TranslationAnimation.prototype._refreshValues = function(obj, context) {
	 	this.current_offset = this._calculateTranslationVector();
		this.katze();
		this.translationMatrix = this._calculateTranslationMatrix(this.current_offset);
}


SplineTranslationAnimation = function(type, name, spline) {
	TranslationAnimation.call(this, type, name);
	this.spline = spline;
	this.tension = CardinalSpline.TENSION_NORMAL;
}

SplineTranslationAnimation.prototype= new TranslationAnimation();

SplineTranslationAnimation.prototype._calculateTranslationVector = function() {
	var u = this.time_elapsed / this.duration;
	//console.log(this.name, this.duration, -s*u3+2*s*u2-s*u, (2-s)*u3+(s-3)*u2+1, (s-2)*u3+(3-2*s)*u2+1+s*u, s*u3-s*u2, "\n", p[0].toVector().inspect(), p[1].toVector().inspect(), p[2].toVector().inspect(), p[3].toVector().inspect(), res.inspect());
	return this.spline.getPosition(u, this.tension);
}

BezierTranslationAnimation = function(type, name, curve) {
	TranslationAnimation.call(this, type, name);
	this.curve = curve;
}

BezierTranslationAnimation.prototype= new TranslationAnimation();


BezierTranslationAnimation.prototype._calculateTranslationVector = function() {
	var u = this.time_elapsed / this.duration;
	//console.log(this.name, this.duration, -s*u3+2*s*u2-s*u, (2-s)*u3+(s-3)*u2+1, (s-2)*u3+(3-2*s)*u2+1+s*u, s*u3-s*u2, "\n", p[0].toVector().inspect(), p[1].toVector().inspect(), p[2].toVector().inspect(), p[3].toVector().inspect(), res.inspect());
	return this.curve.getPosition(u);
}


AcceleratedTranslationAnimation = function(type, name) {
	TranslationAnimation.call(this, type, name);
}

AcceleratedTranslationAnimation.prototype= new TranslationAnimation();

AcceleratedTranslationAnimation.prototype._calculateLength = function(start,end,time,duration) {
	return start + ((end-start) * (time / duration)* (time / duration)* (time / duration)* (time / duration));
}


var AnimationMashCount = 0;

AnimationMash = function() {
	this._startAnimations = new Array();
	this._successors = new Object();
	this._predecessors = new Object();
	this._parallels = new Object();
	this._runningAnimations = new Array();
	this._pausedAnimations = new Array();
	this._animations = new Array();
	this.rotationMatrices = new Array();
	this.translationMatrices = new Array();
	this.scalingMatrices = new Array();
	this._pausedRotationMatrices = new Array();
	this._pausedTranslationMatrices = new Array();
	this._pausedScalingMatrices = new Array();
	this.context = new Object();
	this._finishedInPause = new Array();
	this.state = Animation.STATE_CREATED;
	this.object = null;
	this.name = "AnimationMash" + AnimationMashCount++;
}

AnimationMash.prototype = {
	// TODO: Vorgänger / Nachfolger / sonstige zeitlich versetzt starten (100ms nach Vorgaenger) (Offset)
	_startAnimations: new Array(),
	_successors: new Object(),
	_predecessors: new Object(),
	_parallels: new Object(),
	_runningAnimations: new Array(),
	_pausedAnimations: new Array(),
	_animations: new Array(),
	_finishedInPause: new Array(),
	_pausedRotationMatrices: new Array(),
	_pausedTranslationMatrices: new Array(),
	_pausedScalingMatrices: new Array(),
	object: null,
	context: new Object(),
	state: Animation.STATE_CREATED,
	/**
	 * adds an animation, that is started, when the animation mash is started
	 */
	addStartAnimation: function(ani) {
		this._startAnimations.push(ani);
		this._addAnimation(ani);
	},
	/**
	 * adds an animation to the mash animation pool
	 */
	_addAnimation: function(ani) {
		if(!isContained(ani,this._animations)) {
			this._animations.push(ani);
			ani.mash = this;
		}
	},
	/**
	 * adds an animation, that is started, when the animation mash is started
	 */
	getAnimations: function() {
		return this._animations;
	},
	/**
	 * connects a successor animation that is started, when a predecessor animation finishes
	 */
	connectSuccessor: function(predecessor, successor, time_offset) {
		if(this._successors[predecessor.name] == null) {
			this._addAnimation(successor);
			this._successors[predecessor.name] = new Array(successor);	
		} else {
			this._addAnimation(successor);
			this._successors[predecessor.name].push(successor);
		}
		if(this._predecessors[successor.name] == null) {
			this._predecessors[successor.name] = new Array(predecessor);	
		} else {
			this._predecessors[successor.name].push(predecessor);
		}
		successor.mash = this;
	},
	/**
	 * removes a successor animation from the predecessor animation
	 */
	removeSuccessor: function(predecessor, successor) {
		if(this._successors[predecessor.name] != null) {
			for(var i = 0; i<this._successors[predecessor.name].length; i++) {
				if(this._successors[predecessor.name][i].name == successor.name) {
					this._successors[predecessor.name].splice(i,1);
				}
			}
		}
		if(this._predecessors[successor.name] != null) {
			for(var i = 0; i<this._predecessors[successor.name].length; i++) {
				if(this._predecessors[successor.name][i].name == _predecessors.name) {
					this._predecessors[successor.name].splice(i,1);
				}
			}
		}
	},
	/**
	 * connects a parallel animation2 to animation1
	 */
	connectParallel: function(animation1, animation2) {
		this._addAnimation(ani);
		if(this._parallels[animation1.name] == null) {
			this._parallels[animation1.name] = new Array(animation2);	
		} else {
			this._parallels[animation1.name].push(animation2);
		}
		animation2.mash = this;
	},
	
	/**
	 * removes the parallens animation2 from animation1
	 */
	removeParallel: function(animation1, animation2) {
		if(this._parallels[animation1.name] != null) {
			for(var i = 0; i<this._parallels[animation1.name].length; i++) {
				if(this._parallels[animation1.name][i].name == animation2.name) {
					this._parallels[animation1.name].splice(i,1);
				}
			}
		}
	},
	/**
	 * refreshes all running animations
	 */
	refresh: function(obj) {
		//console.log("refresh");
		this.translationMatrices = new Array();
		this.rotationMatrices = new Array();
		this.scalingMatrices = new Array();
		if(this.state == Animation.STATE_FINISHED) return;
		
		for(var i = 0; i<this._runningAnimations.length; i++) {
			var ani = this._runningAnimations[i];
			ani.refresh(obj, this.context);
		}
		
		for(var i = 0; i<this._runningAnimations.length; i++) {
			var ani = this._runningAnimations[i];
			if(ani.state == Animation.STATE_RUNNING) {
				if(ani.changesTranslationMatrix) {
					if(ani.translationMatrix == null) throw ani.name + " changes translation matrix, but does not provide one";
					this.translationMatrices.push(ani.translationMatrix);
				}
				if(ani.changesRotationMatrix) {
					if(ani.rotationMatrix == null) throw ani.name + " changes rotation matrix, but does not provide one";
					this.rotationMatrices.push(ani.rotationMatrix);
				} 
				if(ani.changesScalingMatrix) { 
					if(ani.scalingMatrix == null) throw ani.name + " changes scaling matrix, but does not provide one";
					this.scalingMatrices.push(ani.scalingMatrix);
				}
			}
		}
		
		for(var i = 0; i<this._pausedAnimations.length; i++) {
			var ani = this._runningAnimations[i];
			if(ani.changesTranslationMatrix) {
				
				if(ani.translationMatrix == null) throw ani.name + " changes translation matrix, but does not provide one";
				this.translationMatrices.push(ani.translationMatrix);
			}
			if(ani.changesRotationMatrix) {
				if(ani.rotationMatrix == null) throw ani.name + " changes rotation matrix, but does not provide one";
				this.rotationMatrices.push(ani.rotationMatrix);
			} 
			if(ani.changesScalingMatrix) { 
				if(ani.scalingMatrix == null) throw ani.name + " changes scaling matrix, but does not provide one";
				this.scalingMatrices.push(ani.scalingMatrix);
			}
		}

		if(this.state == Animation.STATE_PAUSED) {
			this.translationMatrices = this.translationMatrices.concat(this._pausedTranslationMatrices);
			this.rotationMatrices = this.rotationMatrices.concat(this._pausedRotationMatrices);
			this.scalingMatrices = this.scalingMatrices.concat(this._pausedScalingMatrices);
		}

	},
	_getRunningAnimations: function() { 
		return this._runningAnimations;
	},
	isFinished: function() {
		if(this._runningAnimations.length == 0 && this._pausedAnimations.length == 0) {
			if(this._finishedInPause.length == 0) return true;
			else {
				for(var i = 0; i < this._finishedInPause.length; i++) {
					if(this._successors[this._finishedInPause[i].name] != null) {
						return false;
					}
				}
				return true;
			}
		}
		return false;
	},
	_updateAnimationState: function(animation, last_state) {
		//console.log(animation.name + " from " + last_state +  " to " + animation.state);
		switch(animation.state) {
			case Animation.STATE_CREATED: {break};
			case Animation.STATE_RUNNING: {
				this._removeRunningAnimation(animation);
				this._runningAnimations.push(animation);
				this._removePausedAnimation(animation);
				break;
			};
			case Animation.STATE_PAUSED: {
				this._removeRunningAnimation(animation);
				this._pausedAnimations.push(animation);
				break;
			};
			case Animation.STATE_FINISHED: {
				this._removeRunningAnimation(animation);
				if(this.isFinished() && this._successors[animation.name] == null) {
					this.state = Animation.STATE_FINISHED;
				}
				if(this.state == Animation.STATE_RUNNING) {
					this._startSuccessors(animation);
				} else if(this.state == Animation.STATE_PAUSED) {
					animation._activateParts();
					this._finishedInPause.push(animation);
					this._saveMatrices(animation);
				}

				break;
			};
		}
	},
	_saveMatrices: function(ani) {
		if(ani.changesTranslationMatrix) {
			if(ani.translationMatrix == null) throw ani.name + " changes translation matrix, but does not provide one";
			this._pausedTranslationMatrices.push(ani.translationMatrix);
		}
		if(ani.changesRotationMatrix) {
			if(ani.rotationMatrix == null) throw ani.name + " changes rotation matrix, but does not provide one";
			this._pausedRotationMatrices.push(ani.rotationMatrix);
		} 
		if(ani.changesScalingMatrix) { 
			if(ani.scalingMatrix == null) throw ani.name + " changes scaling matrix, but does not provide one";
			this._pausedScalingMatrices.push(ani.scalingMatrix);
		}
	},
	setContextValue: function (name, value) {
		this.context[name] = value;
	},
	getContextValue: function (name) {
		return this.context[name];
	},
	start: function() {
		if(this.object == null) throw "You must add an AnimationMash to an Object3D beforce starting it"
		this.state = Animation.STATE_RUNNING;
		for(var i=0; i<this._startAnimations.length; i++) {
			this._startAnimation(this._startAnimations[i]);
		}
	},
	stop: function() {
		this.state = Animation.STATE_FINISHED;
		this.stopAnimations();
	},
	pause: function() {
		if(this.state == Animation.STATE_RUNNING)
			this.state = Animation.STATE_PAUSED;
	},
	resume: function() {
		if(this.state == Animation.STATE_PAUSED) {
			this.state = Animation.STATE_RUNNING;
			for(var i=0;i<this._finishedInPause.length;i++) {
				this._startSuccessors(this._finishedInPause[i]);
				this._finishedInPause[i]._deactivateParts();
			}
			this._finishedInPause = new Array();
			this._pausedRotationMatrices = new Array();
			this._pausedTranslationMatrices = new Array();
			this._pausedScalingMatrices = new Array();
		}
	},
	resumeOneStep: function() {
		if(this.state == Animation.STATE_PAUSED) {
			for(var i=0;i<this._finishedInPause.length;i++) {
				this._startSuccessors(this._finishedInPause[i]);
				this._finishedInPause[i]._deactivateParts();
			}
			this._finishedInPause = new Array();
			this._pausedRotationMatrices = new Array();
			this._pausedTranslationMatrices = new Array();
			this._pausedScalingMatrices = new Array();
		}
	},
	restart: function() {
		for(var i = 0; i<this._runningAnimations.length; i++) {
			this._runningAnimations[i].stop();
		}
		this.start();
	},
	restartAnimations: function() {
		for(var i = 0; i<this._runningAnimations.length; i++) {
			this._runningAnimations[i].restart();
		}
	},	
	pauseAnimations: function() {
		// TODO: Parallels pause?
		for(var i = 0; i<this._runningAnimations.length; i++) {
			this._runningAnimations[i].pause();
		}
	},
	resumeAnimations: function() {
		for(var i = 0; i<this._pausedAnimations.length; i++) {
			this._pausedAnimations[i].resume();
		}
	},
	stopRunningAnimations: function() {
		for(var i = 0; i<this._runningAnimations.length; i++) {
			this._runningAnimations[i].stop();
			this._runningAnimations[i].refresh();
		}
	},
	stopAnimations: function() {
		for(var i = 0; i<this._runningAnimations.length; i++) {
			this._runningAnimations[i].stop();
			this._runningAnimations[i].refresh();
		}
		for(var i = 0; i<this._pausedAnimations.length; i++) {
			this._pausedAnimations[i].stop();
			this._pausedAnimations[i].refresh();
		}
	},
	_removeRunningAnimation: function(animation) {
		for(var i = 0; i<this._runningAnimations.length; i++) {
			if(this._runningAnimations[i].name == animation.name) {
				this._runningAnimations.splice(i,1);
			}
		}
	},
	_removePausedAnimation: function(animation) {
		for(var i = 0; i<this._pausedAnimations.length; i++) {
			if(this._pausedAnimations[i].name == animation.name) {
				this._pausedAnimations.splice(i,1);
			}
		}
	},
	_startAnimation: function(animation) {
		animation.start();
		animation.refresh(this.object);
		this._startParallels(animation);
	},
	_startParallels: function(animation) {
		if(this._parallels[animation.name] != null) {
			for(var i = 0; i < this._parallels[animation.name].length; i++) {
				if(this._allPredecessorsFinished(this._parallels[animation.name][i])) {
					this._startAnimation(this._parallels[animation.name][i]);
				}
			}
		}		
	},
	_startSuccessors: function(animation) {
		if(this._successors[animation.name] != null) {
			for(var i = 0; i < this._successors[animation.name].length; i++) {
				if(this._allPredecessorsFinished(this._successors[animation.name][i])) {
					this._startAnimation(this._successors[animation.name][i]);
				}
			}	
		}
	},
	_allPredecessorsFinished: function(animation) {
		if(this._predecessors[animation.name] != null) {
			for(var i = 0; i < this._predecessors[animation.name].length; i++) {
				if(this._predecessors[animation.name][i].state != Animation.STATE_FINISHED) return false;
			}
		}
		return true;
	}
	
}



AnimationPath = function() {
	this.points = new Array();
}

AnimationPath.prototype = {
	points: new Array(),
	setPoints: function(points) {
		this.points = points;
	},
	getPoints: function() {
		return this.points;
	},
	addPoint: function(point) {
		this.points.push(point);
	},
	getPoint: function(index) {
		return this.points[index];
	},
	getLastPointIndex: function(length) {
		for(var i=1; i<this.points.length; i++) {
			if(this.getLength(i) >= length) return i-1;
			if(i == this.points.length-1) return i;
		}
	},
	getLength: function(index, index2) {
		if(index == null || index >= this.points.length) var index = 0;
		if(index2 == null || index2 >= this.points.length) var index2 = this.points.length-1;
		var len = 0;
		for(var i=index+1; i<=index2; i++) {
			len += this.points[i].distanceFrom(this.points[i-1]);
		}
		return len;
	},
	getCircleLength: function() {
		return this.getLength() + this.points[0].distanceFrom(this.points[this.points.length-1]);
	},
	getCardinalSpline: function(index, circle, tension) {
		if(circle == null) circle == false;
		if(tension == null) tension == 0;

		var points = new Array();
		if(this.points.length < 4) throw "Path has less than 4 points";
		
		if(circle) {
			points.push(this.points[(index+this.points.length-1)%(this.points.length)]);
			points.push(this.points[index]);
			points.push(this.points[(index+1)%(this.points.length)]);
			points.push(this.points[(index+2)%(this.points.length)]);
		} else {
			if(i+2 >= this.points.length) throw "Index is too high";
			if(index == 0) {
				points.push(this.points[index]);
				points.push(this.points[index]);
				points.push(this.points[index+1]);
				points.push(this.points[index+2]);
			} else if(index == this.points.length-2) {
				points.push(this.points[index-1]);
				points.push(this.points[index]);
				points.push(this.points[index+1]);
				points.push(this.points[index+1]);
			} else {
				points.push(this.points[index-1]);
				points.push(this.points[index]);
				points.push(this.points[index+1]);
				points.push(this.points[index+2]);
			}
		}
		return new CardinalSpline(points);
	},
	getBezierCurve: function(index, index2) {
		if(index == null) index = 0;
		
		return new BezierCurve(this.points.slice(index, index2))
	}
}


AnimationMashFactory = function() {
	
}

AnimationMashFactory.prototype = {
	createShrinkAnimation: function(factor, duration) {
		if(duration == null) duration = 75;
		if(factor == null) factor = 1.1;
		
		var defs = new Array();
		var d = new Deferrable();
   		var defList = new DeferrableList();

		var inAni = new ScalingAnimation(Animation.TYPE_ONCE);
		var outAni = new ScalingAnimation(Animation.TYPE_ONCE);
		defs.push(inAni.completed);
		defs.push(outAni.completed);
		
		defList.finalCallback( function() {
			
		    inAni.duration = duration;
            inAni.start_offset = Vector.create([1,1,1]);
            inAni.end_offset = Vector.create([1.0/factor,1.0/factor,1.0/factor]);
            
            AnimationUtilities.oppositeOf(inAni, outAni);
			
			var mash = new AnimationMash();
			mash.name = "shrink";
			mash.addStartAnimation(inAni);
			mash.connectSuccessor(inAni, outAni);
			d.callback(mash);
		});
		defList.addDeferrables(defs);
		return d;
	},
	createFlipAnimation: function(axis, degrees, duration) {
		if(duration == null) duration = 300;
		if(axis == null) axis = "x";
		if(degrees == null) degrees = 180;
		
		var defs = new Array();
		var d = new Deferrable();
   		var defList = new DeferrableList();

		// create Animations
		upAni = new RotationAnimation(Animation.TYPE_ONCE);
		backAni = new RotationAnimation(Animation.TYPE_ONCE);
		defs.push(upAni.completed);
		defs.push(backAni.completed);
		
		defList.finalCallback( function() {
			
			// configure animations
			var vec = Vector.create([degrees,0,0]);
			if(axis == "y") vec = Vector.create([0,degrees,0]);
			if(axis == "z") vec = Vector.create([0,0,degrees]);
	        upAni.duration = duration;
	        upAni.start_offset = Vector.create([0,0,0]);
	        upAni.end_offset = vec;
	        AnimationUtilities.oppositeOf(upAni, backAni);
			
			var mash = new AnimationMash();
			mash.name = "flip";
			mash.addStartAnimation(upAni);
			mash.connectSuccessor(upAni, backAni);
			d.callback(mash);
		});
		defList.addDeferrables(defs);
		return d;
	},
	createBlinkAnimation: function(color, duration) {
		if(duration == null) duration = 75;
		if(color == null) color = Vector.create([0.5,0,0,0]);
		
		var defs = new Array();
		var d = new Deferrable();
   		var defList = new DeferrableList();

		// create Animations
		upAni = new ColorGradientAnimation(Animation.TYPE_ONCE);
		backAni = new ColorGradientAnimation(Animation.TYPE_ONCE);
		defs.push(upAni.completed);
		defs.push(backAni.completed);
		
		defList.finalCallback( function() {
			
			// configure animations
	        upAni.duration = duration;
	        upAni.start_offset = Vector.create([0,0,0,0]);
	        upAni.end_offset = color;
	        AnimationUtilities.oppositeOf(upAni, backAni);
			
			var mash = new AnimationMash();
			mash.name = "blink";
			mash.addStartAnimation(upAni);
			mash.connectSuccessor(upAni, backAni);
			d.callback(mash);
		});
		defList.addDeferrables(defs);
		return d;
	},
	createMinimizeAnimation: function(position, duration) {
		if(duration == null) duration = 300;
		if(position == null) position = Vector.create([0,0,0]);
		
		var defs = new Array();
		var d = new Deferrable();
   		var defList = new DeferrableList();

		// create Animations
		
		minAni1 = new ScalingAnimation(Animation.TYPE_ONCE);
		maxAni1 = new ScalingAnimation(Animation.TYPE_ONCE);
		minAni2 = new TranslationAnimation(Animation.TYPE_ONCE);
		maxAni2 = new TranslationAnimation(Animation.TYPE_ONCE);
		
		defs.push(minAni1.completed);
		defs.push(minAni2.completed);
		defs.push(maxAni1.completed);
		defs.push(maxAni2.completed);
		
		defList.finalCallback( function() {
			
			// configure animations
	        minAni1.duration = duration;
	        minAni1.start_offset = Vector.create([1,1,1]);
	        minAni1.end_offset = Vector.create([0,0,0]);
	        AnimationUtilities.oppositeOf(minAni1, maxAni1);
	        
	        minAni2.duration = duration;
	        minAni2.start_offset = Vector.create([0,0,0]);
	        minAni2.end_offset = position;
	        AnimationUtilities.oppositeOf(minAni2, maxAni2);
			
			var mash = new AnimationMash();
			mash.name = "minimize";
			mash.addStartAnimation(minAni1);
			mash.addStartAnimation(minAni2);
			mash.connectSuccessor(minAni1, maxAni1);
			mash.connectSuccessor(minAni2, maxAni2);
			d.callback(mash);
		});
		defList.addDeferrables(defs);
		return d;
	},
	createCircleMinimizeAnimation: function(radius, duration) {
		if(duration == null) duration = 500;
		if(radius == null) radius = 3;
		
		var defs = new Array();
		var d = new Deferrable();
   		var defList = new DeferrableList();

		// create Animations
		
		var path = new AnimationPath();
		path.addPoint(Vector.create([0,0,0]));
		path.addPoint(Vector.create([radius,-radius,0]));
		path.addPoint(Vector.create([2*radius,0,0]));
		path.addPoint(Vector.create([0,2*radius,0]));
		path.addPoint(Vector.create([-4*radius,0,0]));
		path.addPoint(Vector.create([6*radius,-6*radius,0]));
		
		minAni1 = new ScalingAnimation(Animation.TYPE_ONCE);
		
		var mash2;
		
		defs.push(minAni1.completed);
		defs.push(this.createSplineTranslationAnimation(path,true,duration));
		defs[defs.length-1].addCallback(function(data) { mash2 = data; console.log((data))});
		
		defList.finalCallback( function() {
			
			// configure animations
	        minAni1.duration = duration;
	        minAni1.start_offset = Vector.create([1,1,1]);
	        minAni1.end_offset = Vector.create([0,0,0]);
			
			var mash = new AnimationMash();
			mash.name = "minimize";
			mash.addStartAnimation(minAni1);
			mash.addStartAnimation(mash2._animations[0]);
			for(var i = 0; i < mash2._animations.length-1; i++) {
				mash.connectSuccessor(mash2._animations[i], mash2._animations[i+1]);
			}
			console.log(mash);
			d.callback(mash);
		});
		defList.addDeferrables(defs);
		return d;
	},
	createCircleMaximizeAnimation: function(radius, duration) {
		if(duration == null) duration = 500;
		if(radius == null) radius = 3;
		
		var defs = new Array();
		var d = new Deferrable();
   		var defList = new DeferrableList();

		// create Animations
		
		var path = new AnimationPath();
		path.addPoint(Vector.create([6*radius,-6*radius,0]));
		path.addPoint(Vector.create([-4*radius,0,0]));
		path.addPoint(Vector.create([0,2*radius,0]));
		path.addPoint(Vector.create([2*radius,0,0]));
		path.addPoint(Vector.create([radius,-radius,0]));
		path.addPoint(Vector.create([0,0,0]));

		minAni1 = new ScalingAnimation(Animation.TYPE_ONCE);
		
		var mash2;
		
		defs.push(minAni1.completed);
		defs.push(this.createSplineTranslationAnimation(path,true,duration));
		defs[defs.length-1].addCallback(function(data) { mash2 = data; console.log((data))});
		
		defList.finalCallback( function() {
			
			// configure animations
	        minAni1.duration = duration;
	        minAni1.start_offset = Vector.create([0,0,0]);
	        minAni1.end_offset = Vector.create([1,1,1]);
			
			var mash = new AnimationMash();
			mash.name = "maximize";
			mash.addStartAnimation(minAni1);
			mash.addStartAnimation(mash2._animations[0]);
			for(var i = 0; i < mash2._animations.length-1; i++) {
				mash.connectSuccessor(mash2._animations[i], mash2._animations[i+1]);
			}
			console.log(mash);
			d.callback(mash);
		});
		defList.addDeferrables(defs);
		return d;
	},
	createLinearPathTranslationAnimation: function(path, duration) {
		if(duration == null) duration = 1000;
		if(path == null) return null;
		
		var defs = new Array();
		var d = new Deferrable();
   		var defList = new DeferrableList();

		// create Animations
		var anis = new Array();
		
		for(var i = 0; i<path.points.length-1; i++) {
			var ani = new TranslationAnimation(Animation.TYPE_ONCE);
			anis.push(ani);
			defs.push(ani.completed);
		}
		
		defList.finalCallback( function() {
			
			// configure animations
			var mash = new AnimationMash();
			mash.name = "minimize";
			mash.addStartAnimation(anis[0]);
			
			
			for(var i = 0; i<anis.length; i++) {
				var ani = anis[i];
				ani.start_offset = path.points[i];
				ani.end_offset = path.points[i+1];
				ani.duration = duration * path.getLength(i,i+1) / path.getLength();
				if(i != anis.length -1) {
					mash.connectSuccessor(ani, anis[i+1]);
				} else {
					mash.connectSuccessor(ani, anis[0]);
				}
			}

			d.callback(mash);
		});
		defList.addDeferrables(defs);
		return d;
	},
	createSplineTranslationAnimation: function(path, circle, duration) {
		if(duration == null) duration = 1000;
		if(path == null) return null;
		if(circle == null) circle == true;
		
		var defs = new Array();
		var d = new Deferrable();
   		var defList = new DeferrableList();

		// create Animations
		var anis = new Array();
		
		var c;
		if(circle) c=path.points.length;
		else c=path.points.length+1; 
		for(var i = 0; i<c; i++) {
			var ani = new SplineTranslationAnimation(Animation.TYPE_ONCE);
			anis.push(ani);
			defs.push(ani.completed);
		}
		
		defList.finalCallback( function() {
			
			// configure animations
			var mash = new AnimationMash();
			mash.name = "splineTranslation";
			mash.addStartAnimation(anis[0]);
			
			for(var i = 0; i<anis.length; i++) {
				var ani = anis[i];
				ani.spline = path.getCardinalSpline(i,circle);
				
				if(i != anis.length -1) {
					mash.connectSuccessor(ani, anis[i+1]);
					ani.duration = duration * path.getLength(i,i+1) / path.getCircleLength();
				} else {
					mash.connectSuccessor(ani, anis[0]);
					ani.duration = duration * (path.getCircleLength() - path.getLength()) / path.getCircleLength();
				}
			}
			d.callback(mash);
		});
		defList.addDeferrables(defs);
		return d;
	},
}

AnimationMashFactory = new AnimationMashFactory();

CardinalSpline = function(control_points) {
	this.control_points = control_points;
}

CardinalSpline.TENSION_TIGHT = -1;
CardinalSpline.TENSION_NORMAL = 0;
CardinalSpline.TENSION_LOOSE = 1;

CardinalSpline.prototype = {
	getPosition: function(u, tension) {
		if(tension == null) tension = 0;
		if(this.control_points == null || this.control_points.length < 4) throw "Cardinal Splines need at least 4 control points but you have specified less";
		var s = (1-tension)/2;
		var p = this.control_points;
		var u3 = Math.pow(u,3);
		var u2 = Math.pow(u,2);
		
		var res = p[0].x(-s*u3+2*s*u2-s*u);
		res = res.add(p[1].x((2-s)*u3+(s-3)*u2+1));
		res = res.add(p[2].x((s-2)*u3+(3-2*s)*u2+s*u));
		res = res.add(p[3].x(s*u3-s*u2));
		
		//console.log(this.name, this.duration, -s*u3+2*s*u2-s*u, (2-s)*u3+(s-3)*u2+1, (s-2)*u3+(3-2*s)*u2+1+s*u, s*u3-s*u2, "\n", p[0].toVector().inspect(), p[1].toVector().inspect(), p[2].toVector().inspect(), p[3].toVector().inspect(), res.inspect());
		return res;
	}
}


BezierCurve = function(control_points) {
	this.control_points = control_points;
}


BezierCurve.prototype = {
	getPosition: function(u) {
		if(this.control_points == null) throw "No control points for Bezier curve specified";
		var p = this.control_points;
		var res = Vector.create([0,0,0]);

		for(var i=0; i<p.length; i++) {
			res = res.add(p[i].x(this._bezier(i,p.length-1,u)));
		}
		//console.log(this.name, this.duration, -s*u3+2*s*u2-s*u, (2-s)*u3+(s-3)*u2+1, (s-2)*u3+(3-2*s)*u2+1+s*u, s*u3-s*u2, "\n", p[0].toVector().inspect(), p[1].toVector().inspect(), p[2].toVector().inspect(), p[3].toVector().inspect(), res.inspect());
		return res;
	},
	_bezier: function(k,n,u) {
		var bez = (factorial(n)/(factorial(k)*factorial(n-k))) * Math.pow(u,k) * Math.pow(1-u, n-k);
		return  bez;
	}
}