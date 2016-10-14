function Preview(madori) {
    'use strict'

    var scene       = new THREE.Scene();
    var camera      = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var light       = new THREE.AmbientLight(0xffffff);
    var renderer    = new THREE.WebGLRenderer();


    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    function setCube(x, y, width, height, depth, color) {
        var geometry = new THREE.BoxBufferGeometry(width, -height, depth);
        var material = new THREE.MeshLambertMaterial({color: color});
        var cube = new THREE.Mesh(geometry, material);

        cube.position.set(x + width / 2, -y - height / 2, depth / 2);
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
        setMadoriCube(madori.data[i]);
    }

    camera.position.set(window.innerWidth / 2, 0, 1000);
    light.position.set(window.innerWidth / 2, 0, -1000);
    scene.add(light);
    render();
}
