$(document).ready(function() {
    var madori = new Madori('canvas', setEvent);
    var winSize = {width: null, height: null};
    var drag = {x: null, y: null};
    var setting = madori.getSetting();
    var container, resizing, shift, moving, lock;

    setWindowSize();
    setZoom(100);
    setFloor(1);
    $('#madori').on('click', setMadoriForm);
    $('#toti').on('click', setTotiForm);
    $('#add, #change').on('click', submit);
    $('#remove').on('click', remove)
    $('#setting').on('click', setSetting)
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
    $(window).on('resize', resize);

    function update() {
        checkOverFlow();
        checkError();

        $('#tubo').text(madori.getTubo() + '坪');
    }
    function submit() {
        if (!container._init) madori.remove(container);
        madori.create(container.x, container.y, madori.getLength($('#size').val(), container.height), container.height, $('#type').val());
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
        container.getChildByName('field').on('mouseover', () => { if (!moving && !lock) $('body').css('cursor', 'pointer') });
        container.getChildByName('field').on('mouseout', () => { if (!moving && !lock) $('body').css('cursor', '') });
        container.getChildByName('top').on('mouseover', () => { $('body').css('cursor', 'row-resize') });
        container.getChildByName('left').on('mouseover', () => { $('body').css('cursor', 'col-resize') });
        container.getChildByName('right').on('mouseover', () => { $('body').css('cursor', 'col-resize') });
        container.getChildByName('bottom').on('mouseover', () => { $('body').css('cursor', 'row-resize') });
    }
    function remove() {
        madori.remove(container);
        update();
    }
    function setSetting() {
        setting.width = $('#width').val();
        setting.height = $('#height').val();
        setting.unit = $('#unit').val();

        madori.setSetting(setting);
        update();
    }
    function moveStart() {
        drag.x = madori.getMouse('x') - this.x;
        drag.y = madori.getMouse('y') - this.y;
        moving = false;

        $('body').css('cursor', 'move');
    }
    function move(e) {
        moving = true;
        if (e.pointerID < 1 && !lock) madori.move(this, drag);
        else if (e.pointerID >= 1) madori.pinch(this, drag);
        checkOverFlow();
    }
    function moveEnd() {
        if (!moving && !lock) setMadoriForm(this, true);
        $('body').css('cursor', 'pointer');

        moving = lock = false;
        checkOverFlow();
        checkError();
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
    function resizeMadori(container, diff) {
        madori.resize(container, diff);
        lock = true;
    }
    function setMadoriForm(c, isChange) {
        container = c;
        $('#madoriForm').openModal();

        if (isChange) {
            $('#add').addClass('hide');
            $('#remove, #change').removeClass('hide');
        } else {
            container = {x: 100, y: 100, size: 1, height: 1, type: 1, _init: true};
            $('#add').removeClass('hide');
            $('#remove, #change').addClass('hide');
        }
        $('#size').val(container.size).trigger('change');
        $('#type').val(container.type).material_select();
    }
    function setTotiForm() {
        setting = madori.getSetting();
        $('#totiForm').openModal();

        $('#width').val(setting.width).trigger('change');
        $('#height').val(setting.height).trigger('change');
        $('#unit').val(setting.unit).material_select();
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
        winSize.width = $(window).width();
        winSize.height = $(window).height() - $('.navbar-fixed').height();
        $('#canvas').attr('width', winSize.width);
        $('#canvas').attr('height', winSize.height);
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
        if (setting.width && setting.width * 1000 < madori.getMeter(locate.x.max - locate.x.min)) Materialize.toast('土地の横幅を超過してます', 2000);
        if (setting.height && setting.height * 1000 < madori.getMeter(locate.y.max - locate.y.min)) Materialize.toast('土地の縦幅を超過してます', 2000);
    }
    function importFile(e) {
        var file = new FileReader();
        file.readAsText(e.target.files[0]);

        file.onload = () => {
            madori.setJson(JSON.parse(file.result));
            $('#side').sideNav('hide');
            update();
        }
    }
    function exportFile() {
        window.location.href = window.URL.createObjectURL(new Blob([JSON.stringify(madori.getJson())], {type: 'application/octet-stream'}));
    }
})
