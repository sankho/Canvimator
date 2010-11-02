# Canvimator

##Canvimator is a JS library to make animating objects in an HTML5 canvas tag a bit easier.

###Written by Sankho Mallik, sankho [dot] mallik [at] gmail [dot] com

##Usage

I'd check the examples folder, if I were you.

But here's the skinny. Let's say you have an HTML document with a Canvas tag with an ID of.... "canvas." Here's how you would add a circle, and then animate it's position and color, twice.

var canv = new CANVIMATOR('canvas');

var circle = canv.addObject({
    type    : 'circle',
    x       : 30,
    y       : 30,
    radius  : 10,
    color   : '#fff'
});

circle.animate({
    x       : 100,
    y       : 100,
    color   : 'rgb(232,33,33)'
},1500,function() {
    circle.animate({
        x    : 100,
        y    : 10,
        color: '#333'
    })
});

This is very much under development, so if you wanna use it, please refer to the comments in the code.

### Supported object types

The "type" parameter in addObject supports the following object types: circle, square, and rectangle.

#### Adding custom object types

Please see examples/addObject.html