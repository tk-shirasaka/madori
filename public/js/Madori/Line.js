(function () {
    'use strict'

    function Line(name) {
        this.Shape_constructor();
        this.name   = name;
        this.color  = 'Black';
    }
    createjs.extend(Line, createjs.Shape);
    createjs.promote(Line, 'Shape');
    createjs.Line = Line;

    Line.prototype.getX = function() {
        return 0;
    };

    Line.prototype.getY = function() {
        return 0;
    };

    Line.prototype.getHeight = function() {
        return 0;
    };

    Line.prototype.getWidth = function() {
        return 0;
    };

    Line.prototype.redraw = function() {
        var color   = this.color;
        var x       = this.getX();
        var y       = this.getY();
        var height  = this.getHeight();
        var width   = this.getWidth();

        this.graphics.clear().beginStroke(color).setStrokeStyle(4).moveTo(x, y).lineTo(width, height).endStroke();
    };
}());
