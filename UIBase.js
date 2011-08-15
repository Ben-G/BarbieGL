function WebGLBase_UI(canvas,body){
	//this.focusedComponent;		
    this.canvas = canvas;
    this.body = body;
    this.canvas.onclick = this.onClick;
    this.canvas.onmouseup = this.onMouseUp;
    this.canvas.onmousedown = this.onMouseDown;
    this.body.onkeydown = this.onKeyDown;
    this.body.onkeypress = this.onKeyPress;
}


WebGLBase_UI.prototype = {
    onClick: function(){
    	var hitObject = hitTest(event.offsetX, event.offsetY, myRoot);
                                                if (hitObject.clicked != null){ 
                                                	hitObject.clicked();       
                                                }     
    },
    onMouseUp: function(){
    	var hitObject = hitTest(event.offsetX, event.offsetY, myRoot);
                                                if (hitObject.mouseUp != null){ 
                                                	hitObject.mouseUp();       
                                                }     
    },
    onMouseDown: function(){
   		var hitObject = hitTest(event.offsetX, event.offsetY, myRoot);
                                                if (hitObject.mouseDown != null){ 
                                                	hitObject.mouseDown();       
                                                }                                               
    },
    onKeyDown: function(){
    	WebGLBase.UIDelegate.focusedComponent.onKeyDown();
    },
    onKeyPress: function(){
		WebGLBase.UIDelegate.focusedComponent.onKeyPress();    	
    },
    reportFocus: function(focused){
    	
    	console.log(focused.name);
    	
    	if (this.focusedComponent != null)
    		this.focusedComponent.lostFocus();
    		
    	this.focusedComponent = focused;
    	this.focusedComponent.receivedFocus();
    }
}