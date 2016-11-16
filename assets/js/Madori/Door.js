(function () {
    function Door(line, type, start, end) {
        this.Shape_constructor();
        this.name   = 'door';
        this.set({line: line, type: type, start: start, end: end});
    }
    createjs.extend(Door, createjs.Shape);
    createjs.promote(Door, 'Shape');
    createjs.Door = Door;

    Door.prototype.redraw = function() {
        if (this.parent.wall.indexOf(this.line) === -1) return this.parent.removeChild(this);

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
