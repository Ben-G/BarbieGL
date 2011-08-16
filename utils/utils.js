//Function providing inheritance capabilities to JS-Objects
function extend(subClass, superClass)
{
	var F = function() {};
	F.prototype = superClass.prototype;
	subClass.prototype = new F();
	subClass.prototype.constructor = subClass;
	
	subClass.superclass = superClass.prototype;
	if (superClass.prototype.constructor == Object.prototype.constructor){
		superClass.prototype.constructor = superClass;
	}
}

//Function providing inheritance capabilities to JS-Objects
function extend2(subClass, superClass)
{
	subClass.prototype = new superClass();
	subClass.superClass = superClass;
}


function deferredLoadFile(fileUrl){
    var d = new Deferrable();

        var req;
	    var fileContent;
	    // branch for native XMLHttpRequest object
	   	if (window.XMLHttpRequest) {
		    req = new XMLHttpRequest();
		    req.open("GET", fileUrl, true);
            req.overrideMimeType("application/json");
		    req.send(null);
            req.onreadystatechange=function() {
			if (req.readyState == 4) {
                var content = req.responseText;
                d.callback(content);
            }
            }            			
    	// branch for IE/Windows ActiveX version
    	    } else if (window.ActiveXObject) {
			req = new ActiveXObject("Microsoft.XMLHTTP");
			req.open("GET", fileUrl, false);
			req.onreadystatechange=function() {
			if (req.readyState == 4) {
                var content = req.responseText;
                d.callback(content);
			}
        }
        req.send(null);
  }

    return d;
}

function DeferrableList(){
    this.leftToComplete = 0;
}

DeferrableList.prototype = {
    addDeferrables: function(defArray) {
        this.leftToComplete = defArray.length;
        for (var i=0; i<defArray.length; i++){
            if (defArray[i].completed == true){
                this.leftToComplete--;
            }else{
                var closure = this;
                defArray[i].addCallback(function(){ closure.reportFinished();});
            }
        }  
        if (this.leftToComplete == 0)
            this.executeFinalCallback();                  
    },

    reportFinished: function(){
        this.leftToComplete--;
        if (this.leftToComplete == 0){  
            this.executeFinalCallback();
        }
    },

    executeFinalCallback: function(){
        this.finalCallbackFunc();          
    },

    finalCallback: function(func){
        if (this.leftToComplete != null)
            this.finalCallbackFunc = func; 
        else
            func();         
    }
        
}

function Deferrable(){
    this.callbacks = new Array();
    this.deferrables = new Array();
    this.completed = false;
    this.data;
    this.returnedValues = new Array();
}

function round(zahl,n_stelle){   
   zahl = Math.round(zahl * n_stelle) / n_stelle;
   
   return zahl;
}


Deferrable.prototype = {

    callback: function(data){
        
        if (this.completed == false){
        
            for (var i = 0; i < this.callbacks.length; i++){
                var callDef = this.callbacks[i](data);
                //if function returned a DeferredObject then attach the callbacks of the
                //Deferred object created in 'addCallback', else only execute the callback method
                //of the according Deferred Object
                if (callDef != null && callDef.callbacks != null){
                    var MyClosure = this;
                    //create copy of counter variable
                    var a = i;
                    callDef.addCallback(function(data){MyClosure.deferrables[a].callback(data); });
                }else{
                   this.deferrables[i].callback();
                }
            }

            this.completed = true;
            this.data = data;
        }else{
            console.log("Warning: tried to execute callback-functions twice");
        }
    },
    addCallback: function(callbackPassed){
        if (this.completed == false){
            this.callbacks[this.callbacks.length] = callbackPassed;
            this.deferrables[this.callbacks.length-1] = new Deferrable();
            return this.deferrables[this.callbacks.length-1];
        }
        //if deferrable completed allready, execute the callback directly
        else
        	callbackPassed(this.data)
            return this;
    }
}

/**
 * Looks for a main function and returns the code inside the { } of it
 * @param src the source to search in
 */
function parseMainFunction(src) {
		var src_main = null;
		var pos = src.search("void[\s ]+main\(.*\)[ \s\n]*{");
		if(pos >= 0) {
			var len = src.match("void[\s ]+main\(.*\)[ \s\n]*{")[0].length;
			var parse_pos = pos + len - 1;
			src_main = parseSourceBetweenParenthethis(src,parse_pos);
		}
		return src_main;
}

/**
 * returns the code of all functions contained in a given source
 * @param the source to parse
 */
function parseParameters(src) {
	var res = new Array();
	var found = true;
	var end = 0;
	var rest_start = 0;
	var c = 0;
	while(found == true) {
		found = false;
		rest_start += end;
		var rest = src.substr(rest_start);
		var pos = rest.search("(uniform|attribute|varying)[ \t\s]*.+[ \t\s]*.+[ \t\s]*(\\[[0-9]+\\])?[ \t\s]*;");
		if(pos != -1) {
			found = true;
			var para = rest.match("(uniform|attribute|varying)[ \t\s]*.+[ \t\s]*.+[ \t\s]*(\\[[0-9]+\\])?[ \t\s]*;");
			res.push(para[0]);
			end = pos + para[0].length+1;
		}
		c++;
	}
	res = res.concat(parseConsts(src));
	return res;
}

