(function () {
    'use strict'

    function Door(name) {
        this.Shape_constructor();
        this.initEventListener();
    }
    createjs.extend(Door, createjs.Shape);
    createjs.promote(Door, 'Shape');
    createjs.Door = Door;

    Door.prototype.initEventListener = function() {
        this.addEventListener('click', () => {
            this.parent.removeChild(this);
        });

    };

    Door.prototype.redraw = function() {
        var color   = 'Black';

        if (!this.parent.onFloor()) color = 'rgba(0,0,0,0.5)';
        this.graphics.clear().beginStroke(color).setStrokeStyle(30).moveTo(this.start, this.start).lineTo(this.start + 50, this.start + 50).endStroke();
    };
}());
