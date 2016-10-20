(function () {
    'use strict'

    function Door() {
        this.Shape_constructor();
        this.initEventListener();
        this.name   = 'door';
        this.hover  = false;
    }
    createjs.extend(Door, createjs.Shape);
    createjs.promote(Door, 'Shape');
    createjs.Door = Door;

    Door.prototype.initEventListener = function() {
        this.addEventListener('mouseover', () => {
            if (!this.parent.inDoorAction(this.line)) return;
            this.parent.hoverUp();
            this.hover                  = true;
            document.body.style.cursor  = 'pointer';
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inDoorAction(this.line)) return;
            if (this.hover) this.parent.hoverDown();
            this.hover                  = false;
            document.body.style.cursor  = '';
        });

        this.addEventListener('pressup', (e) => {
            if (!this.parent.inDoorAction(this.line)) return;
            if (this.hover) this.parent.hoverDown();
            var stage   = this.stage;
            this.parent.removeChild(this);
            this.removeAllEventListeners();
            e.stopPropagation();
            stage.update();
        });

    };

    Door.prototype.redraw = function() {
        this.end   -= Math.min(0, this.start);
        this.start  = Math.max(0, this.start + this.parent[this.type] - Math.max(this.parent[this.type], this.end));
        this.end    = Math.min(this.parent[this.type], this.end);

        var color   = 'rgba(0,0,0,0.5)';
        var door    = (this.end - this.start) / 4
        var props   = {x: 0, y: 0, width: 0, height: 0};

        props[this.type] = this.end - this.start;
        if (this.type === 'width') props.x = this.start;
        if (this.type === 'height') props.y = this.start;
        if (this.line === 'right') props.x = this.parent.width;
        if (this.line === 'bottom') props.y = this.parent.height;

        this.set(props);
        this.graphics.beginStroke(color).setStrokeStyle(8).moveTo(0, 0).lineTo(this.width, this.height).endStroke();
        this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(0, 0).lineTo(door, door).endStroke();
        if (this.type === 'width') this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(0, 0).lineTo(door, -door).endStroke();
        if (this.type === 'height') this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(0, 0).lineTo(-door, door).endStroke();
        this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(this.width, this.height).lineTo(this.width - door, this.height - door).endStroke();
        if (this.type === 'width') this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(this.width, this.height).lineTo(this.width - door, this.height + door).endStroke();
        if (this.type === 'height') this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(this.width, this.height).lineTo(this.width + door, this.height - door).endStroke();
    };
}());
