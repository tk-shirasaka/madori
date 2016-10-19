(function () {
    'use strict'

    function VerticalLine(name) {
        this.Line_constructor(name);
        this.type       = 'height';
        this.x          = 1;
    }
    createjs.extend(VerticalLine, createjs.Line);
    createjs.promote(VerticalLine, 'Line');
    createjs.VerticalLine = VerticalLine;

    VerticalLine.prototype.getHeight = function() {
        return this.height || this.parent.height;
    };
}());
