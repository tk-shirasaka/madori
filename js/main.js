var madori = {
    _default: 100,
    _drag: {x: 0, y: 0},
    _stage: null,
    init: function() {
        this._stage = new createjs.Stage('madori');
        $('#madori').attr('width', $(document).width());
        $('#madori').attr('height', $(document).height());
        $('#add').on('click', this.add.bind(this));

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
                tubo += obj.scaleX * obj.scaleY;
            }
        }
        $('#tubo').text(tubo / 3.30579);
    },
    getText: function(obj) {
        var unit = (obj.unit == '1.70') ? '畳 (団地間)'
                 : (obj.unit == '1.76') ? '畳 (江戸間)'
                 : (obj.unit == '1.82') ? '畳 (中京間)'
                 : (obj.unit == '1.91') ? '畳 (京間)'
                 : 'm';
        var text = (obj.scaleX / obj.unit)
                 + ' x '
                 + (obj.scaleY / obj.unit)
                 + ' : '
                 + unit;

        var obj = new createjs.Text(text, '15px sans-serif');
        obj.x = obj.y = 10;
        return obj;
    },
    add: function() {
        var container = new createjs.Container();
        var obj = new createjs.Shape();
        obj.graphics.beginStroke('Black').setStrokeStyle(3);
        obj.graphics.beginFill('DeepSkyBlue').drawRect(0, 0, this._default, this._default);
        obj.graphics.endFill();
        container.x = container.y = 100;
        obj.unit = '1.00';

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

        container.x = this._stage.mouseX - this._drag.x;
        container.y = this._stage.mouseY - this._drag.y;
        this.update();
    },
    change: function() {
        var continer, obj, text, i;

        container = this;
        for (i = 0; i < this.children.length; i++) {
            if (this.children[i].text) {
                text = this.children[i];
            } else {
                obj = this.children[i];
            }
        }

        $('#form').openModal();
        $('#width').val(obj.scaleX / obj.unit);
        $('#height').val(obj.scaleY / obj.unit);
        $('#unit').val(obj.unit).trigger('click');
        $('#change').on('click', function() {
            $(this).off('click');
            obj.unit = $('#unit').val();
            obj.scaleX = $('#width').val() * obj.unit;
            obj.scaleY = $('#height').val() * obj.unit;
            container.removeChild(text);
            container.addChild(madori.getText(obj));
            madori.update();
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
