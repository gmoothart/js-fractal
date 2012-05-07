
define(function(g) {
    "use strict";

    return {
        drawTo: drawTo,
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

    /*
     * Draw a portion of the Mandelbrot set to the 
     * imageData
     */
    function drawTo(imgData, world) {
        var w = world.width,
            h = world.height,
            pixelArr = imgData.data,
            x,y,r,i,
            originX, originY,
            iter,
            pos,
            maxIter = 100;

        // draw set
        for(x=0; x<w; x++) {
            r = mapPixelToComplexCoord(x, w, world.minR, world.maxR);

            for(y=0; y<h; y++) {

                // convert pixel x,y to coordinate on the complex plane
                i = mapPixelToComplexCoord(y, h, world.minI, world.maxI);
                
                // does the point diverge?
                iter = diverges(r,i, maxIter);

                // if it did not diverge after `maxIter` iterations,
                // it is in the set. Draw it!
                if (iter >= maxIter) {
                    pos = (y*w + x) * 4;
                    pixelArr[pos + 0] = 0; // R
                    pixelArr[pos + 1] = 0; // G
                    pixelArr[pos + 2] = 0; // B
                    pixelArr[pos + 3] = 255; // Alpha
                }
            }
        }
    }

    function diverges(cR, cI, maxIter)
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



});
