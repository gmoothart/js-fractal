(function() {
    "use strict";
    var overlay = $('#overlayCanvas'),
        overlayCtx = overlay[0].getContext('2d'),
        world = createWorld({
            width: overlay.width(),
            height: overlay.height(),
            minR: -2.5,
            maxR: 1.5,
            minI: -1.5,
            maxI: 1.5,
            maxIter: 100,
            computeFn: mandelbrot.compute,
            drawContext: $('#c')[0].getContext('2d'),
            colorFn: colors.selected,
        }),
        previewWorld = createWorld({
            width: 120,
            height: 90,
            minR: -2.5,
            maxR: 1.5,
            minI: -1.5,
            maxI: 1.5,
            maxIter: 50,
            computeFn: mandelbrot.computeJulia,
            drawContext: overlayCtx,
            colorFn: function() {
                return colors.invert(world.colorFn).apply(this, arguments);
            },
        }),
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

                // must initialize julia-set-specific point
                var startP = mandelbrot.xy_to_ri(ev.offsetX, ev.offsetY, world);
                previewWorld.startI = startP.i;
                previewWorld.startR = startP.r;

                previewWorld.draw();
            },
            'click.juliaOverlay': function(ev) {
                // switch to Julia set
                console.log("drawing julia set...");

                world.computeFn = mandelbrot.computeJulia;
                var startP = mandelbrot.xy_to_ri(ev.offsetX, ev.offsetY, world);
                world.startI = startP.i;
                world.startR = startP.r;

                world.draw();
            }
        }

    overlay.on(selectionEvents);
    $('#mandelZoom').on('click', function(ev) {
        world.update(rectXStart, rectYStart, rectXEnd, rectYEnd);

        world.draw();

        // clear selection box
        overlayCtx.clearRect(0,0,world.width,world.height);
    });

    $('#mandelSharpen').on('click', function(ev) {
        if (world.maxIter < 100) {
            world.maxIter = 100;
        }
        else {
            world.maxIter += 100;
        }
        world.draw();
    });

    $('#mandelBlur').on('click', function(ev) {
        if (world.maxIter <= 100) {
            world.maxIter -= Math.floor(world.maxIter / 2);
        }
        else {
          world.maxIter -= 100;
        }
        world.draw();
    });

    $('#mandelReset').on('click', function(ev) {
        world.reset();
        world.computeFn = mandelbrot.compute;
        world.draw();

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

    $('#invertColors').on('change', function(ev) {
      var invert = $(ev.currentTarget).is(':checked');
      drawColorPreviews(invert);
    });

    function createWorld(p) {

        var origMinR = p.minR,
            origMaxR = p.maxR,
            origMinI = p.minI,
            origMaxI = p.maxI;

        return {
            drawContext: p.drawContext,
            computeFn: p.computeFn,
            width: p.width,
            height: p.height,
            minR: p.minR,
            maxR: p.maxR,
            minI: p.minI,
            maxI: p.maxI,
            maxIter: p.maxIter,
            colorFn: p.colorFn,
            // only used for julia set
            startI: null,
            startR: null,

            draw: function() {
                var imgData = this.drawContext.createImageData(this.width, this.height),
                    x, y, result;

                result = this.computeFn(this);
                imgData.data.set(result);

                this.drawContext.putImageData(imgData, 0, 0);
            },
            update: function(newx1, newy1, newx2, newy2) {
                var p1 = mandelbrot.xy_to_ri(newx1, newy1, world),
                    p2 = mandelbrot.xy_to_ri(newx2, newy2, world)

                if (p1.r > p2.r) {
                    this.maxR = p1.r;
                    this.minR = p2.r;
                }
                else {
                    this.maxR = p2.r;
                    this.minR = p1.r;
                }

                if (p1.i > p2.i) {
                    this.minI = p2.i;
                    this.maxI = p1.i;
                }
                else {
                    this.minI = p1.i;
                    this.maxI = p2.i;
                }

                // crude method for sharpening image as we zoom in
                this.maxIter += 100;
            },

            reset: function() {
                this.minR = origMinR;
                this.maxR = origMaxR;
                this.minI = origMinI;
                this.maxI = origMaxI;

                this.maxIter = 100;
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

    function drawColorPreviews(invert) {
        var sidebar = $('#sidebar');

        // clean up if necessary
        $('#sidebar canvas').remove();

        $.each(colors.schemes, function(index, _scheme) {
            var c = $('<canvas class="scheme"></canvas>'),
                ctx = c[0].getContext('2d'),
                scheme = invert ? colors.invert(_scheme) : _scheme,
                // base these world objects on previewWorld
                w = Object.create(previewWorld);

            w.computeFn = mandelbrot.compute;
            w.drawContext = ctx;
            w.colorFn = scheme;

            ctx.canvas.width = w.width;
            ctx.canvas.height = w.height;

            c.on('click', function(ev) {
                // change current color scheme on click
                world.colorFn = scheme;
                world.draw();
            });

            w.draw();
            sidebar.append(c)
        });
    }


    // draw the full set
    world.draw();
    drawColorPreviews();
})();
