
define(function(g) {
    "use strict";

    return {
        draw: draw,
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

    function draw(canvasEl, minR, minI, maxR, maxI) {
        var w = canvasEl.width,
            h = canvasEl.height,
            x,y,r,i,
            originX, originY,
            iter,
            maxIter = 100,
            ctx = canvasEl.getContext('2d');

        ctx.clearRect(0,0,w,h);

        // draw axes
        // x-axis is the line from (minR,0) to (maxR,0) and
        // y-axis is the line from (minI,0) to (maxI,0)
        // We need to map that to pixel coordinates
        originX = mapComplexCoordToPixel(0, w, minR, maxR);
        originY = mapComplexCoordToPixel(0, h, minI, maxI);

        ctx.strokeStyle = '#6699ff';
        ctx.beginPath();
        ctx.moveTo(0,originY);
        ctx.lineTo(w,originY); // x-axis
        ctx.moveTo(originX,0);
        ctx.lineTo(originX,h); // y-axis
        ctx.stroke();

        ctx.strokeStyle = '#fff';
        // draw set
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
