(function () {
    'use strict'

    function VerticalLine(name) {
        this.Line_constructor(name);
        this.mouseover  = 'col-resize';
        this.x          = 2;
    }
    createjs.extend(VerticalLine, createjs.Line);
    createjs.promote(VerticalLine, 'Line');
    createjs.VerticalLine = VerticalLine;

    VerticalLine.prototype.getHeight = function() {
        return this.height || this.parent.height;
    };
}());
