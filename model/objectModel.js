function ObjectModel(){
    this.cache = new Object();
}

ObjectModel.prototype = {
      
    find: function(objectName){
            if (this.cache[objectName] == null){
                var d = deferredLoadFile("objects/"+objectName+".json");
                var closure = this;   
                d.addCallback(function(data){ closure._addToCache(objectName,data); });  
                return d;     
            }else{
                var d = new Deferrable();
                d.data = this.cache[objectName];
                d.completed = true;
                return d;
            }
    }, 
    _addToCache: function(objectName,objectString){
        this.cache[objectName] = objectString;
    }
}

ObjectModel = new ObjectModel();


