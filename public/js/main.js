$(document).ready(function() {
    var stage   = new createjs.MadoriStage('canvas');
    var madori  = null;
    var redos   = [];
    var memos   = [];
    var action  = null;
    var preview = new Preview();

    setSelectForm();
    madoriMode();
    resize();
    setZoom();
    setFloor();
    $('#madori').on('click', addMadori);
    $('#memoMode').on('click', memoMode);
    $('#previewMode').on('click', previewMode);
    $('.madoriMode').on('click', madoriMode);
    $('#erase').on('click', memoErase);
    $('#undo').on('click', undo);
    $('#redo').on('click', redo);
    $('#toti').on('click', setSettingForm);
    $('#add, #change').on('click', submit);
    $('#remove').on('click', remove);
    $('.add-types').on('click', addTypes);
    $('.rm-types').on('click', rmTypes);
    $('#setting').on('click', setSetting);
    $('#import').on('change', importFile);
    $('#export').on('click', exportFile);
    $('#zoomIn').on('click', zoomIn);
    $('#zoomOut').on('click', zoomOut);
    $('#floorUp').on('click', floorUp);
    $('#floorDown').on('click', floorDown);
    $('#menu').sideNav();
    $('.modal-trigger').leanModal();
    $('#types').collapsible();
    $(window).on('resize', resize);

    function submit() {
        if (!madori.stage) stage.addChild(madori);
        madori.setMadoriProps({width: $('#size').val() * stage.unit * stage.unit / madori.height / 2, type: $('#type').val(), wall: $('#wall').val()});
        $('#side').sideNav('hide');
    }
    function memoMode() {
        stage.mode  = 'memo';
        $('.madori-mode').addClass('hide');
        $('.memo-mode').removeClass('hide');
    }
    function madoriMode() {
        stage.mode  = 'madori';
        $('.memo-mode').addClass('hide');
        $('.preview-mode').addClass('hide');
        $('.madori-mode').removeClass('hide');
        preview.dispose();
    }
    function memoErase() {
        stage.loopByName('memo', (memo) => {
            if (stage.floor === memo.floor) stage.removeChild(memo);
        });
        stage.update();
    }
    function undo() {
        var memo = stage.getChildByName('memo');
        if (memo) {
            redos.push(memo);
            stage.removeChild(memo);
            stage.update();
        }
    }
    function redo() {
        if (!redos.length) return;
        stage.addChildAt(redos.pop(), 0);
        stage.update();
    }
    function setTimestamp(e) {
        action = e.timeStamp;
    }
    function remove() {
        stage.removeChild(madori);
        stage.update();
    }
    function addTypes() {
        var $type = newType();
        $type.find('.collapsible-header').text('-');
        $('#types').append($type);
    }
    function rmTypes() {
        var error = false;
        var id = parseInt($(this).closest('li').find('input.id').val());

        stage.loopByName('madori', (madori) => { if (madori.type == id) error = true; });
        if (error) {
            Materialize.toast('使用中のため削除できません', 2000);
        } else {
            $(this).closest('li').remove();
            stage.loopByName('madori', (madori) => { if (madori.type > id) madori.type -= 1; });
            stage.types.splice(id, 1);
            setSelectForm();
        }
    }
    function setSetting() {
        stage.types     = [];
        stage.width     = parseInt($('#width').val());
        stage.height    = parseInt($('#height').val());
        stage.unit      = parseInt($('#unit').val());

        $('#types li').each(function() {
            stage.types.push({
                name: $(this).find('input.name').val(),
                color: $(this).find('input.color').val(),
                rate: parseInt($(this).find('input.rate').val()),
                ignore: $(this).find('input.ignore').prop('checked'),
                depth: parseInt($(this).find('input.depth').val()),
            });
        });
        stage.loopByName('madori', (madori) => { madori.redraw() });
        setSelectForm();
    }
    function newType() {
        var $type = $('#typeList').clone(true).attr('id', null).removeClass('hide');
        var id = 'ignore_' + $('#types li').length;
        $type.find('input.ignore').attr('id', id).next().attr('for', id);
        return $type;
    }
    function setSelectForm() {
        $('#unit, #type, #types').empty();

        Object.keys(stage.units).forEach((i) => {
            $('#unit').append(`<option value="${i}">${stage.units[i]}</option>`);
        });
        Object.keys(stage.types).forEach((i) => {
            var $type = newType();
            $type.find('.collapsible-header').text(stage.types[i].name).css({background: stage.types[i].color});
            $type.find('input.id').val(i);
            $type.find('input.name').val(stage.types[i].name);
            $type.find('input.color').val(stage.types[i].color);
            $type.find('input.rate').val(stage.types[i].rate);
            $type.find('input.ignore').prop('checked', stage.types[i].ignore);
            $type.find('input.depth').val(stage.types[i].depth);
            $('#types').append($type);
            $('#type').append(`<option value="${i}">${stage.types[i].name}</option>`);
        });

        $('#width').val(stage.width).trigger('change');
        $('#height').val(stage.height).trigger('change');
        $('#unit').val(stage.unit).material_select();
    }
    function addMadori() {
        madori  = new createjs.Madori();
        madori.set({x: 100 - stage.x, y: 100 - stage.y, height: stage.unit, type: 0, floor: stage.floor, wall: ['top', 'left', 'right', 'bottom']});
        madori.addEventListener('mousedown', setTimestamp);
        madori.addEventListener('pressup', changeMadori);
        $('#add').removeClass('hide');
        $('#remove, #change').addClass('hide');
        $('#size').val(1).trigger('change');
        resetMadoriForm();
    }
    function changeMadori(e) {
        if (e.timeStamp - action > 200) return;
        madori  = e.target.parent;
        $('#remove, #change').removeClass('hide');
        $('#add').addClass('hide');
        $('#size').val(madori.width * madori.height / stage.unit / stage.unit * 2).trigger('change');
        resetMadoriForm();
    }
    function resetMadoriForm() {
        $('#madoriForm').openModal();
        $('#type').val(madori.type).material_select();
        $('#wall').val(madori.wall).material_select();
    }
    function setSettingForm() {
        setSelectForm();
        $('#settingForm').openModal();
    }
    function zoomIn() {
        stage.scaleX += 0.1;
        stage.scaleY += 0.1;
        setZoom();
    }
    function zoomOut() {
        if (stage.scaleX < 0.2 || stage.scaleY < 0.2) return;
        stage.scaleX -= 0.1;
        stage.scaleY -= 0.1;
        setZoom();
    }
    function setZoom() {
        $('#zoomLevel').text(Math.round(stage.scaleX * 100) + '%');
        stage.update();
        preview.setScale(stage.scaleX);
    }
    function floorUp() {
        stage.floor++;
        setFloor();
    }
    function floorDown() {
        if (stage.floor < 2) return;
        stage.floor--;
        setFloor();
    }
    function setFloor() {
        redos   = [];
        stage.loopByName('madori', (madori) => { madori.redraw(); });
        stage.loopByName('memo', (memo) => {
            memos.push(memo);
            stage.removeChild(memo);
        });
        for (var i = memos.length - 1; i >= 0; i--) {
            if (stage.floor === memos[i].floor) {
                stage.addChild(memos[i]);
                memos.splice(i, 1);
            }
        }
        stage.update();
        $('#floor').text(stage.floor + '階');

        preview.setJson(stage.getMadoriJson());
    }
    function resize() {
        var width   = $(window).width() - 20;
        var height  = $(window).height() - $('.navbar-fixed').height() - 26;
        $('#canvas, #preview').attr({width, width, height: height});
        $('#canvas, #preview').css({margin: '10px'});
        preview.setSize(width, height);
        stage.update();
    }
    function importFile(e) {
        var file = new FileReader();
        file.readAsText(e.target.files[0]);

        file.onload = () => {
            stage.setMadoriJson(file.result, (madori) => {
                madori.addEventListener('mousedown', setTimestamp);
                madori.addEventListener('pressup', changeMadori);
            });
            $('#side').sideNav('hide');
            setSelectForm();
        }
    }
    function exportFile() {
        window.location.href = window.URL.createObjectURL(new Blob([stage.getMadoriJson()], {type: 'application/octet-stream'}));
    }
    function previewMode() {
        stage.mode  = 'preview';
        $('.madori-mode').addClass('hide');
        $('.preview-mode').removeClass('hide');
        $('#side').sideNav('hide');
        preview.setJson(stage.getMadoriJson());
    }
})
