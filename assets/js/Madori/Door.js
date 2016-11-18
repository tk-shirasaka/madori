(function () {
    function Door(line, type, start, end) {
        this.Shape_constructor();
        this.name   = 'door';
        this.set({line: line, type: type, start: start, end: end});
        this.graphics.beginFill().drawRect(0, 0, 0, 0).endFill();
    }
    createjs.extend(Door, createjs.Shape);
    createjs.promote(Door, 'Shape');
    createjs.Door = Door;

    Door.prototype.draw = function(ctx) {
        if (this.parent.wall.indexOf(this.line) === -1) return this.parent.removeChild(this);

        this.end    = Math.min(this.parent[this.type], this.end);

        var color   = '#fff';
        var door    = Math.min(this.stage.unit / 2, this.end - this.start) / 4
        var props   = {x: 1, y: 1, width: 0, height: 0};

        props[this.type] = this.end - this.start;
        if (this.type === 'width') props.x = this.start;
        if (this.type === 'height') props.y = this.start;
        if (this.line === 'right') props.x = this.parent.width - 1;
        if (this.line === 'bottom') props.y = this.parent.height - 1;

        this.set(props);
        this.graphics.clear().beginStroke(color).setStrokeStyle(2).moveTo(0, 0);
        if (this.type === 'width') this.graphics.lineTo(this.width, 0).endStroke();
        if (this.type === 'height') this.graphics.lineTo(0, this.height).endStroke();
        createjs.Shape.prototype.draw.call(this, ctx);
    };
}());
