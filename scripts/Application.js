import * as THREE from '../build/three.module.js';

import { VRControls } from './vr/VRControls.js';


import { WebControls } from './desktop/WebControls.js';
import { DataLoader } from './DataLoader.js';
import { Scorer } from './Scorer.js';
import { CameraInfo} from './CameraInfo.js';

import { VRButton } from '../jsm/webxr/VRButton.js';

export class Application {
	constructor() {
		this.c_WebControls = null
		this.c_VRControls = null
		this.c_renderer = null
		this.c_mainCamera = null
		this.c_scene = null

		this.c_clock = null

		this.c_application_state = 
		{
			lastFrameInVR: false,
			state: AppStates.APPLICATION_INIT,
		}
		this.init()
	}

	init()
	{
		this.c_clock = new THREE.Clock();
		document.getElementById("AppVer").innerHTML = VERSION;
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
		var self = this
		this.c_renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true} );
		this.c_renderer.setPixelRatio( window.devicePixelRatio );
		this.c_renderer.setSize( window.innerWidth, window.innerHeight );
		this.c_renderer.outputEncoding = THREE.sRGBEncoding;
		this.c_renderer.setClearColor(0xffffff, 0);
		this.c_renderer.autoClear = false; 
		this.c_renderer.xr.enabled = true;
		this.c_renderer.xr.setReferenceSpaceType( 'local' );

		function loop()
		{
			APPLICATION.update();
			APPLICATION.render();
		}
		this.c_renderer.setAnimationLoop( loop );



		container.appendChild( this.c_renderer.domElement );
		document.body.appendChild( VRButton.createButton(this.c_renderer) );

		window.addEventListener( 'resize', this.onWindowResize );
	
		this.initScene()
		this.initControls()

		DataLoader.loadShaders()

	}
	__debugGetCameraList()
	{
		return DataLoader.getCameraList()
	}
	onWindowResize()
	{
		APPLICATION.c_mainCamera.aspect = window.innerWidth / window.innerHeight;
		APPLICATION.c_mainCamera.updateProjectionMatrix();

		APPLICATION.c_renderer.setSize( window.innerWidth, window.innerHeight );

		m_views[1].height = 0.3
		m_views[1].width = (m_views[1].height*(window.innerWidth / window.innerHeight))*(1/(window.innerWidth / window.innerHeight))
		m_views[1].left = 1.0-m_views[1].width

		APPLICATION.c_WebControls.onWindowResize()
	}

	initControls()
	{
		this.c_WebControls = new WebControls()
		this.c_VRControls = new VRControls(this.c_scene,this.c_renderer)
	}

	initScene()
	{
		this.c_scene = new THREE.Scene();
		this.c_scene.background = new THREE.Color( 0x72645b );
		this.c_scene.fog = new THREE.Fog( 0x72645b, 2, 15 );
	}





	animate()
	{

	}

	restartApplication()
	{
		this.c_application_state.state = AppStates.APPLICATION_INIT
	}
	update()
	{
		const timer = Date.now() * 0.0005;
		const delta = this.c_clock.getDelta();
		requestAnimationFrame( this.animate );

		switch(this.c_application_state.state)
		{
			case AppStates.READY_TO_GO:
			{	
				if(this.c_renderer.xr.isPresenting)
				{					
					if(!this.c_application_state.lastFrameInVR)
					{
						//ENTER VR
						this.c_WebControls.setEnabledOrbitControls(false)
						this.c_scene.remove(this.c_WebControls.c_camera_group)
						this.c_VRControls.restart(this.c_scene, this.c_mainCamera, this.c_renderer, true)
						this.c_application_state.lastFrameInVR = true
					}
						
					this.c_VRControls.update(delta, this.c_renderer)
				}
				else
				{
					if(this.c_application_state.lastFrameInVR)
					{
						//EXIT VR
						this.c_scene.remove(this.c_VRControls.camera_group)
						this.c_WebControls.restart(this.c_scene, this.c_mainCamera, this.c_renderer, true)
						this.c_application_state.lastFrameInVR = false
					}
					this.c_WebControls.update(delta, this.c_mainCamera)
				} 
				const sceneModels = DataLoader.getSceneModels() 
				sceneModels[0].material.uniforms.showRedArea.value = this.c_WebControls.getGui().c_gui_options.red_area_enabled;
				sceneModels[0].material.uniforms.u_time.value += delta;
				break
			}
			case AppStates.APPLICATION_INIT:
			{
				if(DataLoader.shadersLoaded())
				{
					this.startSceneForModel(this.c_WebControls.getGui().c_gui_options.current_model);
					this.c_application_state.state = AppStates.LOADING_MESHES
				}
				break
			}
			case AppStates.LOADING_MESHES:
			{
				if( DataLoader.assetsLoaded() /*&& this.c_VRControls.isLoaded()*/)
				{
					Scorer.init(DataLoader.getCameraList())
					document.getElementById("loadingText").innerHTML = "Loading: 80%";
					this.c_application_state.state = AppStates.LOADING_TEXTURES
				}
				break
			}
			case AppStates.LOADING_TEXTURES:
			{
				if(DataLoader.texturesLoaded())
				{
					this.c_application_state.state = AppStates.LOADING_PRECOMPUTED_DATA
					const loader = new THREE.FileLoader();
			        loader.load('models/'+DataLoader.getCurrentModel().path+'/capture_info/precomputedCameraData.txt', function ( data ) {
					        // output the text to the console
					        DataLoader.loadPrecomputedFile(data)

							document.getElementById("loadingText").innerHTML = "Loading: 90%";
					});
					
				}
				break
			}
			case AppStates.LOADING_PRECOMPUTED_DATA:
			{
				if(DataLoader.precomputeFileLoaded())
				{
					if(DataLoader.captureRaysNeedRecompute())
					{
						DataLoader.precomputeCaptureInfo(NUM_RAYS_PRECOMPUTE, NUM_RAYS_PRECOMPUTE)
					}
					else
					{
						this.c_WebControls.enable()
						this.c_application_state.state = AppStates.READY_TO_GO
						document.getElementById("loadingText").innerHTML = "";
						document.getElementById("loadingTextContainer").style.visibility = "hidden";
						console.log("INFO: System ready to go!")
					}
					
				}
					
				break
			}
		}
	}
	getAppScene()
	{
		return this.c_scene
	}
	getMainCamera()
	{
		return this.c_mainCamera
	}


	render() {
		if(this.c_application_state.state != AppStates.READY_TO_GO)
			return;

		this.c_renderer.clear();
		if(this.c_renderer.xr.isPresenting)
			this.c_VRControls.render(this.c_scene, this.c_renderer, this.c_mainCamera)
		else
			this.c_WebControls.render(this.c_scene, this.c_renderer, this.c_mainCamera)
	}
	getControls()
	{
		if(this.c_renderer.xr.isPresenting)
			return this.c_VRControls
		else
			return this.c_WebControls
	}



	clearScene()
	{
		while(this.c_scene.children.length > 0){ 
			if(this.c_scene.children[0].geometry)
				this.c_scene.children[0].geometry.dispose();
			if(this.c_scene.children[0].material)
				this.c_scene.children[0].material.dispose();
		    this.c_scene.remove(this.c_scene.children[0]); 
		}
	}
	startSceneForModel(model)
	{
		this.clearAppStates()
		this.clearScene()

		DataLoader.restart(model, this.c_scene)

		document.getElementById("info3").innerHTML  = "";
		document.getElementById("loadingTextContainer").style.visibility = "visible";
		
		this.c_mainCamera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.c_mainCamera.position.set( 0,0,0 );
		this.c_mainCamera.name = "main_camera"

		this.c_WebControls.restart(this.c_scene, this.c_mainCamera, this.c_renderer)
		this.c_VRControls.restart(this.c_scene, this.c_mainCamera, this.c_renderer)
		
		this.animate();
	}

	enableSceneNavigation(enabled)
	{
		if(this.c_renderer.xr.isPresenting)
		{
			this.c_VRControls.enableSceneNavigation(enabled)
		}
	}

	clearAppStates()
	{
		this.c_application_state.lastFrameInVR = false
	}

	moveToCapturePosition(index_capture)
	{
		if(this.c_renderer.xr.isPresenting)
		{
		    this.c_VRControls.moveToCapturePosition(this.c_mainCamera, index_capture)
		}
		else
		{
			this.c_WebControls.moveToCapturePosition(this.c_mainCamera, index_capture)
		}
	}


	changeCaptureInView(index_capture)
	{
		const camList = DataLoader.getCameraList()
		
		if(this.c_renderer.xr.isPresenting)
			this.c_VRControls.changeCaptureInView(camList[index_capture], this.c_scene)
		else
			this.c_WebControls.changeCaptureInView(camList[index_capture], this.c_scene)
	}

	showZoomedPhoto(index_capture)
	{
		const camList = DataLoader.getCameraList()
		
		if(!this.c_renderer.xr.isPresenting)
			console.log("INFO: NOT IMPLEMENTED (and should not be implemented this way)")
		else
		{
			this.c_VRControls.changeCaptureInView(camList[index_capture], this.c_scene)
			this.c_VRControls.hideShowZoomedImage(this.c_renderer, this.c_scene, true)
		}
	}

	displayImageCollection(index_capture, collection_index)
	{
		const camList = DataLoader.getCameraList()
		
		if(!this.c_renderer.xr.isPresenting)
			console.log("INFO: NOT IMPLEMENTED (and should not be implemented this way)")
		else
		{
			this.c_VRControls.displayImageCollection(index_capture, collection_index)
			//TODO (maybe use index of collection as well as the index camera)
		}
	}

}

