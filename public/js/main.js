var madori = {
    version: '0.0.1',
    _default: 100,
    _scale: 1,
    _locate: {x: [], y: []},
    _units: {'1.70': '団地間', '1.76': '江戸間', '1.82': '中京間', '1.91': '京間'},
    _types: {
        1: {name: '洋室', color: '#bcaaa4'},
        2: {name: '和室', color: '#8bc34a'},
        3: {name: 'トイレ', color: '#bdbdbd'},
        4: {name: 'お風呂', color: '#81d4fa'},
        5: {name: '洗面所', color: '#009688'},
        6: {name: '廊下', color: '#795548'},
        7: {name: '階段', color: '#ffff8d'},
        8: {name: '玄関', color: '#ce93d8'},
        9: {name: 'その他', color: '#f44336'},
    },
    _drag: {x: 0, y: 0, isMove: false, lock: false},
    _stage: null,
    init: function() {
        this._stage = new createjs.Stage('madori');
        this._stage.mouseMoveOutside = true;
        this._stage.enableMouseOver(50);
        $('#madori').attr('width', $(document).width());
        $('#madori').attr('height', $(document).height() * 2);
        $('#add').on('click', this.add.bind(this));
        $('#import').on('change', this.importFile.bind(this));
        $('#export').on('click', this.exportFile.bind(this));
        $('#menu').sideNav();
        $('select').material_select();

        if (this._default > $(document).width() / 15) this._scale = $(document).width() / 15 / this._default;
        if (createjs.Touch.isSupported()) createjs.Touch.enable(this._stage);
    },
    update: function() {
        this._stage.update();
        this.setTubo();
    },
    remove: function(c) {
        this._clearLocate(c);
        this._stage.removeChild(c);
        this.update();
    },
    setTubo: function() {
        var tubo = 0;

        this.eachStage((c) => {
            tubo += c.size / 2 * c.unit * c.unit * (c.type == '7' ? 2 : 1);
        });
        $('#tubo').text(Math.round(tubo / 3.30579 * 100) / 100 + '坪');
    },
    getText: function(c) {
        var text = c.size
                 + '畳 (' + this._units[c.unit] + ')\n'
                 + this._types[c.type].name;

        if (this._scale < 0.5) text = '';
        var obj = new createjs.Text(text, '15px sans-serif');
        obj.x = obj.y = 10;
        return obj;
    },
    getLength(size, length) {
        return size / length / 2;
    },
    add: function() {
        this.change({x: 100, y: 100, size: 1, height: 1, width: 0.5, unit: '1.82', type: 1, _init: true});
    },
    eachStage: function(callback) {
        for (var i = this._stage.children.length - 1; i >= 0; i--) {
            var c = this._stage.children[i];
            if (c.size) callback.call(this, c);
        }
    },
    _setLocate(c) {
        this._locate.x.push(c.x);
        this._locate.y.push(c.y);
        this._locate.x.push(c.x + c.right * this._scale);
        this._locate.y.push(c.y + c.bottom * this._scale);
        this._changeLocale();
    },
    _clearLocate(c) {
        this._locate.x.splice(this._locate.x.indexOf(c.x), 1);
        this._locate.y.splice(this._locate.y.indexOf(c.y), 1);
        this._locate.x.splice(this._locate.x.indexOf(c.x + c.right * this._scale), 1);
        this._locate.y.splice(this._locate.y.indexOf(c.y + c.bottom * this._scale), 1);
        this._changeLocale();
    },
    _changeLocale() {
        var width, height, line, text, locate;
        locate = {
            x: {min: Math.min(...this._locate.x), max: Math.max(...this._locate.x)},
            y: {min: Math.min(...this._locate.y), max: Math.max(...this._locate.y)}
        };
        if (!(width = this._stage.getChildByName('width'))) {
            width = new createjs.Container();
            line = new createjs.Shape();
            text = new createjs.Text('', '15px sans-serif');
            width.name = 'width';
            line.name = 'line';
            text.name = 'text';
            text.textBaseline = 'bottom';
            width.addChild(line);
            width.addChild(text);
            this._stage.addChild(width);
        }
        if (!(height = this._stage.getChildByName('height'))) {
            height = new createjs.Container();
            line = new createjs.Shape();
            text = new createjs.Text('', '15px sans-serif');
            height.name = 'height';
            line.name = 'line';
            text.name = 'text';
            text.textAlign = 'right';
            height.addChild(line);
            height.addChild(text);
            this._stage.addChild(height);
        }
        width.x = locate.x.min;
        width.y = locate.y.min - 15;
        height.x = locate.x.min - 15;
        height.y = locate.y.min;
        width.getChildByName('text').text = Math.round((locate.x.max - locate.x.min) / this._scale * 10) + 'mm';
        width.getChildByName('line').graphics.clear().beginStroke('#bdbdbd').setStrokeDash([5, 5]).setStrokeStyle(2).moveTo(0, 5).lineTo(locate.x.max - locate.x.min, 5).endStroke();
        height.getChildByName('text').text = Math.round((locate.y.max - locate.y.min) / this._scale * 10) + 'mm';
        height.getChildByName('line').graphics.clear().beginStroke('#bdbdbd').setStrokeDash([5, 5]).setStrokeStyle(2).moveTo(5, 0).lineTo(5, locate.y.max - locate.y.min).endStroke();
    },
    create: function(x, y, width, height, unit, type) {
        var container = new createjs.Container();
        var obj = new createjs.Shape();
        var lineTop = new createjs.Shape();
        var lineLeft = new createjs.Shape();
        var lineRight = new createjs.Shape();
        var lineBottom = new createjs.Shape();

        container.scaleX = container.scaleY = this._scale;
        container.x = x;
        container.y = y;
        container.width = width;
        container.height = height;
        container.size = width * height * 2;
        container.unit = unit;
        container.type = type;
        obj.name = 'field';
        lineTop.name = 'top';
        lineLeft.name = 'left';
        lineRight.name = 'right';
        lineBottom.name = 'bottom';

        $(container).on('mousedown', {c: container}, this.moveStart.bind(this));
        $(container).on('pressmove', {c: container}, this.move.bind(this));
        $(container).on('pressup', {c: container}, this.moveEnd.bind(this));
        $(lineTop).on('pressmove', {c: container}, this.resizeTop.bind(this));
        $(lineLeft).on('pressmove', {c: container}, this.resizeLeft.bind(this));
        $(lineRight).on('pressmove', {c: container}, this.resizeRight.bind(this));
        $(lineBottom).on('pressmove', {c: container}, this.resizeBottom.bind(this));
        obj.on('mouseover', () => { if (!this._drag.isMove && !this._drag.lock) $('body').css('cursor', 'pointer') });
        obj.on('mouseout', () => { if (!this._drag.isMove && !this._drag.lock) $('body').css('cursor', '') });
        lineTop.on('mouseover', () => { $('body').css('cursor', 'row-resize') });
        lineLeft.on('mouseover', () => { $('body').css('cursor', 'col-resize') });
        lineRight.on('mouseover', () => { $('body').css('cursor', 'col-resize') });
        lineBottom.on('mouseover', () => { $('body').css('cursor', 'row-resize') });
        container.addChild(obj);
        container.addChild(lineTop);
        container.addChild(lineLeft);
        container.addChild(lineRight);
        container.addChild(lineBottom);
        container.addChild(this.getText(container));
        this._stage.addChild(container);
        this._redraw(container);
    },
    _redraw: function(c) {
        if (c.right && c.bottom) this._clearLocate(c)
        c.right = c.width * c.unit * this._default;
        c.bottom = c.height * c.unit * this._default;
        c.getChildByName('top').graphics.clear().beginStroke('Black').setStrokeStyle(2).moveTo(0, 0).lineTo(c.right, 0).endStroke();
        c.getChildByName('left').graphics.clear().beginStroke('Black').setStrokeStyle(2).moveTo(0, 0).lineTo(0, c.bottom).endStroke();
        c.getChildByName('right').graphics.clear().beginStroke('Black').setStrokeStyle(2).moveTo(c.right, 0).lineTo(c.right, c.bottom).endStroke();
        c.getChildByName('bottom').graphics.clear().beginStroke('Black').setStrokeStyle(2).moveTo(0, c.bottom).lineTo(c.right, c.bottom).endStroke();
        c.getChildByName('field').graphics.clear().beginFill(this._types[c.type].color).drawRect(0, 0, c.right, c.bottom).endFill();
        this._setLocate(c);
        this.update();
    },
    _resize: function(c, diff) {
        var offset = c.unit * 0.25 * this._default * this._scale;

        this._drag.isMove = this._drag.lock = true;
        if (Math.abs(diff) > offset) {
            this._clearLocate(c);
            if (c.width < c.height && (diff > 0 || c.width > 0.25)) {
                c.x += c.width * c.unit * this._default * this._scale / 2;
                c.y += c.height * c.unit * this._default * this._scale / 2;
                c.width += 0.25 * (diff > 0 ? 1 : -1);
                c.width = (diff > 0 ? Math.floor(c.width / 0.25) : Math.floor(c.width / 0.25)) * 0.25;
                c.height = this.getLength(c.size, c.width);
                c.x -= c.width * c.unit * this._default * this._scale / 2;
                c.y -= c.height * c.unit * this._default * this._scale / 2;
            } else if (c.width >= c.height && (diff < 0 || c.height > 0.25)) {
                c.x += c.width * c.unit * this._default * this._scale / 2;
                c.y += c.height * c.unit * this._default * this._scale / 2;
                c.height += 0.25 * (diff > 0 ? -1 : 1);
                c.height = (diff > 0 ? Math.floor(c.height / 0.25) : Math.floor(c.height / 0.25)) * 0.25;
                c.width = this.getLength(c.size, c.height);
                c.x -= c.width * c.unit * this._default * this._scale / 2;
                c.y -= c.height * c.unit * this._default * this._scale / 2;
            } else
                return;
            c.right = c.bottom = null;
            this._redraw(c);
        }
    },
    resizeTop: function(e) {
        this._resize(e.data.c, this._stage.mouseY - e.data.c.y);
    },
    resizeLeft: function(e) {
        this._resize(e.data.c, e.data.c.x - this._stage.mouseX);
    },
    resizeRight: function(e) {
        this._resize(e.data.c, this._stage.mouseX - e.data.c.x - e.data.c.right);
    },
    resizeBottom: function(e) {
        this._resize(e.data.c, e.data.c.y - this._stage.mouseY + e.data.c.bottom);
    },
    moveStart: function(e) {
        var c = e.data.c;

        $('body').css('cursor', 'move');
        this._drag.x = this._stage.mouseX - c.x;
        this._drag.y = this._stage.mouseY - c.y;
        this._drag.isMove = false;
    },
    move: function(e) {
        if (e.originalEvent.pointerID < 2) this._move(e.data.c);
        else this._pinch(e.data.c);
    },
    _move: function(c) {
        if (this._drag.lock) return;
        this._clearLocate(c);
        c.x = this._stage.mouseX - this._drag.x;
        c.y = this._stage.mouseY - this._drag.y;

        this._locate.x.find(function(elm) {
            if (Math.abs(elm - c.x) < 10) c.x = elm;
            else if (Math.abs(elm - c.x - c.right * this._scale) < 10) c.x = elm - c.right * this._scale;
            else return false;
            return true;
        }, this);
        this._locate.y.find(function(elm) {
            if (Math.abs(elm - c.y) < 10) c.y = elm;
            else if (Math.abs(elm - c.y - c.bottom * this._scale) < 10) c.y = elm - c.bottom * this._scale;
            else return false;
            return true;
        }, this);
        this._setLocate(c);
        this._drag.isMove = true;
        this.update();
    },
    _pinch: function(c) {
        var diffx = Math.abs(this._stage.mouseX - this._drag.x - c.x);
        var diffy = Math.abs(this._stage.mouseY - this._drag.y - c.y);

        if (diffx > diffy) this._resize(c, this._stage.mouseX - this._drag.x - c.x);
        if (diffx < diffy) this._resize(c, this._stage.mouseY - this._drag.y - c.y);
        if (diffx != diffy && Math.max(diffx, diffy) > c.unit * 0.25 * this._default * this._scale) {
            this._drag.x = this._stage.mouseX - c.x;
            this._drag.y = this._stage.mouseY - c.y;
        }
    },
    moveEnd: function(e) {
        var c = e.data.c;

        $('body').css('cursor', 'pointer');
        if (!this._drag.isMove && !this._drag.lock) this.change(c);
        this._drag.isMove = this._drag.lock = false;
    },
    change: function(c) {
        $('#form').openModal();
        $('#size').val(c.size);
        $('#unit').val(c.unit);
        $('#type').val(c.type);
        $('select').material_select('update');
        $('#change').off('click');
        $('#change').on('click', () => {
            if (!c._init) this.remove(c);
            this.create(c.x, c.y, this.getLength($('#size').val(), c.height), c.height, $('#unit').val(), $('#type').val());
            $('#form').closeModal();
            $('#side').sideNav('hide');
        })
        $('#remove').off('click');
        $('#remove').on('click', () => {
            this.remove(c);
            $('#form').closeModal();
        })
    },
    importFile: function(e) {
        var file = new FileReader();
        file.readAsText(e.target.files[0]);

        file.onload = () => {
            var json = JSON.parse(file.result);

            this.eachStage((c) => { this.remove(c); });
            for (var i = 0; i < json.data.length; i++) {
                this.create(json.data[i].x * this._scale, json.data[i].y * this._scale, json.data[i].width, json.data[i].height, json.data[i].unit, json.data[i].type);
            }
            $('#side').sideNav('hide');
        }
    },
    exportFile: function() {
        var json = {version: this.version, data: []};
        this.eachStage((c) => {
            json.data.push({x: c.x / this._scale, y: c.y / this._scale, width: c.width, height: c.height, unit: c.unit, type: c.type});
        });
        window.location.href = window.URL.createObjectURL(new Blob([JSON.stringify(json)], {type: 'application/octet-stream'}));
    }
}

$(document).ready(function() {
    madori.init();
})
