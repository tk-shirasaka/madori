(function () {
    'use strict'

    var _locate = {x: [], y: []};
    var _area   = 0;
    var _hover  = 0;
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
            if (this.actionable()) this.hoverUp();
        });

        this.addEventListener('mouseout', () => {
            if (this.actionable()) this.hoverDown();
        });

        this.addEventListener('mousedown', (e) => {
            if (!this.actionable()) return;
            if (!this.inAction()) {
                this.hoverUp();
                _action = this.stage.getPointer();
                _action.start = e.timeStamp;
            }
        });

        this.addEventListener('pressup', () => {
            if (!this.actionable()) return;
            this.hoverDown();
            _action = false;
            createjs.Ticker.removeEventListener('tick', _ticker);
            _ticker = false;
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

    Madori.prototype.inDoorAction = function(name) {
        return this.floor === this.stage.floor && this.stage.mode == 'door' && this.wall.indexOf(name) >= 0;
    };

    Madori.prototype.hoverUp = function() {
        _hover++;
    };

    Madori.prototype.hoverDown = function() {
        _hover--;
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
        if (this.floor !== this.stage.floor) this.stage.setChildIndex(this, 0);
        if (this.wall.indexOf('top') < 0) this.setChildIndex(this.getChildByName('top'), 2);
        if (this.wall.indexOf('left') < 0) this.setChildIndex(this.getChildByName('left'), 2);
        if (this.wall.indexOf('right') < 0) this.setChildIndex(this.getChildByName('right'), 2);
        if (this.wall.indexOf('bottom') < 0) this.setChildIndex(this.getChildByName('bottom'), 2);
        this.getChildByName('text').redraw();
        this.getChildByName('field').redraw();
        this.getChildByName('top').redraw();
        this.getChildByName('left').redraw();
        this.getChildByName('right').redraw();
        this.getChildByName('bottom').redraw();
        this.stage.getChildByName('width').redraw();
        this.stage.getChildByName('height').redraw();
        this.stage.getChildByName('tubo').redraw();
        this.stage.update();
    };

    Madori.prototype.setMadoriProps = function(props) {
        var orig    = {
            width:  this.width,
            height: this.height,
            type:   this.type,
        };
        this.clearLocate();
        this.set(props);

        _area += (this.type === undefined || this.stage.types[this.type].ignore === true) ? 0 : this.width * this.height * (this.stage.types[this.type].rate + 1);
        _area -= (orig.type === undefined || this.stage.types[orig.type].ignore === true) ? 0 : orig.width * orig.height * (this.stage.types[orig.type].rate + 1);
        this.getChildByName('right').x  = this.width - 1;
        this.getChildByName('bottom').y = this.height - 1;

        this.setLocate();
        this.redraw();
    };

    Madori.prototype.shiftWindow = function(vector) {
        var shift = {x: 0, y: 0};

        if (vector.x < 0 && this.x * this.stage.scaleX < -this.stage.x) shift.x = 3;
        if (vector.y < 0 && this.y * this.stage.scaleY < -this.stage.y) shift.y = 3;
        if (vector.x > 0 && (this.x + this.width) * this.stage.scaleX > (-this.stage.x + this.stage.canvas.width)) shift.x = -3;
        if (vector.y > 0 && (this.y + this.height) * this.stage.scaleY > (-this.stage.y + this.stage.canvas.height)) shift.y = -3;
        if (_ticker) createjs.Ticker.removeEventListener('tick', _ticker);
        if (shift.x || shift.y) {
            _ticker = createjs.Ticker.addEventListener('tick', () => {
                this.stage.set({x: this.stage.x + shift.x * this.stage.scaleX, y: this.stage.y + shift.y * this.stage.scaleY});
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

    Madori.prototype.addDoor = function(line, type, start, end) {
        var door    = new createjs.Door();

        this.addChild(door);
        door.set({line: line, type: type, start: start, end: end});
        door.redraw();
    };
}());
