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
        var move = () => {
            var action  = this.parent.inAction();
            var pointer = this.stage.getPointer();
            var x       = pointer.x - action.x + this.parent.x;
            var y       = pointer.y - action.y + this.parent.y;
            this.parent.setMadoriProps({x: x, y: y});

            var near    = this.parent.nearLocate();
            this.parent.setMadoriProps(near);
            this.parent.shiftWindow();

            action.x    = pointer.x + (near.x || x) - x;
            action.y    = pointer.y + (near.y || y) - y;
            action.type = 'move';
        };

        var resize = () => {
            var action  = this.parent.inAction();
            var pointer = this.stage.getPointer();
            var type    = (Math.abs(action.x - pointer.x) > Math.abs(action.y - pointer.y)) ? 'x' : 'y'
            var diff    = (type === 'x') ? action.x - pointer.x : pointer.y - action.y;

            if (!action.sign) {
                action.sign = 1;
                if (type === 'x' && this.parent.x + this.parent.width / 2 < action.x) action.sign = -1;
                if (type === 'y' && this.parent.y + this.parent.height / 2 < action.y) action.sign = -1;
            }
            this.parent.transform(diff * action.sign);
            action.type = 'resize';
        };

        this.addEventListener('mouseover', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = 'pointer';
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = '';
        });

        this.addEventListener('pressmove', (e) => {
            if (!this.parent.actionable()) return;
            var action  = this.parent.inAction();

            document.body.style.cursor = 'move';
            (action.type !== 'move' && action.start < e.timeStamp - 500) ? resize() : move();
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
