import * as THREE from '../../build/three.module.js';
import { GUI } from './../../jsm/libs/dat.gui.module.js';
import { CaptureSelected } from './../CaptureSelected.js';
import { WebCollection } from './WebCollection.js';

var showViewChanged = false
export class Gui {
	
	constructor()
	{	
		
		this.c_scene_capture = new THREE.Scene();
		this.c_camera_capture_orto = null;

		this.c_capture_selected = null;

		this.c_gui_options =
		{
			projection: 1,
			orientation: 0,
			position: 0,
			timer_recalc: 1,

			max_num_collections: 6,
			max_collection_size: 5,
			similitude_treshold: 0.7,
			discard_too_similar: true,
			clustering_method: 'single_linkage',
			clustering_method_aux: false,

			red_area_enabled: false,
			show_camera_enabled: false,
			show_view_enabled: false,
			show_photo_enabled: false,
			project_capture_enabled: true,
			auto_score_enabled: false,
			show_photo_collection: true,
			current_model: "pedret",

		}
		
		this.gui = new GUI();
		this.c_web_collection = new WebCollection("imageCollectionGroup", false)


		this.addElemsGui()

		
		this.enabled = true
		
		
	}

	getCurrentCaptureInViewIndex()
	{
		return this.c_web_collection.getCurrentCaptureInViewIndex()
	}


	
	updateSelectedSprite(index)
	{
		this.c_web_collection.updateSelectedSprite(index)
	}
	
	updateGuiNormal()
	{
		updateGuiNormal = false;

	}
	addElemsGui()
	{
		const models = [ 'pedret', 'doma','solsona'];
		const clustering_methods = [ 'basic', 'single_linkage'];
		this.modelsFolder = this.gui.addFolder( 'Models' );

		

		this.modelsFolder.open();

		this.scoreFolder = this.gui.addFolder( 'Score computation' );
		
		
		this.modelsFolder.add( this.c_gui_options, 'current_model' ).options( models ).name( 'Current model' ).listen().onChange( function () {
			APPLICATION.restartApplication()
		} );
		this.scoreFolder.add(this.c_gui_options, 'projection', 0, 1, 0.1 ).name( 'View' );
		this.scoreFolder.add(this.c_gui_options, 'position', 0, 1, 0.1 ).name( 'Position' );
		this.scoreFolder.add(this.c_gui_options, 'orientation', 0, 1, 0.1 ).name( 'Orientation' );
		this.scoreFolder.add(this.c_gui_options, 'timer_recalc', 0, 10, 0.1 ).name( 'Recalc timer' );

		//this.scoreFolder.open();

		this.viewFolder = this.gui.addFolder( 'Display options' );


		this.viewFolder.add(this.c_gui_options, 'red_area_enabled').name( 'Show highlighted area' ).listen().onChange(function ()
		{
		});
		this.viewFolder.add(this.c_gui_options, 'show_camera_enabled').name( 'Show camera' ).listen().onChange(function ()
		{
		});
		this.viewFolder.add(this.c_gui_options, 'show_photo_enabled').name( 'Show photo' ).listen().onChange(function ()
		{
		});
		this.viewFolder.add(this.c_gui_options, 'project_capture_enabled').name( 'Show projection' ).listen().onChange(function ()
		{
		});
		this.viewFolder.add(this.c_gui_options, 'show_view_enabled').name( 'Show view' ).listen().onChange(function ()
		{
			showViewChanged = true
		});
		this.viewFolder.add(this.c_gui_options, 'auto_score_enabled').name( 'Auto-detect' ).listen().onChange(function ()
		{
		});
		this.viewFolder.add(this.c_gui_options, 'show_photo_collection').name( 'Show collection' ).listen().onChange(function ()
		{
		});
		this.viewFolder.open();


		this.candidatesFolder = this.gui.addFolder( 'Candidate selection' );

		

		this.candidatesFolder.add(this.c_gui_options, 'max_num_collections', 0, 10, 1 ).name( 'Max num collections' );
		this.candidatesFolder.add(this.c_gui_options, 'max_collection_size', 0, 15, 1 ).name( 'Max size stack' );
		this.candidatesFolder.add(this.c_gui_options, 'similitude_treshold', 0, 1, 0.01 ).name( 'Simil treshold' );
		//this.gui.add(this.c_gui_options, 'linkage_enabled').name( 'Linkage clustering' );
		this.candidatesFolder.add( this.c_gui_options, 'clustering_method' ).options( clustering_methods ).name( 'Cluster method' ).onChange(function ()
		{

		});
		//this.candidatesFolder.open();
	}
	


