/**
 * base constructor function
 *
 * @param {string} canvasId
 * @param {object} userOptions
 * @public
 */
;var CANVIMATOR = (function(canvasId,userOptions) {

    
    /** PRIVATE FUNCTIONS AND VARIABLES BELOW **/
    
    // set up our variables...
    if (canvasId.indexOf('#') !== -1) {
        canvasId.replace('#','');
    }

    canvas = this.canvas = document.getElementById(canvasId);
    ctx = this.ctx = canvas.getContext('2d');
    
    // Some private vars
    var isDrawing = false;

    // Our canvas and context elements, respectively
    var canvas,ctx;
    
    // extend options
    var globalOptions = extend({
        timeout   : 30,         // how often the board gets redrawn,
        color     : '#000'
    },userOptions);

    // This object stores all our objects on the board
    var objects = {};
    
    function circle(x,y,r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
    }
    
    function rect(x,y,w,h) {
      ctx.beginPath();
      ctx.rect(x,y,w,h);
      ctx.closePath();
      ctx.fill();
    }

    var draw = function(objectName) {
        
        isDrawing = true;
        clear();
        for (obj in objects) {
            var obj = objects[obj];
            
            if (obj.color) {
                ctx.fillStyle = obj.color;
            }
            
            defaultObjects[obj.type](obj);
            
            ctx.fillStyle = globalOptions.color;
        }
        
        isDrawing = false;
        
    }

    var clear = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /**********************************************************
    * the following functions are all borrowed from the jQuery
    * 
    * extend, isFunction, isArray, and isPlainObject
    **********************************************************///*
    function extend() {
    	// copy reference to target object
    	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

    	// Handle a deep copy situation
    	if ( typeof target === "boolean" ) {
    		deep = target;
    		target = arguments[1] || {};
    		// skip the boolean and the target
    		i = 2;
    	}

    	// Handle case when target is a string or something (possible in deep copy)
    	if ( typeof target !== "object" && isFunction(target) ) {
    		target = {};
    	}

    	// extend jQuery itself if only one argument is passed
    	if ( length === i ) {
    		target = this;
    		--i;
    	}

    	for ( ; i < length; i++ ) {
    		// Only deal with non-null/undefined values
    		if ( (options = arguments[ i ]) != null ) {
    			// Extend the base object
    			for ( name in options ) {
    				src = target[ name ];
    				copy = options[ name ];

    				// Prevent never-ending loop
    				if ( target === copy ) {
    					continue;
    				}

    				// Recurse if we're merging object literal values or arrays
    				if ( deep && copy && ( isPlainObject(copy) || isArray(copy) ) ) {
    					var clone = src && ( isPlainObject(src) || isArray(src) ) ? src
    						: isArray(copy) ? [] : {};

    					// Never move original objects, clone them
    					target[ name ] = extend( deep, clone, copy );

    				// Don't bring in undefined values
    				} else if ( copy !== undefined ) {
    					target[ name ] = copy;
    				}
    			}
    		}
    	}

    	// Return the modified object
    	return target;
    };

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	function isFunction ( obj ) {
		return toString.call(obj) === "[object Function]";
	};

	function isArray( obj ) {
		return toString.call(obj) === "[object Array]";
	};

	function isPlainObject( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
			return false;
		}
		
		// Not own constructor property must be Object
		if ( obj.constructor
			&& !hasOwnProperty.call(obj, "constructor")
			&& !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
			return false;
		}
		
		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
	
		var key;
		for ( key in obj ) {}
		
		return key === undefined || hasOwnProperty.call( obj, key );
	};
	
	//** end jQuery robbery **//
	
	/************************************
	 END PRIVATE FUNCTIONS AND VARIABLES
	********************************///*/

    //** PUBLIC FUNCTIONS AND VARIABLES BEGIN **//

    var defaultObjects = this.defaultObjects = {
        
        circle : function(obj) {
            circle(obj.x,obj.y,obj.radius);
        },
        rect   : function(obj) {
            rect(obj.x,obj.y,obj.width,obj.height);
        },
        square : function(obj) {
            rect(obj.x,obj.y,obj.side,obj.side);
        }
        
    };
    
    /**
     * The base "addObject" function, returns all the cool functions
     * that lets you declare objects as JS variables and animate them and shit. Pretty cool.
     *
     * @param {object} options
     * @private
     */
    this.addObject = function(options) {
        var objectName = options.type + new Date().getTime() + Math.floor(Math.random()*111);
        objects[objectName] = options;
        
        /**
         * The public API for each object
         *
         * @public
         */
        return {
            
            /**
             * Super cool animations
             *
             * @param {object} endOptions
             * @param {integer} time
             * @param {function} callback
             */
            animate : function(endOptions,time,callback) {
                
                var time = time || 50;
                
                var changes    = {};
                
                for (opt in endOptions) {
                    if (endOptions[opt] !== objects[objectName][opt]) {
                        changes[opt] = {
                            end     : endOptions[opt],
                            begin   : objects[objectName][opt]
                        }
                    }
                }
                
                var times = Math.floor(time / globalOptions.timeout);
                
                var doit = function(timeout,time) {
                    
                    if (time > 0) {
                        
                        for (opt in changes) {
                            if (opt === 'color') {
                                // color blending goes here
                                objects[objectName][opt] = endOptions[opt];
                            } else {
                                var endVal   = changes[opt].end;
                                var startVal = changes[opt].begin;
                                var interval = (endVal - startVal) / times;
                                var curVal   = objects[objectName][opt];
                                objects[objectName][opt] = curVal + interval;
                            }
                        }    
                        
                        time = time - 1;
                        
                        scheduleDraw();
                        
                        setTimeout(function() {
                            doit(timeout,time);
                        },timeout);
                        
                    } else if (typeof callback === 'function') {
                        callback();
                    }
                    
                }
                
                doit(globalOptions.timeout,times);
                    
            },
            
            /**
             * Simply changes the element's options immediately
             * Will set a timeout if a "time" variable is passed
             *
             * @param {object} o
             * @param {int} time
             * @param {function} callback
             * @public
             */
            change : function(o,time,callback) {
                var time     = time || 0;
                setTimeout(function() {
                    extend(options,o);
                    scheduleDraw();
                    if (isFunction(callback)) {
                        callback();
                    }
                },time);
            }
            
        }
        
    }
    
    function scheduleDraw() {
        if (!isDrawing) {
            draw();
        }
    }
    
    this.draw  = draw;
    this.clear = clear;
    
})