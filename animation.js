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
			//console.log("resuming " + this.name);
			this.start_timestamp = new Date().getTime() - this.time_elapsed;
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
		this._deactivateParts();
		this._setState(Animation.STATE_FINISHED);
		this._finishActions();
	},
	_setState: function(state) {
		this.state = state;
		if(this.mash != null) {
			this.mash._updateAnimationState(this);
		}
	}
}


RotationAnimation = function(type, name) {
	var parts = new Array();
	Animation.call(this, type, parts, name);
	this.start_offset = Vector.create([0,0,0]);
	this.current_offset = Vector.create([0,0,0]);
	this.end_offset = Vector.create([0,0,0]);
	this.changesRotationMatrix = true;
	this.rotationMatrix = null;
}
RotationAnimation.prototype= new Animation();



RotationAnimation.prototype._calculateRotationMatrix = function(curRotation) {
	var rotX, rotY, rotZ, rotMat;
	rotX = WebGLBase.createRotationMatrix("x", curRotation.e(1));
	rotY = WebGLBase.createRotationMatrix("y", curRotation.e(2));
	rotZ = WebGLBase.createRotationMatrix("z", curRotation.e(3));
	return rotX.x(rotY.x(rotZ));
}

RotationAnimation.prototype._calculateAngles = function(start,end,time,duration) {
	return start.add(end.subtract(start).multiply(time / duration));
}


RotationAnimation.prototype._refreshValues = function(obj) {
 	this.current_offset = this._calculateAngles(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
	this.rotationMatrix = this._calculateRotationMatrix(this.current_offset);
}

RotationAnimation.prototype._passParameters = function(program) {
	//program.setParameter(this._getPartByName("rotation").getParameterById("rotMatrix"), this.rotMatrix.flatten());
}


ScalingAnimation = function(type, name) {
	var parts = new Array();
	Animation.call(this, type, parts, name);
	this.start_offset = Vector.create([0,0,0]);
	this.current_offset = Vector.create([0,0,0]);
	this.end_offset = Vector.create([0,0,0]);
	this.scalingMatrix = null;
	this.changesScalingMatrix = true;
}

ScalingAnimation.prototype= new Animation();

ScalingAnimation.prototype._calculateScalingMatrix = function(scaleVector) {
		return WebGLBase.createScalingMatrix(scaleVector.e(1), scaleVector.e(2), scaleVector.e(3));
}
ScalingAnimation.prototype._calculateScale = function(start,end,time,duration) {
		return start.add(end.subtract(start).multiply(time / duration));
}
ScalingAnimation.prototype.setNewEnd = function(newEndVector) {
		curScaleVector = this._calculateScale(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
		this.start_offset = curScaleVector;
		this.end_offset = newEndVector
}
ScalingAnimation.prototype._refreshValues = function(obj) {
	 	this.current_offset = this._calculateScale(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
		this.scalingMatrix = this._calculateScalingMatrix(this.current_offset);
}
ScalingAnimation.prototype._passParameters = function(program) {
		//program.setParameter(this._getPartByName("translation").getParameterById("transMatrix"), this.transMatrix.flatten());
}


TranslationAnimation = function(type, name) {
	var parts = new Array();
	Animation.call(this, type, parts, name);
	this.start_offset = Vector.create([0,0,0]);
	this.current_offset = Vector.create([0,0,0]);
	this.end_offset = Vector.create([0,0,0]);
	this.translationMatrix = null;
	this.changesTranslationMatrix = true;
}
TranslationAnimation.prototype= new Animation();

TranslationAnimation.prototype._calculateTranslationMatrix = function(transVector) {
		return create3DTranslationMatrix(transVector).ensure4x4();
}
TranslationAnimation.prototype._calculatePosition = function(start,end,time,duration) {
		return start.add(end.subtract(start).multiply(time / duration));
}
TranslationAnimation.prototype.setNewEnd = function(newEndVector) {
		curPositionVector = this._calculatePosition(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
		this.start_offset = curPositionVector;
		this.end_offset = newEndVector
}
TranslationAnimation.prototype._refreshValues = function(obj, context) {
	 	this.current_offset = this._calculatePosition(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
		this.translationMatrix = this._calculateTranslationMatrix(this.current_offset);
}
TranslationAnimation.prototype._passParameters = function(program) {
		//program.setParameter(this._getPartByName("translation").getParameterById("transMatrix"), this.transMatrix.flatten());
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
	this.context = new Object();
	this.finishedInPause = new Array();
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
		this.translationMatrices = new Array();
		this.rotationMatrices = new Array();
		this.scalingMatrices = new Array();
		for(var i = 0; i<this._runningAnimations.length; i++) {
			var ani = this._runningAnimations[i];
			ani.refresh(obj, this.context);
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
	},
	_getRunningAnimations: function() { 
		return this._runningAnimations;
	},
	_updateAnimationState: function(animation) {
		switch(animation.state) {
			case Animation.STATE_CREATED: {break};
			case Animation.STATE_RUNNING: {
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
				if(this.state == Animation.STATE_RUNNING) {
					this._startSuccessors(animation);
				} else if(this.state == Animation.STATE_PAUSED) {
					this._finishedInPause.push(animation);
				}
				this._removeRunningAnimation(animation);
				break;
			};
		}
	},
	setContextValue: function (name, value) {
		this.context[name] = value;
	},
	getContextValue: function (name) {
		return this.context[name];
	},
	start: function() {
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
			}
			this._finishedInPause = new Array();
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
	getLength: function(index) {
		if(index == null || index >= this.points.length) var index = this.points.length-1;
		var len = 0;
		for(var i=1; i<=index; i++) {
			len += this.points[i].toVector().distanceFrom(this.points[i-1].toVector());
		}
		return len;
	}
}
