import * as THREE from '../../build/three.module.js';

import { OrbitControls } from '../../jsm/controls/CustomOrbitControls.js';
import { SelectionBox } from '../../jsm/interactive/SelectionBox.js';
import { SelectionHelper } from '../../jsm/interactive/SelectionHelper.js';
import { DataLoader } from './../DataLoader.js';
import { getWorldIntersectFromNDCxy, getNDCposFromWorld, positionAtT, getWorldFromNDC, singleLinkageClustering, basicClustering} from './../utils.js';
import { Scorer } from './../Scorer.js';
import { Gui} from './Gui.js';
export class WebControls {
	constructor(renderer) {
		this.c_gui = null
		this.c_camera_group = new THREE.Group()
		this.init(renderer)
		this.c_controls = null
		this.c_controls_secondary = null
		this.c_capture_index_over_mouse = -1
		this.c_selection_rectangle = {
			startNDC: null,
			endNDC: null,
			startWorld: null,
			endWorld: null,
			selectionBox: null,
			helper: null,
		}
		this.c_is_dragging = false
		this.c_select_controls_enabled = false

		this.c_recording_distance = 0;
	    this.c_recording_timer = 0;
	    this.c_recording_state = 1;
	    this.c_enabled = false;
	    this.c_views_swaped = false;

	    this.c_need_to_update_auto_detect = false;
	    this.c_old_pos_cam = new THREE.Vector3();
	    this.c_timer_update = 0;

	}

	init()
	{
		this.c_gui = new Gui()

		var self = this
		document.addEventListener( 'mousewheel',(evt) => onDocumentMouseWheel(self, evt) );
		document.addEventListener( 'pointerup',(evt) => onDocumentPointerUp(self, evt) );
		document.addEventListener('pointermove',(evt) => onDocumentPointerMove(self, evt))
		document.addEventListener( 'pointerdown',(evt) => onDocumentPointerDown(self, evt) );
		document.addEventListener("keydown",(evt) => onDocumentKeyDown(self, evt), false);
		document.addEventListener("keyup",(evt) => onDocumentKeyUp(self, evt));

	}
	setEnabledOrbitControls(enabled)
	{
		if(enabled)
		{
			this.c_camera_group.position.set(0,0,0)
			this.c_camera_group.add(this.c_camera)
		}
		else
		{
			this.c_camera_group.remove(this.c_camera)
		}
		this.c_controls.enabled = enabled
	}
	enable()
	{
		this.c_gui.enableGui()
		this.c_enabled = true
	}
	restart(scene, camera, renderer, active)
	{
		this.c_need_to_update_auto_detect = false;
		this.c_timer_update = 0;
		this.c_old_pos_cam = new THREE.Vector3()	
		this.c_gui.disableGui()
		this.c_selection_rectangle.selectionBox = new SelectionBox( camera, scene);
		this.c_selection_rectangle.helper = new SelectionHelper( this.c_selection_rectangle.selectionBox, renderer, 'selectBox' );
		this.c_selection_rectangle.helper.element.hidden = true;
	
		this.c_recording_distance = 0;
		this.c_recording_timer = 0;
		this.c_recording_state = 0;
		this.c_capture_index_over_mouse = -1
		this.c_is_dragging = false;
		this.c_gui.restart(scene, camera)

		this.c_controls = new OrbitControls( camera, renderer.domElement );
		this.c_controls.minPolarAngle =  - Infinity; // radians
		this.c_controls.maxPolarAngle = Infinity; // radians
		this.c_controls.minDistance = 1;
		this.c_controls.maxDistance = 30;
		this.c_controls.minAzimuthAngle = - Infinity; // radians
		this.c_controls.maxAzimuthAngle = Infinity; // radians

		const target_x = DataLoader.getCurrentModel().target_x_cam_start
		const target_y = DataLoader.getCurrentModel().target_y_cam_start
		const target_z = DataLoader.getCurrentModel().target_z_cam_start

		this.c_controls.target.set(target_x,target_y,target_z)

		this.c_controls_secondary = new OrbitControls( this.c_gui.getCameraCaptureOrto(), renderer.domElement );
		this.c_controls_secondary.minPolarAngle =  - Infinity; // radians
		this.c_controls_secondary.maxPolarAngle = Infinity; // radians
		this.c_controls_secondary.minDistance = 0;
		this.c_controls_secondary.maxDistance = 3;
		this.c_controls_secondary.minAzimuthAngle = - Infinity; // radians
		this.c_controls_secondary.maxAzimuthAngle = Infinity; // radians
		this.c_controls_secondary.enabled = false;

		this.c_enabled = false
		if(active)
		{
			this.c_camera_group.position.set(0,0,0)
			this.c_camera_group.add(camera)
			scene.add(this.c_camera_group);
		}
		
	}

