import * as THREE from '../build/three.module.js';
import {VRGUIButton} from './VRGUIButton.js';
import {VRGUIPhoto} from './VRGUIPhoto.js';
const OFFSET_Z = 0.2
//const var SIZE_X (not needed check parent plane)
const ROWS = 3
const COLS = 3
export class VRGUIPhotoStack {
	constructor(parentGroup, hoverFunction, pressFunction, clickFunction) {
		this.images = []
		this.currPage = 0
		this.numPages = -1
		this.group = new THREE.Group()
		this.group.name = PointedObjectNames.VR_GUI_GROUP
		this.group.type = PointedObjectNames.VR_GUI_TYPE
		this.group.position.set(0,1,0)
		this.group.scale.set(0.5,0.5,0.5)
		this.group.parentClass = this;
		this.buttonUp = null
		this.buttonDown = null
		this.indexCollection = -1

		//arrows up/down
		this.generatePage(this.currPage)
		this.generateButtons()
	}
	generateButtons()
	{
		this.buttonUp = new VRGUIButton(this)
		this.buttonUp.initButtonIcon('../assets/UI/arrow_button', 0.233)
		this.buttonUp.setPosition((COLS*1.05)/2-0.75,(ROWS*1.05)-0.5,0)
		this.buttonUp.setScale(0.7, -0.7, 0.7)
		this.buttonUp.isButton = true
		this.buttonUp.show()
		this.group.add(this.buttonUp.getGroup())

		this.buttonDown = new VRGUIButton(this)
		this.buttonDown.initButtonIcon('../assets/UI/arrow_button', 0.233)
		this.buttonDown.setPosition((COLS*1.05)/2-0.75,0.25-1,0)
		this.buttonDown.setScale(0.7, 0.7, 0.7)
		this.buttonDown.isButton = true
		this.buttonDown.show()
		this.group.add(this.buttonDown.getGroup())

	}
	setImages(images, indexCollection)	//capture array
	{
		this.indexCollection = indexCollection
		this.images = images
		this.numPages = Math.ceil(this.images.length/(ROWS*COLS))
	}
	nextPage()
	{
		if(this.currPage == this.numPages-1)
			return;
		this.currPage +=1
		this.generatePage(this.currPage)
	}
	prevPage()
	{
		if(this.currPage == 0)
			return;
		this.currPage -=1
		this.generatePage(this.currPage)
		
	}
	clearPage()
	{
		var auxList = []
		for(var i = 0; i < this.group.children.length; ++i)
		{
			if(this.group.children[i].name == PointedObjectNames.VR_GUI_GROUP && !this.group.children[i].isButton)
			{
				this.group.children[i].parentClass.clear()
				auxList.push(this.group.children[i])
			}
		}
		for(var i=0; i < auxList.length; ++i)
		{
			this.group.children.remove(auxList[i])
		}
		

	}
	generatePage(page)
	{

		this.clearPage()
		for(var i = 0; i < ROWS; ++i)
		{
			for(var j = 0; j < COLS; ++ j)
			{
				var imageIndex = (i*COLS+j)*(ROWS*COLS)*page
				var testImage = new VRGUIPhoto(this,"", 1.05*i,1.05*j,0)
				this.group.add(testImage.getGroup())
			}
		}
		 
	}
	getGroup()
	{
		return this.group
	}
	clear()
	{
		this.clearPage()
		this.buttonUp.clear()
		this.buttonDown.clear()
		this.group.remove(this.buttonUp)
		this.group.remove(this.buttonDown)
	}
	onHover()
	{

	}
	onPress()
	{

	}
	onClickEnd()
	{

	}
	setHovering()
	{
		this.hovering = true
	}
	update(dt, pointedObject)
	{
		for(var i=0; i < this.group.children.length; ++i)
		{
			if(this.group.children[i].name == PointedObjectNames.VR_GUI_GROUP)
				this.group.children[i].parentClass.update(dt, pointedObject)
		}
	}
}