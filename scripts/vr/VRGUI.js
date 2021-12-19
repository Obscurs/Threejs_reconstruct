import * as THREE from '../../build/three.module.js';
import {intersectionObjectLine} from './../utils.js';
import {VRGUIPhotoStack} from './VRGUIPhotoStack.js';
import {VRGUIButton} from './VRGUIButton.js';
import {VRGUIPhoto} from './VRGUIPhoto.js';
import {VRGUIZoomedPhoto} from './VRGUIZoomedPhoto.js';
import {UIElement} from './../ui/UIElement.js';
import { CaptureSelected } from './../CaptureSelected.js';

const MAX_NUM_STACKS = 6
const MAX_SIZE_STACK = 8
export class VRGUI extends UIElement {
	constructor(camera_group) {
		super("VR GUI", false)

		this.hasClickFunctions = true
		this.c_capture_selected = null;
		this.currentCollections = []
		this.camera_group = camera_group
		this.colSphere = null
		this.photo_stack = null
		this.zoomed_photo = new VRGUIZoomedPhoto()
		this.main_photos = new UIElement("Main Photos", true);
		this.project_capture = false


		/*this.main_photos.name = PointedObjectNames.VR_GUI_GROUP_STACKS
		this.isGUI = true*/
		const geometryColSphere = new THREE.SphereGeometry( 2, 32, 16 );
		const materialColSphere = new THREE.MeshBasicMaterial( {
						opacity: 0.0,
						transparent: true,
					} );
		materialColSphere.side = THREE.BackSide
		this.colSphere = new THREE.Mesh( geometryColSphere, materialColSphere );
		
		this.camera_group.add(this.colSphere)



		/*this.type = PointedObjectNames.VR_COMPLEX_GROUP
		this.name = PointedObjectNames.VR_GUI*/
		const material = new THREE.MeshBasicMaterial( { color: 0x555b6e} );
		material.depthTest = false;
		
		const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.000, 1.000), material);
		plane.renderOrder = 1
		plane.name = PointedObjectNames.VR_GUI_PLANE
		plane.hasClickFunctions = true

		function funStartClick() { this.parent.onStartClick()}
		function funEndClick() { this.parent.onEndClick()}
		function funStartDrag() { this.parent.onStartDrag()}
		function funEndDrag() { this.parent.onEndDrag()}
		function funCancelClick() { this.parent.onCancelClick()}
		function funHover() { this.parent.onHover()}
		function funUpdateDrag(p1, p2) { this.parent.onUpdateDrag(p1,p2)}
		plane.onStartClick = funStartClick
		plane.onEndClick = funEndClick
		plane.onStartDrag = funStartDrag
		plane.onEndDrag = funEndDrag
		plane.onUpdateDrag = funUpdateDrag
		plane.onCancelClick = funCancelClick
		plane.onHover = funHover

		


		this.add(this.main_photos)
		this.add(plane)
		this.add(this.zoomed_photo)
		/*for(var i=0; i < MAX_NUM_STACKS; ++i)
		{
			testObj = {
				width: 100,
				height: 100,

			}
			var testImage = new VRGUIPhoto('https://s3.amazonaws.com/duhaime/blog/tsne-webgl/assets/cat.jpg',0,testObj, 1.05*i,0,0)
			this.main_photos.add(testImage)

			//var stack = new VRGUIPhotoStack(this,null,null,null, i)
			//this.photo_stacks.push(stack)
			//this.add(stack)
		}*/

		this.photo_stack = null/*new VRGUIPhotoStack(null, null, null)*/
		//this.add(this.photo_stack)

		this.camera_group.add(this)

		const auxDir = new THREE.Vector3(-1,1,-1)
		auxDir.normalize()
		const auxPos = new THREE.Vector3()
		this.camera_group.getWorldPosition(auxPos);
		this.updatePositionUI(auxPos,auxDir)
	}
	restart(scene)
	{
		if(this.c_capture_selected)
		{
			this.c_capture_selected.dispose()
		}
		this.c_capture_selected = new CaptureSelected(scene)

		this.zoomed_photo.setImage(null)
	}
	updatePositionUI(from, direction)
	{
		const intersect = intersectionObjectLine([this.colSphere], from, direction)
		if(intersect != null)
		{
			intersect.point.x = intersect.point.x -this.camera_group.position.x
			intersect.point.y = intersect.point.y -this.camera_group.position.y
			intersect.point.z = intersect.point.z -this.camera_group.position.z
			this.position.copy(intersect.point)
			this.lookAt(this.camera_group.position)
		}
	}
	getProjectCapture()
	{
		return this.project_capture
	}
	setProjectCapture(value)
	{
		this.project_capture = value
	}
	updatePhotoCollections(collections)
	{
		this.currentCollections = collections
		//TODO update current stack
		//clean stack
		//close stack
		//TODO update mainphotos
		for (let i = this.main_photos.children.length - 1; i >= 0; i--) {
			this.main_photos.children[i].dispose()
			this.main_photos.remove(this.main_photos.children[i]);
		}
		for(let i=0; i < collections.length; ++i)
		{
			const newImage = new VRGUIPhoto(collections[i][0].imagePath,collections[i][0].index,collections[i][0].camInfo, 1.05*i,0,0)
			this.main_photos.add(newImage)
		}
	}
	updateDrag(from, direction)
	{
		/*var globalPosGroup = new THREE.Vector3()
		this.camera_group.getWorldPosition(globalPosGroup)
		globalPosGroup.multiplyScalar(-1)
		from.add(globalPosGroup)*/
		direction.multiplyScalar(-1)
		this.updatePositionUI(from, direction)
	}
	onUpdateDrag(from, direction)
	{
		this.updateDrag(from, direction)
	}


	changeCaptureInView(camera, scene, sceneModels)
	{
		this.c_capture_selected.setCapture(camera, scene, sceneModels)
	}

	hideShowZoomedImage(renderer, scene, show)
	{
		if(show)
		{
			const meshZoomed = this.c_capture_selected.getCaptureResult()
			this.c_capture_selected.setEnabled(true)

			this.zoomed_photo.setImage(meshZoomed)
			this.zoomed_photo.show()
		}
		else
			this.zoomed_photo.hide()
		
	}
	render(renderer, scene)
	{
		this.visible = false
		this.c_capture_selected.render(renderer, scene, true)
		this.visible = true
	}

	
}