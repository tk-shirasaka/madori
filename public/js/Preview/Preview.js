function Preview() {
    'use strict'

    var canvas      = document.getElementById('preview');
    var scene       = new THREE.Scene();
    var camera      = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight);
    var light1      = new THREE.DirectionalLight(0xffffff);
    var light2      = new THREE.DirectionalLight(0x999999);
    var renderer    = new THREE.WebGLRenderer({canvas: canvas});
    var controls    = new THREE.Controller(camera, renderer.domElement);


    function setCube(x, y, width, height, depth, color) {
        var geometry    = new THREE.BoxBufferGeometry(width, depth, height);
        var material    = new THREE.MeshStandardMaterial({color: color});
        var cube        = new THREE.Mesh(geometry, material);

        cube.position.set(x + width / 2, depth / 2, y + height / 2);
        scene.add(cube);
    }

    this.setJson = (json) => {
        this.dispose();
        scene.add(light1);
        scene.add(light2);
        json    = JSON.parse(json);
        for (var i = 0; i < json.data.length; i++) {
            if (json.setting.floor !== json.data[i].floor) continue;
            var item    = json.data[i];
            var type    = json.setting.types[item.type];

            setCube(item.x, item.y, item.width, item.height, 2, type.color);
            if (item.wall.indexOf('top') >= 0) setCube(item.x, item.y, item.width, 4, type.depth, '#ffffff');
            if (item.wall.indexOf('left') >= 0) setCube(item.x, item.y, 4, item.height, type.depth, '#ffffff');
            if (item.wall.indexOf('right') >= 0) setCube(item.x + item.width, item.y, 4, item.height, type.depth, '#ffffff');
            if (item.wall.indexOf('bottom') >= 0) setCube(item.x, item.y + item.height, item.width, 4, type.depth, '#ffffff');
        }
    };

    this.dispose = () => {
        for (var i = scene.children.length - 1; i >= 0; i--) {
            scene.remove(scene.children[i]);
        }
        renderer.dispose();
    };

    this.setScale = (scale) => {
        scene.scale.set(scale, scale, scale);
    };

    this.setSize = (width, height) => {
        renderer.setSize(width, height);
    };

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }


    camera.position.y = 150;
    camera.position.z = 500;
    light1.position.set(100, 100, 100);
    light2.position.set(-100, -100, -100);
    render();

    renderer.setClearColor(0xccffff);
}
