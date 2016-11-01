(function () {
    function Height() {
        this.Size_constructor();
        this.type       = 'y';
        this.name       = 'height';
        this.prefix     = '縦幅';
        this.rotation   = 270;
    }
    createjs.extend(Height, createjs.Size);
    createjs.promote(Height, 'Size');
    createjs.Height = Height;
}());
