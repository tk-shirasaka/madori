(function () {
    var _locate = {x: [], y: []};
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
            this.clearLocate();
        });
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
            x: {min: _locate.x.length ? Math.min(..._locate.x) : 0, max: _locate.x.length ? Math.max(..._locate.x) : 0},
            y: {min: _locate.y.length ? Math.min(..._locate.y) : 0, max: _locate.y.length ? Math.max(..._locate.y) : 0}
        };
    };

    Madori.prototype.nearLocate = function() {
        var result = {};

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

        return result;
    };

    Madori.prototype.draw = function(ctx) {
        var type    = this.stage.types[this.type];
        ['top', 'left', 'right', 'bottom'].forEach((key) => {
            if (this.wall.indexOf(key) >= 0) return;
            this.setChildIndex(this.getChildByName(key), 2);
        });
        this.stage.getChildByName('tubo').area += (type.ignore === true) ? 0 : this.width * this.height * (type.rate + 1);
        createjs.Container.prototype.draw.call(this, ctx);
    };

    Madori.prototype.set = function(props) {
        this.clearLocate();
        createjs.Container.prototype.set.call(this, props);

        this.getChildByName('right').x  = this.width - 1;
        this.getChildByName('bottom').y = this.height - 1;

        this.setLocate();
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
                this.set({x: this.x - shift.x, y: this.y - shift.y});
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
            this.set({x: x, y: y, width: width, height: height});
        }
    };
}());
