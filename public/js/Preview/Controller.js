THREE.Controller = function(object, domElement) {
    var viewpoint   = {};

    function getEventPointer(e) {
        if (e.type.match(/^touch/)) return {x: e.touches[0].pageX, y: e.touches[0].pageY};
        if (e.type.match(/^mouse/)) return {x: e.pageX, y: e.pageY};
    }

    function setViewpoint(x, y) {
        var maxX            = Math.PI / 2;
        var maxY            = Math.PI;
        object.rotation.x  += Math.PI / 2 / domElement.offsetHeight * (y - viewpoint.y);
        object.rotation.y  += Math.PI / 2 / domElement.offsetWidth * (x - viewpoint.x);
        viewpoint.x         = x;
        viewpoint.y         = y;

        if (object.rotation.x > maxX) object.rotation.x = maxX;
        if (object.rotation.x < -maxX) object.rotation.x = -maxX;
        if (object.rotation.y > maxY) object.rotation.y -= maxY * 2;
        if (object.rotation.y < -maxY) object.rotation.y += maxY * 2;
    }

    function setPosition(speed) {
        object.position.x  += Math.sin(object.rotation.y) * speed;
        object.position.z  += Math.sin(object.rotation.y + Math.PI / 2) * speed;
    }

    function initViewpoint(e, moveEvent, endEvent) {
        viewpoint               = getEventPointer(e);
        domElement.style.cursor = 'move';
        domElement.addEventListener(moveEvent, shiftViewpoint);
        domElement.addEventListener(endEvent, () => {
            domElement.removeEventListener(moveEvent, shiftViewpoint);
            domElement.style.cursor = '';
        });
    }

    function mousedown(e) {
        initViewpoint(e, 'mousemove', 'mouseup');
    }

    function touchstart(e) {
        initViewpoint(e, 'touchmove', 'touchend');
    }

    function shiftViewpoint(e) {
        var ptr = getEventPointer(e);
        setViewpoint(ptr.x, ptr.y);
    }

    function wheel(e) {
        setPosition(e.deltaY * 0.1);
    }

    object.rotation.order = 'YXZ';
    domElement.addEventListener('contextmenu', () => (false));
    domElement.addEventListener('mousedown', mousedown);
    domElement.addEventListener('touchstart', touchstart);
    domElement.addEventListener('wheel', wheel);
};

THREE.Controller.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.Controller.prototype.constructor = THREE.Controller;
