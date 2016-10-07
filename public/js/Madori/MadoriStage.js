(function () {
    'use strict'

    var _version    = '0.0.1';
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
    }
    createjs.extend(MadoriStage, createjs.Stage);
    createjs.promote(MadoriStage, 'Stage');
    createjs.MadoriStage = MadoriStage;

    MadoriStage.prototype.initEventListener = function() {
        var action      = null;

        var madoriModeListener  = () => {
            this.x += this.mouseX - action.x;
            this.y += this.mouseY - action.y;
            action  = {x: this.mouseX, y: this.mouseY};
            this.update();
        };

        var memoModeListener    = () => {
            action.c    = {x: action.a.x + this.mouseX / this.scaleX - this.x >> 1, y: action.a.y + this.mouseY / this.scaleX - this.y >> 1};
            action.memo.graphics.setStrokeStyle(2, 'round', 'round').beginStroke('Black').moveTo(action.c.x, action.c.y).curveTo(action.a.x, action.a.y, action.b.x, action.b.y);
            action.a    = {x: this.mouseX / this.scaleX - this.x, y: this.mouseY / this.scaleX - this.y};
            action.b    = action.c;
            this.update();
        };

        this.addEventListener('stagemousedown', () => {
            var cursor  = null;
            var madori  = this.getChildByName('madori');

            if (madori && madori.hovered()) return;
            switch (this.mode) {
            case 'madori':
                cursor  = 'move';
                action  = {x: this.mouseX, y: this.mouseY};
                this.addEventListener('stagemousemove', madoriModeListener);
                break;
            case 'memo':
                cursor      = 'pointer';
                action      = {};
                action.memo = new createjs.Shape();
                action.a    = {x: this.mouseX / this.scaleX - this.x, y: this.mouseY / this.scaleX - this.y};
                action.b    = action.a
                this.addChild(action.memo);
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

    MadoriStage.prototype.clearMadori = function() {
        var result = [];
        var madori = null;

        while (madori = this.getChildByName('madori')) {
            result.unshift(madori);
            madori.clearLocate();
            this.removeChild(madori);
        }
        return result;
    };

    MadoriStage.prototype.getMadoriJson = function() {
        var madori = this.clearMadori();
        var result = [];

        for (var i = 0; i < madori.length; i++) {
            result.push({
                x:      madori[i].x,
                y:      madori[i].y,
                width:  madori[i].width,
                height: madori[i].height,
            });
        }
        return JSON.stringify(result);
    };

    MadoriStage.prototype.setMadoriJson = function(json) {
        json = JSON.parse();

        for (var i = 0; i < json.length; i++) {
            var madori = new createjs.Madori();

            madori.setMadoriProps(json);
        }
    };
}());
