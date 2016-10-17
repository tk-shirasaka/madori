function Preview(madori) {
    'use strict'

    var canvas      = document.getElementById('preview');
    var scene       = new THREE.Scene();
    var camera      = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight);
    var light1      = new THREE.DirectionalLight(0xffffff);
    var light2      = new THREE.DirectionalLight(0x999999);
    var light3      = new THREE.AmbientLight(0x222222);
    var renderer    = new THREE.WebGLRenderer({canvas: canvas});
    var controls    = new THREE.Controller(camera, renderer.domElement);


    function setCube(x, y, width, height, depth, color) {
        var geometry = new THREE.BoxBufferGeometry(width, depth, height);
        var material = new THREE.MeshStandardMaterial({color: color});
        var cube = new THREE.Mesh(geometry, material);

        cube.position.set(x + width / 2, depth / 2, y + height / 2);
        scene.add(cube);
    }

    function setMadoriCube(item) {
        setCube(item.x, item.y, item.width, item.height, 2, madori.setting.types[item.type].color);

        if (item.wall.indexOf('top') >= 0) setCube(item.x, item.y, item.width, 4, 250, '#ffffff');
        if (item.wall.indexOf('left') >= 0) setCube(item.x, item.y, 4, item.height, 250, '#ffffff');
        if (item.wall.indexOf('right') >= 0) setCube(item.x + item.width, item.y, 4, item.height, 250, '#ffffff');
        if (item.wall.indexOf('bottom') >= 0) setCube(item.x, item.y + item.height, item.width, 4, 250, '#ffffff');
    }

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    for (var i = 0; i < madori.data.length; i++) {
        if (madori.setting.floor !== madori.data[i].floor) continue;
        setMadoriCube(madori.data[i]);
    }


    camera.position.y = 150;
    camera.position.z = 500;
    light1.position.set(1, 1, 1);
    scene.add(light1);
    light2.position.set(-1, -1, -1);
    scene.add(light2);
    scene.add(light3);
    render();

    renderer.setClearColor(0xccffff);
    return renderer;
}
