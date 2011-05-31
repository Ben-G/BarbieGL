function Scene(){
    this.object3ds = new Array();
}

Scene.prototype = {
    addObject: function(newObject,gl) {
        var obj = JSON.parse(newObject);  
        this.object3ds[this.object3ds.length] = WebGLBase.CreateObject3DFromFile(obj,gl);  
        console.log(this.object3ds);  
    }   
}
