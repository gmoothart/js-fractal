(function() {
    "use strict";

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

    ];

    // public signature
    window.colors = {
        invert: invertColors,
        schemes: schemes,
        selected: schemes[0],
    };
})();
