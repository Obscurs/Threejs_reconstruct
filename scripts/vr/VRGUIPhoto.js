import * as THREE from '../../build/three.module.js';
import {VRGUIButton} from './VRGUIButton.js';
import { ThumbnailSprite } from './../ThumbnailSprite.js';
import {UIElement} from './../ui/UIElement.js';
const OFFSET_Z = 0.05
export class VRGUIPhoto extends UIElement{
	constructor(pathImage, index, colIndex, camInfo, offset_x, offset_y, offset_z) {
		
		super("PHOTO ELEM", true)

		this.sprite = null
		this.imageIndex = index
		this.cameraInfo = camInfo
		this.collectionIndex = colIndex

		this.position.set(offset_x, offset_y, offset_z)


		this.sprite = new ThumbnailSprite(pathImage, this.imageIndex, this.cameraInfo.width, this.cameraInfo.height)

		this.sprite.setUniformMinSel(this.cameraInfo.spriteProperties.minSel)
		this.sprite.setUniformMaxSel(this.cameraInfo.spriteProperties.maxSel)
		this.sprite.setUniformSelected(false)
		this.sprite.setUniformOpacity(1.0);
		
		this.sprite.renderOrder = 1
		//this.sprite.position.set(offset_x,offset_y,OFFSET_Z+offset_z)

		this.sprite.hasClickFunctions = true

		function funStartClick() { this.parent.onStartClick()}
		function funEndClick() { this.parent.onEndClick()}
		function funStartDrag() { this.parent.onStartDrag()}
		function funEndDrag() { this.parent.onEndDrag()}
		function funCancelClick() { this.parent.onCancelClick()}
		function funHover() { this.parent.onHover()}
		function funUpdateDrag(p1, p2) { this.parent.onUpdateDrag(p1,p2)}

		this.sprite.onStartClick = funStartClick
		this.sprite.onEndClick = funEndClick
		this.sprite.onStartDrag = funStartDrag
		this.sprite.onEndDrag = funEndDrag
		this.sprite.onUpdateDrag = funUpdateDrag
		this.sprite.onCancelClick = funCancelClick

		this.sprite.onHover = funHover

		// add the image to the scene

		this.add(this.sprite);
		
		var self = this

		function zoomFun(p1, p2) { APPLICATION.showZoomedPhoto(self.imageIndex)}
		this.button1 = new VRGUIButton(zoomFun, "BUTTON OPEN")
		this.button1.initButtonIcon('../assets/UI/open_button', 0.233)
		this.button1.setPosition(-0.25,-0.35,0.1)
		this.button1.setScale(0.3, 0.3, 0.3)
		this.add(this.button1)

		function projFun(p1, p2) { APPLICATION.changeCaptureInView(self.imageIndex)}
		this.button2 = new VRGUIButton(projFun, "BUTTON PROJECT")
		this.button2.initButtonIcon('../assets/UI/project_button', 0.233)
		this.button2.setPosition(0.25,0.35,0.1)
		this.button2.setScale(0.3, 0.3, 0.3)
		this.add(this.button2)

		function teleFun(p1, p2) { APPLICATION.moveToCapturePosition(self.imageIndex)}
		this.button3 = new VRGUIButton(teleFun, "BUTTON TELEPORT")
		this.button3.initButtonIcon('../assets/UI/teleport_button', 0.233)
		this.button3.setPosition(0.25,-0.35,0.1)
		this.button3.setScale(0.3, 0.3, 0.3)
		this.add(this.button3)

		function colFun(p1, p2) { APPLICATION.displayImageCollection(self.imageIndex, self.collectionIndex)}
		this.button4 = new VRGUIButton(colFun, "BUTTON COLLECTION")
		this.button4.initButtonIcon('../assets/UI/show_collection_button', 0.233)
		this.button4.setPosition(-0.25,0.35,0.1)
		this.button4.setScale(0.3, 0.3, 0.3)
		this.add(this.button4)


	}
	setHighlighted(value)
	{
		this.sprite.setUniformSelected(value)
	}

	showButtons(show)
	{
		for(let i=0; i < this.children.length; ++i)
		{
			if(this.children[i].isVRButton)
				this.children[i].show(show)
		}
	}


	onStartHovering()
	{
		super.onStartHovering()
		this.showButtons(true)
	}
	onEndHovering()
	{
		super.onEndHovering()
		this.showButtons(false)
	}
}