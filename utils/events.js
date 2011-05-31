function EventManager(){
    this.events = new Object();
}

EventManager.prototype = {
    eventOccured: function(eventID, param){
        if (this.events[eventID] != null){
            for (var i = 0; i < this.events[eventID].length; i++){
                this.events[eventID][i](param);
            }
        }
    },
    register: function(eventID, methodToCall){
        if (this.events[eventID] == null){
            this.events[eventID] = new Array();                  
        }  
        this.events[eventID].push(methodToCall);     

        //returns the ID which is needed to identify and unregister the event
        return this.events[eventID].length-1;  
    },
    unregister: function(eventID, identifier){

        try{
             if (this.events[eventID].length > identifier)
                this.events[eventID].splice(identifier,1);   
             else
                throw "noSuchEventRegisteredException";
        }
        catch(e){
            console.warn(e);
            return;
        }
           
    }  
}

eventManager = new EventManager();
