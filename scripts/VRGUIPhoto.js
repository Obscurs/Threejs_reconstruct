import * as THREE from '../build/three.module.js';
import {VRGUIButton} from './VRGUIButton.js';
const OFFSET_Z = 0.05
export class VRGUIPhoto {
	constructor(parent, pathImage, offset_x, offset_y, offset_z) {
		this.parent = parent
		this.group = new THREE.Group();
		this.group.parentClass = this;
		this.group.name = PointedObjectNames.VR_GUI_GROUP
		this.group.type = PointedObjectNames.VR_GUI_TYPE
		this.mesh = null
		this.hovering = false

		this.texture = null
		//this.renderOrderMin = renderOrderMin


		//CREATE THE IMAGE
		var loader = new THREE.TextureLoader();
		this.texture = loader.load(pathImage)
		var materialImage = new THREE.MeshBasicMaterial({
		  map: this.texture
		});
		materialImage.depthTest = false;
		// create a plane geometry for the image with a width of 10
		// and a height that preserves the image's aspect ratio
		var geometryImage = new THREE.PlaneGeometry(0.8, 0.8);

		// combine our image geometry and material into a mesh
		this.mesh = new THREE.Mesh(geometryImage, materialImage);
		this.mesh.renderOrder = 1
		// set the position of the image mesh in the x,y,z dimensions
		this.mesh.position.set(offset_x,offset_y,OFFSET_Z+offset_z)



		this.mesh.name = PointedObjectNames.VR_GUI_IMAGE
		this.mesh.type = PointedObjectNames.VR_GUI_TYPE
		this.mesh.parentClass = this;
		function funStartClick() { this.parentClass.onStartClick()}
		function funEndClick() { this.parentClass.onEndClick()}
		function funStartDrag() { this.parentClass.onStartDrag()}
		function funEndDrag() { this.parentClass.onEndDrag()}
		function funCancelClick() { this.parentClass.onCancelClick()}
		//function funHover() { this.parentClass.onHover()}
		function funUpdateDrag(p1, p2) { this.parentClass.onUpdateDrag(p1,p2)}
		this.mesh.onStartClick = funStartClick
		this.mesh.onEndClick = funEndClick
		this.mesh.onStartDrag = funStartDrag
		this.mesh.onEndDrag = funEndDrag
		this.mesh.onUpdateDrag = funUpdateDrag
		this.mesh.onCancelClick = funCancelClick
		//mesh.onHover = funHover

		// add the image to the scene

		this.group.add(this.mesh);
		


		this.button1 = new VRGUIButton(this)
		this.button1.initButtonIcon('../assets/UI/open_button', 0.233)
		this.button1.setPosition(offset_x,0.25+offset_y,0.1+offset_z)
		this.button1.setScale(0.5, 0.5, 0.5)
		this.group.add(this.button1.getGroup())

		this.button2 = new VRGUIButton(this)
		this.button2.initButtonIcon('../assets/UI/project_button', 0.233)
		this.button2.setPosition(offset_x,0.09+offset_y,0.1+offset_z)
		this.button2.setScale(0.5, 0.5, 0.5)
		this.group.add(this.button2.getGroup())

		this.button3 = new VRGUIButton(this)
		this.button3.initButtonIcon('../assets/UI/teleport_button', 0.233)
		this.button3.setPosition(offset_x,-0.09+offset_y,0.1+offset_z)
		this.button3.setScale(0.5, 0.5, 0.5)
		this.group.add(this.button3.getGroup())

		this.button4 = new VRGUIButton(this)
		this.button4.initButtonIcon('../assets/UI/show_collection_button', 0.233)
		this.button4.setPosition(offset_x,-0.25+offset_y,0.1+offset_z)
		this.button4.setScale(0.5, 0.5, 0.5)
		this.group.add(this.button4.getGroup())


	}

	onStartClick()
	{
		this.parent.onStartClick()
	}
	onEndClick()
	{
		this.parent.onEndClick()
	}
	onStartDrag()
	{
		this.parent.onStartDrag()
	}
	onEndDrag()
	{
		this.parent.onEndDrag()
	}
	onUpdateDrag(from, direction)
	{
		this.parent.onUpdateDrag(from, direction)
	}
	onCancelClick()
	{
		this.parent.onCancelClick()	
	}
	clear()
	{
		this.button1.getGroup().clear()
		this.button2.getGroup().clear()
		this.button3.getGroup().clear()
		this.button4.getGroup().clear()
		console.log(this.mesh)
		this.mesh.material.dispose()
		this.mesh.geometry.dispose()
		this.texture.dispose()
		this.group.remove(this.mesh)
		this.group.remove(this.button1.getGroup())


	}
	getGroup()
	{
		return this.group
	}
	/*isHovering(pointedObject)
	{
		for(var i=0; i < this.group.children.length; ++i)
		{
			if(this.group.children[i].name == PointedObjectNames.VR_GUI_GROUP)
			{
				if(this.group.children[i].parentClass.isHovering(pointedObject))
					return true
			}
			else
			{
				if(pointedObject != null && pointedObject == this.group.children[i])
				{
					return true
				}
			}
		}

		return false
	}*/
	showButtons(show)
	{
		for(var i=0; i < this.group.children.length; ++i)
		{
			if(this.group.children[i].name == PointedObjectNames.VR_GUI_GROUP)
				this.group.children[i].parentClass.show(show)
		}
	}
	setHovering()
	{
		this.hovering = true
	}
	onStartHovering()
	{
		this.showButtons(true)
	}
	onEndHovering()
	{
		this.showButtons(false)
	}
	onHover(dt)
	{

	}
	updateChildren(dt, pointedObject)
	{
		for(var i=0; i < this.group.children.length; ++i)
		{
			if(this.group.children[i].name == PointedObjectNames.VR_GUI_GROUP)
				this.group.children[i].parentClass.update(dt, pointedObject)
			else
			{
				if(this.group.children[i] == pointedObject)
					this.setHovering()
			}
		}
	}
	update(dt, pointedObject)
	{
		var wasHoveringPreviousFrame = this.hovering
		this.hovering = false

		this.updateChildren(dt, pointedObject)
		
		if(!wasHoveringPreviousFrame && this.hovering)
			this.onStartHovering()
		else if(wasHoveringPreviousFrame && !this.hovering)
			this.onEndHovering()
		if(this.hovering)
			this.onHover(dt)
		
	}
}