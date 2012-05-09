
(function(){
    "use strict";

    // public signature
    window.mandelbrot = {
        compute: function(world, drawFn, colorFn) { 
            compute(world, function(r,i,maxIter){ return diverges(r,i,0,0,maxIter); }, 
            drawFn, colorFn); 
        },
        // todo: can generate more accurately, cf. wikipedia
        computeJulia: function(world, startR, startI, drawFn, colorFn) { 
            compute(world, function(r,i,maxIter){ return diverges(startR,startI,r,i,maxIter); }, 
            drawFn, colorFn); 
        },
        mapPixelToComplexCoord: mapPixelToComplexCoord,
        mapComplexCoordToPixel: mapComplexCoordToPixel
    };

    function mapPixelToComplexCoord(p, canvasWidth, minC, maxC) {
        var step = Math.abs(maxC - minC) / canvasWidth;
        return p * step + minC
    }

    function mapComplexCoordToPixel(c, canvasWidth, minC, maxC) {
        var step = Math.abs(maxC - minC) / canvasWidth;
        return (c - minC) / step;
    }


    // computes a julia or mandelbrot set, based on divergeFn
    function compute(world, divergeFn, drawFn, colorFn) {
        var w = world.width,
            h = world.height,
            x,y,r,i,
            iter,
            pos,
            rgbArr,
            maxIter = 100;

        // draw set
        for(x=0; x<w; x++) {
            r = mapPixelToComplexCoord(x, w, world.minR, world.maxR);

            for(y=0; y<h; y++) {

                // convert pixel x,y to coordinate on the complex plane
                i = mapPixelToComplexCoord(y, h, world.minI, world.maxI);
                
                // number of iterations before divergence
                // Julia set starts out at 
                iter = divergeFn(r, i, maxIter);

                rgbArr = colorFn(iter, maxIter);
                drawFn(x, y, rgbArr);
            }
        }
    }

    // iterate over z = z^2 + c `maxIter` times
    // For the Julia set, z is a point in the plane
    // for the Mandelbrot set, z is 0
    function diverges(cR, cI, zR, zI, maxIter) {
        var i, magnitude,
            tmpR, tmpI,
            threshold=2;

        for(i=0; i < maxIter; i++) {
            // z = z^2 + c
            tmpR = zR*zR - zI*zI;
            tmpI = 2*zR*zI; // should be 2 * zR * zI ???
            zR = tmpR + cR;
            zI = tmpI + cI;

            magnitude = Math.sqrt( zR*zR + zI*zI );

            if (magnitude > 2) break;
        }

        return i;
    }
})();