	changeCaptureInView(camera, scene, sceneModels)
	{
		this.c_gui.changeCaptureInView(camera, scene, sceneModels)
		this.c_controls_secondary.reset();
	}

	getGui()
	{
		return this.c_gui
	}

	onWindowResize()
	{
		this.c_gui.onWindowResize()
	}

	getCollectionIndexUnderMouse()
	{
		const need_to_update_auto_detect = APPLICATION.c_application_state.need_to_update_auto_detect
		if(!this.c_gui.c_gui_options.show_photo_collection && !m_renderer.xr.isPresenting)
			return -1;
		if(need_to_update_auto_detect)
			return -1;
		if(this.c_capture_index_over_mouse != -1)
		{
			let index_collection = -1
			for(let i=0; i<Scorer.getCurrentCandidates().length; i++)
			{
				for(let j=0; j < Scorer.getCurrentCandidates()[i].elems.length; j++)
				{
					if(Scorer.getCurrentCandidates()[i].elems[j] == this.c_capture_index_over_mouse)
					{
						index_collection = i;
						break;
					}
				}
				
			}
			return index_collection;
		}
		return -1;
	}

	selectCapture(index_capture, allow_jump = false)
	{
		if(!this.c_gui.c_gui_options.show_photo_collection)
			return;
		/*if(this.c_need_to_update_auto_detect)
			return;*/

		if(this.c_gui.getCurrentCaptureInViewIndex() == index_capture && allow_jump)
		{
			APPLICATION.moveToCapturePosition(index_capture)
		}
		else
		{
			if(index_capture !=this.c_gui.getCurrentCaptureInViewIndex())
			APPLICATION.changeCaptureInView(index_capture)
		}

		this.c_gui.updateSelectedSprite(index_capture)
		
	}

	update(delta, camera)
	{
		if(this.c_recording_state==1)
		{
			this.c_recording_distance += this.c_old_pos_cam.distanceTo(camera.position);
			this.c_recording_timer += delta;
		}
		this.c_gui.update(delta, Scorer.getCurrentCandidates())
		this.c_controls.update()
		this.c_controls_secondary.update()


		if(this.c_need_to_update_auto_detect)
			this.c_timer_update += delta

		if(this.c_old_pos_cam.distanceTo(camera.position) > 0.0001)
		{
			//console.log("changed!! " + this.c_old_pos_cam.x + " " +camera.position.x)
			this.c_timer_update = 0;
			this.c_need_to_update_auto_detect = true;
			if(this.c_gui.c_gui_options.auto_score_enabled)
				this.c_gui.setCollectionOpacity(0.2);
		}
	
		//m_stats.update();
		if(this.c_timer_update > this.getGui().c_gui_options.timer_recalc)
		{
			//console.log("update")
			this.c_need_to_update_auto_detect = false
			this.c_timer_update = 0
			if(this.c_gui.c_gui_options.auto_score_enabled)
			{
				Scorer.genNewCandidates(DataLoader.getCameraList(), null, this.c_gui.getClusteringOptions(), this.c_gui.getScoreOptions(), camera)
				this.c_gui.showCollections(true, Scorer.getCurrentCandidates())
			}
			else
				this.c_gui.setCollectionOpacity(1.0);
		}
		this.c_old_pos_cam.copy(camera.position);
	}

	moveToCapturePosition(camera, index_capture)
	{
		const captureCam = (DataLoader.getCameraList())[index_capture].camera
		const direction = new THREE.Vector3();
		captureCam.getWorldDirection( direction );
		camera.position.copy( captureCam.position )
		
		
		this.c_controls.update()
		
		this.c_controls.target = new THREE.Vector3( captureCam.position.x+direction.x, captureCam.position.y+direction.y, captureCam.position.z+direction.z );

		this.c_controls.update()
	}

