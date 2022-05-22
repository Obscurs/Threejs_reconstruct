
let APPLICATION;
let AUTO_ENABLED = false;
const NUM_RAYS_PRECOMPUTE = 10;	//rays x rays
const VERSION = "v2.1.8"
const AppStates =
{
	APPLICATION_INIT: "init_state",
	LOADING_MESHES: "loading_meshes_state",
	LOADING_TEXTURES: "loading_textures_state",
	LOADING_PRECOMPUTED_DATA: "loading_precomputed_state",
	READY_TO_GO: "ready_state",
}
const PointedObjectNames =
{
	GROUND: "THEMODEL_COL_GROUND",
	WALL: "THEMODEL_COL_SELECT",
	VR_GUI: "VR_GUI",
	VR_GUI_PLANE: "VR_GUI_PLANE",
	VR_GUI_IMAGE: "VR_GUI_IMAGE",
	VR_GUI_BUTTON: "VR_GUI_BUTTON",
	VR_GUI_TYPE: "VR_GUI_TYPE",
	VR_GUI_GROUP_STACKS: "VR_GUI_GROUP_STACKS",
	VR_GUI_PHOTO_STACK: "VR_GUI_PHOTO_STACK",
	VR_GUI_PHOTO_ELEM: "VR_GUI_PHOTO_ELEM",
	VR_GUI_BACKGROUND: "VR_GUI_BACKGROUND",
	VR_COMPLEX_GROUP: "VR_COMPLEX_GROUP",
}

const ClusteringMethods = 
{
	SINGLE_LINKAGE: "single_linkage",
	BASIC: "basic",
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
/*
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

var m_debug_func = null;*/