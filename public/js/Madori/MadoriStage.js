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
            {name: '洋室', color: '#bcaaa4', rate: 0},
            {name: '和室', color: '#8bc34a', rate: 0},
            {name: 'トイレ', color: '#bdbdbd', rate: 0},
            {name: 'お風呂', color: '#81d4fa', rate: 0},
            {name: '洗面所', color: '#009688', rate: 0},
            {name: '廊下', color: '#795548', rate: 0},
            {name: '階段', color: '#ffff8d', rate: 1},
            {name: '玄関', color: '#ce93d8', rate: 0},
            {name: 'その他', color: '#f44336', rate: 0},
        ]
    };

    function MadoriStage(canvas) {
        this.Stage_constructor(canvas);
        this.initEventListener();
        this.set(_defaults);
        this.mouseMoveOutside = true;
        this.enableMouseOver(50);
        if (createjs.Touch.isSupported()) createjs.Touch.enable(this);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
    }
    createjs.extend(MadoriStage, createjs.Stage);
    createjs.promote(MadoriStage, 'Stage');
    createjs.MadoriStage = MadoriStage;

    MadoriStage.prototype.initEventListener = function() {
        var action      = null;

        var madoriModeListener  = () => {
            var pointer = this.getPointer();
            this.x += (pointer.x - action.x) * this.scaleX;
            this.y += (pointer.y - action.y) * this.scaleY;
            action  = pointer;
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
            var madori  = this.getChildByName('madori');

            if (madori && madori.hovered()) return;
            switch (this.mode) {
            case 'madori':
                cursor  = 'move';
                action  = pointer;
                this.addEventListener('stagemousemove', madoriModeListener);
                break;
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
        for (var i = this.children.length - 1; i >= 0; i--) {
            if (this.children[i].name === name) callback.call(this, this.children[i]);
        }
    };

    MadoriStage.prototype.clearMadori = function() {
        this.loopByName('madori', (madori) => {
            madori.clearLocate();
            this.removeChild(madori);
        });
    };

    MadoriStage.prototype.getMadoriJson = function() {
        var result = {
            version: _version,
            setting: {
                unit: this.unit,
                width: this.width,
                height: this.height,
                units: this.units,
                types: this.types,
            },
            data: [],
        };

        this.loopByName('madori', (madori) => {
            result.data.unshift({
                x:      madori.x,
                y:      madori.y,
                width:  madori.width,
                height: madori.height,
                type:   madori.type,
                floor:  madori.floor,
                wall:   madori.wall,
            });
        });
        return JSON.stringify(result);
    };

    MadoriStage.prototype.setMadoriJson = function(json) {
        json = JSON.parse(json);

        this.removeAllChildren();
        this.set(json.setting);
        for (var i = 0; i < json.data.length; i++) {
            var madori = new createjs.Madori();
            this.addChild(madori);

            madori.setMadoriProps(json.data[i]);
        }
    };
}());
