import * as THREE from '../../build/three.module.js';
import {VRGUIButton} from './VRGUIButton.js';
import {VRGUIPhoto} from './VRGUIPhoto.js';
import {UIElement} from './../ui/UIElement.js';
const OFFSET_Z = 0.2
//const var SIZE_X (not needed check parent plane)
const ROWS = 3
const COLS = 3
export class VRGUIPhotoStack extends UIElement {
	constructor(hoverFunction, pressFunction, clickFunction) {
		super("Photo stack", true)

		

		this.images = []
		this.currPage = 0
		this.numPages = -1
		this.position.set(0,1,0)
		this.scale.set(0.5,0.5,0.5)
		this.buttonUp = null
		this.buttonDown = null
		this.indexCollection = -1

		//arrows up/down
		this.generatePage(this.currPage)
		this.generateButtons()
	}
	generateButtons()
	{
		this.buttonUp = new VRGUIButton()
		this.buttonUp.initButtonIcon('../assets/UI/arrow_button', 0.233)
		this.buttonUp.setPosition((COLS*1.05)/2-0.75,(ROWS*1.05)-0.5,0)
		this.buttonUp.setScale(0.7, -0.7, 0.7)
		this.buttonUp.isButton = true
		this.buttonUp.show()
		this.add(this.buttonUp)

		this.buttonDown = new VRGUIButton()
		this.buttonDown.initButtonIcon('../assets/UI/arrow_button', 0.233)
		this.buttonDown.setPosition((COLS*1.05)/2-0.75,0.25-1,0)
		this.buttonDown.setScale(0.7, 0.7, 0.7)
		this.buttonDown.isButton = true
		this.buttonDown.show()
		this.add(this.buttonDown)

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
	disposePage()
	{
		const auxList = []
		for(let i = 0; i < this.children.length; ++i)
		{
			if(this.children[i].type == PointedObjectNames.VR_COMPLEX_GROUP && !this.children[i].isButton)
			{
				this.children[i].dispose()
				auxList.push(this.children[i])
			}
		}
		for(let i=0; i < auxList.length; ++i)
		{
			this.children.remove(auxList[i])
		}
		

	}
	generatePage(page)
	{

		this.disposePage()
		for(let i = 0; i < ROWS; ++i)
		{
			for(let j = 0; j < COLS; ++ j)
			{
				const imageIndex = (i*COLS+j)*(ROWS*COLS)*page
				const testImage = new VRGUIPhoto("", 0,m_camera_list[0], 1.05*i,1.05*j,0)
				this.add(testImage)
			}
		}
		 
	}


	dispose()
	{
		super.dispose()
		this.disposePage()
	}

}