	render(scene, renderer, main_camera, scene_models)
	{
		//this.c_camera_group.visible = false
		this.c_gui.render(scene, renderer, main_camera, scene_models, this.c_select_controls_enabled, this.c_views_swaped)
		//this.c_camera_group.visible = true
	}
}




function onDocumentMouseWheel(self, event)
{
	const collection = self.getCollectionIndexUnderMouse()
	if(collection >=0 && Scorer.getCurrentCandidates()[collection].elems.length > 1)
	{
		if(event.wheelDelta > 0)
		{
			Scorer.getCurrentCandidates()[collection].animating = 1
		}
		else
		{
			Scorer.getCurrentCandidates()[collection].animating = -1
		}
	}

}
function onDocumentPointerUp(self, event ) {   
	if(!self.c_enabled)
		return;
	if(self.c_select_controls_enabled)
	{
		
		self.c_is_dragging = false;
		const mouseNDC = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
                            -( event.clientY / window.innerHeight ) * 2 + 1,  
                            0.5 );   
		self.c_selection_rectangle.endNDC = mouseNDC

		self.c_selection_rectangle.selectionBox.endPoint.set(
		( event.clientX / window.innerWidth ) * 2 - 1,
		- ( event.clientY / window.innerHeight ) * 2 + 1,
		0.5 );


			const minWorldPoint = getWorldIntersectFromNDCxy(APPLICATION.getMainCamera(),self.c_selection_rectangle.startNDC, APPLICATION.getSceneModels());
			const maxWorldPoint = getWorldIntersectFromNDCxy(APPLICATION.getMainCamera(),self.c_selection_rectangle.endNDC, APPLICATION.getSceneModels());
			console.log(self.c_selection_rectangle.startNDC)
			console.log(self.c_selection_rectangle.endNDC)
			self.c_selection_rectangle.startWorld = minWorldPoint;
			self.c_selection_rectangle.endWorld = maxWorldPoint;

		Scorer.genNewCandidates(DataLoader.getCameraList(), self.c_selection_rectangle, self.c_gui.getClusteringOptions(), self.c_gui.getScoreOptions() ,APPLICATION.getMainCamera() );
		self.c_gui.showCollections(true, Scorer.getCurrentCandidates())
	}
	else
	{
		const captureIndex = self.c_gui.getCaptureUnderMouse(event);
		if(captureIndex >= 0)
			self.selectCapture(captureIndex, true)
	}
}

function onDocumentPointerMove(self, event)
{
	if(!self.c_enabled)
		return;
	const captureIndex = self.c_gui.getCaptureUnderMouse(event);
	if(captureIndex >= 0)
	{
		if(self.c_gui && self.c_gui.enabled)
		{
			self.c_gui.removeFocus()
		}
		
		if(self.c_controls)
			self.c_controls.enabled = false;
		if(self.c_controls_secondary)
			self.c_controls_secondary.enabled = false;
	}
	else
	{
		if(!self.c_select_controls_enabled && !self.c_views_swaped)
		{
			if(self.c_controls)
				self.c_controls.enabled = true;
		}
			
		if(self.c_controls_secondary && self.c_views_swaped)
			self.c_controls_secondary.enabled = true;
		
		self.c_gui.resetCaptureIndexUnderMouse();
	}
		
	if(self.c_select_controls_enabled && self.c_is_dragging)
	{
		const mouseNDC = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
	                                    -( event.clientY / window.innerHeight ) * 2 + 1,  
	                                    0.5 );   
		self.c_selection_rectangle.endNDC = mouseNDC

		self.c_selection_rectangle.selectionBox.endPoint.set(
						( event.clientX / window.innerWidth ) * 2 - 1,
						- ( event.clientY / window.innerHeight ) * 2 + 1,
						0.5 );
	}
	self.c_capture_index_over_mouse = captureIndex;
}
function onDocumentPointerDown(self, event)
{
	if(!self.c_enabled)
		return;
	if(self.c_select_controls_enabled)
	{
		//document.getElementById("selection_menu").style.display = "none";
		

		
		const mouseNDC = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
	                                    -( event.clientY / window.innerHeight ) * 2 + 1,  
	                                    0.5 );   
		
		self.c_selection_rectangle.startNDC = mouseNDC
		self.c_selection_rectangle.endNDC = mouseNDC

		//console.log("NDC down" + mouseNDC);
		self.c_is_dragging = true;

		self.c_selection_rectangle.selectionBox.startPoint.set(
					( event.clientX / window.innerWidth ) * 2 - 1,
					- ( event.clientY / window.innerHeight ) * 2 + 1,
					0.5 );
	}
	else
	{
		if(self.c_gui.c_gui_options.show_view_enabled)
		{
			const mouseWindwNorm = new THREE.Vector3( ( event.clientX / window.innerWidth ),   
	                                    1-( event.clientY / window.innerHeight ),  
	                                    0.5 );   
			

			console.log(mouseWindwNorm)
			if(mouseWindwNorm.x >m_views[1].left && mouseWindwNorm.x < m_views[1].left +m_views[1].width && mouseWindwNorm.y >m_views[1].bottom && mouseWindwNorm.y <m_views[1].bottom+m_views[1].height)
			{
				self.c_views_swaped = !self.c_views_swaped;
				if(self.c_views_swaped)
				{
					document.getElementById("info").innerHTML  = "2D view";
					document.getElementById("info2").innerHTML  = "3D view";
					self.c_controls_secondary.enabled = true;
					self.c_controls_secondary.update()
					self.c_controls.enabled = false;
				}
				else
				{
					document.getElementById("info").innerHTML  = "3D view";
					document.getElementById("info2").innerHTML  = "2D view";
					self.c_controls_secondary.enabled = false;
					self.c_controls.enabled = true;
				}
			}
		}
		

	}
}

