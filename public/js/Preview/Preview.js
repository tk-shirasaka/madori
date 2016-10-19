function Preview() {
    'use strict'

    var _canvas     = document.getElementById('preview');
    var _json       = null;
    var _scale      = 1;
    var _floor      = null;
    var _scene      = new THREE.Scene();
    var _camera     = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight);
    var _light1     = new THREE.DirectionalLight(0xffffff);
    var _light2     = new THREE.DirectionalLight(0x999999);
    var _renderer   = new THREE.WebGLRenderer({canvas: _canvas});
    var _controls   = new THREE.Controller(_camera, _renderer.domElement);


    function setCube(x, y, width, height, depth, color) {
        var geometry    = new THREE.BoxBufferGeometry(width, depth, height);
        var material    = new THREE.MeshStandardMaterial({color: color});
        var cube        = new THREE.Mesh(geometry, material);

        cube.position.set(x + width / 2, depth / 2, y + height / 2);
        _scene.add(cube);
    }

    function dispose() {
        for (var i = _scene.children.length - 1; i >= 0; i--) {
            _scene.remove(_scene.children[i]);
        }
        _renderer.dispose();
    }

    function reset() {
        dispose();
        _scene.add(_light1);
        _scene.add(_light2);
        for (var i = 0; _json && i < _json.data.length; i++) {
            var item    = _json.data[i];
            var type    = _json.setting.types[item.type];

            if (_floor < item.floor || _floor > item.floor + type.rate) continue;

            setCube(item.x, item.y, item.width, item.height, 2, type.color);
            if (item.wall.indexOf('top') >= 0) setCube(item.x, item.y, item.width, 4, type.depth, '#ffffff');
            if (item.wall.indexOf('left') >= 0) setCube(item.x, item.y, 4, item.height, type.depth, '#ffffff');
            if (item.wall.indexOf('right') >= 0) setCube(item.x + item.width - 4, item.y, 4, item.height, type.depth, '#ffffff');
            if (item.wall.indexOf('bottom') >= 0) setCube(item.x, item.y + item.height - 4, item.width, 4, type.depth, '#ffffff');
        }
    }

    function render() {
        requestAnimationFrame(render);
        _renderer.render(_scene, _camera);
    }

    this.setJson = (json) => {
        _json   = JSON.parse(json);
        reset();
    };

    this.setFloor = (floor) => {
        _floor  = floor;
        reset();
    };

    this.setViewHeight = (height) => {
        _camera.position.y = height;
    };

    this.setSize = (width, height) => {
        _renderer.setSize(width, height);
    };


    _camera.position.y = 150;
    _camera.position.z = 500;
    _light1.position.set(100, 100, 100);
    _light2.position.set(-100, -100, -100);
    render();

    _renderer.setClearColor(0xccffff);
}
