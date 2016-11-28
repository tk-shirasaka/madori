(function () {
    function Tubo() {
        this.Text_constructor();
        this.font   = '15px sans-serif';
        this.name   = 'tubo';
        this.suffix = '坪';
        this.text   = ' ';
        this.area   = 0;
    }
    createjs.extend(Tubo, createjs.Text);
    createjs.promote(Tubo, 'Text');
    createjs.Tubo = Tubo;

    Tubo.prototype.draw = function(ctx) {
        var tubo    = Math.round(this.area / 3.30579 / 100) / 100;
        var props   = {x: this.stage.x / -this.stage.scaleX, y: this.stage.y / -this.stage.scaleY, color: 'Black', text: tubo.toLocaleString() + this.suffix, area: 0};

        if (this.stage[this.name] && this.stage[this.name] < tubo) props.color = 'Red';
        this.set(props);
        createjs.Text.prototype.draw.call(this, ctx);
    };
}());
