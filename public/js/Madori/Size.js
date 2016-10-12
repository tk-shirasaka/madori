(function () {
    'use strict'

    function Size() {
        this.Text_constructor();
        this.font   = '15px sans-serif';
    }
    createjs.extend(Size, createjs.Text);
    createjs.promote(Size, 'Text');
    createjs.Size = Size;

    Size.prototype.redraw = function() {
        var locate  = createjs.Madori.prototype.limitLocate();
        var type    = this.type
        var length  = Math.round((locate[type].max - locate[type].min) * 10);
        var props   = {x: this.stage.x * -1, y: this.stage.y * -1, color: 'Black', text: length.toLocaleString() + 'mm'};
        props[type] = (this.stage.canvas[this.name] - this.stage[type] * 2) / 2;

        if (this.stage[this.name] && this.stage[this.name] * 1000 < length) props.color = 'Red';
        this.set(props);
    };
}());
