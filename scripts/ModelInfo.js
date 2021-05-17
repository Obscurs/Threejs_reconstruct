export class ModelInfo {
	constructor(path, texture_name, mesh_name, pos_x_cam_start, pos_y_cam_start, pos_z_cam_start,vr_y) {
		this.path = path;
		this.texture_name = texture_name;
		this.mesh_name = mesh_name;
		this.pos_x_cam_start = pos_x_cam_start;
		this.pos_y_cam_start = pos_y_cam_start;
		this.pos_z_cam_start = pos_z_cam_start;
		this.vr_y = vr_y;
		this.refinePosAndOrientation()
	}
	refinePosAndOrientation()
	{
		if(this.path == "doma")
		{
			this.target_x_cam_start = 10.972;
			this.target_y_cam_start = -0.153;
			this.target_z_cam_start = 18.147;
		}
		else if(this.path == "solsona")
		{
			this.target_x_cam_start = 6.933;
			this.target_y_cam_start = 0.557;
			this.target_z_cam_start = 16.99;

		}
		else if(this.path == "pedret")
		{
			this.target_x_cam_start = 2.50;
			this.target_y_cam_start = 0.125;
			this.target_z_cam_start = -7.854;
		}
	}
}