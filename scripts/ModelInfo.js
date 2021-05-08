export class ModelInfo {
	constructor(path, texture_name, mesh_name, pos_x_cam_start, pos_y_cam_start, pos_z_cam_start,vr_y) {
		this.path = path;
		this.texture_name = texture_name;
		this.mesh_name = mesh_name;
		this.pos_x_cam_start = pos_x_cam_start;
		this.pos_y_cam_start = pos_y_cam_start;
		this.pos_z_cam_start = pos_z_cam_start;
		this.vr_y = vr_y;
	}
}