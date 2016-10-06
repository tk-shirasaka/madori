(function () {
    'use strict'

    function VerticalLine(name) {
        this.Line_constructor(name);
    }
    createjs.extend(VerticalLine, createjs.Line);
    createjs.promote(VerticalLine, 'Line');
    createjs.VerticalLine = VerticalLine;

    VerticalLine.prototype.getY = function() {
        return -2;
    };

    VerticalLine.prototype.getHeight = function() {
        return (this.height || this.parent.height) + 2;
    };
}());
