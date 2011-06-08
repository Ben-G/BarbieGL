Animation = function(type) {
	
	if(type != null) {
		this.type = type;
	}
	
	this.successors = new Array();
	this.predecessors = new Array();

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
	
	// names of the shader parts the animation needs
	required_parts : new Array(),
	
	// this animation will not start until all predecessors are finished
	// endless animations predecessors must be stopped manually!
	predecessors : new Array(),
	
	// this animation will try to start all animations in this array when it finishes
	// endless animations must be stopped manually!
	successors : new Array(),
	
	refresh: function(obj) {
		if(this.state == Animation.STATE_RUNNING) {
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
			} else {
				this.time_elapsed = new Date().getTime() - this.start_timestamp;

			}
			
			this._refreshValues(obj);
			this._passParameters(obj.shaderProgram);
		}
	},
	_refreshValues: function() {

	},
	_passParameters: function() {
		
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
			this.start_timestamp = new Date().getTime();
			this.state = Animation.STATE_RUNNING;
		}
	},
	start: function() {
		this.start_timestamp = new Date().getTime();
		this.state = Animation.STATE_RUNNING;
	},
	restart: function() {
		this.state = Animation.STATE_RUNNING;
		this.start_timestamp = new Date().getTime();
		this._repetitionsCount = 0;
	},
	pause: function() {
		this.pause_timestamp = new Date().getTime();
		this.state = Animation.STATE_PAUSED;
	},
	resume: function() {
		this.start_timestamp = new Date().getTime() - this.time_elapsed;
		this.state = Animation.STATE_PAUSED;
	},
	stop: function() {
		this._finish();
	},
	_finish: function() {
		this.time_elapsed = this.duration;
		this.state = Animation.STATE_FINISHED;
		this._startSuccessors();
	},
	_startSuccessors: function() {
		for(var i = 0; i < this.successors.length; i++) {
			this.successors[i].startAfterPredecessors();
		}
	},
	_allPredecessorsFinished: function() {
		for(var i = 0; i < this.predecessors.length; i++) {
			if(this.predecessors[i].state != Animation.STATE_FINISHED) return false;
		}
		return true;
	}
}


RotationAnimation = function(type) {
	Animation.call(this, type);
}
RotationAnimation.prototype= new Animation();

RotationAnimation.prototype.start_offset_x = 0;
RotationAnimation.prototype.start_offset_y = 0;
RotationAnimation.prototype.start_offset_z = 0;
RotationAnimation.prototype.end_offset_x = 0;
RotationAnimation.prototype.end_offset_y = 0;
RotationAnimation.prototype.end_offset_z = 0;
RotationAnimation.prototype.rotMatrix = null;

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
