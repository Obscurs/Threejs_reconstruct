let m_container, m_stats, m_gui;
let m_camera, m_camera_capture, m_camera_capture_orto, m_scene, m_scene_collections, m_scene_capture, m_camera_collections, m_renderer, m_context;

const AppStates =
{
	THREE_JS_INIT: "init_state",
	LOADING_MESHES: "loading_meshes_state",
	LOADING_TEXTURES: "loading_textures_state",
	LOADING_PRECOMPUTED_DATA: "loading_precomputed_state",
	READY_TO_GO: "ready_state",

}
var m_camera_list = [];
var m_camera_mesh_list = [];
var m_scene_models = [];
var m_current_candidates = [];
var m_current_candidates_collections = [];

var m_controls;
var m_controls_secondary;
var m_camera_mode = "ORBIT";
var m_timer_update = 0;
var m_cams_enabled = false;
var m_current_capture_in_view_index = -1;
var m_capture_rays_need_recomputation = true;
var m_vr_mode = false;
const m_num_rays_precomputation = 10;	//rays x rays
var m_dragging = false;
var m_current_sprites_in_scene = [];
var m_selection_rectangle = {
	startNDC: null,
	endNDC: null,
	startWorld: null,
	endWorld: null,
	selectionBox: null,
	helper: null,
}
var m_cameraHelper;
var m_has_any_secondary_capture = false;
var m_min_pos = null;
var m_max_pos = null;
var m_plane_image_secondary = null;
var m_plane_render_target = null;
var m_render_target_secondary = null;
var m_application_state = 
{
	state: AppStates.THREE_JS_INIT,
	num_cameras_loaded: 0,
	num_models_loaded: 0,
	three_js_inited: false,
	num_cameras_to_load: 0,
	num_models_to_load: 0,
	precomputed_file_loaded: false,
	precomputation_done: false,
	textures_loaded: false,
	count_precomputation_iterations: 0,
	capture_index_over_mouse: -1,
	transition_animation_step: 1.0,
	views_swaped: false,
	select_controls_enabled: false,
	need_to_update_auto_detect: true,
}
var m_debug = 
{
	debug_mesh_lines: [],
}

const m_models_values = []
m_models_values["doma"] ={
	path: "doma", 
	texture_name: "doma-interior_texture16k.jpg",
	mesh_name: "doma-interior_textured.ply",
	pos_x_cam_start: 11*0.03,
	pos_y_cam_start: -20*0.03,
	pos_z_cam_start: 2*0.03,
}
m_models_values["pedret"] ={
	path: "pedret", 
	texture_name: "pedret-interior_meshed_tex.png",
	mesh_name: "pedret-interior_meshed_simplified.ply",
	pos_x_cam_start: 0.0681,
	pos_y_cam_start: 0.0920,
	pos_z_cam_start: 0.0327,
}
m_models_values["solsona"] ={
	path: "solsona", 
	texture_name: "solsona_meshed_tex.jpg",
	mesh_name: "solsona_meshed_simplified.ply",
	pos_x_cam_start: 0.329,
	pos_y_cam_start: -0.545,
	pos_z_cam_start: 0.0307,
}


const m_views = [
	{
		left: 0.0,
		bottom: 0.0,
		width: 1.0,
		height: 1.0,
		border_size: 2.0,
	},
	{
		left: 0.0,
		bottom: 0.0,
		width: 0.0,
		height: 0.0,
		border_size: 2.0,
	},
	{
		left: 0.0,
		bottom: 0.0,
		width: 1.0,
		height: 1.0,
		border_size: 2.0,
	}
];
var m_gui_options =
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
	linkage_enabled: true,

	red_area_enabled: false,
	show_camera_enabled: false,
	show_view_enabled: false,
	show_photo_enabled: false,
	project_capture_enabled: false,
	auto_score_enabled: false,

	current_model: "pedret",

}