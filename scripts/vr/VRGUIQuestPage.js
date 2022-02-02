import * as THREE from '../../build/three.module.js';
import {VRGUIButton} from './VRGUIButton.js';
import { ThumbnailSprite } from './../ThumbnailSprite.js';
import {UIElement} from './../ui/UIElement.js';
const OFFSET_Z = 0.005
const BUTTON_SCALE = 0.2
const PageState =
{
	IDLE: "init",
	RUNNING: "run"
}

export class VRGUIQuestPage extends UIElement{
	constructor(offset_x, offset_y, offset_z, scale, data) {
		
		super("QUESTIONARIE PAGE", true)
		this.inited = false
		this.elementMeshes = []
		this.elementTextures = []
		this.scale.set(scale,scale,scale)
		this.position.set(offset_x, offset_y, offset_z+OFFSET_Z)
		this.state = PageState.IDLE

		this.initWithData(data)
	}

	addImageElement(offset_y,imagePath,scale)
	{
		var loader = new THREE.TextureLoader();
		var texture = loader.load('../assets/questionarie/'+imagePath)
		const material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 1.0,} );

		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.000, 1.666), material);
		//this.panel.renderOrder = 1
		mesh.scale.x = scale
		mesh.scale.y = scale
		mesh.scale.z = scale
		mesh.position.y = offset_y
		mesh.name = PointedObjectNames.VR_GUI_PLANE
		mesh.hasClickFunctions = true

		function funStartClick() { this.parent.onStartClick()}
		function funEndClick() { this.parent.onEndClick()}
		function funStartDrag() { this.parent.onStartDrag()}
		function funEndDrag() { this.parent.onEndDrag()}
		function funCancelClick() { this.parent.onCancelClick()}
		function funHover() { this.parent.onHover()}
		function funUpdateDrag(p1, p2) { this.parent.onUpdateDrag(p1,p2)}
		function funDispose() {}
		mesh.onStartClick = funStartClick
		mesh.onEndClick = funEndClick
		mesh.onStartDrag = funStartDrag
		mesh.onEndDrag = funEndDrag
		mesh.onUpdateDrag = funUpdateDrag
		mesh.onCancelClick = funCancelClick
		mesh.dispose = funDispose
		mesh.onHover = funHover

		this.elementMeshes.push(mesh)
		this.elementTextures.push(texture)
		this.add(mesh)
	}

	initWithData(data)
	{
		//let offsetElapsed = 0
		for(let i=0; i < data.elements.length; ++i)
		{
			const elemData = data.elements[i]
			switch(elemData.type)
			{
				/*case "text":
				{
					page.addTextElement(offsetElapsed, elemData.data, elemData.size)
					break;
				}*/
				case "img":
				{
					this.addImageElement(0, elemData.data, elemData.size)
					break;
				}
			}
		}
		for(let i=0; i < data.buttons.length; ++i)
		{
			const elemData = data.buttons[i]

			this.addButton(elemData, -0.8, (1.0/data.buttons.length)*(i)-0.5+(0.5/data.buttons.length))
		}
	}
	addButton(data, offset_y, offset_x)
	{
		if(data == "Next")
		{
			var self = this
			function func(p1, p2) { self.parent.nextPage()}

			const button1 = new VRGUIButton(func, "NEXT")
			button1.initButtonIcon('next', 1)
			button1.setPosition(offset_x,offset_y,OFFSET_Z*2)
			button1.setScale(BUTTON_SCALE, BUTTON_SCALE, BUTTON_SCALE)
			button1.show(true)
			this.add(button1)
		}
		if(data == "Start")
		{
			var self = this
			function func(p1, p2) { self.parent.nextPage()}

			const button1 = new VRGUIButton(func, "START")
			button1.initButtonIcon('start', 1)
			button1.setPosition(offset_x,offset_y,OFFSET_Z*2)
			button1.setScale(BUTTON_SCALE, BUTTON_SCALE, BUTTON_SCALE)
			button1.show(true)
			this.add(button1)
		}
		else if(data == "Back")
		{
			var self = this
			function func(p1, p2) { self.parent.prevPage()}
			const button1 = new VRGUIButton(func, "BACK")
			button1.initButtonIcon('back', 1)
			button1.setPosition(offset_x,offset_y,OFFSET_Z*2)
			button1.setScale(BUTTON_SCALE, BUTTON_SCALE, BUTTON_SCALE)
			button1.show(true)
			this.add(button1)
		}
		else if(data == "Start/Stop")
		{
			var self = this
			function func1(p1, p2) { 
				self.parent.startRecordTime()
				for(let i = 0; i < self.children.length; ++i)
				{
					if(self.children[i].name == "START")
					{
						self.children[i].show(false)
					}
					if(self.children[i].name == "STOP")
					{
						self.children[i].show(true)
					}
				}
			}
			function func2(p1, p2) { 
				self.parent.stopRecordTime()
				self.parent.nextPage()
				for(let i = 0; i < self.children.length; ++i)
				{
					if(self.children[i].name == "START")
					{
						self.children[i].show(true)
					}
					if(self.children[i].name == "STOP")
					{
						self.children[i].show(false)
					}
				}
			}
			const button1 = new VRGUIButton(func1, "START")
			button1.initButtonIcon('start', 1)
			button1.setPosition(offset_x,offset_y,OFFSET_Z*2)
			button1.setScale(BUTTON_SCALE, BUTTON_SCALE, BUTTON_SCALE)
			button1.show(true)
			this.add(button1)

			const button2 = new VRGUIButton(func2, "STOP")
			button2.initButtonIcon('stop', 1)
			button2.setPosition(offset_x,offset_y,OFFSET_Z*2)
			button2.setScale(BUTTON_SCALE, BUTTON_SCALE, BUTTON_SCALE)
			button2.show(false)
			this.add(button2)
			
		}
		else if(data == "Restart")
		{
			var self = this
			function func1(p1, p2) { 
				self.parent.startRecordTime()
				for(let i = 0; i < this.children.length; ++i)
				{
					if(self.children[i].name == "START")
					{
						self.children[i].show(false)
					}
					if(self.children[i].name == "STOP")
					{
						self.children[i].show(true)
					}
				}
			}
			
			const button1 = new VRGUIButton(func1, "RESTART")
			button1.initButtonIcon('restart', 1)
			button1.setPosition(offset_x,offset_y,OFFSET_Z*2)
			button1.setScale(BUTTON_SCALE, BUTTON_SCALE, BUTTON_SCALE)
			button1.show(true)
			this.add(button1)
		}
		else if(data == "RestartQuest")
		{
			var self = this
			function func1(p1, p2) { 
				self.parent.restartQuest()
			}
			
			const button1 = new VRGUIButton(func1, "RESTART QUEST")
			button1.initButtonIcon('restart', 1)
			button1.setPosition(offset_x,offset_y,OFFSET_Z*2)
			button1.setScale(BUTTON_SCALE, BUTTON_SCALE, BUTTON_SCALE)
			button1.show(true)
			this.add(button1)
		}
		else if(data == "Export")
		{
			var self = this
			function func1(p1, p2) { 
				self.parent.exportData()
			}
			
			const button1 = new VRGUIButton(func1, "EXPORT")
			button1.initButtonIcon('export', 1)
			button1.setPosition(offset_x,offset_y,OFFSET_Z*2)
			button1.setScale(BUTTON_SCALE, BUTTON_SCALE, BUTTON_SCALE)
			button1.show(true)
			this.add(button1)
		}
	}


	addTextElement(offset_y,text,scale)
	{

	}
	dispose()
	{
		super.dispose()
		for(let i=0; i < this.elementMeshes.length; ++i)
		{
			this.elementMeshes[i].material.dispose()
			this.elementMeshes[i].geometry.dispose()
			this.elementTextures[i].dispose()
		}
	}
	
}