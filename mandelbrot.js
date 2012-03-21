
Mandelbrot = {};
(function() {
    "use strict";

    Mandelbrot.draw = function(canvasEl) {
        var w = canvasEl.width,
            h = canvasEl.height,
            minR = -2, maxR = 2,
            minI = -1.5, maxI = 1.5,
            x,y,r,i,
            iter,
            maxIter = 100,
            ctx = canvasEl.getContext('2d');

        for(x=0; x<w; x++) {
            r = mapPixelToComplexCoord(x, w, minR, maxR);

            for(y=0; y<h; y++) {

                // convert pixel x,y to coordinate on the complex plane
                i = mapPixelToComplexCoord(y, h, minI, maxI);
                
                // does the point diverge?
                iter = diverges(r,i, maxIter);

                // if it did not diverge after `maxIter` iterations,
                // it is in the set. Draw it!
                if (iter >= maxIter) {
                    ctx.fillRect(x,y,1,1);
                }
            }
        }
    }

    var diverges = function(cR, cI, maxIter)
    {
        var i, magnitude,
            zR=0, zI=0, 
            tmpR, tmpI,
            threshold=2;
        // start at 1 instead of 0 because we want i to be the actual number
        // of iterations
        for(i=1; i <= maxIter; i++) {
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

    var mapPixelToComplexCoord = function(p, canvasWidth, minR, maxR)
    {
        var step = Math.abs(maxR - minR) / canvasWidth;
        return p * step + minR
    }

})();
