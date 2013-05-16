(function() {
    "use strict";
    var overlay = $('#overlayCanvas'),
        world = {
            width: overlay.width(),
            height: overlay.height(),
            minR: -2.5,
            maxR: 1.5,
            minI: -1.5,
            maxI: 1.5,
        },
        previewWorld = {
            width: 120,
            height: 90,
            minR: -2.5,
            maxR: 1.5,
            minI: -1.5,
            maxI: 1.5,
        },
        overlayCtx = overlay[0].getContext('2d'),
        isDragging = false,
        rectXStart, rectYStart,
        rectXEnd, rectYEnd,
        selectionEvents = {
            'mousedown.selection': function(ev) {
                isDragging = true;

                rectXStart = ev.offsetX;
                rectYStart = ev.offsetY;
            },
            'mouseup.selection mouseout.selection': function(ev) {
                isDragging = false;
            },
            'mousemove.selection': function(ev) {
                drawSelectionRect(ev.offsetX, ev.offsetY);
            }
        },
        juliaOverlayEvents = {
            'mousemove.juliaOverlay': function(ev) {
                drawJuliaPreview(ev.offsetX, ev.offsetY);
            },
            'click.juliaOverlay': function(ev) {
                // switch to Julia set
                Julia.draw(ev.offsetX, ev.offsetY);

            }
        }

    overlay.on(selectionEvents);
    $('#mandelZoom').on('click', function(ev) {

        var ctx,
            imgData;

        updateWorld(rectXStart, rectYStart, rectXEnd, rectYEnd);

        compute(world);

        // clear selection box
        overlayCtx.clearRect(0,0,world.width,world.height);
    });

    $('#mandelReset').on('click', function(ev) {
        var ctx,
            imgData;

        resetWorld();
        compute(world);

        // clear selection box
        overlayCtx.clearRect(0,0,world.width,world.height);
    });

    $('#mandelOverlay').on('change', function(ev) {
        //
        // Toggle between rectangle-selection zoom and julia ovelay mode
        //
        overlayCtx.clearRect(0,0,world.width,world.height);
        overlay.toggleClass('crosshair');

        if ($(ev.currentTarget).is(':checked')) {
            overlay.off('.selection');
            overlay.on(juliaOverlayEvents);
        }
        else {
            overlay.on(selectionEvents);
            overlay.off('.juliaOverlay');
        }
    });

    function updateWorld(newx1, newy1, newx2, newy2) {
        var p1 = mandelbrot.xy_to_ri(newx1, newy1, world),
            p2 = mandelbrot.xy_to_ri(newx2, newy2, world)

        if (p1.r > p2.r) {
            world.maxR = p1.r;
            world.minR = p2.r;
        }
        else {
            world.maxR = p2.r;
            world.minR = p1.r;
        }

        if (p1.i > p2.i) {
            world.minI = p2.i;
            world.maxI = p1.i;
        }
        else {
            world.minI = p1.i;
            world.maxI = p2.i;
        }
    }

    function resetWorld() {
        world.minR = -2.5;
        world.maxR = 1.5;
        world.minI = -1.5;
        world.maxI = 1.5;
    }

    function setColorGrayscale(iter, maxIter) {
        // normalize to a 0..255 range
        var norm = Math.floor(255 * iter/maxIter);

        // simple, just scale smoothly from white to black
        return {
          r: norm,
          g: norm,
          b: norm,
          a: 255
        }
    }

    function invertColors(colorFn) {
        return function(iter,maxIter) {
            var c = colorFn(iter,maxIter);

            return {
              r: 255 - c.r,
              b: 255 - c.b,
              g: 255 - c.g,
              a: c.a
            }
        };
    }

    function drawSelectionRect(offsetX, offsetY) {
        var startP,
            currP = mandelbrot.xy_to_ri(offsetX, offsetY, world)

        if (isDragging) {
            startP = mandelbrot.xy_to_ri(rectXStart, rectYStart, world);
            rectXEnd = offsetX;

            // constrain selection to canvas aspect ration
            if (offsetY > rectYStart) {
              rectYEnd = rectYStart + 3*(Math.abs(rectXStart - offsetX)) / 4;
            }
            else {
              rectYEnd = rectYStart - 3*(Math.abs(rectXStart - offsetX)) / 4;
            }

            overlayCtx.clearRect(0,0,world.width, world.height);
            overlayCtx.strokeStyle = '#6699ff';
            overlayCtx.beginPath();
            overlayCtx.moveTo(rectXStart, rectYStart);
            overlayCtx.lineTo(rectXStart, rectYEnd);
            overlayCtx.lineTo(rectXEnd, rectYEnd);
            overlayCtx.lineTo(rectXEnd, rectYStart);
            overlayCtx.lineTo(rectXStart, rectYStart);
            overlayCtx.stroke();

            // show selection region
            $('#coordspan').text('(' + startP.r + ', ' + startP.i + ') to (' + currP.r + ', ' + currP.i + ')');

        }
        else {
            // show current point
            $('#coordspan').text('(' + currP.r + ', ' + currP.i + ')');
        }
    }

    function drawJuliaPreview(offsetX, offsetY) {
        var ctx, imgData, result,
            startP = mandelbrot.xy_to_ri(offsetX, offsetY, world)


        console.info('draw overlay at (' + startP.r + ',' + startP.i + ')');

        imgData = overlayCtx.createImageData(previewWorld.width, previewWorld.height);
        result = mandelbrot.computeJulia(previewWorld, startP.r, startP.i, invertColors(setColorGrayscale));
        imgData.data.set(result);
        overlayCtx.putImageData(imgData, 0, 0);
    }

    function compute(w) {
        var ctx = $('#c')[0].getContext('2d'),
            imgData = ctx.createImageData(w.width, w.height),
            x, y, result;

        result = mandelbrot.compute(w, setColorGrayscale);
        imgData.data.set(result);

        ctx.putImageData(imgData, 0, 0);
    }


    // draw the full set
    compute(world);
})();
