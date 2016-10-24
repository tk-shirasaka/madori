function Preview() {
    'use strict'

    var _canvas     = document.getElementById('preview');
    var _json       = null;
    var _floor      = null;
    var _engine     = new BABYLON.Engine(_canvas, true);
    var _scene      = new BABYLON.Scene(_engine);
    var _camera1    = new BABYLON.TouchCamera('camera1', BABYLON.Vector3.Zero(), _scene);
    var _camera2    = new BABYLON.WebVRFreeCamera('camera2', BABYLON.Vector3.Zero(), _scene);
    var _light1     = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(100, 100, 100), _scene);
    var _light2     = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(-100, 100, -100), _scene);


    function setCube(x, y, width, height, depth, color) {
        var props       = {
            width:      height,
            height:     depth,
            depth:      width,
            faceColors: Array.apply(null, Array(6)).map(() => {
                return  BABYLON.Color3.FromHexString(color);
            })
        };
        var cube        = BABYLON.MeshBuilder.CreateBox('box', props, _scene);
        cube.position.x = y + height / 2;
        cube.position.y = depth / 2;
        cube.position.z = x + width / 2;

        return cube;
    }

    function csgMesh(mesh1, mesh2, type) {
        var mesh    = BABYLON.CSG.FromMesh(mesh2);

        mesh2.dispose();
        return (mesh1) ? mesh1[type](mesh) : mesh;
    }

    function subtractMesh(mesh1, mesh2) {
        return csgMesh(mesh1, mesh2, 'subtract');
    }

    function unionMesh(mesh1, mesh2) {
        return csgMesh(mesh1, mesh2, 'union');
    }

    function reset() {
        var wall    = null;
        var door    = null;

        for (var i = _scene.meshes.length - 1; i >= 0; i--) {
            _scene.meshes[i].dispose();
        }

        for (var i = 0; _json && i < _json.data.length; i++) {
            var item    = _json.data[i];
            var type    = _json.setting.types[item.type];

            if (_floor < item.floor || _floor > item.floor + type.rate) continue;

            setCube(item.x, item.y, item.width, item.height, 2, type.color);
            if (item.wall.indexOf('top') >= 0) wall = unionMesh(wall, setCube(item.x, item.y, item.width, 4, type.depth, '#ffffff'));
            if (item.wall.indexOf('left') >= 0) wall = unionMesh(wall, setCube(item.x, item.y, 4, item.height, type.depth, '#ffffff'));
            if (item.wall.indexOf('right') >= 0) wall = unionMesh(wall, setCube(item.x + item.width - 4, item.y, 4, item.height, type.depth, '#ffffff'));
            if (item.wall.indexOf('bottom') >= 0) wall = unionMesh(wall, setCube(item.x, item.y + item.height - 4, item.width, 4, type.depth, '#ffffff'));

            for (var j = 0; j < item.door.length; j++) {
                door    = unionMesh(door, setCube(
                    (item.door[j].type === 'width') ? item.x + item.door[j].start + 10 : item.x - 4 + (item.door[j].line === 'right' ? item.width : 0),
                    (item.door[j].type === 'height') ? item.y + item.door[j].start + 10 : item.y - 4 + (item.door[j].line === 'bottom' ? item.height : 0),
                    (item.door[j].type === 'width') ? item.door[j].end - item.door[j].start - 20 : 8,
                    (item.door[j].type === 'height') ? item.door[j].end - item.door[j].start - 20  : 8,
                    type.depth - 10,
                    '#cccccc'
                ));
            }
        }

        if (door) wall = subtractMesh(wall, door.toMesh('door', null, _scene));
        if (wall) wall.toMesh('wall', null, _scene);
    }

    this.setJson = (json) => {
        _json   = JSON.parse(json);
        reset();
    };

    this.setFloor = (floor) => {
        _floor  = floor;
        reset();
    };

    this.setSolidMode = (solid) => {
        if (solid) {
            _camera2.position.x = _camera1.position.x;
            _camera2.position.y = _camera1.position.y;
            _camera2.position.z = _camera1.position.z;
            _scene.activeCamera = _camera2;
        } else {
            _camera1.position.x = _camera2.position.x;
            _camera1.position.y = _camera2.position.y;
            _camera1.position.z = _camera2.position.z;
            _scene.activeCamera = _camera1;
        }
    };

    this.setSize = (width, height) => {
        _engine.setSize(width, height);
    };

    _light2.intensity   = 0.5;
    _scene.clearColor   = new BABYLON.Color3(0.8, 1, 1);
    _camera1.speed       = 10;
    _camera2.speed       = 10;
    _camera1.attachControl(_canvas, false);
    _camera2.attachControl(_canvas, false);
    _engine.runRenderLoop(() => {
        _scene.render();
    });
}