	update(delta, candidates)
	{
		if(showViewChanged)
		{
			if(this.c_gui_options.show_view_enabled)
			{
				document.getElementById("info2").style.visibility = "visible";
			}
			else
			{
				document.getElementById("info2").style.visibility = "hidden";
			}
			showViewChanged = false;

		}
		this.c_web_collection.update(delta, candidates)
	}

	onWindowResize()
	{

		this.c_camera_capture_orto.left = window.innerWidth / - 2;
		this.c_camera_capture_orto.right =window.innerWidth / 2;
		this.c_camera_capture_orto.top = window.innerHeight / 2;
		this.c_camera_capture_orto.bottom = window.innerHeight / - 2;
		this.c_camera_capture_orto.updateProjectionMatrix();

		this.c_web_collection.onWindowResize()
	}


	disposeSceneCapture()
	{
		while(this.c_scene_capture.children.length > 0){
			if(this.c_scene_capture.children[0].geometry) 
				this.c_scene_capture.children[0].geometry.dispose();
			if(this.c_scene_capture.children[0].material) 
				this.c_scene_capture.children[0].material.dispose();
		    this.c_scene_capture.remove(this.c_scene_capture.children[0]); 
		}
	}
	restart(scene, camera)
	{
		this.c_web_collection.restart()
		this.resetCamera(scene, camera)
		this.disposeSceneCapture()
		if(this.c_capture_selected)
		{
			this.c_capture_selected.dispose()
		}
		this.c_capture_selected = new CaptureSelected(scene)
	}
	resetCamera(scene, camera)
	{
		console.log("RESET CAMERA")
		this.c_camera_capture_orto = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0, 10);
		this.c_web_collection.restart()

