export class CameraInfo {
	constructor(name, width, height, matrix, focal, mesh, sprite, camera) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.matrix = matrix;
		this.focal = focal;
		this.spriteProperties = {
			minSel: -1,
			maxSel: -1,
			indexInGroup: -1,
			//selected: false,
		}
		this.camera = camera;
		this.mesh = mesh;
		this.similitudes = [];
		this.similitudes_indices_ordered = [];
		this.rays = [];

	}

}
