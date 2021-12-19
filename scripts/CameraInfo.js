import * as THREE from '../build/three.module.js';
export class CameraInfo {
	constructor() {
		this.spriteProperties = {
			minSel: -1,
			maxSel: -1,
			indexInGroup: -1,
			//selected: false,
		}
		this.similitudes = [];
		this.similitudes_indices_ordered = [];
		this.rays = [];
	}
	
	initFromValues(name, width, height, matrix, focal, camera)
	{
		this.name = name;
		this.width = width;
		this.height = height;
		this.matrix = matrix;
		this.focal = focal;

		this.camera = camera;
		
	}

	initFromLoad(element)
	{
		console.log("      Loading Camera "+element.name+" ...")

	 	const m = new THREE.Matrix4();
		m.set( element.m1, element.m2, element.m3, element.tx,
	       element.m4, element.m5, element.m6, element.ty,
	       element.m7, element.m8, element.m9, element.tz,
	       0, 0, 0, 1 );
		m.invert();


		const m2 = new THREE.Matrix4();

		m2.makeRotationX(THREE.Math.degToRad(-90))
		m2.multiply(m)




		const fov_y = 2*Math.atan(element.height/(2*element.f))
		const fov_x = 2*Math.atan(element.width/(2*element.f))

		const capture_camera = new THREE.PerspectiveCamera( fov_y*(180/Math.PI), element.width / element.height, 0.1, 100 );

		capture_camera.applyMatrix4(m2);
		capture_camera.name = element.name


		capture_camera.updateMatrixWorld();
		capture_camera.updateProjectionMatrix();
		

		this.name = element.name;
		this.width = element.width;
		this.height = element.height;
		this.matrix = m;
		this.focal = element.f;
		this.camera = capture_camera;
		
		console.log("      Loading Camera "+element.name+" : DONE")
	}



}
