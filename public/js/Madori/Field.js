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
            if (!this.parent.inAction()) document.body.style.cursor = 'pointer';
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inAction()) document.body.style.cursor = '';
        });

        this.addEventListener('pressmove', (e) => {
            var action  = this.parent.inAction();
            var x       = e.stageX - action.x + this.parent.x;
            var y       = e.stageY - action.y + this.parent.y;

            action.x    = e.stageX;
            action.y    = e.stageY;
            this.parent.setMadoriProps({x: x, y: y});
        });
    };

    Field.prototype.redraw = function() {
        var color   = this.color;
        var width   = this.parent.width;
        var height  = this.parent.height;

        this.graphics.clear().beginFill(color).drawRect(0, 0, width, height).endFill();
    };
}());
