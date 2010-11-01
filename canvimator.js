/**
 * base constructor function
 *
 * @param {string} canvasId
 * @param {object} userOptions
 * @public
 */
;var CANVIMATOR = (function(canvasId,userOptions) {

    
    /** PRIVATE FUNCTIONS AND VARIABLES BELOW **/
    
    // You never know.
    if (canvasId.indexOf('#') !== -1) {
        canvasId.replace('#','');
    }

    // Our canvas and context elements, respectively
    var canvas = this.canvas = document.getElementById(canvasId);
    var ctx    = this.ctx    = canvas.getContext('2d');
    
    // Some private vars
    var isDrawing = false;
    
    // for trimming whitespace
    var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

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

    function draw(objectName) {
        
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
    
    function scheduleDraw() {
        if (!isDrawing) {
            draw();
        }
    }
    
    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /**********************************************************
    * the following functions are all borrowed from the jQuery
    * of possibly from jQuery functions... yes
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
    
    function trim( text ) {
        return (text || "").replace( rtrim, "" );
    }
    
    // We override the animation for all of these color styles
    function colorChange(obj){
        if ( !isArray(obj.startColor) ) {
            obj.startColor = getRGB( obj.startColor );
            obj.endColor   = getRGB( obj.endColor );
        }
        
        obj.color = "rgb(" + [
            Math.max(Math.min( parseInt((obj.pos * (obj.endColor[0] - obj.startColor[0])) + obj.startColor[0]), 255), 0),
            Math.max(Math.min( parseInt((obj.pos * (obj.endColor[1] - obj.startColor[1])) + obj.startColor[1]), 255), 0),
            Math.max(Math.min( parseInt((obj.pos * (obj.endColor[2] - obj.startColor[2])) + obj.startColor[2]), 255), 0)
        ].join(",") + ")";
    }

    /** BIG TODO - adjust private getRGB function to read & spit rgba **/

    // taken from jQuery ui
    function getRGB(color) {
        var result;
        
        // Check if we're already dealing with an array of colors
        if ( color && color.constructor == Array && color.length == 3 )
                return color;
        
        // Look for rgb(num,num,num)
        if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
                return [parseInt(result[1],10), parseInt(result[2],10), parseInt(result[3],10)];
        
        // Look for rgb(num%,num%,num%)
        if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
                return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];
        
        // Look for #a0b1c2
        if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
                return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];
        
        // Look for #fff
        if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
                return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];
        
        // Look for rgba(0, 0, 0, 0) == transparent in Safari 3
        if (result = /rgba\(0, 0, 0, 0\)/.exec(color))
                return colors['transparent'];
        
        // Otherwise, we're most likely dealing with a named color
        return colors[trim(color).toLowerCase()];
    }
    
    // Some named colors to work with
    // From Interface by Stefan Petre
    // http://interface.eyecon.ro/
    var colors = {
        aqua:[0,255,255],
        azure:[240,255,255],
        beige:[245,245,220],
        black:[0,0,0],
        blue:[0,0,255],
        brown:[165,42,42],
        cyan:[0,255,255],
        darkblue:[0,0,139],
        darkcyan:[0,139,139],
        darkgrey:[169,169,169],
        darkgreen:[0,100,0],
        darkkhaki:[189,183,107],
        darkmagenta:[139,0,139],
        darkolivegreen:[85,107,47],
        darkorange:[255,140,0],
        darkorchid:[153,50,204],
        darkred:[139,0,0],
        darksalmon:[233,150,122],
        darkviolet:[148,0,211],
        fuchsia:[255,0,255],
        gold:[255,215,0],
        green:[0,128,0],
        indigo:[75,0,130],
        khaki:[240,230,140],
        lightblue:[173,216,230],
        lightcyan:[224,255,255],
        lightgreen:[144,238,144],
        lightgrey:[211,211,211],
        lightpink:[255,182,193],
        lightyellow:[255,255,224],
        lime:[0,255,0],
        magenta:[255,0,255],
        maroon:[128,0,0],
        navy:[0,0,128],
        olive:[128,128,0],
        orange:[255,165,0],
        pink:[255,192,203],
        purple:[128,0,128],
        violet:[128,0,128],
        red:[255,0,0],
        silver:[192,192,192],
        white:[255,255,255],
        yellow:[255,255,0]
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
                
                var time = time || 500;
                
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
                
                function doit(timeout,time) {
                    
                    if (time > 0) {
                        
                        for (opt in changes) {
                            if (opt === 'color' && changes[opt]) {
                                // color blending goes here
                                /** BIG TODO - adjust private getRGB function to read & spit RGBa **/
                                var interval                   = 1 / times;
                                objects[objectName].endColor   = changes.color.end   || globalOptions.color;
                                objects[objectName].startColor = changes.color.begin || globalOptions.color;
                                objects[objectName].pos        = (times-time+1) * interval;
                                colorChange(objects[objectName]);
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
            },
            
            options : objects[objectName]
        }
        
    }

    // Attach a few more public functions...
    this.draw  = draw;
    this.clear = clear;
    
})