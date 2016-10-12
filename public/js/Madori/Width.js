(function () {
    'use strict'

    function Width() {
        this.Size_constructor();
        this.type   = 'x';
        this.name   = 'width';
    }
    createjs.extend(Width, createjs.Size);
    createjs.promote(Width, 'Size');
    createjs.Width = Width;
}());
