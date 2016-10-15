(function () {
    'use strict'

    function HorizontalLine(name) {
        this.Line_constructor(name);
        this.mouseover  = 'row-resize';
        this.y          = 2;
    }
    createjs.extend(HorizontalLine, createjs.Line);
    createjs.promote(HorizontalLine, 'Line');
    createjs.HorizontalLine = HorizontalLine;

    HorizontalLine.prototype.getWidth = function() {
        return this.width || this.parent.width;
    };
}());
