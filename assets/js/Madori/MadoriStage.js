(function () {
    var _version    = '0.0.2';
    var _defaults   = {
        floor:  1,
        unit:   182,
        width:  0,
        height: 0,
        tubo:   0,
        mode:   'madori',
        units:  {
            170: '団地間',
            176: '江戸間',
            182: '中京間',
            191: '京間'
        },
        materials: {
            flooring:   'フローリング',
            tatami:     '畳',
            tile:       'タイル',
        },
        types:  [
            {name: '洋室', color: '#bcaaa4', rate: 0, depth: 300, material: 'flooring', counter: 0},
            {name: '和室', color: '#8bc34a', rate: 0, depth: 300, material: 'tatami', counter: 0},
            {name: 'トイレ', color: '#bdbdbd', rate: 0, depth: 300, material: 'flooring', counter: 0},
            {name: 'お風呂', color: '#81d4fa', rate: 0, depth: 300, material: 'tile', counter: 0},
            {name: '洗面所', color: '#009688', rate: 0, depth: 300, material: 'flooring', counter: 0},
            {name: '廊下', color: '#795548', rate: 0, depth: 300, material: 'flooring', counter: 0},
            {name: '階段', color: '#ffff8d', rate: 1, depth: 300, material: 'flooring', counter: 0},
            {name: '玄関', color: '#ce93d8', rate: 0, depth: 300, material: 'flooring', counter: 0},
            {name: 'その他', color: '#f44336', rate: 0, depth: 300, material: 'flooring', counter: 0},
        ]
    };

    function MadoriStage(canvas) {
        this.Stage_constructor(canvas);
        this.initEventListener();
        this.set(_defaults);
        this.mouseMoveOutside = true;
        this.enableMouseOver(50);
        this.addChild(new createjs.Width(), new createjs.Height(), new createjs.Tubo());
        if (createjs.Touch.isSupported()) createjs.Touch.enable(this);
        createjs.Ticker.addEventListener('tick', this);
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
        this.addEventListener('stagemousedown', () => {
            var action  = this.getPointer();

            this.addEventListener('stagemousemove', () => {
                if (createjs.Madori.prototype.hovered()) return this.removeAllEventListeners('stagemousemove');

                var pointer = this.getPointer();
                this.x += (pointer.x - action.x) * this.scaleX;
                this.y += (pointer.y - action.y) * this.scaleY;
                action  = pointer;
                this.update();
            });
            document.body.style.cursor = 'move';
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
                x:          0,
                y:          0,
                unit:       this.unit,
                width:      this.width,
                height:     this.height,
                tubo:       this.tubo,
                units:      this.units,
                materials:  this.materials,
                types:      this.types,
            },
            data: [],
        };

        this.loopByName('madori', (madori) => {
            var door    = [];
            madori.children.forEach((child) => {
                if (child.name !== 'door') return;
                door.push({line: child.line, type: child.type, start: child.start, end: child.end});
            });
            result.data.unshift({
                x:      madori.x - limit.x.min + 100,
                y:      madori.y - limit.y.min + 100,
                width:  madori.width,
                height: madori.height,
                type:   madori.type,
                floor:  madori.floor,
                wall:   madori.wall,
                door:   door,
            });
        });
        return JSON.stringify(result);
    };

    MadoriStage.prototype.setMadoriJson = function(json, callback) {
        json = JSON.parse(json);

        this.getChildParentByName('madori').removeAllChildren();
        this.set(json.setting);
        for (var i = 0; i < json.data.length; i++) {
            var madori = new createjs.Madori();
            if (json.data[i].door !== undefined) {
                json.data[i].door.forEach((door) => (madori.addChild(new createjs.Door(door.line, door.type, door.start, door.end))));
            }
            this.addChild(madori);

            madori.set(json.data[i]);
            if (callback) callback(madori);
        }
    };

    MadoriStage.prototype.setFloor = function(floor) {
        this.floor  = floor;
        this.getChildParentByName('madori').sortChildren((a, b) => {
            if (a.floor === b.floor) return 0;
            if (a.floor === this.floor) return 1;
            if (b.floor === this.floor) return -1;
            return 0;
        });
        this.update();
    };
}());
