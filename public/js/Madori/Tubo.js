(function () {
    'use strict'

    function Tubo() {
        this.Size_constructor();
        this.name   = 'tubo';
        this.suffix = '坪';
    }
    createjs.extend(Tubo, createjs.Size);
    createjs.promote(Tubo, 'Size');
    createjs.Tubo = Tubo;

    Tubo.prototype.redraw = function() {
        var tubo    = Math.round(createjs.Madori.prototype.area() / 3.30579 / 100) / 100;
        var props   = {x: this.stage.x / -this.stage.scaleX, y: this.stage.y / -this.stage.scaleY, color: 'Black', text: tubo.toLocaleString() + this.suffix};

        this.set(props);
    };
}());
