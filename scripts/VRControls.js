
import * as THREE from '../build/three.module.js';
import { positionAtT, intersectionObjectLine} from './utils.js';
import { XRControllerModelFactory } from '../jsm/webxr/XRControllerModelFactory.js';
import { PLYLoader } from '../jsm/loaders/PLYLoader.js';
const VRStates =
{
	IDLE: "idle_state",
	DRAGGING: "drag_state",
	MOVING: "move_state",
	SHOWING_UI: "ui_state",
	DELETING_ITEM: "deleting_state",
}
const HEIGHT_OFFSET = 1
const TeleportTypes = 
{
	LINE: "LINE",
	ARC:  "ARC",
}
export class VRControls {
	constructor(scene, renderer, camera, camera_group, selector) {
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
		this.camera_group = camera_group

		this.controller1 = null
		this.controller2 = null
		this.controllerGrip1 = null
		this.controllerGrip2 = null
		this.scene = scene
		this.renderer = renderer
		this.camera = camera
		this.selector = selector

		this.state = VRStates.IDLE
		this.leftControllerData = null
		this.rightControllerData = null
		this.spinDir = 1
		this.spinTimer = 0
		this.colPlane = null
		this.currentPointedGroundY = -1
		this.currentPointedPosition = new THREE.Vector3()
		this.timerGroundUpdater =0
		this.startedMovement = false
		this.teleportType = TeleportTypes.LINE
		var self = this

		const loader = new PLYLoader();
		loader.load( '../assets/arrow.ply', function ( geometry ) {
			const material = new THREE.MeshBasicMaterial( { color: 0xffffff} );
			self.guidesprite = new THREE.Mesh( geometry, material );
			self.loaded = true;
			console.log(self.guidesprite)
		})




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
					self.state = VRStates.DRAGGING
					self.instanceDragged = self.instancePointed 
					self.instancePointed = null
				}
			}*/
		    
		}

		function onSelectEndRight(self, controller) {

			/*if(self.state == VRStates.DRAGGING)
			{
				self.instanceDragged = null
				self.state = VRStates.IDLE
			}*/
			if(true) //check collision object to decide what to do
			{
				self.endMovingUser(self.rightControllerData.controller)
			}

		    
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
		this.camera_group.add( this.controller1 );

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
		this.camera_group.add( this.controller2 );

		const controllerModelFactory = new XRControllerModelFactory();

		this.controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
		this.controllerGrip1.add( controllerModelFactory.createControllerModel( this.controllerGrip1 ) );
		this.camera_group.add( this.controllerGrip1 );

		this.controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
		this.controllerGrip2.add( controllerModelFactory.createControllerModel( this.controllerGrip2 ) );
		this.camera_group.add( this.controllerGrip2 );
		
		
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

		this.scene.add(this.camera_group);
		
		//this.scene.add(this.colPlane);
	}
	isLoaded()
	{
		return this.loaded
	}
	updateControllers()
	{
		const session = this.renderer.xr.getSession();
		let i = 0;
		if (session) {
	        for (const source of session.inputSources) {
	        	var handedness;
	            if (source && source.handedness) {
	                handedness = source.handedness; //left or right controllers
	            }
	            if(source.gamepad)
	            {
	            	const controller = this.renderer.xr.getController(i++);
	            	var data = {
		            	buttons: source.gamepad.buttons.map((b) => b.value),
		                axes: source.gamepad.axes.slice(0),
		                controller: controller
		            }
		            if(handedness == "left")
		            	this.leftControllerData = data
		            else if(handedness =="right")
		            	this.rightControllerData = data 
	            }
	            
	           
	            /*if (!source.gamepad || handedness != "right") continue;
	            const controller = this.renderer.xr.getController(i++);

	            var data = {
	                //handedness: handedness,
	                buttons: source.gamepad.buttons.map((b) => b.value),
	                axes: source.gamepad.axes.slice(0)
	            };*/
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


	
	startMovingUser(controller)
	{
		console.log("startMoviing")
		//this.state = VRStates.MOVING
		this.guidingController = controller;
	    this.guidelight.intensity = 1;
	    controller.add(this.guideline);
	    this.scene.add(this.guidesprite);
	    this.startedMovement = true
	}
	endMoveArc(controller)
	{
		const feetPos = this.renderer.xr.getCamera(m_camera).getWorldPosition(this.tempVec);
        feetPos.y = -1//this.camera_group.position.y;

        // cursor position
        const p = this.guidingController.getWorldPosition(this.tempVecP);
        const v = this.guidingController.getWorldDirection(this.tempVecV);
        v.multiplyScalar(6);
        var offsety = -this.getFloorFromPos(m_camera_group.position);
        const t = (-v.y+offsety  + Math.sqrt((v.y+offsety)**2 - 2*(p.y+offsety)*this.g.y))/this.g.y;
        var cursorPos = positionAtT(this.tempVec1,t,p,v,this.g);
        //cursorPos.y = this.camera_group.position.y+1
        cursorPos.y = this.getFloorFromPos(cursorPos) + HEIGHT_OFFSET

        //console.log("FLOOR Y = "+cursorPos.y)
        // Offset
        //const offset = cursorPos.addScaledVector(feetPos ,-1);

        // Do the locomotion
        //locomotion(offset);
        this.moveVRCam(cursorPos)
        // clean up
        this.guidingController = null;
        this.guidelight.intensity = 0;
        controller.remove(this.guideline);
        m_scene.remove(this.guidesprite);

        this.state = VRStates.IDLE
	}
	endMoveLine(controller)
	{
		var cursorPos = new THREE.Vector3()
		cursorPos.copy(this.currentPointedPosition)
		cursorPos.y = this.getFloorFromPos(cursorPos) + HEIGHT_OFFSET
		this.moveVRCam(cursorPos)
        // clean up
        //this.guidingController = null;
        //this.guidelight.intensity = 0;
        //controller.remove(this.guideline);
        //m_scene.remove(this.guidesprite);

        //this.state = VRStates.IDLE
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
	doJoystickEvents()
	{
		/*if(this.defaulted)
		{
			if(this.rightControllerData.axes[3] < -0.5 && this.state == VRStates.IDLE)
			{
				this.startMovingUser(this.rightControllerData.controller)
				
			} else if(this.rightControllerData.axes[3] > -0.2 && this.state == VRStates.MOVING)
			{
				this.endMovingUser(this.rightControllerData.controller)
			}
		} else{
			if(this.rightControllerData.axes[3] > -0.1 && this.state == VRStates.IDLE)
			{
				this.defaulted = true
			}
		}*/
		

		
	}
	
	doInputEvents()
	{
		if(this.rightControllerData == null/* || this.leftControllerData == null*/)
			return
		this.doJoystickEvents()
		if(this.isAButtonPressed(this.rightControllerData))
		{
			if(this.state == VRStates.IDLE)
			{
				
				this.state = VRStates.DELETING_ITEM
			}
		}
		else
		{
			if(this.state == VRStates.DELETING_ITEM)
				this.state = VRStates.IDLE
		}
		if(this.isStickButtonPressed(this.rightControllerData))
		{
			if(this.state == VRStates.IDLE)
			{
				//Show UI
				var pos = new THREE.Vector3()
				var dir = new THREE.Vector3()
				this.rightControllerData.controller.getWorldPosition(pos);
			    this.rightControllerData.controller.getWorldDirection(dir);
				//this.selector.showUI(pos, dir)
				this.state = VRStates.SHOWING_UI
			}
		}
		else
		{
			if(this.state == VRStates.SHOWING_UI)
			{
				this.state = VRStates.IDLE
			}
		}
		
	}
	updatePointedPosition(dt)
	{

		if(this.teleportType == TeleportTypes.ARC)
		{
	        // cursor position
	        if(this.guidingController && this.timerGroundUpdater > 0.3)
	        {
	        	const p = this.guidingController.getWorldPosition(this.tempVecP);
		        const v = this.guidingController.getWorldDirection(this.tempVecV);
		        v.multiplyScalar(6);
		        var offsety =  -this.getFloorFromPos(m_camera_group.position);
		        const t = (-v.y+offsety  + Math.sqrt((v.y+offsety)**2 - 2*(p.y+offsety)*this.g.y))/this.g.y;
		        var cursorPos = positionAtT(this.tempVec1,t,p,v,this.g);

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

			    var pos = new THREE.Vector3()
				var dir = new THREE.Vector3()
				this.guidingController.getWorldPosition(pos);
			    this.guidingController.getWorldDirection(dir);
			    dir.multiplyScalar(-1)
			    var pos = intersectionObjectLine(m_scene_models_col, pos, dir)
			    if(pos != null)
			    {
			    	this.currentPointedPosition.copy(pos.point)
			    	this.currentPointedGroundY = this.getFloorFromPos(this.currentPointedPosition)
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
        var offsety =  -this.currentPointedGroundY; // - ground y
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
        positionAtT(this.guidesprite.position,t*0.98,p,v,this.g);
	}
	updateGuidingControllerLine()
	{
		const p = this.guidingController.getWorldPosition(this.tempVecP);
        //p.y = p.y+1
        // Set Vector V to the direction of the controller, at 1m/s
        const v = this.guidingController.getWorldDirection(this.tempVecV);

        var distance = p.distanceTo( this.currentPointedPosition );
        var offset = -distance/10
        const vertex = this.tempVec.set(0,0,0);
        for (let i=1; i<=this.lineSegments; i++) {

            // set vertex to current position of the virtual ball at time t

            vertex.copy(p);
    		vertex.addScaledVector(v,(i-1)*offset);
    		this.guidingController.worldToLocal(vertex);
            vertex.toArray(this.lineGeometryVertices,i*3);
        }
        this.guidelight.position.copy(this.currentPointedPosition)
        this.guidesprite.position.copy(this.currentPointedPosition)
	}
	update(dt)
	{
		
		this.updateControllers()
		this.updatePointedPosition(dt)
		this.doInputEvents()
		if(this.state == VRStates.DRAGGING)
			this.updateInstanceDragged(dt)
		if(this.state == VRStates.SHOWING_UI && this.rightControllerData != null)
		{
			var pos = new THREE.Vector3()
			this.rightControllerData.controller.getWorldPosition(pos)
			//this.selector.updateUI(dt, pos)
		}
		/*const session = this.renderer.xr.getSession();
		let i = 0;
		if (session) {
	        for (const source of session.inputSources) {
	        	var handedness;
	            if (source && source.handedness) {
	                handedness = source.handedness; //left or right controllers
	            }

	            if (!source.gamepad || handedness != "right") continue;
	            const controller = this.renderer.xr.getController(i++);

	            var data = {
	                //handedness: handedness,
	                buttons: source.gamepad.buttons.map((b) => b.value),
	                axes: source.gamepad.axes.slice(0)
	            };
	            this.doVRinputEvents(controller, data)
	        }
	    }*/

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
				material.depthTest = false;
				material.transparent = true;
				var theline = new THREE.Line( geometry, material );
				//theline.renderOrder = 1
				return theline

			case 'gaze':

				geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
				material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
				return new THREE.Mesh( geometry, material );

		}

	}

	getFloorFromPos(position)
	{
		var auxPos = new THREE.Vector3(position.x,100 ,position.z)
		var auxUp = new THREE.Vector3(0,-1,0)
		var raycasterFloor =  new THREE.Raycaster(auxPos, auxUp);    
		var intersectsFloor = raycasterFloor.intersectObjects( m_scene_models_col );  
		//console.log(intersectsFloor)
		if(intersectsFloor.length > 0)
		{
			var minY = 1000;
			for(var i = 0; i < intersectsFloor.length; i++)
			{
				if(intersectsFloor[i].point.y < minY)
					minY = intersectsFloor[i].point.y
			}
			return minY+0.5
		}
		else
		{
			return m_models_values[m_gui.gui_options.current_model].vr_y
		}
	}

	moveVRCam(offset)
	{
		//this.camera_group.position.add(offset)
		this.camera_group.position.copy(offset)
	}
	
}