function onDocumentKeyDown(self, event) {
	if(self.c_enabled)
	{
		const keyCode = event.which;
	    if (keyCode == 82) { //R
	        self.restart();
	    /*} else if (keyCode == 77) { //M
	        changeMode();*/
	    /*}  else if (keyCode == 67) { //C
	        toggleEnableCams();*/
	    }else if(keyCode == 87) { //W
	    	const collection = self.getCollectionIndexUnderMouse()
			if(collection >=0 && Scorer.getCurrentCandidates()[collection].elems.length > 1)
			{
				Scorer.getCurrentCandidates()[collection].animating = -1			
			}

	    }else if(keyCode == 83) { //S
	    	const collection = self.getCollectionIndexUnderMouse()
			if(collection >=0 && Scorer.getCurrentCandidates()[collection].elems.length > 1)
			{
				Scorer.getCurrentCandidates()[collection].animating = +1			
			}

	    }  else if (keyCode == 17) { //Control
	    	self.c_gui.disableGui()
	    	self.c_select_controls_enabled = true;
	    	self.c_controls.enabled = false;
	    	self.c_controls_secondary.enabled = false;
	    	self.c_selection_rectangle.helper.element.hidden = false;
	    	
	    	/*m_canvas.setHeight(window.innerHeight);
			m_canvas.setWidth(window.innerWidth);*/
	    }
	     else if (keyCode == 32) { //Space
	    	if(self.c_recording_state == 0)
	    	{
	    		self.c_recording_distance = 0;
	    		self.c_recording_timer = 0;
	    		self.c_recording_state = 1;
	    		document.getElementById("info3").innerHTML  = "Recording...";
	    	}
	    	else if(self.c_recording_state == 1)
	    	{
	    		document.getElementById("info3").innerHTML  = "";
	    		self.c_recording_state = 0;
	    		Math.round(self.c_recording_distance * 100) / 100

	    		alert("Time elapsed: "+(Math.round(self.c_recording_timer * 100) / 100)+" seconds\nDistance traveled: "+(Math.round(self.c_recording_distance * 100) / 100)+" meters");
	    		//console.log(m_recording_timer)
	    		//console.log(m_recording_distance)
	    	}

	    		

	    	
	    	/*m_canvas.setHeight(window.innerHeight);
			m_canvas.setWidth(window.innerWidth);*/
	    }
	}
};
function onDocumentKeyUp(self, event) {
	if (event.keyCode === 17 && !self.c_views_swaped) {
	    self.c_gui.enableGui()
	    self.c_select_controls_enabled = false;
		self.c_is_dragging = false

	    self.c_controls.enabled = true;

	    self.c_selection_rectangle.helper.element.hidden = true;
	  }
};









