(function() {
    "use strict";

    function invertColors(colorFn) {
        return function(iter,maxIter,magnitude) {
            var c = colorFn(iter,maxIter,magnitude);

            return {
              r: 255 - c.r,
              b: 255 - c.b,
              g: 255 - c.g,
              a: c.a
            }
        };
    }

    var schemes = [
        // grayscale
        function(iter, maxIter) {
            // normalize to a 0..255 range
            var norm = Math.floor(255 * iter/maxIter);

            // simple, just scale smoothly from white to black
            return {
              r: norm,
              g: norm,
              b: norm,
              a: 255
            }
        },

        function(iter, maxIter) {
            var v = 1 - iter/maxIter;

            return {
              r: v*v * 255,
              g: (1-v) * 255,
              b: v * 255,
              a: 255,
            };
        },

        /*
         * inspired by http://preshing.com/20110926/high-resolution-mandelbrot-in-obfuscated-python/,
         * but for some reason it doesn't come out right
        function(iter, maxIter, magnitude) {
            var mag = Math.pow(magnitude, 1);
            var norm = (2 + iter - Math.pow(4*Math.abs(mag), -0.4))/maxIter;
            if (iter == maxIter) norm=0;

            if (norm >= 1) {
                console.log("ut oh");
            }

            return {
                r: norm*80 + Math.pow(norm, 9) *255-950 * Math.pow(norm,99),
                g: norm*70-880*Math.pow(norm,18)+701* Math.pow(norm,9),
                b: norm*Math.pow(255,(1-Math.pow(norm,45)*2)),
                a: 255,
            };

        }
        */

    ];

    // public signature
    window.colors = {
        invert: invertColors,
        schemes: schemes,
        selected: schemes[0],
    };
})();
