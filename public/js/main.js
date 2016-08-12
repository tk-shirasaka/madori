var madori = {
    _default: 100,
    _units: {1.70: '団地間', 1.76: '江戸間', 1.82: '中京間', 1.91: '京間'},
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
    _scale: 1,
    _drag: {x: 0, y: 0, isMove: false},
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
        $('select').material_select();

        if (this._default > $(document).width() / 15) this._scale = $(document).width() / 15 / this._default;
        if (createjs.Touch.isSupported()) createjs.Touch.enable(this._stage);
    },
    update: function() {
        this._stage.update();
        this.setTubo();
    },
    setTubo: function() {
        var tubo = 0;

        for (var i = 0; i < this._stage.children.length; i++) {
            var c = this._stage.children[i];
            tubo += c.size / 2 * c.unit * c.unit * (c.type == '7' ? 2 : 1);
        }
        $('#tubo').text(Math.round(tubo / 3.30579 * 100) / 100);
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
        this.change(this.create(100, 100, this.getLength(1, 1), 1, '1.82', 1));
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
        obj.graphics.beginFill(this._types[type].color).drawRect(0, 0, container.width * unit * this._default, container.height * unit * this._default);
        obj.graphics.endFill();
        lineTop.graphics.beginStroke('Black').setStrokeStyle(3).moveTo(0, 0).lineTo(container.width * unit * this._default, 0).endStroke();
        lineLeft.graphics.beginStroke('Black').setStrokeStyle(3).moveTo(0, 0).lineTo(0, container.height * unit * this._default).endStroke();
        lineRight.graphics.beginStroke('Black').setStrokeStyle(3).moveTo(container.width * unit * this._default, 0).lineTo(container.width * unit * this._default, container.height * unit * this._default).endStroke();
        lineBottom.graphics.beginStroke('Black').setStrokeStyle(3).moveTo(0, container.height * unit * this._default).lineTo(container.width * unit * this._default, container.height * unit * this._default).endStroke();

        $(container).on('mousedown', {c: container}, this.moveStart.bind(this));
        $(container).on('pressmove', {c: container}, this.move.bind(this));
        $(container).on('pressup', {c: container}, this.moveEnd.bind(this));
        $(lineTop).on('pressmove', {c: container, line: lineTop}, this.resizeTop.bind(this));
        $(lineLeft).on('pressmove', {c: container, line: lineLeft}, this.resizeLeft.bind(this));
        $(lineRight).on('pressmove', {c: container, line: lineRight}, this.resizeRight.bind(this));
        $(lineBottom).on('pressmove', {c: container, line: lineBottom}, this.resizeBottom.bind(this));
        obj.on('mouseover', () => { $('body').css('cursor', 'pointer') });
        obj.on('mouseout', () => { $('body').css('cursor', '') });
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
        this.update();

        return container;
    },
    _resize: function(c, line, diff) {
        var offset = c.unit * 0.025 * this._default;

        if (Math.abs(diff) > offset) {
            if (c.width < c.height && (diff > 0 || c.width > 0.25)) {
                c.width += 0.25 * (diff > 0 ? 1 : -1);
                c.width = (diff > 0 ? Math.ceil(c.width / 0.25) : Math.floor(c.width / 0.25)) * 0.25;
                c.height = this.getLength(c.size, c.width);
            } else if (c.width >= c.height && (diff < 0 || c.height > 0.25)) {
                c.height += 0.25 * (diff > 0 ? -1 : 1);
                c.height = (diff > 0 ? Math.ceil(c.height / 0.25) : Math.floor(c.height / 0.25)) * 0.25;
                c.width = this.getLength(c.size, c.height);
            }
            if (c.width && c.height) {
                $(line).off('pressmove');
                this._stage.removeChild(c);
                this.create(c.x, c.y, c.width, c.height, c.unit, c.type);
            }
        }
    },
    resizeTop: function(e) {
        this._resize(e.data.c, e.data.line, this._stage.mouseY - e.data.c.y);
    },
    resizeLeft: function(e) {
        this._resize(e.data.c, e.data.line, e.data.c.x - this._stage.mouseX);
    },
    resizeRight: function(e) {
        this._resize(e.data.c, e.data.line, this._stage.mouseX - e.data.c.x - e.data.c.width * e.data.c.unit * this._default);
    },
    resizeBottom: function(e) {
        this._resize(e.data.c, e.data.line, e.data.c.y - this._stage.mouseY + e.data.c.height * e.data.c.unit * this._default);
    },
    moveStart: function(e) {
        var c = e.data.c;

        $('body').css('cursor', 'move');
        this._drag.x = this._stage.mouseX - c.x;
        this._drag.y = this._stage.mouseY - c.y;
        this._drag.isMove = false;
    },
    move: function(e) {
        var c = e.data.c;

        c.x = this._stage.mouseX - this._drag.x;
        c.y = this._stage.mouseY - this._drag.y;
        this._drag.isMove = true;
        this.update();
    },
    moveEnd: function(e) {
        var c = e.data.c;

        $('body').css('cursor', 'pointer');
        if (!this._drag.isMove) this.change(c);
    },
    change: function(c) {
        $('#form').openModal();
        $('#size').val(c.size);
        $('#unit').val(c.unit);
        $('#type').val(c.type);
        $('select').material_select('update');
        $('#change').off('click');
        $('#change').on('click', () => {
            this._stage.removeChild(c);
            this.create(c.x, c.y, this.getLength($('#size').val(), c.height), c.height, $('#unit').val(), $('#type').val());
            $('#form').closeModal();
        })
        $('#remove').on('click', () => {
            this._stage.removeChild(c);
            this.update();
            $('#form').closeModal();
        })
    },
    importFile: function(e) {
        var file = new FileReader();
        file.readAsText(e.target.files[0]);

        file.onload = () => {
            var json = JSON.parse(file.result);

            for (var i = 0; i < this._stage.children.length; i++) {
                this._stage.removeChild(this._stage.children[i]);
            }
            for (var i = 0; i < json.data.length; i++) {
                this.create(json.data[i].x, json.data[i].y, json.data[i].width, json.data[i].height, json.data[i].unit, json.data[i].type);
            }
        }
    },
    exportFile: function() {
        var json = {version: '0.0.1', data: []};
        for (var i = 0; i < this._stage.children.length; i++) {
            var c = this._stage.children[i];
            json.data.push({x: c.x, y: c.y, width: c.width, height: c.height, unit: c.unit, type: c.type});
        }
        window.location.href = window.URL.createObjectURL(new Blob([JSON.stringify(json)], {type: 'application/octet-stream'}));
    }
}

$(document).ready(function() {
    madori.init();
})
