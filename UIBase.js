function WebGLBase_UI(canvas,body,gl){
	//this.focusedComponent;		
    this.canvas = canvas;
    this.body = body;
    this.canvas.onclick = this.onClick;
    this.canvas.onmouseup = this.onMouseUp;
    this.body.onmouseup = this.onMouseUp;
    this.canvas.onmousedown = this.onMouseDown;
    this.canvas.onmousemove = this.onMouseMove;
    this.body.onkeydown = this.onKeyDown;
    this.body.onkeypress = this.onKeyPress;
    this.gl = gl;
}


WebGLBase_UI.prototype = {
	init: function(){
		var myDef = new Deferrable();
		var myDefs = new Array;
		var myMash;
		var def = new DeferrableList();
		var closure = this;
		var myShaders = new Array();
		
		myDefs.push(WebGLBase.shaderPartFactory.createFromName("fragshaderCursor_benji").addCallback(function(data){myShaders[1] = data; }));
		myDefs.push( AnimationMashFactory.createBlinkAnimation(Vector.create([0,0,0,-1]), 300).addCallback( 
    		function(data){
    			myMash = data;
    			myMash.connectSuccessor(myMash._animations[1], myMash._animations[0]);   		
    		}
    	));
    	
    	
    	def.finalCallback(function(){
	    	closure.cursorAnimationMash = myMash; 
	    	console.log("asds"+myMash); 
	    	var vertShader = ShaderBuilder.buildDefaultShader(Shader.TYPE_VERTEX_SHADER, closure.gl);
        	var fragShader = ShaderBuilder.buildShaderFromParts(new Array(myShaders[1]), Shader.TYPE_FRAGMENT_SHADER, closure.gl);
            closure.cursorShaderProgram = ShaderProgramBuilder.buildShaderProgram(vertShader, fragShader);
	
    		myDef.callback();
    	});
    	
    	def.addDeferrables(myDefs);    	    	
    	  
		return myDef;
	},
    onClick: function(){
    	this.hitObject = hitTest(event.offsetX, event.offsetY, myRoot);
                                                if (this.hitObject.clicked != null && this.hitObject.visible){ 
                                                	this.hitObject.clicked();    
                                                }     
    },
    onMouseUp: function(){
    	this.hitObject = hitTest(event.offsetX, event.offsetY, myRoot);
                                                if (this.hitObject.mouseUp != null && this.hitObject.visible){ 
                                                	this.hitObject.mouseUp();       
                                                }     
                                                if (this.hitObject != WebGLBase.UIDelegate.focusedComponent &&
                                                	WebGLBase.UIDelegate.focusedComponent != null){ 
                                                		if (WebGLBase.UIDelegate.focusedComponent.mouseUp != null)
                                                		WebGLBase.UIDelegate.focusedComponent.mouseUp();	
                                                	}
    	document.body.style.cursor = "default";                                        	
    },
    onMouseDown: function(){
   		this.hitObject = hitTest(event.offsetX, event.offsetY, myRoot);
                                                if (this.hitObject.mouseDown != null && this.hitObject.visible){ 
                                                	this.hitObject.mouseDown();       
                                                }        
        return false;                                                                               
    },
    onMouseMove: function(){
    	if (WebGLBase.UIDelegate.focusedComponent != null && WebGLBase.UIDelegate.focusedComponent.mouseMove != null){
    		WebGLBase.UIDelegate.focusedComponent.mouseMove();                     
    	}
    	if (this.hitObject != null && this.hitObject.mouseMove != null){
    		this.hitObject.mouseMove();                
    	}                                   
    },
    onKeyDown: function(){
    	WebGLBase.UIDelegate.focusedComponent.onKeyDown();
    },
    onKeyPress: function(){
		WebGLBase.UIDelegate.focusedComponent.onKeyPress();    	
    },
    reportFocus: function(focused){    	
    	if (this.focusedComponent != null){
    		if(this.focusedComponent.lostFocus != null)	
    			this.focusedComponent.lostFocus();
    	}
    		
    	this.focusedComponent = focused;
    	
    	if(this.focusedComponent.receivedFocus != null)
    	this.focusedComponent.receivedFocus();
    }
}