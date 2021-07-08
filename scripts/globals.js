let m_container, m_stats, m_gui;
let m_camera, m_camera_capture, m_camera_capture_orto, m_scene, m_scene_collections, m_scene_capture, m_camera_collections, m_renderer, m_context, m_vr_panels_group;
let m_controller1, m_controller2;
let m_controllerGrip1, m_controllerGrip2;
let m_camera_group;
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
var m_group;
var m_rectangle_select_vr = null;
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
var m_current_sprites_in_scene;
var m_selection_rectangle = {
	startNDC: null,
	endNDC: null,
	startWorld: null,
	endWorld: null,
	selectionBox: null,
	helper: null,
}
var m_changed_image_in_view = 1;
var m_cameraHelper;
var m_has_any_secondary_capture = false;
var m_min_pos = null;
var m_max_pos = null;
var m_plane_image_secondary = null;
var m_plane_render_target = null;
var m_render_target_secondary = null;
var m_old_vr_input_data = null;
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
	inVR: false,
}
var m_debug = 
{
	debug_mesh_lines: [],
}

const m_models_values = []



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

var m_vr_move_utils = 
{
	g: null,
	tempVec: null,
	tempVec1: null,
	tempVecP: null,
	tempVecV: null,
	guidingController: null,
	guidelight: null,
	guideline: null,
	lineGeometryVertices: null,
	lineSegments: null,
	guidesprite: null,
	vrguiEnabled: null,
	vrgui: null,
	lastFrameInVR: false,
	isDrawingSelectBox: false,
	drawBoxStartPoint: null,
	drawBoxEndPoint: null,
	lineGeometryVerticesSquare: null,
	lineSquare: null,
	framesSquare: 0,
	captureIntexUnderPointer: 0,
}
