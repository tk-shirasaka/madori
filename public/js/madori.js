function Madori (canvas, objEvent) {
    var version = '0.0.1';
    var stage = new createjs.Stage(canvas);
    var font = '15px sans-serif'
    var picsel = 150;
    var scale = 1;
    var floor = 1;
    var locate = {x: [], y: []};
    var memos = [];
    var setting = {
        madori: {unit: '1.82', width: null, height: null},
        units: {'1.70': '団地間', '1.76': '江戸間', '1.82': '中京間', '1.91': '京間'},
        types: [
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

    stage.mouseMoveOutside = true;
    stage.enableMouseOver(50);
    if (createjs.Touch.isSupported()) createjs.Touch.enable(stage);

    this.createObject = (type, property) => {
        var obj = new createjs[type]();

        if (typeof property === 'object') {
            Object.keys(property).forEach((key) => {
                obj[key] = property[key];
            });
        }

        return obj;
    };
    this.create = (x, y, width, height, type, floor, wall) => {
        if (!floor) floor = this.getFloor();

        var property = {scaleX: scale, scaleY: scale, x: x, y: y, width: width, height: height, size: width * height * 2, type: type, floor: floor, wall: wall};
        var text = (scale < 0.5) ? '' : property.size + '畳\n' + setting.types[type].name;
        var memo = stage.getChildByName('memo');
        var container = this.createObject('Container', property);
        container.addChild(this.createObject('Shape', {name: 'field'}));
        container.addChild(this.createObject('Shape', {name: 'top'}));
        container.addChild(this.createObject('Shape', {name: 'left'}));
        container.addChild(this.createObject('Shape', {name: 'right'}));
        container.addChild(this.createObject('Shape', {name: 'bottom'}));
        container.addChild(this.createObject('Text', {name: 'text', x: 10, y: 10, text: text, font: font}));

        stage.addChild(container);
        objEvent(container);

        if (memo) {
            stage.removeChild(memo);
            stage.addChild(memo);
        }
        this.draw(container);
    };
    this.draw = (container) => {
        var wall = this.checkFloor(container) ? 'Black' : 'rgba(0,0,0,0.5)'
        var color = this.checkFloor(container) ? setting.types[container.type].color : 'rgba(0,0,0,0.5)';
        var _drawLine = (type, a, b, c, d) => {
            container.getChildByName(type).graphics.clear().beginStroke((container.wall.indexOf(type) < 0) ? color : wall).setStrokeStyle(4).moveTo(a, b).lineTo(c, d).endStroke();
        };
        var _resetLine = (type) => {
            var memo = container.getChildByName(type);
            container.removeChild(memo);
            container.addChild(memo);
        };
        if (container.right && container.bottom) this.clearLocate(container)
        container.right = container.width * picsel;
        container.bottom = container.height * picsel;

        _drawLine('top', -2, 0, container.right + 2, 0);
        _drawLine('left', 0, -2, 0, container.bottom + 2);
        _drawLine('right', container.right, -2, container.right, container.bottom + 2);
        _drawLine('bottom', -2, container.bottom, container.right + 2, container.bottom);
        container.wall.forEach(_resetLine);
        container.getChildByName('field').graphics.clear().beginFill(color).drawRect(0, 0, container.right, container.bottom).endFill();
        this.setLocate(container);
        stage.update();
    };
    this.memoMode = () => {
        var ptrA, ptrB, ptrC;

        if (!stage.getChildByName('memo')) stage.addChild(this.createObject('Container', {name: 'memo', scaleX: scale, scaleY: scale}));
        stage.on('stagemousedown', () => {
            var memo = this.createObject('Shape', {name: floor});
            ptrA = ptrB = {x: stage.mouseX / scale - stage.x, y: stage.mouseY / scale - stage.y};
            stage.on('stagemousemove', () => {
                ptrC = {x: ptrA.x + stage.mouseX / scale - stage.x >> 1, y: ptrA.y + stage.mouseY / scale - stage.y >> 1};
                memo.graphics.setStrokeStyle(2, 'round', 'round').beginStroke('Black').moveTo(ptrC.x, ptrC.y).curveTo(ptrA.x, ptrA.y, ptrB.x, ptrB.y);
                ptrA = {x: stage.mouseX / scale - stage.x, y: stage.mouseY / scale - stage.y};
                ptrB = ptrC;
                stage.update();
            });
            stage.getChildByName('memo').addChildAt(memo, 0);
            memos = [];
        });
        stage.on('stagemouseup', () => {
            stage.removeAllEventListeners('stagemousemove');
        });
    };
    this.madoriMode = () => {
        memos = [];
        stage.removeAllEventListeners('stagemousedown');
        stage.removeAllEventListeners('stagemouseup');
    };
    this.memoErase = () => {
        stage.getChildByName('memo').removeAllChildren();
        stage.update();
    };
    this.undo = () => {
        var memo = stage.getChildByName('memo').getChildByName(floor);
        if (memo) {
            memos.push(memo);
            stage.getChildByName('memo').removeChild(memo);
            stage.update();
        }
        return memo;
    };
    this.redo = () => {
        if (memos.length) {
            stage.getChildByName('memo').addChildAt(memos.pop(), 0);
            stage.update();
        }
    };
    this.update = () => {
        stage.update();
    };
    this.remove = (container) => {
        this.clearLocate(container);
        stage.removeChild(container);
        stage.update();
    };
    this.move = (container, drag) => {
        this.clearLocate(container);
        container.x = stage.mouseX - drag.x;
        container.y = stage.mouseY - drag.y;

        locate.x.find(function(pos) {
            if (Math.abs(pos - container.x) < 10) container.x = pos;
            else if (Math.abs(pos - container.x - container.right * scale) < 10) container.x = pos - container.right * scale;
            else return false;
            return true;
        }, this);
        locate.y.find(function(pos) {
            if (Math.abs(pos - container.y) < 10) container.y = pos;
            else if (Math.abs(pos - container.y - container.bottom * scale) < 10) container.y = pos - container.bottom * scale;
            else return false;
            return true;
        }, this);
        this.setLocate(container);
        stage.update();
    };
    this.resize = (container, diff) => {
        var offset = 0.25 * picsel * scale;

        if (Math.abs(diff) > offset) {
            if (container.width < container.height && (diff > 0 || container.width > 0.25)) {
                this.clearLocate(container);
                container.x += container.width * picsel * scale / 2;
                container.y += container.height * picsel * scale / 2;
                container.width += 0.25 * (diff > 0 ? 1 : -1);
                container.width = (diff > 0 ? Math.floor(container.width / 0.25) : Math.floor(container.width / 0.25)) * 0.25;
                container.height = this.getLength(container.size, container.width);
                container.x -= container.width * picsel * scale / 2;
                container.y -= container.height * picsel * scale / 2;
            } else if (container.width >= container.height && (diff < 0 || container.height > 0.25)) {
                this.clearLocate(container);
                container.x += container.width * picsel * scale / 2;
                container.y += container.height * picsel * scale / 2;
                container.height += 0.25 * (diff > 0 ? -1 : 1);
                container.height = (diff > 0 ? Math.floor(container.height / 0.25) : Math.floor(container.height / 0.25)) * 0.25;
                container.width = this.getLength(container.size, container.height);
                container.x -= container.width * picsel * scale / 2;
                container.y -= container.height * picsel * scale / 2;
            } else
                return;
            container.right = container.bottom = null;
            this.draw(container);
        }
    };
    this.pinch = (container, drag) => {
        var diffx = Math.abs(stage.mouseX - drag.x - container.x);
        var diffy = Math.abs(stage.mouseY - drag.y - container.y);

        if (diffx > diffy) this.resize(container, stage.mouseX - drag.x - container.x);
        if (diffx < diffy) this.resize(container, stage.mouseY - drag.y - container.y);
        if (diffx != diffy && Math.max(diffx, diffy) > 0.25 * picsel * scale) {
            drag.x = stage.mouseX - container.x;
            drag.y = stage.mouseY - container.y;
        }
    };
    this.setSetting = (value) => {
        var json = this.getJson();
        setting = value;
        stage.x = stage.y = 0;

        this.setJson(json);
    };
    this.setScale = (value) => {
        var json = this.getJson();
        scale = value / 100;
        stage.x = stage.y = 0;

        this.setJson(json);
    };
    this.setFloor = (value) => {
        var json = this.getJson();

        this.forEachMemo((memo) => { memo.graphics.store(); });
        floor = value;
        this.forEachMemo((memo) => { memo.graphics.unstore(); });
        stage.x = stage.y = 0;

        this.setJson(json);
    };
    this.setLocate = (container) => {
        locate.x.push(container.x);
        locate.y.push(container.y);
        locate.x.push(container.x + container.right * scale);
        locate.y.push(container.y + container.bottom * scale);
        this.changeLocale();
    };
    this.clearLocate = (container) => {
        locate.x.splice(locate.x.indexOf(container.x), 1);
        locate.y.splice(locate.y.indexOf(container.y), 1);
        locate.x.splice(locate.x.indexOf(container.x + container.right * scale), 1);
        locate.y.splice(locate.y.indexOf(container.y + container.bottom * scale), 1);
        this.changeLocale();
    };
    this.changeLocale = () => {
        var width, height;
        var locate = this.getLimitLocate();
        if (!(width = stage.getChildByName('width'))) {
            width = this.createObject('Container', {name: 'width'});
            width.addChild(this.createObject('Shape', {name: 'line'}));
            width.addChild(this.createObject('Text', {name: 'text', textBaseline: 'bottom', font: font}));
            stage.addChild(width);
        }
        if (!(height = stage.getChildByName('height'))) {
            height = this.createObject('Container', {name: 'height'});
            height.addChild(this.createObject('Shape', {name: 'line'}));
            height.addChild(this.createObject('Text', {name: 'text', textAlign: 'right', font: font}));
            stage.addChild(height);
        }
        width.x = locate.x.min;
        width.y = locate.y.min - 15;
        height.x = locate.x.min - 15;
        height.y = locate.y.min;
        width.getChildByName('text').text = this.getMeter(locate.x.max - locate.x.min) + 'mm';
        width.getChildByName('line').graphics.clear().beginStroke('#bdbdbd').setStrokeDash([5, 5]).setStrokeStyle(2).moveTo(0, 5).lineTo(locate.x.max - locate.x.min, 5).endStroke();
        height.getChildByName('text').text = this.getMeter(locate.y.max - locate.y.min) + 'mm';
        height.getChildByName('line').graphics.clear().beginStroke('#bdbdbd').setStrokeDash([5, 5]).setStrokeStyle(2).moveTo(5, 0).lineTo(5, locate.y.max - locate.y.min).endStroke();
    };
    this.checkFloor = (container) => {
        return (container.floor <= floor && floor <= container.floor + setting.types[container.type].rate)
    };
    this.setJson = (json) => {
        var memo = stage.getChildByName('memo');
        this.forEach((container) => { this.remove(container); });
        if (json.setting) setting = json.setting;
        for (var i = json.data.length - 1; i >= 0; i--) {
            if (!this.checkFloor(json.data[i])) this.create(json.data[i].x * scale, json.data[i].y * scale, json.data[i].width, json.data[i].height, json.data[i].type, json.data[i].floor, json.data[i].wall);
        }
        for (var i = json.data.length - 1; i >= 0; i--) {
            if (this.checkFloor(json.data[i])) this.create(json.data[i].x * scale, json.data[i].y * scale, json.data[i].width, json.data[i].height, json.data[i].type, json.data[i].floor, json.data[i].wall);
        }
        if (memo) memo.scaleX = memo.scaleY = scale;
        stage.update();
    };
    this.getMouse = (type) => {
        if (type === 'x') return stage.mouseX;
        if (type === 'y') return stage.mouseY;
    };
    this.getStagePtr = () => {
        return {x: stage.x, y: stage.y};
    };
    this.getJson = () => {
        var json = {version: version, setting: setting, data: []};
        var memo = stage.getChildByName('memo');
        this.forEach((container) => {
            json.data.push({x: container.x / scale + stage.x, y: container.y / scale + stage.y, width: container.width, height: container.height, type: container.type, floor: container.floor, wall: container.wall});
        });
        if (memo) {
            memo.x += stage.x;
            memo.y += stage.y;
        }
        return json;
    };
    this.getSetting = () => {
        return setting;
    };
    this.getScale = () => {
        return Math.round(scale * 100);
    };
    this.getFloor = () => {
        return floor;
    };
    this.getLimitLocate = () => {
        return {
            x: {min: Math.min(...locate.x), max: Math.max(...locate.x)},
            y: {min: Math.min(...locate.y), max: Math.max(...locate.y)}
        };
    };
    this.getTubo = () => {
        var rate, tubo = 0;

        this.forEach((container) => {
            rate = (setting.types[container.type].ignore) ? 0 : 1 + setting.types[container.type].rate
            tubo += container.size / 2 * setting.madori.unit * setting.madori.unit * rate;
        });
        return Math.round(tubo / 3.30579 * 100) / 100;
    };
    this.getLength = (size, length) => {
        return size / length / 2;
    };
    this.getMeter = (px) => {
        return Math.round(px / scale / picsel * setting.madori.unit * 1000);
    };
    this.forEach = (callback) => {
        for (var i = stage.children.length - 1; i >= 0; i--) {
            var child = stage.children[i];
            if (child.size) callback.call(this, child);
        }
    };
    this.forEachMemo = (callback) => {
        var memos = [];
        var memo;
        while (stage.getChildByName('memo') && (memo = stage.getChildByName('memo').getChildByName(floor))) {
            memos.push(memo);
            callback.call(this, memo);
            stage.getChildByName('memo').removeChild(memo);
        }
        memos.forEach((memo) => { stage.getChildByName('memo').addChildAt(memo, 0); });
    };
    this.shiftWindow = (x, y, max, shiftEnd) => {
        return setInterval(() => {
            var locate = this.getLimitLocate();
            if ((x > 0 && stage.x + locate.x.min > 100) ||
                (y > 0 && stage.y + locate.y.min > 50) ||
                (x < 0 && stage.x + locate.x.max + 10 < max.width) ||
                (y < 0 && stage.y + locate.y.max + 10 < max.height)) {
                shiftEnd();
            } else {
                stage.x += x;
                stage.y += y;
                stage.update();
            }
        }, 10);
    };
}
