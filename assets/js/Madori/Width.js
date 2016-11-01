(function () {
    function Width() {
        this.Size_constructor();
        this.type   = 'x';
        this.name   = 'width';
        this.prefix = '横幅';
    }
    createjs.extend(Width, createjs.Size);
    createjs.promote(Width, 'Size');
    createjs.Width = Width;
}());