		if(this.c_capture_selected)
		{
			this.c_capture_selected.dispose()
		}
		this.c_capture_selected = new CaptureSelected(scene)
	}

	resetCaptureIndexUnderMouse()
	{
		this.c_web_collection.resetCaptureIndexUnderMouse()
	}

	getClusteringOptions()
	{
		const options = {
			max_num_collections: this.c_gui_options.max_num_collections,
			max_collection_size: this.c_gui_options.max_collection_size,
			similitude_treshold: this.c_gui_options.similitude_treshold,
			discard_too_similar: this.c_gui_options.discard_too_similar,
			clustering_method: this.c_gui_options.clustering_method,
			clustering_method_aux: this.c_gui_options.clustering_method_aux,
		}
		
		return options
	}

	getScoreOptions()
	{
		const options = {
			position: this.c_gui_options.position,
			orientation: this.c_gui_options.orientation,
			projection: this.c_gui_options.projection,
		}
		return options
	}
	getCaptureUnderMouse(event)
	{
		if(!this.c_gui_options.show_photo_collection)
			return -1;

		return this.c_web_collection.getCaptureUnderMouse(event)
	}
	getCameraCaptureOrto()
	{
		return this.c_camera_capture_orto
	}

	enableGui()
	{
		this.enabled = true
		this.gui.domElement.style.display = '';
	}
	disableGui()
	{
		this.enabled = false
		this.gui.domElement.style.display = 'none';
	}
	removeFocus()
	{
		this.gui.domElement.blur()
	}


	setCollectionOpacity(opacity)
	{
		this.c_web_collection.setCollectionOpacity(opacity)

	}

	showCollections(useNewSprites, candidates)
	{
		this.c_web_collection.showCollections(useNewSprites, candidates)
	}


	render(scene, renderer, main_camera, scene_models, hide_ui_elements, views_swaped)
	{
		
		if(scene_models.length >0)
			scene_models[0].material.uniforms.projectCapture.value = this.c_gui_options.project_capture_enabled && this.c_capture_selected.getCaptureResult() != null
		
		if(this.c_gui_options.show_view_enabled && !hide_ui_elements)
		{
			if(views_swaped)
			{
				this.renderSecondaryCamera(scene, renderer, 0, false);
				this.renderMainCamera(scene, renderer, main_camera, 1, true);
			}
			else
			{
				this.renderMainCamera(scene, renderer, main_camera,0, false);
				this.renderSecondaryCamera(scene, renderer, 1, true);
			}
		}
		else
		{
			if(views_swaped)
			{
				this.renderSecondaryCamera(scene, renderer, 2, false);
			}
			else
			{
				this.renderMainCamera(scene, renderer, main_camera, 2, false);
			}
		}

		if(!hide_ui_elements && this.c_gui_options.show_photo_collection)
		{
			if(!views_swaped)
				this.c_web_collection.render(renderer, 2)
		}
	}

	renderMainCamera(scene, renderer, main_camera, view_index, draw_border)
	{
		this.c_capture_selected.setEnabled(this.c_gui_options.show_photo_enabled && this.c_gui_options.show_view_enabled && this.c_gui_options.show_camera_enabled)
		/*if(this.c_plane_image_secondary != null)
			this.c_plane_image_secondary.material.uniforms.showTexture.value = this.c_gui_options.show_photo_enabled && this.c_gui_options.show_view_enabled && this.c_gui_options.show_camera_enabled;
		*/
		const left = Math.floor( window.innerWidth * m_views[view_index].left );
		const bottom = Math.floor( window.innerHeight * m_views[view_index].bottom );
		const width = Math.floor( window.innerWidth * m_views[view_index].width );
		const height = Math.floor( window.innerHeight * m_views[view_index].height );

		if(!renderer.xr.isPresenting)
		{
			renderer.setViewport( left, bottom, width, height );
			renderer.setScissor( left, bottom, width, height );
			renderer.setScissorTest( true );


		} else
		{
			renderer.setScissorTest( false );

		}

		if(draw_border)
		{
			renderer.setClearColor ( new THREE.Color(0x000000), 1.0 )
			renderer.clear();
			renderer.setViewport( left+m_views[view_index].border_size, bottom+m_views[view_index].border_size, width-m_views[view_index].border_size*2, height-m_views[view_index].border_size*2 );
			renderer.setScissor( left+m_views[view_index].border_size, bottom+m_views[view_index].border_size, width-m_views[view_index].border_size*2, height-m_views[view_index].border_size*2 );
		}
		main_camera.aspect = width / height;
		main_camera.updateProjectionMatrix();
		this.c_capture_selected.setWidgetVisible(this.c_gui_options.show_camera_enabled)

		renderer.render( scene, main_camera );
	}

	changeCaptureInView(camera, scene, sceneModels)
	{
		this.c_capture_selected.setCapture(camera, scene, sceneModels)
		let meshRenderedPlane = this.c_capture_selected.getCaptureResult()
		if(meshRenderedPlane != null)
		{
			const existing = this.c_scene_capture.getObjectByName("plane_rt");
			if(existing){
				this.c_scene_capture.remove( existing );
			}	
			this.c_scene_capture.add(meshRenderedPlane)
		}
	}
	renderSecondaryCamera(scene, renderer, view_index, draw_border)
	{
		this.c_capture_selected.setWidgetVisible(false)
		const left = Math.floor( window.innerWidth * m_views[view_index].left );
		const bottom = Math.floor( window.innerHeight * m_views[view_index].bottom );
		const width = Math.floor( window.innerWidth * m_views[view_index].width );
		const height = Math.floor( window.innerHeight * m_views[view_index].height );


		if(this.c_capture_selected)
			this.c_capture_selected.render(renderer, scene, this.c_gui_options.show_photo_enabled)
		
		if(draw_border)
		{
			renderer.setViewport( left-0.1, bottom, width+0.1, height+0.1 );
			renderer.setScissor( left-0.1, bottom, width+0.1, height+0.1 );
			renderer.setScissorTest( true );
		}
		renderer.setViewport( left, bottom, width, height );
		renderer.setScissor( left, bottom, width, height );
		renderer.setScissorTest( true );
		

		if(draw_border)
		{
			renderer.setClearColor ( new THREE.Color(0x000000), 1.0 )
			renderer.clear();
			renderer.setViewport( left+m_views[view_index].border_size, bottom+m_views[view_index].border_size, width-m_views[view_index].border_size*2, height-m_views[view_index].border_size*2 );
			renderer.setScissor( left+m_views[view_index].border_size, bottom+m_views[view_index].border_size, width-m_views[view_index].border_size*2, height-m_views[view_index].border_size*2 );
		}
		if(this.c_capture_selected.getCaptureResult())
			renderer.render( this.c_scene_capture, this.c_camera_capture_orto );

	}
}


