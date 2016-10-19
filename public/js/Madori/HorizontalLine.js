(function () {
    'use strict'

    function HorizontalLine(name) {
        this.Line_constructor(name);
        this.type       = 'width';
        this.y          = 1;
    }
    createjs.extend(HorizontalLine, createjs.Line);
    createjs.promote(HorizontalLine, 'Line');
    createjs.HorizontalLine = HorizontalLine;

    HorizontalLine.prototype.getWidth = function() {
        return this.width || this.parent.width;
    };
}());
