
Mandelbrot = {};
(function() {
    "use strict";

    Mandelbrot.draw = function(canvasEl) {
        var w = canvasEl.width,
            h = canvasEl.height,
            x,y,
            ctx = canvasEl.getContext('2d');

        for(x=0; x<w; x++) {
            for(y=0; y<h; y++) {
                ctx.fillRect(x,y,1,1);
                

            }
        }
    }

})();
