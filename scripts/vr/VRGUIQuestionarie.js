import * as THREE from '../../build/three.module.js';
import {VRGUIButton} from './VRGUIButton.js';
import {VRGUIQuestPage} from './VRGUIQuestPage.js';
import { ThumbnailSprite } from './../ThumbnailSprite.js';
import {UIElement} from './../ui/UIElement.js';
import { DataLoader } from './../DataLoader.js';
const OFFSET_Z = 0.005
export class VRGUIQuestionarie extends UIElement{
	constructor(offset_x, offset_y, offset_z, scale) {
		
		super("QUESTIONARIE", true)
		this.inited = false
		this.page = null
		this.scale.set(scale,scale,scale)
		this.position.set(offset_x, offset_y, offset_z+OFFSET_Z)
		this.questData = null
		this.currentPageIndex = 0
		this.recordedData = []
		this.recordedDistance = []
		this.recordedImages = []
		this.currentTimer = 0
		this.recording = false
		this.currentDistanceTracked = 0
		this.auxRecordDistancePos = new THREE.Vector3()
		this.auxRecordDistanceCurrentPos = new THREE.Vector3()
		const pathJson = "/assets/questionarie/quest.json"
		var xmlhttp = new XMLHttpRequest();
		var self = this;
		xmlhttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		        var myObj = JSON.parse(this.responseText);
		        self.setJsonData(myObj)
		        self.inited = true
		        console.log("INFO: JSON loaded: "+pathJson)
		    }
		};
		xmlhttp.open("GET", pathJson, true);
		console.log("INFO: Loading JSON: "+pathJson)
		xmlhttp.send();

		this.generatePanel()
		
	}

	initPage()
	{
		if(this.questData[this.currentPageIndex].pageType == "question")
		{
			console.log(this.parent)
			APPLICATION.enableSceneNavigation(false)
		}
		const page = new VRGUIQuestPage(0,0,0,1, this.questData[this.currentPageIndex])
		this.page = page
		this.add(page)
	}
	setJsonData(jsonData)
	{
		this.questData = jsonData.pages
		this.initPage()
	}
	generatePanel()
	{
		var loader = new THREE.TextureLoader();
		this.texPanel = loader.load('../assets/UI/panels/square_panel.png')
		this.materialPanel = new THREE.MeshBasicMaterial( { map: this.texPanel, transparent: true, opacity: 0.8,} );

		this.panel = new THREE.Mesh(new THREE.PlaneGeometry(1.000, 2.000), this.materialPanel);
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
	disposePage()
	{
		//TODO dispose using dispose (this leaks now)
		this.remove(this.page)
		//this.page.dispose()
	}
	nextPage()
	{
		if(this.currentPageIndex+1 < this.questData.length)
		{
			this.disposePage()
			this.currentPageIndex = this.currentPageIndex +1
			this.initPage()
		}
		
	}
	prevPage()
	{
		if(this.currentPageIndex > 0)
		{
			this.disposePage()
			this.currentPageIndex = this.currentPageIndex -1
			this.initPage()
		}
	}
	startRecordTime()
	{
		APPLICATION.enableSceneNavigation(true)
		this.currentDistanceTracked = 0
		this.auxRecordDistancePos.copy(this.auxRecordDistanceCurrentPos)
		this.recording = true
		this.currentTimer = 0
	}
	stopRecordTime()
	{

		this.recording = false
		console.log(this.currentDistanceTracked)
		console.log(this.auxRecordDistancePos)
		console.log(this.auxRecordDistanceCurrentPos)
		this.currentDistanceTracked += this.auxRecordDistancePos.distanceTo(this.auxRecordDistanceCurrentPos)
		const camName = this.parent.getSelectedImageName()
		this.recordedImages.push(camName)
		this.recordedDistance.push(this.currentDistanceTracked)
		this.recordedData.push(this.currentTimer)
		this.currentDistanceTracked = 0
		this.currentTimer = 0
	}
	restartQuest()
	{
		this.disposePage()
		this.recordedData = []
		this.recordedDistance = []
		this.recordedImages = []
		this.currentPageIndex = 0
		this.initPage()
	}
	incDistanceDueTeleport(oldPos, newPos)
	{
		if(this.recording)
		{
			this.currentDistanceTracked += this.auxRecordDistancePos.distanceTo(newPos)
			this.auxRecordDistancePos.copy(newPos)
		}
	}

	exportData()
	{
		DataLoader.saveQuestionarieData(this.recordedData, this.recordedDistance, this.recordedImages)
	}

	setCamPos(pos)
	{
		this.auxRecordDistanceCurrentPos.copy(pos)
	}
	update(dt)
	{
		super.update(dt)
		if(this.recording)
		{
			this.currentTimer += dt
		}
	}
}