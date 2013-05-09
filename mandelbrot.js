
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
        xy_to_ri: xy_to_ri
    };

    function xy_to_ri(x, y, world) {
        var rstep = Math.abs(world.maxR - world.minR) / world.width,
            istep = Math.abs(world.maxI - world.minI) / world.height;

        return {
          r: (x * rstep) + world.minR,
          i: world.maxI - (y * istep)
        }
    }

    function ri_to_xy(r, i, world) {
        var xstep = Math.abs(world.maxR - world.minR) / world.width;
        var ystep = Math.abs(world.maxI - world.minI) / world.height;

        return {
          x: (r - world.minR) / step,
          y: (world.maxI - i) / step
        }
    }

    function mapComplexCoordToPixel(c, canvasWidth, minC, maxC) {
        var step = Math.abs(maxC - minC) / canvasWidth;
        return (c - minC) / step;
    }


    // computes a julia or mandelbrot set, based on divergeFn
    function compute(world, divergeFn, drawFn, colorFn) {
        var w = world.width,
            h = world.height,
            x,y,p,
            iter,
            pos,
            rgbArr,
            maxIter = 100;

        // draw set
        for(x=0; x<w; x++) {
            for(y=0; y<h; y++) {

                // convert pixel x,y to coordinate on the complex plane
                // could be slightly more efficient by computing r in the outer loop
                p = xy_to_ri(x, y, world)
                
                // number of iterations before divergence
                iter = divergeFn(p.r, p.i, maxIter);

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
            tmpI = 2*zR*zI;
            zR = tmpR + cR;
            zI = tmpI + cI;

            magnitude = Math.sqrt( zR*zR + zI*zI );

            if (magnitude > 2) break;
        }

        return i;
    }
})();
