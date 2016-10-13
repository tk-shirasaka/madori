(function () {
    'use strict'

    var _locate = {x: [], y: []};
    var _area   = 0;
    var _hover  = false;
    var _action = false;
    var _ticker = false;

    function Madori() {
        this.Container_constructor();
        this.initEventListener();
        this.addChild(
            new createjs.Field(),
            new createjs.MadoriText(),
            new createjs.HorizontalLine('top'),
            new createjs.VerticalLine('left'),
            new createjs.VerticalLine('right'),
            new createjs.HorizontalLine('bottom')
        );

        this.name   = 'madori';
        this.width  = 0;
        this.height = 0;
    }
    createjs.extend(Madori, createjs.Container);
    createjs.promote(Madori, 'Container');
    createjs.Madori = Madori;

    Madori.prototype.initEventListener = function() {
        this.addEventListener('added', () => {
            this.setLocate();
        });

        this.addEventListener('mouseover', () => {
            if (this.actionable()) _hover  = true;
        });

        this.addEventListener('mouseout', () => {
            if (this.actionable()) _hover  = false;
        });

        this.addEventListener('mousedown', (e) => {
            if (!this.inAction()) {
                _action = this.stage.getPointer();
                _action.start = e.timeStamp;
            }
        });

        this.addEventListener('pressup', () => {
            _action = false;
            document.body.style.cursor = '';
        });

        this.addEventListener('removed', () => {
            _area -= (this.width * this.height);
            this.clearLocate();
        });
    };

    Madori.prototype.area = function() {
        return _area;
    };

    Madori.prototype.hovered = function() {
        return _hover;
    };

    Madori.prototype.inAction = function() {
        return _action;
    };

    Madori.prototype.onFloor = function() {
        return this.floor === this.stage.floor;
    };

    Madori.prototype.actionable = function() {
        return this.floor === this.stage.floor && this.stage.mode == 'madori';
    };

    Madori.prototype.setLocate = function() {
        _locate.x.push(this.x);
        _locate.x.push(this.x + this.width);
        _locate.y.push(this.y);
        _locate.y.push(this.y + this.height);
    };

    Madori.prototype.clearLocate = function() {
        _locate.x.splice(_locate.x.indexOf(this.x), 1);
        _locate.x.splice(_locate.x.indexOf(this.x + this.width), 1);
        _locate.y.splice(_locate.y.indexOf(this.y), 1);
        _locate.y.splice(_locate.y.indexOf(this.y + this.height), 1);
    };

    Madori.prototype.limitLocate = function() {
        return {
            x: {min: Math.min(..._locate.x), max: Math.max(..._locate.x)},
            y: {min: Math.min(..._locate.y), max: Math.max(..._locate.y)}
        };
    };

    Madori.prototype.nearLocate = function() {
        var result = {};

        this.clearLocate();
        _locate.x.find(function(pos) {
            if (Math.abs(pos - this.x) < 5) result.x = pos;
            else if (Math.abs(pos - this.x - this.width) < 10) result.x = pos - this.width;
            else return false;
            return true;
        }, this);
        _locate.y.find(function(pos) {
            if (Math.abs(pos - this.y) < 5) result.y = pos;
            else if (Math.abs(pos - this.y - this.height) < 10) result.y = pos - this.height;
            else return false;
            return true;
        }, this);
        this.setLocate();

        return result;
    };

    Madori.prototype.redraw = function() {
        if (this.floor === this.stage.floor) this.stage.setChildIndex(this, this.stage.children.length - 1);
        if (this.wall.indexOf('top') < 0) this.setChildIndex(this.getChildByName('top'), 0);
        if (this.wall.indexOf('left') < 0) this.setChildIndex(this.getChildByName('left'), 0);
        if (this.wall.indexOf('right') < 0) this.setChildIndex(this.getChildByName('right'), 0);
        if (this.wall.indexOf('bottom') < 0) this.setChildIndex(this.getChildByName('bottom'), 0);
        this.getChildByName('text').redraw();
        this.getChildByName('field').redraw();
        this.getChildByName('top').redraw();
        this.getChildByName('left').redraw();
        this.getChildByName('right').redraw();
        this.getChildByName('bottom').redraw();
        this.stage.getChildByName('width').redraw();
        this.stage.getChildByName('height').redraw();
        this.stage.update();
    };

    Madori.prototype.setMadoriProps = function(props) {
        var width   = this.width;
        var height  = this.height;
        this.clearLocate();
        this.set(props);

        _area += (this.width * this.height) - (width * height);
        this.getChildByName('right').x  = this.width;
        this.getChildByName('bottom').y = this.height;

        this.setLocate();
        this.redraw();
    };

    Madori.prototype.shiftWindow = function() {
        var shift = {x: 0, y: 0};

        if (this.x < this.stage.x * -1) shift.x = 3;
        if (this.y < this.stage.y * -1) shift.y = 3;
        if (this.x + this.width > (this.stage.x * -1 + this.stage.canvas.width)) shift.x = -3;
        if (this.y + this.height > (this.stage.y * -1 + this.stage.canvas.height)) shift.y = -3;
        if (_ticker) {
            createjs.Ticker.removeEventListener('tick', _ticker);
            _ticker = false;
        }
        if (shift.x || shift.y) {
            _ticker = createjs.Ticker.addEventListener('tick', () => {
                this.stage.set({x: this.stage.x + shift.x, y: this.stage.y + shift.y});
                this.setMadoriProps({x: this.x - shift.x, y: this.y - shift.y});
            });
        }
    };

    Madori.prototype.transform = function(diff) {
        var action  = this.inAction();
        var pointer = this.stage.getPointer();
        var offset  = this.stage.unit * 0.25;

        if (Math.abs(diff) > offset) {
            var width   = this.width;
            var height  = this.height;
            var size    = width * height;
            if (width < height) {
                width  += offset * (diff > 0 ? 1 : -1);
                width   = Math.round(Math.max(offset, width) / offset) * offset;
                height  = size / width;
            } else if (width >= height) {
                height += offset * (diff > 0 ? -1 : 1);
                height  = Math.round(Math.max(offset, height) / offset) * offset;
                width   = size / height;
            }
            var x       = this.x + (this.width - width) / 2;
            var y       = this.y + (this.height - height) / 2;
            action.x    = pointer.x;
            action.y    = pointer.y;
            this.setMadoriProps({x: x, y: y, width: width, height: height});
        }
    };
}());
