(function () {
    'use strict'

    var _locate = {x: [], y: []};
    var _area   = 0;
    var _hover  = false;
    var _action = false;

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
        this.setLocate();
    }
    createjs.extend(Madori, createjs.Container);
    createjs.promote(Madori, 'Container');
    createjs.Madori = Madori;

    Madori.prototype.initEventListener = function() {
        this.addEventListener('mouseover', () => {
            if (this.actionable()) _hover  = true;
        });

        this.addEventListener('mouseout', () => {
            if (this.actionable()) _hover  = false;
        });

        this.addEventListener('mousedown', () => {
            if (!this.inAction()) _action = {x: this.stage.mouseX, y: this.stage.mouseY};
        });

        this.addEventListener('pressup', () => {
            _action = false;
            document.body.style.cursor = '';
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
        _locate.x.splice(_locate.x.indexOf(this.x + this.right), 1);
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
        this.getChildByName('text').redraw();
        this.getChildByName('field').redraw();
        this.getChildByName('top').redraw();
        this.getChildByName('left').redraw();
        this.getChildByName('right').redraw();
        this.getChildByName('bottom').redraw();
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
}());
