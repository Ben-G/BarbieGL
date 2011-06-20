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
	this.successors = new Array();
	this.predecessors = new Array();
	this.parallels = new Array();
	this.parts = new Array();
	this.required_parts = required_parts;
	
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
	
	finishedStateWasDrawn : true,
	
	stopParallels : true,
	
	// bring the loaded parts in the right order an save them into this.parts
	_setShaderParts: function(tmp_parts) {
		
		for(var j=0;j<tmp_parts.length;j++) {
			for(var i=0;i<this.required_parts.length;i++) {
				if(this.required_parts[i] == tmp_parts[j].name) this.parts[i] = tmp_parts[j];
			}	
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
	_refreshValues: function(obj) {

	},
	_passParameters: function(shaderProgram) {
		
	},
	addPredecessor: function(ani) {
		this.predecessors.push(ani);
	},
	addSuccessor: function(ani) {
		this.successors.push(ani);
		ani.addPredecessor(this);
	},
	startAfterPredecessors: function() {
		if(this._allPredecessorsFinished()) {
			this.start();
			//console.log("Start: " + this.name)
		} else {
			console.log("Not all Predecessors have finished for " + this.name)
		}
	},
	start: function() {
		this._repetitionsCount = 1;
		this.start_timestamp = new Date().getTime();
		this.state = Animation.STATE_RUNNING;
		this._startParallels();
		this._startActions();
	},
	restart: function() {
		this.start();
	},
	pause: function(pauseParals) {
		if(this.state == Animation.STATE_RUNNING) {
			this.pause_timestamp = new Date().getTime();
			this.state = Animation.STATE_PAUSED;
			if(pauseParals) this._pauseParallels();
		}
	},
	resume: function() {
		if(this.state == Animation.STATE_PAUSED) {
			//console.log("resuming " + this.name);
			this.start_timestamp = new Date().getTime() - this.time_elapsed;
			this.state = Animation.STATE_RUNNING;
			this._resumeParallels();
		}
	},
	stop: function(startSuccessors) {
		console.log("stop " + this.name);
		if(startSuccessors == null) startSuccessors = true;
		this._finish(startSuccessors, stopParallels);
		this.finishedStateWasDrawn = false;
	},
	_finishActions: function() {
		return;
	},
	_startActions: function() {
		return;
	},
	_finish: function(startSuccessors) {
		if(startSuccessors == null) startSuccessors = true;
		//console.log("Finishing " + this.name);
		this.time_elapsed = this.duration;
		this.state = Animation.STATE_FINISHED;
		if(startSuccessors) {
			this._startSuccessors();
		}
		if(this.stopParallels) {
			this._stopParallels();
		}
		this._finishActions();
	},
	_startSuccessors: function() {
		for(var i = 0; i < this.successors.length; i++) {
			//console.log("starting " + this.successors[i].name);
			this.successors[i].startAfterPredecessors();
		}
	},
	_startParallels: function() {
		for(var i = 0; i < this.parallels.length; i++) {
			//console.log("starting parallel " + this.parallels[i].name);
			this.parallels[i].start();
		}
	},
	_pauseParallels: function() {
		for(var i = 0; i < this.parallels.length; i++) {
			//console.log("starting parallel " + this.parallels[i].name);
			this.parallels[i].pause();
		}
	},
	_resumeParallels: function() {
		for(var i = 0; i < this.parallels.length; i++) {
			//console.log("starting parallel " + this.parallels[i].name);
			this.parallels[i].resume();
		}
	},
	_stopParallels: function() {
		for(var i = 0; i < this.parallels.length; i++) {
			//console.log("stopping parallel " + this.parallels[i].name);
			this.parallels[i].stop();
		}
	},
	_allPredecessorsFinished: function() {
		for(var i = 0; i < this.predecessors.length; i++) {
			if(this.predecessors[i].state != Animation.STATE_FINISHED) return false;
		}
		return true;
	}
}


RotationAnimation = function(type, name) {
	var parts = new Array("rotation");
	Animation.call(this, type, parts, name);
	this.start_offset_x = 0;
	this.start_offset_y = 0;
	this.start_offset_z = 0;
	this.end_offset_x = 0;
	this.end_offset_y = 0;
	this.end_offset_z = 0;
	this.rotMatrix = null;
}
RotationAnimation.prototype= new Animation();



RotationAnimation.prototype._calculateRotationMatrix = function(x_deg, y_deg, z_deg) {
	var rotX, rotY, rotZ, rotMat;
	rotX = WebGLBase.createRotationMatrix("x", x_deg);
	rotY = WebGLBase.createRotationMatrix("y", y_deg);
	rotZ = WebGLBase.createRotationMatrix("z", z_deg);
	return rotX.x(rotY.x(rotZ));
}

RotationAnimation.prototype._calculateAngle = function(start,end,time,duration) {
	return start + ((end-start) * (time / duration));
}


RotationAnimation.prototype._refreshValues = function(obj) {

 	var x_deg = this._calculateAngle(this.start_offset_x, this.end_offset_x, this.time_elapsed, this.duration);
	var y_deg = this._calculateAngle(this.start_offset_y, this.end_offset_y, this.time_elapsed, this.duration);
	var z_deg = this._calculateAngle(this.start_offset_z, this.end_offset_z, this.time_elapsed, this.duration);

	this.rotMatrix = this._calculateRotationMatrix(x_deg, y_deg, z_deg);
}

RotationAnimation.prototype._passParameters = function(program) {
	program.setParameter(program.getParameterById("rotMatrix"), this.rotMatrix.flatten());
}


TranslationAnimation = function(type, name) {
	var parts = new Array("translation");
	Animation.call(this, type, parts, name);
	this.start_offset = Vector.create([0,0,0]);
	this.end_offset = Vector.create([0,0,0]);
	this.transMatrix = null;
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

TranslationAnimation.prototype._refreshValues = function(obj) {
 	var curPosition = this._calculatePosition(this.start_offset, this.end_offset, this.time_elapsed, this.duration);
	
	this.transMatrix = this._calculateTranslationMatrix(curPosition);
}


TranslationAnimation.prototype._passParameters = function(program) {
	program.setParameter(program.getParameterById("transMatrix"), this.transMatrix.flatten());
}



AcceleratedTranslationAnimation = function(type, name) {
	TranslationAnimation.call(this, type, name);
}
AcceleratedTranslationAnimation.prototype= new TranslationAnimation();

AcceleratedTranslationAnimation.prototype._calculateLength = function(start,end,time,duration) {
	return start + ((end-start) * (time / duration)* (time / duration)* (time / duration)* (time / duration));
}

