import { GUI } from './../jsm/libs/dat.gui.module.js';
import { HTMLMesh } from './../jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from './../jsm/interactive/InteractiveGroup.js';

var modelChanged = false
var showViewChanged = false

export class Gui {
	
	constructor()
	{	
		//this.is_vr = false;
		this.gui_options =
		{
			projection: 0,
			orientation: 5,
			position: 1,
			timer_recalc: 1,

			max_num_collections: 7,
			max_collection_size: 5,
			similitude_treshold: 0.7,
			discard_too_similar: true,
			clustering_method: 'normal',
			clustering_method_aux: false,

			red_area_enabled: false,
			show_camera_enabled: false,
			show_view_enabled: false,
			show_photo_enabled: false,
			project_capture_enabled: false,
			auto_score_enabled: false,

			current_model: "pedret",
			current_model_aux1: false,
			current_model_aux2: false,

		}
		this.gui = new GUI();

		const models = [ 'pedret', 'doma','solsona'];
		const clustering_methods = [ 'normal', 'single_linkage'];
		//const modelsFolder = this.gui.addFolder( 'Models' );

		

		//modelsFolder.open();

		//const scoreFolder = this.gui.addFolder( 'Score computation' );
		
		this.gui.add( this.gui_options, 'clustering_method' ).options( clustering_methods ).name( 'Cluster method' ).onChange(function ()
		{

		});
		this.gui.add( this.gui_options, 'current_model' ).options( models ).name( 'Current model' ).onChange( function () {
			modelChanged = true
		} );
		this.gui.add(this.gui_options, 'projection', 0, 10, 0.1 ).name( 'Projection' );
		this.gui.add(this.gui_options, 'position', 0, 10, 0.1 ).name( 'Position' );
		this.gui.add(this.gui_options, 'orientation', 0, 10, 0.1 ).name( 'Orientation' );
		this.gui.add(this.gui_options, 'timer_recalc', 0, 10, 0.1 ).name( 'Recalc timer' );

		//scoreFolder.open();

		//const viewFolder = this.gui.addFolder( 'Display options' );


		this.gui.add(this.gui_options, 'red_area_enabled').name( 'Show area' ).onChange(function ()
		{
		});
		this.gui.add(this.gui_options, 'show_camera_enabled').name( 'Show camera' ).onChange(function ()
		{
		});
		this.gui.add(this.gui_options, 'show_photo_enabled').name( 'Show photo' ).onChange(function ()
		{
		});
		this.gui.add(this.gui_options, 'project_capture_enabled').name( 'Show projection' ).onChange(function ()
		{
		});
		this.gui.add(this.gui_options, 'show_view_enabled').name( 'Show view' ).onChange(function ()
			{
				showViewChanged = true
				
			});
		this.gui.add(this.gui_options, 'auto_score_enabled').name( 'Auto-detect' ).onChange(function ()
		{
		});
		//this.gui.viewFolder.open();


		//const candidatesFolder = this.gui.addFolder( 'Candidate selection' );

		

		this.gui.add(this.gui_options, 'max_num_collections', 0, 20, 1 ).name( 'Max num collection' );
		this.gui.add(this.gui_options, 'max_collection_size', 0, 20, 1 ).name( 'Max size collection' );
		this.gui.add(this.gui_options, 'similitude_treshold', 0, 1, 0.01 ).name( 'Similitude treshold' );
		//this.gui.add(this.gui_options, 'linkage_enabled').name( 'Linkage clustering' );
		
		//candidatesFolder.open();



		
		
	}
	
	update(isVr)
	{
		if(showViewChanged)
		{
			if(this.gui_options.show_view_enabled)
			{
				document.getElementById("info2").style.visibility = "visible";
			}
			else
			{
				document.getElementById("info2").style.visibility = "hidden";
			}
			showViewChanged = false;
		}
		if(modelChanged)
		{
			modelChanged = false;
			return true;
			
		}
		/*if(isVr != this.is_vr)
			this.changeMode(isVr)*/
		return false;
	}
	/*changeMode(is_vr)
	{
		this.is_vr = is_vr

	}*/
	initInteractiveGroup(renderer, camera, scene, vr_panels_group, vrgui)
	{
		
		this.interactiveGroup = new InteractiveGroup( renderer, camera );
		
		
		vr_panels_group.add(this.interactiveGroup)
		//scene.add( group );

		const mesh = new HTMLMesh( this.gui.domElement );
		mesh.position.x = - 0.3;
		mesh.position.y = 0;
		mesh.position.z = - 1.2;
		mesh.rotation.y = Math.PI / 4;
		mesh.scale.setScalar( 2 );
		//group.add( mesh );
		m_vr_move_utils.vrgui = mesh;

	}
	enableVRgui()
	{
		this.interactiveGroup.add(m_vr_move_utils.vrgui)
	}
	disableVRgui()
	{
		this.interactiveGroup.remove(m_vr_move_utils.vrgui);
	}
}