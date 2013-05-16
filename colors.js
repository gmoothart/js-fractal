(function() {
    "use strict";

    // public signature
    window.colors = {
        grayscale: setColorGrayscale,
        invert: invertColors
    };

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

})();
