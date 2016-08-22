$(document).ready(function() {
    var madori = new Madori('madori', setEvent);
    var winSize = {width: null, height: null};
    var drag = {x: null, y: null};
    var container, resize, shift, moving, lock;

    setWindowSize();
    setZoom(0);
    setFloor(0);
    $('#open').on('click', setForm);
    $('#add, #change').on('click', submit);
    $('#remove').on('click', remove)
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
    $('select').material_select();
    $(window).on('resize', resize);

    function submit() {
        if (!container._init) madori.remove(container);
        madori.create(container.x, container.y, madori.getLength($('#size').val(), container.height), container.height, $('#unit').val(), $('#type').val());

        $('#form').closeModal();
        $('#side').sideNav('hide');
        $('#tubo').text(madori.getTubo() + '坪');
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
        checkOverFlow();
    }
    function remove() {
        madori.remove(container);
        checkOverFlow();
        $('#tubo').text(madori.getTubo() + '坪');
        $('#form').closeModal();
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
        if (!moving && !lock) setForm(this, true);
        $('body').css('cursor', 'pointer');

        moving = lock = false;
        checkOverFlow();
    }
    function resizeTop() {
        madori.resize(this.parent, madori.getMouse('y') - this.parent.y - madori.getStagePtr().y);
        checkOverFlow();
        lock = true;
    }
    function resizeLeft() {
        madori.resize(this.parent, this.parent.x - madori.getMouse('x') + madori.getStagePtr().x);
        checkOverFlow();
        lock = true;
    }
    function resizeRight() {
        madori.resize(this.parent, madori.getMouse('x') - this.parent.x - this.parent.right - madori.getStagePtr().x);
        checkOverFlow();
        lock = true;
    }
    function resizeBottom() {
        madori.resize(this.parent, this.parent.y - madori.getMouse('y') + this.parent.bottom + madori.getStagePtr().y);
        checkOverFlow();
        lock = true;
    }
    function setForm(c, isChange) {
        container = c;
        $('#form').openModal();

        if (isChange) {
            $('#add').addClass('hide');
            $('#remove, #change').removeClass('hide');
        } else {
            container = {x: 100, y: 100, size: 1, height: 1, unit: '1.82', type: 1, _init: true};
            $('#add').removeClass('hide');
            $('#remove, #change').addClass('hide');
        }
        $('#size').val(container.size).trigger('change');
        $('#unit').val(container.unit).trigger('change');
        $('#type').val(container.type).trigger('change');
        $('select').material_select('update');
    }
    function zoomIn() {
        setZoom(0.1);
    }
    function zoomOut() {
        setZoom(-0.1);
    }
    function setZoom(scale) {
        madori.setScale(scale);
        $('#zoomLevel').text(Math.round(madori.getScale() * 100) + '%');
        checkOverFlow();
    }
    function floorUp() {
        setFloor(1);
    }
    function floorDown() {
        setFloor(-1);
    }
    function setFloor(floor) {
        madori.setFloor(floor);
        $('#floor').text(madori.getFloor() + '階');
    }
    function setWindowSize() {
        winSize.width = $(window).width();
        winSize.height = $(window).height() - $('.navbar-fixed').height();
        $('#madori').attr('width', winSize.width);
        $('#madori').attr('height', winSize.height);
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
        if (resize) clearTimeout(resize);
        resize = setTimeout(() => {
            setWindowSize();
            madori.changeLocale();
            resize = null;
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
    function importFile(e) {
        var file = new FileReader();
        file.readAsText(e.target.files[0]);

        file.onload = () => {
            madori.setJson(JSON.parse(file.result));
            $('#tubo').text(madori.getTubo() + '坪');
            $('#side').sideNav('hide');
        }
    }
    function exportFile() {
        window.location.href = window.URL.createObjectURL(new Blob([JSON.stringify(madori.getJson())], {type: 'application/octet-stream'}));
    }
})
