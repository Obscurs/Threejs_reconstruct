import * as THREE from '../build/three.module.js';
const OFFSET_Z = 0.05
export class VRGUIButton {
	constructor(parent) {
		this.parent = parent
		this.group = new THREE.Group();
		this.group.parentClass = this;
		this.group.name = PointedObjectNames.VR_GUI_GROUP
		this.group.type = PointedObjectNames.VR_GUI_TYPE
		this.mesh = null;
		this.materialIdle = null;
		this.materialHover = null;
		this.materialClick = null;
		this.materialDisabled = null;
		this.clicking = false;
		this.hovering = false;
		this.enabled = true;

		this.texIdle = null;
		this.texHover = null;
		this.texClick = null;
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
		  depthTest: false
		});
		this.materialHover = new THREE.MeshBasicMaterial({
		  map: this.texHover,
		  transparent: true,
		  depthTest: false
		});
		this.materialClick = new THREE.MeshBasicMaterial({
		  map: this.texClick,
		  transparent: true,
		  depthTest: false
		});
		this.materialDisabled = new THREE.MeshBasicMaterial({
		  map: this.texIdle,
		  transparent: true,
		  opacity: 0.5,
		  depthTest: false
		});

		// create a plane geometry for the image with a width of 10
		// and a height that preserves the image's aspect ratio
		var geometryImage = new THREE.PlaneGeometry(1, 1*ratio);

		// combine our image geometry and material into a mesh
		var mesh = new THREE.Mesh(geometryImage, this.materialIdle);
		mesh.renderOrder = 2
		// set the position of the image mesh in the x,y,z dimensions
		mesh.position.set(0,0,OFFSET_Z)



		mesh.name = PointedObjectNames.VR_GUI_BUTTON
		mesh.type = PointedObjectNames.VR_GUI_TYPE
		mesh.parentClass = this;
		function funStartClick() { this.parentClass.onStartClick()}
		function funEndClick() { this.parentClass.onEndClick()}
		function funStartDrag() { this.parentClass.onStartDrag()}
		function funEndDrag() { this.parentClass.onEndDrag()}
		function funCancelClick() { this.parentClass.onCancelClick()}
		//function funHover() { this.parentClass.onHover()}
		function funUpdateDrag(p1, p2) { this.parentClass.onUpdateDrag(p1,p2)}
		mesh.onStartClick = funStartClick
		mesh.onEndClick = funEndClick
		mesh.onStartDrag = funStartDrag
		mesh.onEndDrag = funEndDrag
		mesh.onUpdateDrag = funUpdateDrag
		mesh.onCancelClick = funCancelClick
		//mesh.onHover = funHover

		// add the image to the scene
		this.mesh = mesh
		this.group.add(mesh);
		this.show(false)
		//this.setEnabled(false)
	}





	onStartClick()
	{
		this.dirty = true
		console.log("start click")
		this.clicking = true
	}
	onEndClick()
	{
		this.dirty = true
		console.log("end click")
		this.clicking = false
	}
	onStartDrag()
	{
		this.dirty = true
		this.parent.onStartDrag()
	}
	onEndDrag()
	{
		this.dirty = true
		this.parent.onEndDrag()
		this.clicking = false
	}
	onUpdateDrag(from, direction)
	{
		this.parent.onUpdateDrag(from, direction)
	}
	onCancelClick()
	{
		this.dirty = true
		console.log("cancel click")
		this.clicking = false
	}
	show(show)
	{
		this.dirty = true
		if(this.mesh != null)
		{
			this.mesh.visible = show
		}
	}
	setEnabled(enabled)
	{

		this.dirty = true
		this.enabled = enabled
	}
	clear()
	{
		this.mesh.material.dispose()
		this.mesh.geometry.dispose()
		this.texIdle.dispose()
		this.texHover.dispose()
		this.texClick.dispose()
		this.group.remove(this.mesh)
		
	}
	/*onHover()
	{
		this.parent.onHover()
		//DELETE THIS; USE UPDATE FUNCTION INSTEAD CHECKING THE UI POINTED OBJECT

	}*/
	getGroup()
	{
		return this.group
	}
	setPosition(x, y, z)
	{
		this.group.position.x = x
		this.group.position.y = y
		this.group.position.z = z
	}
	setScale(x, y, z)
	{
		this.group.scale.x = x
		this.group.scale.y = y
		this.group.scale.z = z
	}
	isHovering(pointedObject)
	{
		if(pointedObject != null && pointedObject == this.mesh)
		{
			return true
		}
		else 
		{
			return false
		}
	}

	onStartHovering()
	{
		this.hovering = true
		this.dirty = true
		/*this.mesh.scale.x = 1.1
		this.mesh.scale.y = 1.1
		this.mesh.scale.z = 1.1*/

	}
	onEndHovering()
	{
		this.hovering = false
		this.dirty = true
		if(this.mesh)
		{
			/*this.mesh.scale.x = 1
			this.mesh.scale.y = 1
			this.mesh.scale.z = 1*/

		}
	}
	onHover(dt)
	{
		this.parent.setHovering()
	}
	update(dt, pointedObject)
	{


		if(this.isHovering(pointedObject))
		{
			if(!this.hovering)
				this.onStartHovering()
		}
		else
		{
			if(this.hovering)
			{
				this.onEndHovering()
			}
		}
		if(this.hovering)
			this.onHover(dt)

		//UPDATE TEXTURE
		if(this.dirty)
		{
				
			if(!this.enabled && this.mesh != null && this.materialDisabled != null && this.mesh.material != this.materialDisabled)
				this.mesh.material = this.materialDisabled
			else if(this.clicking && this.mesh != null && this.materialClick != null && this.mesh.material != this.materialClick)
				this.mesh.material = this.materialClick
			else if(this.hovering && this.mesh != null && this.materialHover != null && this.mesh.material != this.materialHover)
				this.mesh.material = this.materialHover
			else if(this.mesh != null && this.materialIdle != null && this.mesh.material != this.materialIdle)
				this.mesh.material = this.materialIdle
			
			this.dirty = false
		}

	}
}

//555b6e dark
//89b0ae dark green
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

//Show similar photos
//Project on the scene
//Open photo
//Go to photo position