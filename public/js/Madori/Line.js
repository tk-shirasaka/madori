(function () {
    'use strict'

    function Line(name) {
        this.Shape_constructor();
        this.initEventListener();
        this.name   = name;
    }
    createjs.extend(Line, createjs.Shape);
    createjs.promote(Line, 'Shape');
    createjs.Line = Line;

    Line.prototype.initEventListener = function() {
        this.addEventListener('mouseover', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = (this.type === 'width') ? 'row-resize' : 'col-resize';
            else if (this.parent.inDoorAction(this.name)) document.body.style.cursor = 'pointer';
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = '';
            else if (this.parent.inDoorAction(this.name)) document.body.style.cursor = '';
        });

        this.addEventListener('pressmove', () => {
            if (!this.parent.actionable()) return;
            var action  = this.parent.inAction();
            var pointer = this.stage.getPointer();
            var diff    = (this.type === 'height') ? action.x - pointer.x : pointer.y - action.y;

            if (this.x || this.y) diff *= -1;
            this.parent.transform(diff);
        });

        this.addEventListener('pressup', () => {
            if (!this.parent.inDoorAction(this.name)) return;
            var axis    = (this.type === 'width') ? 'x' : 'y';
            var pointer = this.stage.getPointer();
            var offset  = this.stage.unit / 4;
            var start   = pointer[axis] - this.parent[axis] - this.stage[axis];
            this.parent.addDoor(this.name, this.type, start - offset, start + offset);
        });
    };

    Line.prototype.getHeight = function() {
        return 0;
    };

    Line.prototype.getWidth = function() {
        return 0;
    };

    Line.prototype.redraw = function() {
        var color   = (this.parent.wall.indexOf(this.name) >= 0) ? 'Black' : this.stage.types[this.parent.type].color;
        var height  = this.getHeight();
        var width   = this.getWidth();

        if (!this.parent.onFloor()) color = 'rgba(0,0,0,0.5)';
        this.graphics.clear().beginStroke(color).setStrokeStyle(3).moveTo(0, 0).lineTo(width, height).endStroke();
    };
}());
