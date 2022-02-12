
import * as THREE from '../../build/three.module.js';
import { positionAtT, intersectionObjectLine, getNDCposFromWorld} from './../utils.js';
import { VRGUI} from './VRGUI.js';
import { XRControllerModelFactory } from '../../jsm/webxr/XRControllerModelFactory.js';
import { PLYLoader } from '../../jsm/loaders/PLYLoader.js';
import { DataLoader } from './../DataLoader.js';
import { Scorer } from './../Scorer.js';
const VRStates =
{
	IDLE: "idle_state",
	CLICKING: "clicking_state",
	SELECTING_AREA: "drag_state",
	DRAGGING_UI: "ui_state",
}
const MODELS_TO_LOAD = 2
const HEIGHT_OFFSET = 1
const TeleportTypes = 
{
	LINE: "LINE",
	ARC:  "ARC",
}
var IconTypes =
{
	SELECT_TOOL: null,
	TELEPORT_ARROW: null,
	UI_POINTER: null
}
export class VRControls {
	constructor(scene, renderer) {
		this.loaded = false

		this.g = null
		this.tempVec = null
		this.tempVec1 = null
		this.tempVecP = null
		this.tempVecV = null
		this.guidingController = null
		this.guidelight = null
		this.guideline = null
		this.lineGeometryVertices = null
		this.lineSegments = null
		this.guidesprite = null

		this.camera_group = new THREE.Group()
		this.camera_group.name = "cameraGroup"

		this.controller1 = null
		this.controller2 = null
		this.controllerGrip1 = null
		this.controllerGrip2 = null
		this.scene = scene
		this.sceneGUI = new THREE.Scene();
		this.renderer = renderer
		this.camera = null

		this.state = VRStates.IDLE
		this.leftControllerData = null
		this.rightControllerData = null
		this.spinDir = 1
		this.spinTimer = 0
		this.colPlane = null
		this.currentPointedGroundY = -1
		this.currentPointedPosition = new THREE.Vector3()
		this.currentPointedObject = null
		this.currentClickedObject = null
		this.timerGroundUpdater =0
		this.startedMovement = false
		this.teleportType = TeleportTypes.LINE
		this.models_loaded = 0
		this.GUI = new VRGUI(this.camera_group)

		this.selectBox = {
			startPos: null,
			endPos: null,
			startDir: null,
			endDir: null,
			startRay: null,
			endRay: null,
			startNDC: null,
			endNDC: null,
		}

		this.drag_timer = 0
		var self = this

		const loader = new PLYLoader();
		loader.load( '../assets/arrow.ply', function ( geometry ) {
			const material = new THREE.MeshBasicMaterial( { color: 0xffffff} );
			//material.depthTest = false;
			IconTypes.TELEPORT_ARROW = new THREE.Mesh( geometry, material );
			//IconTypes.TELEPORT_ARROW.renderOrder = 10

			material.transparent = true;
			self.models_loaded +=1
			self.loaded = true;
			//console.log(self.guidesprite)
		})
		loader.load( '../assets/selectTool.ply', function ( geometry ) {
			const material = new THREE.MeshBasicMaterial( { color: 0xffffff} );
			//material.depthTest = false;
			material.transparent = true;
			IconTypes.SELECT_TOOL = new THREE.Mesh( geometry, material );
			//IconTypes.SELECT_TOOL.renderOrder = 10
			//self.guidesprite 
			self.models_loaded +=1
			self.loaded = (self.models_loaded == MODELS_TO_LOAD);
			//console.log(self.guidesprite)
		})

		const geometryPointer = new THREE.SphereGeometry( 0.015, 16, 16 );
		const materialPointer = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		IconTypes.UI_POINTER = new THREE.Mesh( geometryPointer, materialPointer );





		function  onSelectStart(self, controller)
		{
			if(controller.type == "left")
			{
				onSelectStartLeft(self, controller)
			}
			else if(controller.type == "right")
			{
				onSelectStartRight(self, controller)
			}

		}
		function  onSelectEnd(self, controller)
		{
			if(controller.type == "left")
			{
				onSelectEndLeft(self, controller)
			}
			else if(controller.type == "right")
			{
				onSelectEndRight(self, controller)
			}
		}
		function onSelectStartLeft(self, controller) {

		}
		function onSelectEndLeft(self, controller) {
			
		}
		function onSelectStartRight(self, controller) {
			/*if(self.state == VRStates.IDLE)
			{
				if(self.instancePointed != null && self.instancePointed.object.name != SCENE_MODEL_NAME)
				{
					self.state = VRStates.DRAGGING_UI
					self.instanceDragged = self.instancePointed 
					self.instancePointed = null
				}
			}*/
			self.state = VRStates.CLICKING
			self.currentClickedObject = self.currentPointedObject
			if(self.currentClickedObject.hasClickFunctions)
			{
				self.currentClickedObject.onStartClick()
			}

		    
		}

		function onSelectEndRight(self, controller) {

			/*if(self.state == VRStates.DRAGGING_UI)
			{
				self.instanceDragged = null
				self.state = VRStates.IDLE
			}*/
			self.drag_timer = 0
			if(self.state == VRStates.CLICKING)
			{
				if(self.currentClickedObject.hasClickFunctions)
				{
					if(self.currentClickedObject == self.currentPointedObject)
					{
						self.currentClickedObject.onEndClick()
					}
					else
					{
						self.currentClickedObject.onCancelClick()
					}

				}
				if(self.currentPointedObject.name==PointedObjectNames.GROUND) //check collision object to decide what to do
				{
					self.endMovingUser(self.rightControllerData.controller)
				}
				else if(self.currentPointedObject.name==PointedObjectNames.WALL)
				{
					self.updateCollectionNoBox()
				}
				
				//else if()
			}
			else if(self.state == VRStates.DRAGGING_UI)
			{
				if(self.currentClickedObject.hasClickFunctions)
				{
					self.currentClickedObject.onEndDrag()
				}
			}
			else if(self.state == VRStates.SELECTING_AREA)
			{
				self.endSelectionBox()
			}
			self.state = VRStates.IDLE
			self.currentClickedObject = null
		}
		
		this.controller1 = this.renderer.xr.getController( 0 );
		this.controller1.addEventListener( 'selectstart', function(){ onSelectStart(self, this);} );
		this.controller1.addEventListener( 'selectend', function(){ onSelectEnd(self, this);} );
		this.controller1.addEventListener( 'connected', function ( event ) {
			this.add( self.buildController( event.data ) );
			this.type = event.data.handedness
		} );
		this.controller1.addEventListener( 'disconnected', function () {
			this.remove( this.children[ 0 ] );

		} );
		

		this.controller2 = this.renderer.xr.getController( 1 );
		this.controller2.addEventListener( 'selectstart',  function(){ onSelectStart(self, this);} );
		this.controller2.addEventListener( 'selectend',  function(){ onSelectEnd(self, this);} );
		this.controller2.addEventListener( 'connected', function ( event ) {
			this.add( self.buildController( event.data ) );
			this.type = event.data.handedness

		} );
		this.controller2.addEventListener( 'disconnected', function () {
			this.remove( this.children[ 0 ] );

		} );


		const controllerModelFactory = new XRControllerModelFactory();

		this.controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
		this.controllerGrip1.add( controllerModelFactory.createControllerModel( this.controllerGrip1 ) );


		this.controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
		this.controllerGrip2.add( controllerModelFactory.createControllerModel( this.controllerGrip2 ) );
		

		
		
		//

		this.g = new THREE.Vector3(0,-9.8,0);
		this.tempVec = new THREE.Vector3();
		this.tempVec1 = new THREE.Vector3();
		this.tempVecP = new THREE.Vector3();
		this.tempVecV = new THREE.Vector3();

		// The this.guideline
		this.lineSegments=10;
		const lineGeometry = new THREE.BufferGeometry();
		this.lineGeometryVertices = new Float32Array((this.lineSegments +1) * 3);
		this.lineGeometryVertices.fill(0);
		const lineGeometryColors = new Float32Array((this.lineSegments +1) * 3);
		lineGeometryColors.fill(0.5);
		lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.lineGeometryVertices, 3));
		lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineGeometryColors, 3));
		const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });
		this.guideline = new THREE.Line( lineGeometry, lineMaterial );

		// The light at the end of the line
		this.guidelight = new THREE.PointLight(0xffeeaa, 0, 2);

		this.camera_group.add( this.controller1 );
		this.camera_group.add( this.controller2 );
		this.camera_group.add( this.controllerGrip1 );
		this.camera_group.add( this.controllerGrip2 );
		//this.camera_group.add(camera)
		this.scene.add(this.camera_group);
		
	}
	resetCameraPos()
	{
		this.camera_group.position.x = DataLoader.getCurrentModel().pos_x_cam_start
		this.camera_group.position.z = DataLoader.getCurrentModel().pos_z_cam_start
		this.camera_group.position.y = DataLoader.getCurrentModel().vr_y+1
	}
	restart(scene, camera, renderer, active)
	{

		this.sceneGUI = new THREE.Scene();
		
		this.guidingController = null
		
		this.GUI.restart(scene)
		this.state = VRStates.IDLE
		this.leftControllerData = null
		this.rightControllerData = null
		this.spinDir = 1
		this.spinTimer = 0
		this.colPlane = null
		this.currentPointedGroundY = -1
		this.currentPointedPosition = new THREE.Vector3()
		this.currentPointedObject = null
		this.currentClickedObject = null
		this.timerGroundUpdater =0
		this.startedMovement = false
		this.teleportType = TeleportTypes.LINE
		this.drag_timer = 0

		this.camera = camera

		if(active)
		{
			this.camera_group.add(camera)
			this.sceneGUI.add(this.camera_group);
			this.resetCameraPos()
		}
	}
	sendCollectionsToGui()
	{
		let collections = Scorer.getCurrentCandidates()

		const vrCollections = []
		const camList = DataLoader.getCameraList()
		for(let i=0; i <collections.length; ++i)
		{
			let elems = []
			for(let j=0; j <collections[i].elems.length; ++j)
			{
				const cameraInfo = camList[collections[i].elems[j]]
				const vrColElem = {
					imagePath: 'models/'+DataLoader.getCurrentModel().path+'/thumbnails/'+cameraInfo.name,
					index: collections[i].elems[j],
					camInfo: cameraInfo,
				}
				elems.push(vrColElem)
			}	
			vrCollections.push(elems)
		}
		this.GUI.updatePhotoCollections(vrCollections)
	}
	genCandidatesWIP()
	{
		const clusteringOptions = {
			max_num_collections: 5,
			max_collection_size: 20,
			similitude_treshold: 0.7,
			discard_too_similar: true,
			clustering_method: 'single_linkage',
			clustering_method_aux: false,
		}
		const scoreOptions = {
			position: 1,
			orientation: 0,
			projection: 0,
		}
		console.log(Scorer.c_min_pos)
		console.log(this.camera)
		Scorer.genNewCandidates(DataLoader.getCameraList(), null, clusteringOptions, scoreOptions, this.camera)
		this.sendCollectionsToGui()


	}
	isLoaded()
	{
		return this.loaded
	}
	render(scene, renderer, main_camera)
	{
		const sceneModels = DataLoader.getSceneModels() 
		if(sceneModels.length >0)
			sceneModels[0].material.uniforms.projectCapture.value = this.GUI.getProjectCapture()

		const width = Math.floor( window.innerWidth );
		const height = Math.floor( window.innerHeight);

		renderer.setScissorTest( false );

		main_camera.aspect = width / height;
		main_camera.updateProjectionMatrix();

		this.GUI.render(renderer, scene)
		renderer.render( scene, main_camera );
		renderer.clearDepth();
		renderer.render(this.sceneGUI, main_camera)
	}
	updateControllers()
	{
		const session = this.renderer.xr.getSession();
		let i = 0;
		if (session) {
	        for (const source of session.inputSources) {
	        	let handedness;
	            if (source && source.handedness) {
	                handedness = source.handedness; //left or right controllers
	            }
	            if(source.gamepad)
	            {
	            	const controller = this.renderer.xr.getController(i++);
	            	const data = {
		            	buttons: source.gamepad.buttons.map((b) => b.value),
		                axes: source.gamepad.axes.slice(0),
		                controller: controller
		            }
		            if(handedness == "left")
		            	this.leftControllerData = data
		            else if(handedness =="right")
		            	this.rightControllerData = data 
	            }
	            
	        }
	        if(this.rightControllerData && !this.startedMovement)
	        	this.startMovingUser(this.rightControllerData.controller)
	    }
	}
	isInnerTriggerPressed(controllerData)
	{
		return controllerData.buttons[1] == 1
	}
	isStickButtonPressed(controllerData)
	{
		return controllerData.buttons[3] == 1
	}
	isAButtonPressed(controllerData)
	{
		return controllerData.buttons[4] == 1
	}
	isBButtonPressed(controllerData)
	{
		return controllerData.buttons[5] == 1
	}


	updateGuideSprite(requestedSprite)
	{
		if(requestedSprite == null)
		{
			if(this.guidesprite != null)
				this.sceneGUI.remove(this.guidesprite);
			this.guidesprite = null
			return
		}
		if(this.guidesprite != requestedSprite)
		{
			if(this.guidesprite != null)
			{
				this.sceneGUI.remove(this.guidesprite);
				requestedSprite.position.copy(this.guidesprite)
			}
			this.guidesprite = requestedSprite
			this.sceneGUI.add(this.guidesprite)
		}
		
	}
	startMovingUser(controller)
	{
		console.log("startMoviing")
		//this.state = VRStates.MOVING
		this.guidingController = controller;
	    this.guidelight.intensity = 1;
	    controller.add(this.guideline);
	    //this.scene.add(this.guidesprite);
	    this.startedMovement = true
	}
	endMoveArc(controller)
	{
		const feetPos = this.renderer.xr.getCamera(this.camera).getWorldPosition(this.tempVec);
        feetPos.y = -1//this.camera_group.position.y;

        // cursor position
        const p = this.guidingController.getWorldPosition(this.tempVecP);
        const v = this.guidingController.getWorldDirection(this.tempVecV);
        v.multiplyScalar(6);
        const offsety = -this.getFloorFromPos(this.camera_group.position);
        const t = (-v.y+offsety  + Math.sqrt((v.y+offsety)**2 - 2*(p.y+offsety)*this.g.y))/this.g.y;
        const cursorPos = positionAtT(this.tempVec1,t,p,v,this.g);
        //cursorPos.y = this.camera_group.position.y+1
        cursorPos.y = this.getFloorFromPos(cursorPos) + HEIGHT_OFFSET

        this.moveVRCam(cursorPos)
	}
	endMoveLine(controller)
	{
		const cursorPos = new THREE.Vector3()
		cursorPos.copy(this.currentPointedPosition)
		cursorPos.y = this.getFloorFromPos(cursorPos) + HEIGHT_OFFSET
		this.moveVRCam(cursorPos)
	}
	endMovingUser(controller)
	{
		console.log("endMoviing")
		if (this.guidingController === controller) {

			if(this.teleportType == TeleportTypes.ARC)
			{
				this.endMoveArc(controller)
			}
			else if(this.teleportType == TeleportTypes.LINE)
			{
				this.endMoveLine(controller)
			}
	        // feet position
	        
	    }
	}

	
	updatePointedPosition(dt)
	{
		const sceneModelsCol = DataLoader.getSceneModelsCol() 
		if(this.teleportType == TeleportTypes.ARC)
		{
	        // cursor position
	        if(this.guidingController && this.timerGroundUpdater > 0.3)
	        {
	        	const p = this.guidingController.getWorldPosition(this.tempVecP);
		        const v = this.guidingController.getWorldDirection(this.tempVecV);
		        v.multiplyScalar(6);
		        const offsety =  -this.getFloorFromPos(this.camera_group.position);
		        const t = (-v.y+offsety  + Math.sqrt((v.y+offsety)**2 - 2*(p.y+offsety)*this.g.y))/this.g.y;
		        const cursorPos = positionAtT(this.tempVec1,t,p,v,this.g);

				this.currentPointedGroundY = this.getFloorFromPos(cursorPos)
				console.log("FLOOR Y = "+this.currentPointedGroundY)
				this.timerGroundUpdater = 0
	        }
	        else if(this.guidingController)
	        {
	        	this.timerGroundUpdater +=dt
	        }
	    }
	    else if(this.teleportType == TeleportTypes.LINE)
	    {
	    	if(this.guidingController && this.timerGroundUpdater > 0.3)
	        {

			    const pos = new THREE.Vector3()
				const dir = new THREE.Vector3()
				this.guidingController.getWorldPosition(pos);
			    this.guidingController.getWorldDirection(dir);
			    dir.multiplyScalar(-1)
			    const intersection = intersectionObjectLine(sceneModelsCol, pos, dir)
			    const intersectionUI = intersectionObjectLine(this.GUI.children,pos,dir)
			    if(intersection != null && intersectionUI == null)
			    {
			    	this.currentPointedPosition.copy(intersection.point)
			    	this.currentPointedGroundY = this.getFloorFromPos(this.currentPointedPosition)
			    	this.currentPointedObject = intersection.object
			    	if(this.currentPointedObject.name == PointedObjectNames.GROUND)
			    		this.updateGuideSprite(IconTypes.TELEPORT_ARROW)
			    	else if(this.currentPointedObject.name == PointedObjectNames.WALL)
			    	{
			    		this.updateGuideSprite(IconTypes.SELECT_TOOL)
			    		this.guidesprite.lookAt(pos)
			    	}
			    	else
			    		this.updateGuideSprite(null)
			    	
			    }
			    else if(intersectionUI != null)
			    {
			    	this.currentPointedPosition.copy(intersectionUI.point)
			    	this.currentPointedObject = intersectionUI.object
			    	this.updateGuideSprite(IconTypes.UI_POINTER)
			    }

			    
			}
			else if(this.guidingController)
	        {
	        	this.timerGroundUpdater +=dt
	        }
	    }
        
	}
	updateGuidingControllerArc()
	{
		const p = this.guidingController.getWorldPosition(this.tempVecP);
        //p.y = p.y+1
        // Set Vector V to the direction of the controller, at 1m/s
        const v = this.guidingController.getWorldDirection(this.tempVecV);
        //v.y = v.y+1
        // Scale the initial velocity to 6m/s
        v.multiplyScalar(6);

        // Time for tele ball to hit ground
        const offsety =  -this.currentPointedGroundY; // - ground y
        const t = (-v.y+offsety  + Math.sqrt((v.y+offsety)**2 - 2*(p.y+offsety)*this.g.y))/this.g.y;

        const vertex = this.tempVec.set(0,0,0);
        for (let i=1; i<=this.lineSegments; i++) {

            // set vertex to current position of the virtual ball at time t
            positionAtT(vertex,i*t/this.lineSegments,p,v,this.g);
            this.guidingController.worldToLocal(vertex);
            vertex.toArray(this.lineGeometryVertices,i*3);
        }
        this.guideline.geometry.attributes.position.needsUpdate = true;
        
        // Place the light and sprite near the end of the poing
        positionAtT(this.guidelight.position,t*0.98,p,v,this.g);
        if(this.guidesprite != null)
        	positionAtT(this.guidesprite.position,t*0.98,p,v,this.g);
	}
	updateGuidingControllerLine()
	{
		const p = this.guidingController.getWorldPosition(this.tempVecP);
        const v = this.guidingController.getWorldDirection(this.tempVecV);
        const distance = p.distanceTo( this.currentPointedPosition );
        
        //const distance = p.distanceTo( this.currentPointedPosition );
        const offset = -distance/9
        const vertex = this.tempVec.set(0,0,0);
        this.lineGeometryVertices.fill(0);

        for (let i=1; i<=this.lineSegments; i++) {

            // set vertex to current position of the virtual ball at time t

            vertex.copy(p);
    		vertex.addScaledVector(v,(i-1)*offset);
    		this.guidingController.worldToLocal(vertex);
            vertex.toArray(this.lineGeometryVertices,i*3);
        }
        this.guideline.geometry.attributes.position.needsUpdate = true;
        this.guidelight.position.copy(this.currentPointedPosition)
        if(this.guidesprite != null)
        {
        	this.guidesprite.position.copy(this.currentPointedPosition)
        }
        	
	}

	startSelectionBox()
	{
		const sceneModelsCol = DataLoader.getSceneModelsCol() 
		console.log("start box")
		let pos = new THREE.Vector3()
		let dir = new THREE.Vector3()
	    this.guidingController.getWorldPosition(pos);
		this.guidingController.getWorldDirection(dir);
	    dir.multiplyScalar(-1)

		this.selectBox.startPos = pos
	    this.selectBox.endPos = pos
	    this.selectBox.startDir = dir
	    this.selectBox.endDir = dir
	    this.selectBox.startRay = null
	    this.selectBox.endRay = null
	    this.selectBox.startNDC = null
		this.selectBox.endNDC = null

	    var raycasterStart =  new THREE.Raycaster(this.selectBox.startPos,  this.selectBox.startDir);    
		var intersectsStart = raycasterStart.intersectObjects( sceneModelsCol ); 
		if(intersectsStart.length > 0){
			this.selectBox.startRay = intersectsStart[0].point
	    	this.selectBox.endRay = intersectsStart[0].point
		}
	}

	updateCollectionNoBox()
	{
		//TODO get this from other place
		const clusteringOptions = {
			max_num_collections: 5,
			max_collection_size: 20,
			similitude_treshold: 0.7,
			discard_too_similar: true,
			clustering_method: 'single_linkage',
			clustering_method_aux: false,
		}
		const scoreOptions = {
			position: 0,
			orientation: 0,
			projection: 1,
		}

		Scorer.genNewCandidates(DataLoader.getCameraList(), null, clusteringOptions, scoreOptions, this.camera)
		this.sendCollectionsToGui()
		
	}

	endSelectionBox()
	{
		console.log("end box")

 

		if(this.selectBox.endRay != null)
		{
			//TODO get this from other place
			const clusteringOptions = {
				max_num_collections: 5,
				max_collection_size: 20,
				similitude_treshold: 0.7,
				discard_too_similar: true,
				clustering_method: 'single_linkage',
				clustering_method_aux: false,
			}
			const scoreOptions = {
				position: 1,
				orientation: 0,
				projection: 0,
			}
			const vec1aux = new THREE.Vector3()
			const vec2aux = new THREE.Vector3()

			let rectangle =
			{
				startWorld:  this.selectBox.startRay,
				endWorld: this.selectBox.endRay,
				startNDC: getNDCposFromWorld(this.camera,this.selectBox.startPos),
				endNDC: getNDCposFromWorld(this.camera,this.selectBox.endPos),
			}
			Scorer.genNewCandidates(DataLoader.getCameraList(), rectangle, clusteringOptions, scoreOptions, this.camera)
			this.sendCollectionsToGui()
		}

		const sceneModels = DataLoader.getSceneModels() 
		sceneModels[0].material.uniforms.squareVR.value = false
		const camCapture = this.GUI.getCameraCapture()
		if(camCapture)
		{
			const viewMat = new THREE.Matrix4();
			const projMat = new THREE.Matrix4();
			viewMat.copy(camCapture.matrixWorldInverse);
			projMat.copy(camCapture.projectionMatrix)
			sceneModels[0].material.uniforms.viewMatrixCapture.value = viewMat;
			sceneModels[0].material.uniforms.projectionMatrixCapture.value = projMat;
		}

		this.selectBox.startPos = null
	    this.selectBox.endPos = null
	    this.selectBox.startDir = null
	    this.selectBox.endDir = null
	    this.selectBox.startRay = null
	    this.selectBox.endRay = null
	    this.selectBox.startNDC = null
		this.selectBox.endNDC = null
	}
	updateSelectionBox(dt, renderer)
	{
		const sceneModelsCol = DataLoader.getSceneModelsCol() 
		const sceneModels = DataLoader.getSceneModels() 

		this.selectBox.sceneModelsPointer = sceneModels

		let pos = new THREE.Vector3()
		let dir = new THREE.Vector3()
	    this.guidingController.getWorldPosition(pos);
		this.guidingController.getWorldDirection(dir);
	    dir.multiplyScalar(-1)

	    this.selectBox.endPos = pos
	    this.selectBox.endDir = dir

		this.selectBox.startNDC = getNDCposFromWorld(this.camera,this.selectBox.startPos)
		this.selectBox.endNDC = getNDCposFromWorld(this.camera,this.selectBox.endPos)
		const v1 = new THREE.Vector2(this.selectBox.startNDC.x,this.selectBox.startNDC.y)
		const v2 = new THREE.Vector2(this.selectBox.endNDC.x,this.selectBox.endNDC.y)
	    sceneModels[0].material.uniforms.squareVR.value = true
	    const viewMat = new THREE.Matrix4();
		const projMat = new THREE.Matrix4();
		viewMat.copy(this.camera.matrixWorldInverse);
		projMat.copy(this.camera.projectionMatrix)
	    sceneModels[0].material.uniforms.viewMatrixCapture.value = viewMat;
		sceneModels[0].material.uniforms.projectionMatrixCapture.value = projMat;
		
		const raycasterEnd =  new THREE.Raycaster(this.selectBox.endPos, this.selectBox.endDir); 

		const intersectsEnd = raycasterEnd.intersectObjects( sceneModelsCol );      
		if(intersectsEnd.length > 0)
		{
			this.selectBox.endRay =intersectsEnd[0].point
			
			sceneModels[0].material.uniforms.squareVR.value = true
		}

		if(this.selectBox.endRay !=null)
		{
			this.selectBox.startNDC = getNDCposFromWorld(this.camera,this.selectBox.startRay)
			this.selectBox.endNDC = getNDCposFromWorld(this.camera,this.selectBox.endRay)
			let aux =0;
			if(this.selectBox.startNDC.x >this.selectBox.endNDC.x)
			{
				aux = this.selectBox.startNDC.x
				this.selectBox.startNDC.x = this.selectBox.endNDC.x
				this.selectBox.endNDC.x = aux
			}
			if(this.selectBox.startNDC.y >this.selectBox.endNDC.y)
			{
				aux = this.selectBox.startNDC.y
				this.selectBox.startNDC.y = this.selectBox.endNDC.y
				this.selectBox.endNDC.y = aux
			}
			sceneModels[0].material.uniforms.vUv_VR_square_min.value   = this.selectBox.startNDC
			sceneModels[0].material.uniforms.vUv_VR_square_max.value   = this.selectBox.endNDC
		}
	}
	update(dt, renderer)
	{
		if(this.currentPointedObject)
		{
			//console.log(this.currentPointedObject)
			if(this.currentPointedObject.hasClickFunctions)
				this.currentPointedObject.onHover()
		}
			
		this.GUI.update(dt)

		if(this.state == VRStates.CLICKING)
		{
			this.drag_timer += dt
			if(this.drag_timer > 0.5)
			{
				
				
				if(this.currentClickedObject != null && this.currentClickedObject == this.currentPointedObject && this.currentClickedObject.hasClickFunctions)
				{	//IF IS UI WE PROPAGATE THE EVENT
					this.state = VRStates.DRAGGING_UI
					this.currentClickedObject.onStartDrag()
				}
				else if(this.currentClickedObject != null && this.currentClickedObject == this.currentPointedObject && this.currentPointedObject.name == PointedObjectNames.WALL)
				{
					//IF IS WALL WE START SELECTION BOX
					this.state = VRStates.SELECTING_AREA
					this.startSelectionBox()
				}
			}	
		}
		else if(this.state == VRStates.SELECTING_AREA)
		{
			this.updateSelectionBox(dt, renderer)
		}

		this.updateControllers()
		this.updatePointedPosition(dt)


		if(this.state == VRStates.DRAGGING_UI && this.currentClickedObject.hasClickFunctions)
		{
			const pos = new THREE.Vector3()
			const dir = new THREE.Vector3()
			this.guidingController.getWorldPosition(pos);
			this.guidingController.getWorldDirection(dir);
			//this.GUI.updateDrag(pos, dir)
			this.currentClickedObject.onUpdateDrag(pos,dir)
		}
			
	

		if (this.guidingController) {
			if(this.teleportType == TeleportTypes.ARC)
			{
				this.updateGuidingControllerArc()
			}
			else if(this.teleportType == TeleportTypes.LINE)
			{
				this.updateGuidingControllerLine()
			}
	    }
	}

	buildController( data ) {
		console.log(data)
		let geometry, material;

		switch ( data.targetRayMode ) {

			case 'tracked-pointer':

				geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 4 ], 3 ) );
				geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

				material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
				//material.depthTest = false;
				material.transparent = true;
				material.opacity = 0;
				const theline = new THREE.Line( geometry, material );
				theline.renderOrder = 1
				return theline

			case 'gaze':

				geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
				material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
				return new THREE.Mesh( geometry, material );

		}

	}

	moveToCapturePosition(camera, index_capture)
	{
		var newpos = new THREE.Vector3()
		var captureCam = (DataLoader.getCameraList())[index_capture].camera
		newpos.copy(captureCam.position)
		newpos.y = this.getFloorFromPos(newpos)
		this.camera_group.position.copy(newpos)
	}

	getFloorFromPos(position)
	{
		const sceneModelsCol = DataLoader.getSceneModelsCol() 

		const auxPos = new THREE.Vector3(position.x,100 ,position.z)
		const auxUp = new THREE.Vector3(0,-1,0)
		const raycasterFloor =  new THREE.Raycaster(auxPos, auxUp);    
		const models = []
		for(let i=0; i<sceneModelsCol.length; ++i )
		{
			if(sceneModelsCol[i].name=="THEMODEL_COL_GROUND")
				models.push(sceneModelsCol[i])
		}
		const intersectsFloor = raycasterFloor.intersectObjects( models );  
		//console.log(intersectsFloor)
		if(intersectsFloor.length > 0)
		{
			let minY = 1000;
			for(let i = 0; i < intersectsFloor.length; i++)
			{
				if(intersectsFloor[i].point.y < minY)
					minY = intersectsFloor[i].point.y
			}
			return minY+0.5
		}
		else
		{
			return DataLoader.getCurrentModel().vr_y
		}
	}

	moveVRCam(offset)
	{
		this.GUI.onMoveEvent(this.camera_group.position, offset)
		this.camera_group.position.copy(offset)

	}
	updateVRCollections(collections)
	{
		this.GUI.updatePhotoCollections(collections)
	}
	changeCaptureInView(camera, scene)
	{
		this.GUI.changeCaptureInView(camera, scene)
		this.GUI.setProjectCapture(true)
	}

	hideShowZoomedImage(renderer, scene, show)
	{
		this.GUI.setProjectCapture(false)
		this.GUI.hideShowZoomedImage(renderer, scene, show)
	}
	displayImageCollection(index_capture, collection_index)
	{
		this.GUI.displayImageCollection(index_capture, collection_index)
	}
	
}