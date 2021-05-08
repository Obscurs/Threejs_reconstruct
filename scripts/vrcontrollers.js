
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'; 
import {
    Mesh,
    MeshBasicMaterial,
    Vector3,
    PointLight,
    PlaneGeometry,
    TextureLoader,
    BufferGeometry,
    BufferAttribute,
    LineBasicMaterial,
    AdditiveBlending,
    Line
} from 'three';

function positionAtT(inVec,t,p,v,g) {
    inVec.copy(p);
    inVec.addScaledVector(v,t);
    inVec.addScaledVector(g,0.5*t**2);
    return inVec;
}

// Utility Vectors
const g = new Vector3(0,-9.8,0);
const tempVec = new Vector3();
const tempVec1 = new Vector3();
const tempVecP = new Vector3();
const tempVecV = new Vector3();

// The guideline
const lineSegments=10;
const lineGeometry = new BufferGeometry();
const lineGeometryVertices = new Float32Array((lineSegments +1) * 3);
lineGeometryVertices.fill(0);
const lineGeometryColors = new Float32Array((lineSegments +1) * 3);
lineGeometryColors.fill(0.5);
lineGeometry.setAttribute('position', new BufferAttribute(lineGeometryVertices, 3));
lineGeometry.setAttribute('color', new BufferAttribute(lineGeometryColors, 3));
const lineMaterial = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending });
const guideline = new Line( lineGeometry, lineMaterial );

// The light at the end of the line
const guidelight = new PointLight(0xffeeaa, 0, 2);

// The target on the ground
const guidespriteTexture = new TextureLoader().load('./assets/target.png');
const guidesprite = new Mesh(
    new PlaneGeometry(0.3, 0.3, 1, 1),
    new MeshBasicMaterial({
        map: guidespriteTexture,
        blending: AdditiveBlending,
        color: 0x555555,
        transparent: true
    })
);
guidesprite.rotation.x = -Math.PI/2;


const controller1 = renderer.xr.getController(0);
controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
cameraGroup.add(controller1);
let guidingController = null;

const controller2 = renderer.xr.getController(1);
controller2.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectend', onSelectEnd);
cameraGroup.add(controller2);

const controllerModelFactory = new XRControllerModelFactory();

const controllerGrip1 = renderer.xr.getControllerGrip(0);
const model1 = controllerModelFactory.createControllerModel( controllerGrip1 );
controllerGrip1.add( model1 );
cameraGroup.add( controllerGrip1 );

const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
const model2 = controllerModelFactory.createControllerModel( controllerGrip2 );
controllerGrip2.add( model2 );
cameraGroup.add( controllerGrip2 );

function onSelectStart() {
    guidingController = this;
    guidelight.intensity = 1;
    this.add(guideline);
    scene.add(guidesprite);
}

function onSelectEnd() {
    if (guidingController === this) {

        // first work out vector from feet to cursor

        // feet position
        const feetPos = renderer.xr.getCamera(camera).getWorldPosition(tempVec);
        feetPos.y = 0;

        // cursor position
        const p = guidingController.getWorldPosition(tempVecP);
        const v = guidingController.getWorldDirection(tempVecV);
        v.multiplyScalar(6);
        const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;
        const cursorPos = positionAtT(tempVec1,t,p,v,g);

        // Offset
        const offset = cursorPos.addScaledVector(feetPos ,-1);

        // Do the locomotion
        locomotion(offset);

        // clean up
        guidingController = null;
        guidelight.intensity = 0;
        this.remove(guideline);
        scene.remove(guidesprite);
    }
}

export {
    controller1,
    controller2,
    controllerGrip1,
    controllerGrip2
}