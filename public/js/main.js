var madori = {
    _default: 100,
    _scale: 1,
    _drag: {x: 0, y: 0},
    _stage: null,
    init: function() {
        this._stage = new createjs.Stage('madori');
        $('#madori').attr('width', $(document).width());
        $('#madori').attr('height', $(document).height() * 2);
        $('#add').on('click', this.add.bind(this));
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
            for (var j = 0; j < this._stage.children[i].children.length; j++) {
                if (this._stage.children[i].children[j].text) continue;
                obj = this._stage.children[i].children[j];
                tubo += obj.width * obj.height;
            }
        }
        $('#tubo').text(Math.round(tubo / 3.30579 * 100) / 100);
    },
    getText: function(obj) {
        var unit = (obj.unit == '1.70') ? '畳 (団地間)'
                 : (obj.unit == '1.76') ? '畳 (江戸間)'
                 : (obj.unit == '1.82') ? '畳 (中京間)'
                 : (obj.unit == '1.91') ? '畳 (京間)'
                 : '㎡';
        var type = (obj.color == 'BurlyWood') ? '洋室'
                 : (obj.color == 'LimeGreen') ? '和室'
                 : (obj.color == 'DarkGray') ? 'トイレ'
                 : (obj.color == 'Aqua') ? 'お風呂'
                 : (obj.color == 'Plum') ? '洗面所'
                 : 'その他';
        var text = '面積 : '
                 + (obj.width / obj.unit * obj.height / obj.unit * (unit === '㎡' ? 1 : 2))
                 + unit + '\n'
                 + '種別 : '
                 + type;

        if (this._scale < 0.5) text = ' ';
        var obj = new createjs.Text(text, '15px sans-serif');
        obj.x = obj.y = 10;
        return obj;
    },
    add: function() {
        this.create(100, 100, 1, 1, '1.00', 'BurlyWood');
    },
    create: function(x, y, width, height, unit, color) {
        var container = new createjs.Container();
        var obj = new createjs.Shape();

        obj.graphics.beginStroke('Black').setStrokeStyle(3);
        obj.graphics.beginFill(color).drawRect(0, 0, width * unit * this._default, height * unit * this._default);
        obj.graphics.endFill();
        container.x = x;
        container.y = y;
        container.scaleX = container.scaleY = this._scale;
        obj.width = width * unit;
        obj.height = height * unit;
        obj.unit = unit;
        obj.color = color;

        $(container).on('click', this.change);
        $(container).on('mousedown', {container: container}, this.moveStart.bind(this));
        $(container).on('pressmove', {container: container}, this.move.bind(this));
        container.addChild(obj);
        container.addChild(this.getText(obj));
        this._stage.addChild(container);
        this.update();
    },
    moveStart: function(e) {
        var container = e.data.container;

        this._drag.x = this._stage.mouseX - container.x;
        this._drag.y = this._stage.mouseY - container.y;
    },
    move: function(e) {
        var container = e.data.container;

        document.body.style.cursor = 'grabbing';
        container.x = this._stage.mouseX - this._drag.x;
        container.y = this._stage.mouseY - this._drag.y;
        this.update();
    },
    change: function() {
        var continer, obj, i;

        container = this;
        if (document.body.style.cursor === 'grabbing') {
            document.body.style.cursor = '';
            return;
        }
        for (i = 0; i < this.children.length; i++) {
            if (this.children[i].text) continue;
            obj = this.children[i];
            break;
        }

        $('#form').openModal();
        $('#width').val(obj.width / obj.unit);
        $('#height').val(obj.height / obj.unit);
        $('#unit').val(obj.unit);
        $('#type').val(obj.color);
        $('select').material_select('update');
        $('#change').off('click');
        $('#change').on('click', function() {
            madori._stage.removeChild(container);
            madori.create(container.x, container.y, $('#width').val(), $('#height').val(), $('#unit').val(), $('#type').val());
            $('#form').closeModal();
        })
        $('#remove').on('click', function() {
            madori._stage.removeChild(container);
            madori.update();
            $('#form').closeModal();
        })
    }
}

$(document).ready(function() {
    madori.init();
})
