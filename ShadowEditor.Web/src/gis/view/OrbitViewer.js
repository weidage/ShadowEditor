import Viewer from './Viewer';
import WGS84 from '../core/WGS84';
import MathUtils from '../utils/MathUtils';

/**
 * 轨道查看器
 * @author tengge / https://github.com/tengge1
 * @param {*} camera 相机
 * @param {*} domElement 文档
 */
function OrbitViewer(camera, domElement) {
    Viewer.call(this, camera, domElement);

    this.sphere = new THREE.Sphere(undefined, WGS84.a);
    this.ray = new THREE.Ray();

    this.isDown = false;
    this.isPan = false;

    this.intersectPoint = new THREE.Vector3();

    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.body.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.domElement.addEventListener('mousewheel', this.onMouseWheel.bind(this));
};

OrbitViewer.prototype = Object.create(Viewer.prototype);
OrbitViewer.prototype.constructor = OrbitViewer;

OrbitViewer.prototype.onMouseDown = function (event) {
    this.isDown = true;
    this.isPan = false;
};

OrbitViewer.prototype.onMouseMove = function () {
    var projectionMatrixInverse = new THREE.Matrix4();
    var matrixWorld = new THREE.Matrix4();
    var lastIntersectPoint = new THREE.Vector3();

    var unit1 = new THREE.Vector3();
    var unit2 = new THREE.Vector3();

    var quat = new THREE.Quaternion();
    var dir = new THREE.Vector3();

    return function (event) {
        if (!this.isDown) {
            return;
        }

        if (!this.isPan) {
            projectionMatrixInverse.getInverse(this.camera.projectionMatrix);
            matrixWorld.copy(this.camera.matrixWorld);

            if (!this.intersectSphere(event.offsetX, event.offsetY, projectionMatrixInverse, matrixWorld)) { // 鼠标在地球外
                return;
            }

            this.isPan = true;
            lastIntersectPoint.copy(this.intersectPoint);
            return;
        }

        if (!this.intersectSphere(event.offsetX, event.offsetY, projectionMatrixInverse, matrixWorld)) { // 鼠标在地球外
            return;
        }

        unit1.copy(lastIntersectPoint).normalize();
        unit2.copy(this.intersectPoint).normalize();

        quat.setFromUnitVectors(unit2, unit1);

        var distance = this.camera.position.length();
        dir.copy(this.camera.position).normalize();
        dir.applyQuaternion(quat).normalize();

        this.camera.position.set(
            distance * dir.x,
            distance * dir.y,
            distance * dir.z,
        );

        this.camera.lookAt(this.sphere.center);

        lastIntersectPoint.copy(this.intersectPoint);
    };
}();

OrbitViewer.prototype.onMouseUp = function (event) {
    this.isDown = false;
    this.isPan = false;
};

OrbitViewer.prototype.onMouseWheel = function () {
    var dir = new THREE.Vector3();

    return function (event) {
        var delta = -event.wheelDelta;

        var distance = dir.copy(this.camera.position).length();
        dir.copy(this.camera.position).normalize();

        if (distance < WGS84.a) {
            distance = WGS84.a;
        }

        var d = delta * (distance - WGS84.a) / 1000;

        var d0 = MathUtils.zoomToAlt(0) + WGS84.a;

        if (distance + d >= d0) { // 最远0层级距离
            d = 0;
        }

        this.camera.position.set(
            this.camera.position.x + d * dir.x,
            this.camera.position.y + d * dir.y,
            this.camera.position.z + d * dir.z,
        );
    };
}();

/**
 * 计算屏幕坐标与地球表面交点
 * @param {float} x 屏幕坐标X
 * @param {float} y 屏幕坐标Y
 * @param {THREE.Matrix4} projectionMatrixInverse 投影矩阵逆矩阵
 * @param {THREE.Matrix4} matrixWorld 相机矩阵
 */
OrbitViewer.prototype.intersectSphere = function (x, y, projectionMatrixInverse, matrixWorld) {
    this.ray.origin.set(
        x / this.domElement.clientWidth * 2 - 1, -y / this.domElement.clientHeight * 2 + 1,
        0.1,
    );
    this.ray.direction.copy(this.ray.origin);
    this.ray.direction.z = 1;

    this.ray.origin.applyMatrix4(projectionMatrixInverse).applyMatrix4(matrixWorld);
    this.ray.direction.applyMatrix4(projectionMatrixInverse).applyMatrix4(matrixWorld).sub(this.ray.origin).normalize();

    return this.ray.intersectSphere(this.sphere, this.intersectPoint);
};

OrbitViewer.prototype.setPosition = function (lon, lat, alt) {
    var xyz = MathUtils.lonlatToXYZ(new THREE.Vector3(lon, lat, alt));
    this.camera.position.copy(xyz);
    this.camera.lookAt(new THREE.Vector3());
};

OrbitViewer.prototype.getPosition = function () {

};

OrbitViewer.prototype.update = function () {

};

OrbitViewer.prototype.dispose = function () {
    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.domElement.removeEventListener('mousemove', this.onMouseMove);
    document.body.removeEventListener('mouseup', this.onMouseUp);
    this.domElement.addEventListener('mousewheel', null);

    Viewer.prototype.dispose.call(this);
};

export default OrbitViewer;