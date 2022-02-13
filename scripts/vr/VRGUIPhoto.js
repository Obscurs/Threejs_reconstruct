import * as THREE from '../../build/three.module.js';
import {VRGUIButton} from './VRGUIButton.js';
import { ThumbnailSprite } from './../ThumbnailSprite.js';
import {UIElement} from './../ui/UIElement.js';
const OFFSET_Z = 0.005
export class VRGUIPhoto extends UIElement{
	constructor(pathImage, index, colIndex, camInfo, offset_x, offset_y, offset_z, scale) {
		
		super(PointedObjectNames.VR_GUI_PHOTO_ELEM, true)

		this.sprite = null
		this.imageIndex = index
		this.cameraInfo = camInfo
		this.collectionIndex = colIndex
		this.scale.set(scale,scale,scale)
		this.position.set(offset_x, offset_y, offset_z+OFFSET_Z)


		this.sprite = new ThumbnailSprite(pathImage, this.imageIndex, this.cameraInfo.width, this.cameraInfo.height)

		this.sprite.setUniformMinSel(this.cameraInfo.spriteProperties.minSel)
		this.sprite.setUniformMaxSel(this.cameraInfo.spriteProperties.maxSel)
		this.sprite.setUniformSelected(false)
		this.sprite.setUniformOpacity(1.0);
		
		//this.sprite.renderOrder = 1
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
		this.button1.initButtonIcon('zoom', 1)
		this.button1.setPosition(-0.30,-0.30,0.005)
		this.button1.setScale(0.3, 0.3, 0.3)
		this.add(this.button1)

		function projFun(p1, p2) { APPLICATION.changeCaptureInView(self.imageIndex)}
		this.button2 = new VRGUIButton(projFun, "BUTTON PROJECT")
		this.button2.initButtonIcon('project', 1)
		this.button2.setPosition(0.30,0.30,0.005)
		this.button2.setScale(0.3, 0.3, 0.3)
		this.add(this.button2)

		function teleFun(p1, p2) { APPLICATION.moveToCapturePosition(self.imageIndex)}
		this.button3 = new VRGUIButton(teleFun, "BUTTON TELEPORT")
		this.button3.initButtonIcon('teleport', 1)
		this.button3.setPosition(0.30,-0.30,0.005)
		this.button3.setScale(0.3, 0.3, 0.3)
		this.add(this.button3)

		function colFun(p1, p2) { APPLICATION.displayImageCollection(self.imageIndex, self.collectionIndex)}
		this.button4 = new VRGUIButton(colFun, "BUTTON COLLECTION")
		this.button4.initButtonIcon('similar', 1)
		this.button4.setPosition(-0.30,0.30,0.005)
		this.button4.setScale(0.3, 0.3, 0.3)
		this.add(this.button4)


	}
	setHighlighted(value)
	{
		this.sprite.setUniformSelected(value)
	}

	setButtonEnabledSimilar(value)
	{
		this.button4.setEnabled(value)
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