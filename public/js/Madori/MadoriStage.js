(function () {
    'use strict'

    var _version    = '0.0.2';
    var _defaults   = {
        floor:  1,
        unit:   182,
        width:  null,
        height: null,
        mode:   'madori',
        units:  {
            170: '団地間',
            176: '江戸間',
            182: '中京間',
            191: '京間'
        },
        types:  [
            {name: '洋室', color: '#bcaaa4', rate: 0, depth: 300},
            {name: '和室', color: '#8bc34a', rate: 0, depth: 300},
            {name: 'トイレ', color: '#bdbdbd', rate: 0, depth: 300},
            {name: 'お風呂', color: '#81d4fa', rate: 0, depth: 300},
            {name: '洗面所', color: '#009688', rate: 0, depth: 300},
            {name: '廊下', color: '#795548', rate: 0, depth: 300},
            {name: '階段', color: '#ffff8d', rate: 1, depth: 300},
            {name: '玄関', color: '#ce93d8', rate: 0, depth: 300},
            {name: 'その他', color: '#f44336', rate: 0, depth: 300},
        ]
    };

    function MadoriStage(canvas) {
        this.Stage_constructor(canvas);
        this.initEventListener();
        this.set(_defaults);
        this.mouseMoveOutside = true;
        this.enableMouseOver(50);
        this.addChildParent('madori');
        this.addChildParent('memo');
        this.addChild(new createjs.Width(), new createjs.Height(), new createjs.Tubo());
        if (createjs.Touch.isSupported()) createjs.Touch.enable(this);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
    }
    createjs.extend(MadoriStage, createjs.Stage);
    createjs.promote(MadoriStage, 'Stage');
    createjs.MadoriStage = MadoriStage;

    MadoriStage.prototype.addChildParent = function(name) {
        var parent  = new createjs.Container();
        parent.set({name: name});
        createjs.Stage.prototype.addChild.call(this, parent);

        return parent;
    };

    MadoriStage.prototype.getChildParentByName = function(name) {
        var parent = createjs.Stage.prototype.getChildByName.call(this, name);

        if (!parent) parent = this.addChildParent(name);
        return parent;
    };

    MadoriStage.prototype.addChild = function() {
        for (var i = 0; i < arguments.length; i++) {
            var name    = arguments[i].name;
            var parent  = this.getChildParentByName(name);

            if (!parent) parent = this.addChildParent(name);
            parent.addChild(arguments[i]);
        }
    };

    MadoriStage.prototype.addChildAt = function() {
        for (var i = 0; i < arguments.length; i += 2) {
            var name    = arguments[i].name;
            var parent  = this.getChildParentByName(name);

            if (!parent) parent = this.addChildParent(name);
            parent.addChildAt(arguments[i], arguments[i + 1]);
        }
    };

    MadoriStage.prototype.setChildIndex = function() {
        for (var i = 0; i < arguments.length; i += 2) {
            var name    = arguments[i].name;
            var parent  = this.getChildParentByName(name);

            if (!parent) parent = this.addChildParent(name);
            parent.setChildIndex(arguments[i], arguments[i + 1]);
        }
    };

    MadoriStage.prototype.removeChild = function() {
        for (var i = 0; i < arguments.length; i++) {
            var name    = arguments[i].name;
            var parent  = this.getChildParentByName(name);

            if (!parent) parent = this.addChildParent(name);
            parent.removeChild(arguments[i]);
        }
    };

    MadoriStage.prototype.getChildByName = function(name) {
        return this.getChildParentByName(name).getChildByName(name);
    };

    MadoriStage.prototype.initEventListener = function() {
        var action      = null;

        var defaultListener  = () => {
            if (createjs.Madori.prototype.hovered()) {
                this.removeAllEventListeners('stagemousemove');
                return;
            }
            var pointer = this.getPointer();
            this.x += (pointer.x - action.x) * this.scaleX;
            this.y += (pointer.y - action.y) * this.scaleY;
            action  = pointer;
            this.getChildByName('width').redraw();
            this.getChildByName('height').redraw();
            this.getChildByName('madori').redraw();
            this.update();
        };

        var memoModeListener    = () => {
            var pointer = this.getPointer();
            action.c    = {x: action.a.x + pointer.x - this.x >> 1, y: action.a.y + pointer.y - this.y >> 1};
            action.memo.graphics.setStrokeStyle(2, 'round', 'round').beginStroke('Black').moveTo(action.c.x, action.c.y).curveTo(action.a.x, action.a.y, action.b.x, action.b.y);
            action.a    = {x: pointer.x - this.x, y: pointer.y - this.y};
            action.b    = action.c;
            this.update();
        };

        this.addEventListener('stagemousedown', () => {
            var cursor  = null;
            var pointer = this.getPointer();

            if (createjs.Madori.prototype.hovered()) return;
            switch (this.mode) {
            case 'memo':
                cursor      = 'pointer';
                action      = {};
                action.memo = new createjs.Shape();
                action.a    = {x: pointer.x - this.x, y: pointer.y - this.y};
                action.b    = action.a
                action.memo.set({name: 'memo', floor: this.floor});
                this.addChildAt(action.memo, 0);
                this.addEventListener('stagemousemove', memoModeListener);
                break;
            default:
                cursor  = 'move';
                action  = pointer;
                this.addEventListener('stagemousemove', defaultListener);
                break;
            }
            document.body.style.cursor = cursor;
        });

        this.addEventListener('stagemouseup', () => {
            document.body.style.cursor = '';
            this.removeAllEventListeners('stagemousemove');
        });
    };

    MadoriStage.prototype.getPointer = function() {
        return {
            x: this.mouseX / this.scaleX,
            y: this.mouseY / this.scaleY,
        };
    };

    MadoriStage.prototype.loopByName = function(name, callback) {
        var parent      = this.getChildParentByName(name);
        var children    = [];
        for (var i = 0; i < parent.children.length; i++) {
            children.unshift(parent.children[i])
        }
        for (var i = 0; i < children.length; i++) {
            callback.call(this, children[i]);
        }
    };

    MadoriStage.prototype.clearMadori = function() {
        this.loopByName('madori', (madori) => {
            madori.clearLocate();
            this.removeChild(madori);
        });
    };

    MadoriStage.prototype.getMadoriJson = function() {
        var limit   = createjs.Madori.prototype.limitLocate();
        var result  = {
            version: _version,
            setting: {
                x:      0,
                y:      0,
                unit:   this.unit,
                width:  this.width,
                height: this.height,
                units:  this.units,
                types:  this.types,
            },
            data: [],
        };

        this.loopByName('madori', (madori) => {
            result.data.unshift({
                x:      madori.x - limit.x.min + 100,
                y:      madori.y - limit.y.min + 100,
                width:  madori.width,
                height: madori.height,
                type:   madori.type,
                floor:  madori.floor,
                wall:   madori.wall,
            });
        });
        return JSON.stringify(result);
    };

    MadoriStage.prototype.setMadoriJson = function(json, callback) {
        json = JSON.parse(json);

        this.getChildParentByName('madori').removeAllChildren();
        this.getChildParentByName('memo').removeAllChildren();
        this.set(json.setting);
        for (var i = 0; i < json.data.length; i++) {
            var madori = new createjs.Madori();
            this.addChild(madori);

            madori.setMadoriProps(json.data[i]);
            if (callback) callback(madori);
        }
    };
}());
