function Preview(canvas) {
    var _json       = null;
    var _floor      = null;
    var _engine     = new BABYLON.Engine(canvas, true);
    var _scene      = new BABYLON.Scene(_engine);
    var _camera1    = new BABYLON.TouchCamera('camera1', new BABYLON.Vector3(0, 150, 0), _scene);
    var _camera2    = new BABYLON.VRDeviceOrientationFreeCamera('camera2', new BABYLON.Vector3(0, 150, 0), _scene, 0);
    var _light1     = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(100, 100, 100), _scene);
    var _light2     = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(-100, 100, -100), _scene);
    var _materials  = {
        flooring:   new BABYLON.StandardMaterial('flooring', _scene),
        tatami:     new BABYLON.StandardMaterial('tatami', _scene),
        tile:       new BABYLON.StandardMaterial('tile', _scene),
        wall:       new BABYLON.StandardMaterial('wall', _scene),
    };


    function setCube(x, y, width, height, depth, material) {
        var props       = {
            width:      height,
            height:     depth,
            depth:      width,
        };
        var cube        = BABYLON.MeshBuilder.CreateBox('box', props, _scene);
        cube.position.x = y + height / 2;
        cube.position.y = depth / 2;
        cube.position.z = x + width / 2;
        cube.material   =   material;

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

            setCube(item.x, item.y, item.width, item.height, 2, _materials[type.material]);
            if (item.wall.indexOf('top') >= 0) wall = unionMesh(wall, setCube(item.x, item.y, item.width, 4, type.depth));
            if (item.wall.indexOf('left') >= 0) wall = unionMesh(wall, setCube(item.x, item.y, 4, item.height, type.depth));
            if (item.wall.indexOf('right') >= 0) wall = unionMesh(wall, setCube(item.x + item.width - 4, item.y, 4, item.height, type.depth));
            if (item.wall.indexOf('bottom') >= 0) wall = unionMesh(wall, setCube(item.x, item.y + item.height - 4, item.width, 4, type.depth));

            for (var j = 0; j < item.door.length; j++) {
                door    = unionMesh(door, setCube(
                    (item.door[j].type === 'width') ? item.x + item.door[j].start + 10 : item.x - 4 + (item.door[j].line === 'right' ? item.width : 0),
                    (item.door[j].type === 'height') ? item.y + item.door[j].start + 10 : item.y - 4 + (item.door[j].line === 'bottom' ? item.height : 0),
                    (item.door[j].type === 'width') ? item.door[j].end - item.door[j].start - 20 : 8,
                    (item.door[j].type === 'height') ? item.door[j].end - item.door[j].start - 20  : 8,
                    type.depth - 10
                ));
            }
        }

        if (door) wall = subtractMesh(wall, door.toMesh('door', null, _scene));
        if (wall) wall.toMesh('wall', null, _scene).material = _materials.wall;
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
            _engine.switchFullscreen(true);
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

    _scene.clearColor                   = new BABYLON.Color3(0.8, 1, 1);
    _materials.flooring.diffuseTexture  = new BABYLON.Texture('/texture/flooring.jpg', _scene);
    _materials.tatami.diffuseTexture    = new BABYLON.Texture('/texture/tatami.jpg', _scene);
    _materials.tile.diffuseTexture      = new BABYLON.Texture('/texture/tile.jpg', _scene);
    _materials.wall.diffuseTexture      = new BABYLON.Texture('/texture/wall.jpg', _scene);
    _camera1.speed                      = 10;
    _camera2.speed                      = 10;
    _camera1.attachControl(canvas, false);
    _camera2.attachControl(canvas, false);
    _engine.runRenderLoop(() => {
        _scene.render();
    });
}
