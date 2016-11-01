(function () {
    function Door() {
        this.Shape_constructor();
        this.initEventListener();
        this.name   = 'door';
        this.stat   = {hover: false, move: false};
    }
    createjs.extend(Door, createjs.Shape);
    createjs.promote(Door, 'Shape');
    createjs.Door = Door;

    Door.prototype.initEventListener = function() {
        this.addEventListener('mouseover', () => {
            if (!this.parent.inDoorAction(this.line)) return;
            this.parent.hoverUp();
            this.stat.hover             = true;
            document.body.style.cursor  = 'pointer';
        });

        this.addEventListener('mouseout', () => {
            if (!this.parent.inDoorAction(this.line)) return;
            if (this.stat.hover) this.parent.hoverDown();
            this.stat.hover            = false;
            document.body.style.cursor = '';
        });

        this.addEventListener('pressmove', () => {
            if (!this.parent.inDoorAction(this.line)) return;
            var pointer     = this.stage.getPointer();
            var axis        = (this.type === 'width') ? 'x' : 'y';
            var point       = (this.stage[axis] + this.parent[axis] + this.start + (this.end - this.start) / 2 > pointer[axis]) ? 'start' : 'end';
            this[point]     = pointer[axis] - this.parent[axis] - this.stage[axis];
            this.stat.move  = true;

            this.redraw();
        });

        this.addEventListener('pressup', (e) => {
            if (!this.parent.inDoorAction(this.line)) return;
            if (this.stat.hover) this.parent.hoverDown();
            if (this.stat.move) {
                this.stat.hover = this.stat.move = false;
                return;
            }

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
        var door    = Math.min(this.stage.unit / 2, this.end - this.start) / 4
        var props   = {x: 0, y: 0, width: 0, height: 0};

        props[this.type] = this.end - this.start;
        if (this.type === 'width') props.x = this.start;
        if (this.type === 'height') props.y = this.start;
        if (this.line === 'right') props.x = this.parent.width;
        if (this.line === 'bottom') props.y = this.parent.height;

        this.set(props);
        this.graphics.clear();
        this.graphics.beginStroke(color).setStrokeStyle(8).moveTo(0, 0).lineTo(this.width, this.height).endStroke();
        this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(0, 0).lineTo(door, door).endStroke();
        if (this.type === 'width') this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(0, 0).lineTo(door, -door).endStroke();
        if (this.type === 'height') this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(0, 0).lineTo(-door, door).endStroke();
        this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(this.width, this.height).lineTo(this.width - door, this.height - door).endStroke();
        if (this.type === 'width') this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(this.width, this.height).lineTo(this.width - door, this.height + door).endStroke();
        if (this.type === 'height') this.graphics.beginStroke(color).setStrokeStyle(4).moveTo(this.width, this.height).lineTo(this.width + door, this.height - door).endStroke();
        this.stage.update();
    };
}());
