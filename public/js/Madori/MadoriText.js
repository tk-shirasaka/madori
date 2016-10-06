(function () {
    'use strict'

    function MadoriText() {
        this.Text_constructor();
        this.name   = 'text';
        this.font   = '15px sans-serif';
    }
    createjs.extend(MadoriText, createjs.Text);
    createjs.promote(MadoriText, 'Text');
    createjs.MadoriText = MadoriText;
}());
