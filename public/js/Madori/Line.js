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
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = this.mouseover;
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inAction() && this.parent.actionable()) document.body.style.cursor = '';
        });

        this.addEventListener('pressmove', () => {
            if (!this.parent.actionable()) return;
            var action  = this.parent.inAction();
            var diff    = (this.mouseover === 'col-resize') ? action.x - this.stage.mouseX : this.stage.mouseY - action.y;
            var offset  = 150 * 0.25;

            if (this.x || this.y) diff *= -1;

            if (Math.abs(diff) > offset) {
                var width   = this.parent.width;
                var height  = this.parent.height;
                var size    = width * height;
                if (width < height) {
                    width  += offset * (diff > 0 ? 1 : -1);
                    width   = Math.max(offset, width);
                    height  = size / width;
                } else if (width >= height) {
                    height += offset * (diff > 0 ? -1 : 1);
                    height  = Math.max(offset, height);
                    width   = size / height;
                }
                var x       = this.parent.x + (this.parent.width - width) / 2;
                var y       = this.parent.y + (this.parent.height - height) / 2;
                action.x    = this.stage.mouseX;
                action.y    = this.stage.mouseY;
                this.parent.setMadoriProps({x: x, y: y, width: width, height: height});
            }
        });
    };

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
        var color   = 'Black' ;
        var x       = this.getX();
        var y       = this.getY();
        var height  = this.getHeight();
        var width   = this.getWidth();

        if (!this.parent.onFloor()) color = 'rgba(0,0,0,0.5)';
        this.graphics.clear().beginStroke(color).setStrokeStyle(4).moveTo(x, y).lineTo(width, height).endStroke();
    };
}());
