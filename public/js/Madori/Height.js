(function () {
    'use strict'

    function Height() {
        this.Size_constructor();
        this.type       = 'y';
        this.name       = 'height';
        this.rotation   = 270;
    }
    createjs.extend(Height, createjs.Size);
    createjs.promote(Height, 'Size');
    createjs.Height = Height;
}());
