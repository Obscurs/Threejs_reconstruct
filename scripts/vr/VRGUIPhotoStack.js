import * as THREE from '../../build/three.module.js';
import {VRGUIButton} from './VRGUIButton.js';
import {VRGUIPhoto} from './VRGUIPhoto.js';
import {UIElement} from './../ui/UIElement.js';
const OFFSET_Z = 0.2
//const var SIZE_X (not needed check parent plane)
const ROWS = 3
const COLS = 3
export class VRGUIPhotoStack extends UIElement {
	constructor() {
		super("Photo stack", true)
		this.images = []
		this.currPage = 0
		this.numPages = -1
		
		this.buttonUp = null
		this.buttonDown = null
		this.buttonClose = null
		this.indexCollection = -1
		this.texPanel = null
		this.panel = null

		this.generatePanel()
		//arrows up/down
		this.generatePage(this.currPage)
		this.generateButtons()
		this.setVisible(false)
		
	}
	generatePanel()
	{
		var loader = new THREE.TextureLoader();
		this.texPanel = loader.load('../assets/UI/panels/square_panel.png')
		this.materialPanel = new THREE.MeshBasicMaterial( { map: this.texPanel, transparent: true, opacity: 0.8,} );

		this.panel = new THREE.Mesh(new THREE.PlaneGeometry(1.000, 1.000), this.materialPanel);
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

		this.add(this.panel)
	}
	generateButtons()
	{
		var self = this

		function prevAction(p1, p2) { self.prevPage()}
		this.buttonUp = new VRGUIButton(prevAction, "PREV BUTTON")
		this.buttonUp.initButtonIcon('arrow', 0.233)
		this.buttonUp.setPosition(0,0.45,0)
		this.buttonUp.setScale(0.2, -0.2, 1.0)
		this.buttonUp.isButton = true
		this.buttonUp.show(true)
		this.add(this.buttonUp)

		function nextAction(p1, p2) { self.nextPage()}
		this.buttonDown = new VRGUIButton(nextAction, "NEXT BUTTON")
		this.buttonDown.initButtonIcon('arrow', 0.233)
		this.buttonDown.setPosition(0,-0.45,0)
		this.buttonDown.setScale(0.2, 0.2, 1.0)
		this.buttonDown.isButton = true
		this.buttonDown.show(true)
		this.add(this.buttonDown)

		function closeAction(p1, p2) { self.closeUI()}
		this.buttonClose = new VRGUIButton(closeAction, "CLOSE BUTTON")
		this.buttonClose.initButtonIcon('close', 0.233)
		this.buttonClose.setPosition(0.45, 0.45,0)
		this.buttonClose.setScale(0.05, 0.20, 1.0)
		this.buttonClose.isButton = true
		this.buttonClose.show(true)
		this.add(this.buttonClose)

	}
	closeUI()
	{
		console.log("close")
		this.setVisible(false)
	}
	setImages(images, indexCollection)	//capture array
	{
		this.currPage = 0
		this.indexCollection = indexCollection
		this.images = images
		this.numPages = Math.ceil(this.images.length/(ROWS*COLS))
	}
	nextPage()
	{
		if(this.currPage == this.numPages-1)
			return;
		this.currPage +=1
		this.generatePage()
	}
	prevPage()
	{
		if(this.currPage == 0)
			return;
		this.currPage -=1
		this.generatePage()
		
	}
	disposePage()
	{
		const auxList = []
		for(let i = 0; i < this.children.length; ++i)
		{
			if(this.children[i].name == PointedObjectNames.VR_GUI_PHOTO_ELEM)
			{
				this.children[i].dispose()
				auxList.push(this.children[i])
			}
		}
		for(let i=0; i < auxList.length; ++i)
		{
			this.remove(auxList[i])
		}

	}
	generatePage()
	{
		this.disposePage()
		for(let i = 0; i < ROWS; ++i)
		{
			for(let j = 0; j < COLS; ++ j)
			{
				const imageIndex = (i*COLS+j)+(ROWS*COLS)*this.currPage+1
				if(this.images.length <= imageIndex)
					return
				else
				{
					const imageInCol = this.images[imageIndex]
					const imageElement = new VRGUIPhoto(imageInCol.imagePath,imageInCol.index, this.indexCollection,imageInCol.camInfo, 0.28*(j)-0.28,0.28*(ROWS-i-1)-0.28,0.0, 0.25)
					imageElement.setButtonEnabledSimilar(false)
					this.add(imageElement)
				}
			}
		}
		 
	}

	dispose()
	{
		super.dispose()
		this.setVisible(false)
		this.disposePage()
		this.panel.material.dispose()
		this.panel.geometry.dispose()
		this.texPanel.dispose()
	}

}