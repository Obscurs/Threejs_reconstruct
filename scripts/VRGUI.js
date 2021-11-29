import * as THREE from '../build/three.module.js';
import {intersectionObjectLine} from './utils.js';
import {VRGUIPhotoStack} from './VRGUIPhotoStack.js';
import {VRGUIButton} from './VRGUIButton.js';
import {VRGUIPhoto} from './VRGUIPhoto.js';

const MAX_NUM_STACKS = 6
const MAX_SIZE_STACK = 8
export class VRGUI {
	constructor(/*scene, renderer, camera,*/ camera_group) {
		//this.scene = scene
		//this.renderer = renderer
		//this.camera = camera
		this.currentCollections = []
		this.camera_group = camera_group
		this.colSphere = null
		this.photo_stack = null
		this.main_photos = new THREE.Group();
		this.main_photos.name = PointedObjectNames.VR_GUI_GROUP_STACKS
		this.main_photos.type = PointedObjectNames.VR_GUI_TYPE
		const geometryColSphere = new THREE.SphereGeometry( 2, 32, 16 );
		const materialColSphere = new THREE.MeshBasicMaterial( {
						opacity: 0.0,
						transparent: true,
					} );
		materialColSphere.side = THREE.BackSide
		this.colSphere = new THREE.Mesh( geometryColSphere, materialColSphere );
		
		this.camera_group.add(this.colSphere)



		this.ui_group = new THREE.Group();
		this.ui_group.name = PointedObjectNames.VR_GUI_GROUP
		this.ui_group.type = PointedObjectNames.VR_GUI_TYPE
		const material = new THREE.MeshBasicMaterial( { color: 0x555b6e} );
		material.depthTest = false;
		
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(1.000, 1.000), material);
		plane.renderOrder = 1
		plane.name = PointedObjectNames.VR_GUI_PLANE
		plane.type = PointedObjectNames.VR_GUI_TYPE
		plane.parentClass = this;
		function funStartClick() { this.parentClass.onStartClick()}
		function funEndClick() { this.parentClass.onEndClick()}
		function funStartDrag() { this.parentClass.onStartDrag()}
		function funEndDrag() { this.parentClass.onEndDrag()}
		function funCancelClick() { this.parentClass.onCancelClick()}
		function funHover() { this.parentClass.onHover()}
		function funUpdateDrag(p1, p2) { this.parentClass.onUpdateDrag(p1,p2)}
		plane.onStartClick = funStartClick
		plane.onEndClick = funEndClick
		plane.onStartDrag = funStartDrag
		plane.onEndDrag = funEndDrag
		plane.onUpdateDrag = funUpdateDrag
		plane.onCancelClick = funCancelClick
		plane.onHover = funHover



		this.ui_group.add(this.main_photos)
		this.ui_group.add(plane)
		for(var i=0; i < MAX_NUM_STACKS; ++i)
		{
			var testImage = new VRGUIPhoto(this,'https://s3.amazonaws.com/duhaime/blog/tsne-webgl/assets/cat.jpg', 1.05*i,0,0)
			this.main_photos.add(testImage.getGroup())

			//var stack = new VRGUIPhotoStack(this,null,null,null, i)
			//this.photo_stacks.push(stack)
			//this.ui_group.add(stack)
		}

		this.photo_stack = new VRGUIPhotoStack(this, null, null, null)
		this.ui_group.add(this.photo_stack.getGroup())

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
	updatePhotoCollections(collections)
	{
		this.currentCollections = collections
		//TODO update current stack
		//clean stack
		//close stack
		//TODO update mainphotos
		for (var i = this.main_photos.children.length - 1; i >= 0; i--) {
			this.main_photos.children[i].parentClass.clear()
			this.main_photos.remove(this.main_photos.children[i]);
		}
		console.log(collections)
		for(var i=0; i < collections.length; ++i)
		{
			var newImage = new VRGUIPhoto(this,collections[i][0].imagePath, 1.05*i,0,0)
			this.main_photos.add(newImage.getGroup())
		}
		console.log(this.main_photos)
	}
	updateDrag(from, direction)
	{
		/*var globalPosGroup = new THREE.Vector3()
		this.camera_group.getWorldPosition(globalPosGroup)
		globalPosGroup.multiplyScalar(-1)
		from.add(globalPosGroup)*/
		direction.multiplyScalar(-1)
		console.log(this)
		this.updatePositionUI(from, direction)
	}




	onStartClick()
	{

	}
	onEndClick()
	{
		
	}
	onStartDrag()
	{

	}
	onEndDrag()
	{

	}
	onHover()
	{
		console.log("HOVERING")
	}
	onUpdateDrag(from, direction)
	{
		this.updateDrag(from, direction)
	}
	onCancelClick()
	{

	}
	update(dt, pointedObject)
	{

		for(var i=0; i < this.ui_group.children.length; ++i)
		{
			if(this.ui_group.children[i].name == PointedObjectNames.VR_GUI_GROUP)
				this.ui_group.children[i].parentClass.update(dt, pointedObject)
			else if(this.ui_group.children[i].name == PointedObjectNames.VR_GUI_GROUP_STACKS)
			{
				for(var j=0; j < this.ui_group.children[i].children.length; ++ j)
					this.ui_group.children[i].children[j].parentClass.update(dt, pointedObject)
			}
		}
	}
}