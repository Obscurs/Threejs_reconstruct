import * as THREE from '../../build/three.module.js';

import {UIElement} from './../ui/UIElement.js';

const OFFSET_Z = 0.05
export class VRGUIButton extends UIElement{
	constructor(callbackClick, name = "VR_BUTTON") {
		super(name, true)

		this.mesh = null;
		this.materialIdle = null;
		this.materialHover = null;
		this.materialClick = null;
		this.materialDisabled = null;

		this.isVRButton = true

		this.texIdle = null;
		this.texHover = null;
		this.texClick = null;

		this.callbackClick = callbackClick
	}
	initButtonIcon(imagePath, ratio)
	{
		var loader = new THREE.TextureLoader();
		this.texIdle = loader.load(imagePath+"_idle.png")
		this.texHover = loader.load(imagePath+"_hover.png")
		this.texClick = loader.load(imagePath+"_click.png")

		this.materialIdle = new THREE.MeshBasicMaterial({
		  map: this.texIdle,
		  transparent: true,
		  //depthTest: false
		});
		this.materialHover = new THREE.MeshBasicMaterial({
		  map: this.texHover,
		  transparent: true,
		  //depthTest: false
		});
		this.materialClick = new THREE.MeshBasicMaterial({
		  map: this.texClick,
		  transparent: true,
		  //depthTest: false
		});
		this.materialDisabled = new THREE.MeshBasicMaterial({
		  map: this.texIdle,
		  transparent: true,
		  opacity: 0.5,
		  //depthTest: false
		});

		// create a plane geometry for the image with a width of 10
		// and a height that preserves the image's aspect ratio
		const geometryImage = new THREE.PlaneGeometry(1, 1*ratio);

		// combine our image geometry and material into a mesh
		const mesh = new THREE.Mesh(geometryImage, this.materialIdle);
		//mesh.renderOrder = 2
		// set the position of the image mesh in the x,y,z dimensions
		mesh.position.set(0,0,OFFSET_Z)



		mesh.name = "Button mesh"
		mesh.hasClickFunctions = true
		function funStartClick() { this.parent.onStartClick()}
		function funEndClick() { this.parent.onEndClick()}
		function funStartDrag() { this.parent.onStartDrag()}
		function funEndDrag() { this.parent.onEndDrag()}
		function funCancelClick() { this.parent.onCancelClick()}
		function funHover() { 
			//console.log(this)
			this.parent.onHover()
		}
		function funUpdateDrag(p1, p2) { this.parent.onUpdateDrag(p1,p2)}

		mesh.onStartClick = funStartClick
		mesh.onEndClick = funEndClick
		mesh.onStartDrag = funStartDrag
		mesh.onEndDrag = funEndDrag
		mesh.onUpdateDrag = funUpdateDrag
		mesh.onCancelClick = funCancelClick
		mesh.onHover = funHover

		// add the image to the scene
		this.mesh = mesh
		this.add(mesh);
		this.show(false)
	}



	onStartClick()
	{
		super.onStartClick()
		this.dirty = true
	}
	onEndClick()
	{
		super.onEndClick()
		this.dirty = true
		if(this.callbackClick != null && this.ui_enabled)
			this.callbackClick()
	}
	onStartDrag()
	{
		super.onStartDrag()
		this.dirty = true
	}
	onEndDrag()
	{
		super.onEndDrag()
		this.dirty = true
	}

	onCancelClick()
	{
		super.onCancelClick()
		this.dirty = true
	}
	show(show)
	{
		this.dirty = true
		if(this.mesh != null)
		{
			this.mesh.visible = show
		}
	}
	setEnabled(value)
	{
		super.setEnabled(value)
		this.dirty = true
	}
	dispose()
	{
		super.dispose()
		this.mesh.material.dispose()
		this.mesh.geometry.dispose()
		this.texIdle.dispose()
		this.texHover.dispose()
		this.texClick.dispose()
		this.remove(this.mesh)
		
	}

	onStartHovering()
	{
		super.onStartHovering()
		//this.hovering = true
		this.dirty = true
		/*this.mesh.scale.x = 1.1
		this.mesh.scale.y = 1.1
		this.mesh.scale.z = 1.1*/

	}
	onEndHovering()
	{
		super.onEndHovering()
		//this.hovering = false
		this.dirty = true
		if(this.mesh)
		{
			/*this.mesh.scale.x = 1
			this.mesh.scale.y = 1
			this.mesh.scale.z = 1*/

		}
	}

	update(dt)
	{
		super.update(dt)

		if(this.dirty)
		{

			if(!this.ui_enabled && this.mesh != null && this.materialDisabled != null)
				this.mesh.material = this.materialDisabled
			else if(this.ui_clicking && this.mesh != null && this.materialClick != null)
				this.mesh.material = this.materialClick
			else if(this.ui_hovering && this.mesh != null && this.materialHover != null)
				this.mesh.material = this.materialHover
			else if(this.mesh != null && this.materialIdle != null)
				this.mesh.material = this.materialIdle
			
			this.dirty = false
		}

	}
}

//555b6e dark
//89b0ae dark green  #648e7f
//bee3db green
//faf9f9 white
//ffd6ba yellow

//https://www.clickminded.com/button-generator/
//300 width
//70 height
//26 text size
//corner 9
//bold
//Buttons:

//Teleport
//Zoom
//Project
//Similar