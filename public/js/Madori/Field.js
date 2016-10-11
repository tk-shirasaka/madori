(function () {
    'use strict'

    function Field() {
        this.Shape_constructor();
        this.initEventListener();
        this.name   = 'field';
    }
    createjs.extend(Field, createjs.Shape);
    createjs.promote(Field, 'Shape');
    createjs.Field = Field;

    Field.prototype.initEventListener = function() {
        this.addEventListener('mouseover', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = 'pointer';
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = '';
        });

        this.addEventListener('pressmove', () => {
            if (!this.parent.actionable()) return;
            document.body.style.cursor = 'move';
            var action  = this.parent.inAction();
            var pointer = this.stage.getPointer();
            var x       = pointer.x - action.x + this.parent.x;
            var y       = pointer.y - action.y + this.parent.y;
            this.parent.setMadoriProps({x: x, y: y});

            var near    = this.parent.nearLocate();
            this.parent.setMadoriProps(near);

            action.x    = pointer.x + (near.x || x) - x;
            action.y    = pointer.y + (near.y || y) - y;
        });
    };

    Field.prototype.redraw = function() {
        var color   = this.color || this.stage.types[this.parent.type].color;
        var width   = this.parent.width;
        var height  = this.parent.height;

        if (!this.parent.onFloor()) color = 'rgba(0,0,0,0.5)';
        this.graphics.clear().beginFill(color).drawRect(0, 0, width, height).endFill();
    };
}());
