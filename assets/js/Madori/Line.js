(function () {
    function Line(name) {
        this.Shape_constructor();
        this.initEventListener();
        this.name   = name;
        this.graphics.beginFill().drawRect(0, 0, 0, 0).endFill();
    }
    createjs.extend(Line, createjs.Shape);
    createjs.promote(Line, 'Shape');
    createjs.Line = Line;

    Line.prototype.initEventListener = function() {
        this.addEventListener('mouseover', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = (this.type === 'width') ? 'row-resize' : 'col-resize';
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = '';
        });

        this.addEventListener('pressmove', () => {
            if (!this.parent.actionable()) return;
            var action  = this.parent.inAction();
            var pointer = this.stage.getPointer();
            var diff    = (this.type === 'height') ? action.x - pointer.x : pointer.y - action.y;

            if (this.x > 1 || this.y > 1) diff *= -1;
            this.parent.transform(diff);
        });
    };

    Line.prototype.getHeight = function() {
        return 0;
    };

    Line.prototype.getWidth = function() {
        return 0;
    };

    Line.prototype.draw = function(ctx) {
        var color   = (this.parent.wall.indexOf(this.name) >= 0) ? 'Black' : this.stage.types[this.parent.type].color;
        var height  = this.getHeight();
        var width   = this.getWidth();

        if (!this.parent.onFloor()) color = 'rgba(0,0,0,0.5)';
        this.graphics.clear().beginStroke(color).setStrokeStyle(3).moveTo(0, 0).lineTo(width, height).endStroke();
        createjs.Shape.prototype.draw.call(this, ctx);
    };
}());
