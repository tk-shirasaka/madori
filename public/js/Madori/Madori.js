(function () {
    'use strict'

    var _locate = {x: [], y: []};
    var _pixel  = 150;

    function Madori() {
        this.name   = 'madori';
        this.width  = 0;
        this.height = 0;
        this.Container_constructor();
        this.addChild(
            new createjs.Field(),
            new createjs.MadoriText(),
            new createjs.HorizontalLine('top'),
            new createjs.VerticalLine('left'),
            new createjs.VerticalLine('right'),
            new createjs.HorizontalLine('bottom')
        );

        this.getChildByName('text').set({x: 10, y: 10});
        this.setLocate();
    }
    createjs.extend(Madori, createjs.Container);
    createjs.promote(Madori, 'Container');
    createjs.Madori = Madori;

    Madori.prototype.setLocate = function() {
        _locate.x.push(this.x);
        _locate.x.push(this.x + this.width);
        _locate.y.push(this.y);
        _locate.y.push(this.y + this.height);
    };

    Madori.prototype.clearLocate = function() {
        _locate.x.splice(_locate.x.indexOf(this.x), 1);
        _locate.x.splice(_locate.x.indexOf(this.x + this.right * this.parent.scaleX), 1);
        _locate.y.splice(_locate.y.indexOf(this.y), 1);
        _locate.y.splice(_locate.y.indexOf(this.y + this.height * this.parent.scaleX), 1);
    };

    Madori.prototype.limitLocate = function() {
        return {
            x: {min: Math.min(..._locate.x), max: Math.max(..._locate.x)},
            y: {min: Math.min(..._locate.y), max: Math.max(..._locate.y)}
        };
    };

    Madori.prototype.nearLocate = function() {
        var result = {};

        _locate.x.find(function(pos) {
            if (Math.abs(pos - this.x) < 10) result.x = pos;
            else if (Math.abs(pos - (this.x + this.width) * this.parent.scaleX) < 10) result.x = pos - this.width * this.parent.scaleX;
            else return false;
            return true;
        }, this);
        _locate.y.find(function(pos) {
            if (Math.abs(pos - this.y) < 10) result.y = pos;
            else if (Math.abs(pos - (this.y - this.height) * this.parent.scaleX) < 10) result.y = pos - this.height * this.parent.scaleX;
            else return false;
            return true;
        }, this);

        return result;
    };

    Madori.prototype.redraw = function() {
        var wall = 'Black'
        var color = 'rgba(0,0,0,0.5)';

        this.getChildByName('text').text = (this.parent.scaleX < 0.5) ? '' : this.getSize() + '畳';
        this.getChildByName('field').redraw();
        this.getChildByName('top').redraw();
        this.getChildByName('left').redraw();
        this.getChildByName('right').redraw();
        this.getChildByName('bottom').redraw();
    };

    Madori.prototype.setMadoriProps = function(props) {
        this.clearLocate();
        this.set(props);

        this.getChildByName('right').x  = this.width;
        this.getChildByName('bottom').y = this.height;

        this.setLocate();
        this.redraw();
    };

    Madori.prototype.getSize = function() {
        return this.width / _pixel * this.height / _pixel * 2;
    };
}());
