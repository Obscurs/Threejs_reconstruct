import * as THREE from '../build/three.module.js';
import {intersectionObjectLine} from './utils.js';
export class VRGUI {
	constructor(/*scene, renderer, camera,*/ camera_group) {
		//this.scene = scene
		//this.renderer = renderer
		//this.camera = camera
		this.camera_group = camera_group
		this.colSphere = null

		const geometryColSphere = new THREE.SphereGeometry( 2, 32, 16 );
		const materialColSphere = new THREE.MeshBasicMaterial( {
						opacity: 0.5,
						transparent: true,
					} );
		materialColSphere.side = THREE.BackSide
		this.colSphere = new THREE.Mesh( geometryColSphere, materialColSphere );
		
		this.camera_group.add(this.colSphere)



		this.ui_group = new THREE.Group();
		this.ui_group.name = PointedObjectNames.VR_GUI
		this.ui_group.type = PointedObjectNames.VR_GUI_TYPE
		const material = new THREE.MeshBasicMaterial( { color: 0xff0000} );
		material.depthTest = false;
		
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(1.000, 1.000), material);
		plane.renderOrder = 1
		plane.name = PointedObjectNames.VR_GUI_PLANE
		plane.type = PointedObjectNames.VR_GUI_TYPE



		this.ui_group.add(plane)
		this.camera_group.add(this.ui_group)

		var auxDir = new THREE.Vector3(-1,1,-1)
		auxDir.normalize()
		var auxPos = new THREE.Vector3()
		this.camera_group.getWorldPosition(auxPos);
		this.updatePositionUI(auxPos,auxDir)
	}

	updatePositionUI(from, direction)
	{
		var intersect = intersectionObjectLine([this.colSphere], from, direction)
		if(intersect != null)
		{
			intersect.point.x = intersect.point.x -this.camera_group.position.x
			intersect.point.y = intersect.point.y -this.camera_group.position.y
			intersect.point.z = intersect.point.z -this.camera_group.position.z
			this.ui_group.position.copy(intersect.point)
			this.ui_group.lookAt(this.camera_group.position)
		}

		
		

	}
	getGroup()
	{
		return this.ui_group
	}
	updateDrag(from, direction)
	{
		/*var globalPosGroup = new THREE.Vector3()
		this.camera_group.getWorldPosition(globalPosGroup)
		globalPosGroup.multiplyScalar(-1)
		from.add(globalPosGroup)*/
		direction.multiplyScalar(-1)
		console.log(from)
		this.updatePositionUI(from, direction)
	}
}