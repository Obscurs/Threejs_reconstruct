import * as THREE from '../../build/three.module.js';
import {intersectionObjectLine} from './../utils.js';
import {VRGUIPhotoStack} from './VRGUIPhotoStack.js';
import {VRGUIButton} from './VRGUIButton.js';
import {VRGUIPhoto} from './VRGUIPhoto.js';
import {VRGUIZoomedPhoto} from './VRGUIZoomedPhoto.js';
import {VRGUIQuestionarie} from './VRGUIQuestionarie.js';
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
		this.photo_stack = new VRGUIPhotoStack()
		this.photo_stack.setScale(2.0,2.0,1.0)
		this.photo_stack.setPosition(0,1.6,0)
		this.zoomed_photo = new VRGUIZoomedPhoto()
		this.zoomed_photo.setPosition(0,0,0.1)
		this.main_photos = new UIElement("Main Photos", true);
		this.project_capture = false
		this.current_col_index_highlighted = -1
		this.texPanel = null
		this.panel = null
		this.questionarie = null


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



		var loader = new THREE.TextureLoader();
		this.texPanel = loader.load('../assets/UI/panels/horizontal_panel.png')
		this.materialPanel = new THREE.MeshBasicMaterial( { map: this.texPanel, transparent: true, opacity: 0.8,} );

		this.panel = new THREE.Mesh(new THREE.PlaneGeometry(4.000, 1.000), this.materialPanel);
		//this.panel.renderOrder = 1
		this.panel.name = PointedObjectNames.VR_GUI_PLANE
		this.panel.hasClickFunctions = true

		function funStartClick() { this.parent.onStartClick()}
		function funEndClick() { this.parent.onEndClick()}
		function funStartDrag() { this.parent.onStartDrag()}
		function funEndDrag() { this.parent.onEndDrag()}
		function funCancelClick() { this.parent.onCancelClick()}
		function funHover() { this.parent.onHover()}
		function funUpdateDrag(p1, p2) { this.parent.onUpdateDrag(p1,p2)}
		function funDispose() {}
		this.panel.onStartClick = funStartClick
		this.panel.onEndClick = funEndClick
		this.panel.onStartDrag = funStartDrag
		this.panel.onEndDrag = funEndDrag
		this.panel.onUpdateDrag = funUpdateDrag
		this.panel.onCancelClick = funCancelClick
		this.panel.dispose = funDispose
		this.panel.onHover = funHover

		this.questionarie = new VRGUIQuestionarie(-2.75,0,0,1)

		this.add(this.questionarie)
		this.add(this.main_photos)
		this.add(this.panel)
		this.add(this.zoomed_photo)
		this.add(this.photo_stack)

		this.camera_group.add(this)

		const auxDir = new THREE.Vector3(-1,1,-1)
		auxDir.normalize()
		const auxPos = new THREE.Vector3()
		this.camera_group.getWorldPosition(auxPos);
		this.updatePositionUI(auxPos,auxDir)
	}
	dispose()
	{
		super.dispose()
		this.panel.material.dispose()
		this.panel.geometry.dispose()
		this.texPanel.dispose()
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
	getCameraCapture()
	{
		return this.c_capture_selected.getCameraCapture()
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
			const newImage = new VRGUIPhoto(collections[i][0].imagePath,collections[i][0].index, i,collections[i][0].camInfo, 1.1*0.66*(i+0.70)-2,0,0, 0.66)
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
	displayImageCollection(index_capture, collection_index)
	{
		if(this.current_col_index_highlighted != -1)
		{
			this.main_photos.children[this.current_col_index_highlighted].setHighlighted(false)
		}
		this.current_col_index_highlighted = collection_index
		this.main_photos.children[this.current_col_index_highlighted].setHighlighted(true)



		this.photo_stack.disposePage()
		this.photo_stack.setImages(this.currentCollections[collection_index], collection_index)
		this.photo_stack.generatePage()
		this.photo_stack.setVisible(true)
	}

	changeCaptureInView(camera, scene)
	{
		this.c_capture_selected.setCapture(camera, scene)
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
		this.c_capture_selected.setEnabled(false)
		this.visible = true
	}

	
}