(function () {
    'use strict'

    function HorizontalLine(name) {
        this.Line_constructor(name);
    }
    createjs.extend(HorizontalLine, createjs.Line);
    createjs.promote(HorizontalLine, 'Line');
    createjs.HorizontalLine = HorizontalLine;

    HorizontalLine.prototype.getX = function() {
        return -2;
    };

    HorizontalLine.prototype.getWidth = function() {
        return (this.width || this.parent.width) + 2;
    };
}());
