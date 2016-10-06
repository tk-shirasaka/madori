(function () {
    'use strict'

    function Field() {
        this.Shape_constructor();
        this.name   = 'field';
    }
    createjs.extend(Field, createjs.Shape);
    createjs.promote(Field, 'Shape');
    createjs.Field = Field;

    Field.prototype.redraw = function() {
        var color   = this.color;
        var width   = this.parent.width;
        var height  = this.parent.height;

        this.graphics.clear().beginFill(color).drawRect(0, 0, width, height).endFill();
    };
}());
