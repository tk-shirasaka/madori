(function () {
    'use strict'

    function MadoriText() {
        this.Text_constructor();
        this.name   = 'text';
        this.font   = '15px sans-serif';
        this.x      = 10;
        this.y      = 10;
    }
    createjs.extend(MadoriText, createjs.Text);
    createjs.promote(MadoriText, 'Text');
    createjs.MadoriText = MadoriText;

    MadoriText.prototype.redraw = function() {
        if (this.stage.scaleX < 0.5) {
            this.text   = '';
        } else {
            var size    = Math.round(this.parent.width / this.stage.unit * this.parent.height / this.stage.unit * 2 * 100) / 100;
            this.text   = size + '畳\n' + this.stage.types[this.parent.type].name;
        }
    };
}());