function parseConsts(src) {
	var res = new Array();
	var found = true;
	var end = 0;
	var rest_start = 0;
	var c = 0;
	while(found == true) {
		found = false;
		rest_start += end;
		var rest = src.substr(rest_start);
		var pos = rest.search("const[ \t\s]*.+[ \t\s]*.+;");
		if(pos != -1) {
			found = true;
			var para = rest.match("const[ \t\s]*.+[ \t\s]*.+;");
			res.push(para[0]);
			end = pos + para[0].length+1;
		}
		c++;
	}
	return res;
}


/**
function trim (zeichenkette) {
  // Erst führende, dann Abschließende Whitespaces entfernen
  // und das Ergebnis dieser Operationen zurückliefern
  return zeichenkette.replace (/^\s+/, '').replace (/\s+$/, '');
}

/**
 * returns the code of all functions contained in a given source
 * @param the source to parse
 */
function parseFunctions(src) {
	var res = new Array();
	var found = true;
	var end = 0;
	var rest_start = 0;
	var c = 0;
	while(found == true) {
		found = false;
		rest_start += end;
		var rest = src.substr(rest_start);
		//console.log(rest);
		var pos = rest.search(".{3,} .+\\(.*\\)[ \t\s\n]+{");
		if(pos >= 0) {
			found = true;
			var functs = rest.match(".{3,} .+\\(.*\\)[ \t\s\n]+{");
			var parse_pos = pos + functs[0].length - 1;
			end = findClosingParenthethis(rest, parse_pos);	
			var func_code = rest.substring(pos, end+1);
			if(func_code.search("void[\s ]+main\(.*\)[ \s\n]*{") < 0) {		
				res.push(rest.substring(pos, end+1));
			}
		}
		c++;
	}
	return res;
}

/**
 * finds the position of the closing parenthethis to a given opening parenthethis position
 */
function findClosingParenthethis(src, opening_position) {
	var parenthesis = 0;
		var end = -1;
		for(var i = opening_position; i < src.length; i++) {
			var char1 = src[i];
			
			if(char1 == "{") parenthesis++;
			else if(char1 == "}") parenthesis--;
			if(parenthesis == 0) {
				end = i;
				break;
			}
		}
		return end;
}

/**
 * Starting from a given index it returns the text between an opening and a closing parenthesis
 * if there are further opening/closing parenthesis pairs between them, they are part of the result
 *  
 * @param src the source parse
 */
function parseSourceBetweenParenthethis(src, start) {
		var end = findClosingParenthethis(src, start);
		if(end >= 0) {
			return src.substring(start+2, end);
		} else return null;
}


/**
 * returns an array with all unique arrays of the given ShaderPart-Array
 * compares by name
 * 
 * @param parts an array of ShaderPart objects
 */
function eraseDuplicates(parts) {
	var unique = new Array();
	for(var i = 0; i<parts.length; i++) {
		if(!isContained(parts[i], unique)) unique.push(parts[i]);
	}
	return unique;
}

/**
 * checks if a ShaderPart object is contained in an array
 */
function isContained(part,array) {
	for(var i = 0; i<array.length; i++) {
		if(array[i].name == part.name) return true;
	}
	return false;
}

function getLongestIdentifierPosition(parameters) {
	var max = 0;
	var pos = 0;
	for(var i = 0; i<parameters.length; i++) {
		if(parameters[i].identifier.length > max) pos = i;
	}
	return pos;
}

function getDoubleIdentifiers(parameters) {
	var doubles = new Array();
	if(parameters.length == 1) return doubles;
	
	for(var i=0; i<parameters.length; i++) {
		for(var j=i+1; j<parameters.length; j++) {
			if(parameters[i].identifier == parameters[j].identifier) {
				doubles.push(parameters[j]);
			}
		}
	}
	return doubles;
}


function factorial(number) {
	var sum = 1;
	for(var i = number; i>0; i--) {
		sum*=i;
	}
	return sum;
}

function zSort(object3D1, object3D2){
	/*if (object3D1.objectHierarchyId != null && object3D2.objectHierarchyId != null ){
		if (object3D1.layer > object3D2.layer && object3D1.objectHierarchyId == object3D2.objectHierarchyId)
			return 1;
			
		if (object3D1.layer < object3D2.layer && object3D1.objectHierarchyId == object3D2.objectHierarchyId)
			return -1;
	}
	
	/*if (object3D1.layer > object3D2.layer)
			return 1;
			
	if (object3D1.layer < object3D2.layer)
			return -1;
	*/
	
	if (object3D1.layer > object3D2.layer)
			return 1;
			
	if (object3D1.layer < object3D2.layer)
			return -1;
			
	if (object3D1.ownMinPoint.z > object3D2.ownMinPoint.z)
		return -1;
	if (object3D1.ownMinPoint.z < object3D2.ownMinPoint.z)
		return +1;
		

}
