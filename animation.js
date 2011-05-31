Animation = function(type) {
	
	if(type != null) {
		this.type = type;
	}

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
	_repetitionsCount : 0,
	
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
	
	refresh: function() {
		this.time_elapsed = new Date().getTime() - this.start_timestamp;
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
		this.state = Animation.STATE_PAUSED;
	},
	stop: function() {
		this.state = Animation.STATE_FINISHED;
	}
}