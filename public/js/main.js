$(document).ready(function() {
    var madori = new Madori('canvas', setEvent);
    var winSize = {width: null, height: null};
    var drag = {x: null, y: null, time: null};
    var setting = madori.getSetting();
    var container, resizing, shift, moving, drawing, lock, clear;

    madoriMode();
    setWindowSize();
    setZoom(100);
    setFloor(1);
    $('#madori').on('click', setMadoriForm);
    $('#memoMode').on('click', memoMode);
    $('#madoriMode').on('click', madoriMode);
    $('#erase').on('click', memoErase);
    $('#undo').on('click', undo);
    $('#redo').on('click', redo);
    $('#toti').on('click', setSettingForm);
    $('#add, #change').on('click', submit);
    $('#remove').on('click', remove);
    $('.add-types').on('click', addTypes);
    $('.rm-types').on('click', rmTypes);
    $('#setting').on('click', setSetting);
    $('#width, #height, input.name, input.color, input.ignore').on('change', dirtySetting);
    $('#import').on('change', importFile);
    $('#export').on('click', exportFile);
    $('#zoomIn').on('click', zoomIn);
    $('#zoomOut').on('click', zoomOut);
    $('#floorUp').on('click', floorUp);
    $('#floorDown').on('click', floorDown);
    $('#top').on('mouseenter', shiftTop);
    $('#left').on('mouseenter', shiftLeft);
    $('#right').on('mouseenter', shiftRight);
    $('#bottom').on('mouseenter', shiftBottom);
    $('#top, #left, #right, #bottom').on('mouseleave', shiftEnd);
    $('#menu').sideNav();
    $('.modal-trigger').leanModal();
    $('#types').collapsible();
    $(window).on('resize', resize);

    function update() {
        checkOverFlow();
        checkError();

        $('#tubo').text(madori.getTubo() + '坪');
    }
    function submit() {
        if (!container._init) madori.remove(container);
        madori.create(container.x, container.y, madori.getLength($('#size').val(), container.height), container.height, $('#type').val(), container.floor, $('#wall').val());
        $('#side').sideNav('hide');
        update();
    }
    function setEvent(container) {
        if (!madori.checkFloor(container)) return;

        container.on('mousedown', moveStart);
        container.on('pressmove', move);
        container.on('pressup', moveEnd);
        container.getChildByName('top').on('pressmove', resizeTop);
        container.getChildByName('left').on('pressmove', resizeLeft);
        container.getChildByName('right').on('pressmove', resizeRight);
        container.getChildByName('bottom').on('pressmove', resizeBottom);
        container.getChildByName('field').on('mouseover', () => { if (!moving && !drawing && !lock) $('body').css('cursor', 'pointer') });
        container.getChildByName('field').on('mouseout', () => { if (!moving && !drawing && !lock) $('body').css('cursor', '') });
        container.getChildByName('top').on('mouseover', () => { if (!moving && !drawing && !lock) $('body').css('cursor', 'row-resize') });
        container.getChildByName('top').on('mouseout', () => { if (!moving && !drawing && !lock) $('body').css('cursor', '') });
        container.getChildByName('left').on('mouseover', () => { if (!moving && !drawing && !lock) $('body').css('cursor', 'col-resize') });
        container.getChildByName('left').on('mouseout', () => { if (!moving && !drawing && !lock) $('body').css('cursor', '') });
        container.getChildByName('right').on('mouseover', () => { if (!moving && !drawing && !lock) $('body').css('cursor', 'col-resize') });
        container.getChildByName('right').on('mouseout', () => { if (!moving && !drawing && !lock) $('body').css('cursor', '') });
        container.getChildByName('bottom').on('mouseover', () => { if (!moving && !drawing && !lock) $('body').css('cursor', 'row-resize') });
        container.getChildByName('bottom').on('mouseout', () => { if (!moving && !drawing && !lock) $('body').css('cursor', '') });
    }
    function memoMode() {
        drawing = true;
        $('.memo-mode').removeClass('hide');
        $('.madori-mode').addClass('hide');
        $('body').css('cursor', 'crosshair');
        madori.memoMode();
    }
    function madoriMode() {
        drawing = false;
        $('.memo-mode').addClass('hide');
        $('.madori-mode').removeClass('hide');
        $('body').css('cursor', '');
        madori.madoriMode();
    }
    function memoErase() {
        madori.memoErase();
    }
    function undo() {
        madori.undo();
    }
    function redo() {
        madori.redo();
    }
    function remove() {
        madori.remove(container);
        update();
    }
    function addTypes() {
        var $type = newType();
        $type.find('.collapsible-header').text('-');
        $('#types').append($type);
        clear = false
    }
    function rmTypes() {
        var error = false;
        var id = parseInt($(this).closest('li').find('input.id').val());

        madori.forEach((container) => { if (container.type == id) error = true; });
        if (error) Materialize.toast('使用中のため削除できません', 2000);
        else {
            $(this).closest('li').remove();
            madori.forEach((container) => { if (container.type > id) container.type -= 1; });
            setSetting();
            setSelectForm();
        }
    }
    function setSetting() {
        setting.types = [];
        setting.madori.width = $('#width').val();
        setting.madori.height = $('#height').val();
        setting.madori.unit = $('#unit').val();

        $('#types li').each(function() {
            setting.types.push({
                name: $(this).find('input.name').val(),
                color: $(this).find('input.color').val(),
                rate: parseInt($(this).find('input.rate').val()),
                ignore: $(this).find('input.ignore').prop('checked')
            });
        });
        madori.setSetting(setting);
        clear = false;
        update();
    }
    function dirtySetting() {
        clear = false
    }
    function initDrag(container) {
        drag.x = madori.getMouse('x') - container.x;
        drag.y = madori.getMouse('y') - container.y;
        drag.time = new Date().getTime();
    }
    function moveStart() {
        if (drawing) return;
        initDrag(this);
        moving = false;

        $('body').css('cursor', 'move');
    }
    function move() {
        if (drawing) return;
        var now = new Date().getTime();
        var moveX = madori.getMouse('x') - this.x;
        var moveY = madori.getMouse('y') - this.y;
        if ((now - drag.time < 500 && !lock && ((Math.abs(drag.x - moveX) > 10) || (Math.abs(drag.y - moveY) > 10))) || moving) {
            var ptr = madori.getStagePtr();
            var direction = {x: 0, y: 0, id: null};
            var checkFit = (isFit) => {
                if ((isFit.x && direction.x) || (isFit.y && direction.y)) {
                    shiftEnd();
                    if (direction.id) clearInterval(direction.id);
                }
            };
            moving = true;
            if (ptr.y + this.y < 0 && drag.y > moveY) direction.y = 5;
            else if (ptr.x + this.x < 0 && drag.x > moveX) direction.x = 5;
            else if (ptr.x + this.x + this.right > winSize.width && drag.x < moveX) direction.x = -5;
            else if (ptr.y + this.y + this.bottom > winSize.height && drag.y < moveY) direction.y = -5;
            if (!shift && (direction.x || direction.y)) {
                shiftWindow(direction.x, direction.y);
                direction.id = setInterval(() => {
                    if (!shift) clearInterval(direction.id);
                    this.x += direction.x;
                    this.y += direction.y;
                    drag.x += direction.x;
                    drag.y += direction.y;
                    checkFit(madori.move(this, drag));
                }, 10);
            }
            checkFit(madori.move(this, drag));
        } else if (now - drag.time >= 500) {
            madori.pinch(this, drag);
            lock = true;
        }
        checkOverFlow();
    }
    function moveEnd() {
        if (drawing) return;
        if (moving || lock) {
            checkOverFlow();
            checkError();
        } else {
            setMadoriForm(this, true);
        }
        if (shift) shiftEnd();
        $('body').css('cursor', 'pointer');

        moving = lock = false;
    }
    function resizeTop() {
        resizeMadori(this.parent, madori.getMouse('y') - this.localToGlobal(0, 0).y);
    }
    function resizeLeft() {
        resizeMadori(this.parent, this.localToGlobal(0, 0).x - madori.getMouse('x'));
    }
    function resizeRight() {
        resizeMadori(this.parent, madori.getMouse('x') - this.localToGlobal(this.parent.right, 0).x);
    }
    function resizeBottom() {
        resizeMadori(this.parent, this.localToGlobal(0, this.parent.bottom).y - madori.getMouse('y'));
    }
    function newType() {
        var $type = $('#typeList').clone(true).attr('id', null).removeClass('hide');
        var id = 'ignore_' + $('#types li').length;
        $type.find('input.ignore').attr('id', id).next().attr('for', id);
        return $type;
    }
    function setSelectForm() {
        if (!clear) {
            setting = madori.getSetting();

            $('#unit, #type, #types').empty();

            Object.keys(setting.units).forEach((i) => {
                $('#unit').append(`<option value="${i}">${setting.units[i]}</option>`);
            });
            Object.keys(setting.types).forEach((i) => {
                var $type = newType();
                $type.find('.collapsible-header').text(setting.types[i].name).css({background: setting.types[i].color});
                $type.find('input.id').val(i);
                $type.find('input.name').val(setting.types[i].name);
                $type.find('input.color').val(setting.types[i].color);
                $type.find('input.rate').val(setting.types[i].rate);
                $type.find('input.ignore').prop('checked', setting.types[i].ignore);
                $('#types').append($type);
                $('#type').append(`<option value="${i}">${setting.types[i].name}</option>`);
            });

            $('#width').val(setting.madori.width).trigger('change');
            $('#height').val(setting.madori.height).trigger('change');
            $('#unit').val(setting.madori.unit).material_select();
            clear = true;
        }
    }
    function resizeMadori(container, diff) {
        if (drawing) return;
        madori.resize(container, diff);
        initDrag(container);
        lock = true;
    }
    function setMadoriForm(c, isChange) {
        container = c;
        $('#madoriForm').openModal();

        setSelectForm();
        if (isChange) {
            $('#add').addClass('hide');
            $('#remove, #change').removeClass('hide');
        } else {
            var ptr = madori.getStagePtr();
            container = {x: 100 - ptr.x, y: 100 - ptr.y, size: 1, height: 1, type: 0, wall: ['top', 'left', 'right', 'bottom'], _init: true};
            $('#add').removeClass('hide');
            $('#remove, #change').addClass('hide');
        }
        $('#size').val(container.size).trigger('change');
        $('#type').val(container.type).material_select();
        $('#wall').val(container.wall).material_select();
    }
    function setSettingForm() {
        $('#settingForm').openModal();

        setSelectForm();
    }
    function zoomIn() {
        setZoom(madori.getScale() + 10);
    }
    function zoomOut() {
        setZoom(madori.getScale() - 10);
    }
    function setZoom(scale) {
        if (scale <= 0) return;

        madori.setScale(scale);
        $('#zoomLevel').text(scale + '%');
        checkOverFlow();
    }
    function floorUp() {
        setFloor(madori.getFloor() + 1);
    }
    function floorDown() {
        setFloor(madori.getFloor() - 1);
    }
    function setFloor(floor) {
        if (floor <= 0) return;

        madori.setFloor(floor);
        $('#floor').text(floor + '階');
    }
    function setWindowSize() {
        winSize.width = $(window).width() - 20;
        winSize.height = $(window).height() - $('.navbar-fixed').height() - 26;
        $('#canvas').attr('width', winSize.width);
        $('#canvas').attr('height', winSize.height);
        $('#canvas').css({margin: '10px'});
        checkOverFlow();
        madori.update();
    }
    function shiftTop() {
        shiftWindow(0, 5);
    }
    function shiftLeft() {
        shiftWindow(5, 0);
    }
    function shiftRight() {
        shiftWindow(-5, 0);
    }
    function shiftBottom() {
        shiftWindow(0, -5);
    }
    function shiftWindow(x, y) {
        if (shift) return;

        shift = madori.shiftWindow(x, y, winSize, shiftEnd);
    }
    function shiftEnd() {
        if (shift) {
            checkOverFlow();
            clearInterval(shift);
            shift = false;
        }
    }
    function resize() {
        if (resizing) clearTimeout(resizing);
        resizing = setTimeout(() => {
            setWindowSize();
            madori.changeLocale();
            resizing = null;
        });
    }
    function checkOverFlow() {
        var ptr = madori.getStagePtr();
        var locate = madori.getLimitLocate();
        if (ptr.y + locate.y.min < 50 && $('#top').hasClass('hide')) $('#top').removeClass('hide');
        if (ptr.y + locate.y.min > 50 && !$('#top').hasClass('hide')) $('#top').addClass('hide');
        if (ptr.x + locate.x.min < 100 && $('#left').hasClass('hide')) $('#left').removeClass('hide');
        if (ptr.x + locate.x.min > 100 && !$('#left').hasClass('hide')) $('#left').addClass('hide');
        if (ptr.x + locate.x.max > winSize.width && $('#right').hasClass('hide')) $('#right').removeClass('hide');
        if (ptr.x + locate.x.max < winSize.width && !$('#right').hasClass('hide')) $('#right').addClass('hide');
        if (ptr.y + locate.y.max > winSize.height && $('#bottom').hasClass('hide')) $('#bottom').removeClass('hide');
        if (ptr.y + locate.y.max < winSize.height && !$('#bottom').hasClass('hide')) $('#bottom').addClass('hide');
    }
    function checkError() {
        var locate = madori.getLimitLocate();
        if (setting.madori.width && setting.madori.width * 1000 < madori.getMeter(locate.x.max - locate.x.min)) Materialize.toast('土地の横幅を超過してます', 2000);
        if (setting.madori.height && setting.madori.height * 1000 < madori.getMeter(locate.y.max - locate.y.min)) Materialize.toast('土地の縦幅を超過してます', 2000);
    }
    function importFile(e) {
        var file = new FileReader();
        file.readAsText(e.target.files[0]);

        file.onload = () => {
            madori.setJson(JSON.parse(file.result));
            $('#side').sideNav('hide');
            update();
            clear = false;
        }
    }
    function exportFile() {
        window.location.href = window.URL.createObjectURL(new Blob([JSON.stringify(madori.getJson())], {type: 'application/octet-stream'}));
    }
})
