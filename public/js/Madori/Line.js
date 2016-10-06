(function () {
    'use strict'

    function Line(name) {
        this.Shape_constructor();
        this.initEventListener();
        this.name   = name;
        this.color  = 'Black';
    }
    createjs.extend(Line, createjs.Shape);
    createjs.promote(Line, 'Shape');
    createjs.Line = Line;

    Line.prototype.initEventListener = function() {
        this.addEventListener('mouseover', () => {
            if (!this.parent.inAction()) document.body.style.cursor = this.mouseover;
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inAction()) document.body.style.cursor = '';
        });

        this.addEventListener('pressmove', (e) => {
            var action  = this.parent.inAction();
            //var point   = (this.mouseover === 'col-resize') ? this.parent.x : this.parent.y * -1;
            var diff    = (this.mouseover === 'col-resize') ?  e.stageX - action.x : action.y - e.stageY;
            var base    = 150 * 0.25;
            var offset  = base * this.stage.scaleX;

            if (this.x || this.y) diff *= -1;

            if (Math.abs(diff) > offset) {
                var x       = this.parent.x + this.parent.width * this.stage.scaleX / 2;
                var y       = this.parent.y + this.parent.height * this.stage.scaleX / 2;
                var width   = this.parent.width;
                var height  = this.parent.height;
                var size    = width * height / 2;
                if (width < height) {
                    width  += base * (diff > 0 ? 1 : -1);
                    width   = Math.max(base, (diff > 0 ? Math.floor(width / base) : Math.floor(width / base)) * base);
                    height  = size / width / 2;
                } else if (width >= height) {
                    height += base * (diff > 0 ? -1 : 1);
                    height  = Math.max(base, (diff > 0 ? Math.floor(height / base) : Math.floor(height / base)) * base);
                    width   = size / height / 2;
                }
                x      -= width * this.stage.scaleX / 2;
                y      -= height * this.stage.scaleX / 2;
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
        var color   = this.color;
        var x       = this.getX();
        var y       = this.getY();
        var height  = this.getHeight();
        var width   = this.getWidth();

        this.graphics.clear().beginStroke(color).setStrokeStyle(4).moveTo(x, y).lineTo(width, height).endStroke();
    };
}());
