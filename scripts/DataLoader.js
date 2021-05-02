import { Vector3 } from '../../build/three.module.js';
import { compareSimilitudes } from './compareFuncs.js';
import { getWorldIntersectFromNDCxy } from './utils.js';
class DataLoader {
	static computeSimilitudesIndicesOrdered(camera_list)
	{
		for(var index_cam=0; index_cam < camera_list.length; ++index_cam)
		{	
			camera_list[index_cam].similitudes_indices_ordered = []
			for(var index_cam2=0; index_cam2 < camera_list[index_cam].similitudes.length; ++index_cam2)
			{
				var curr_sim = 
				{
					index: index_cam2,
					similitude: camera_list[index_cam].similitudes[index_cam2]
				}
				camera_list[index_cam].similitudes_indices_ordered.push(curr_sim)
			}
			camera_list[index_cam].similitudes_indices_ordered.sort(compareSimilitudes)
		}
	}
	static precomputeCaptureSimilitude(camera_list)
	{
		console.log("INFO: Precomputing Similitudes....")
		for(var index_cam=0; index_cam < camera_list.length; ++index_cam)
		{	
			camera_list[index_cam].similitudes = []
			for(var index_cam2=0; index_cam2 < camera_list.length; ++index_cam2)
			{
				camera_list[index_cam].similitudes.push(computeSimilitudeForCams(camera_list[index_cam],camera_list[index_cam2]))
			}
			//var completation = Math.floor((index_cam/camera_list.length)*50+50)

			//document.getElementById("loadingText").innerHTML = "Precomputed rays not found, precomputing again: "+completation.toString() +"%";
		}
		this.computeSimilitudesIndicesOrdered(camera_list)
		console.log("INFO: Precomputing Similitudes: DONE")
	}

	static loadPrecomputedFile(data, camera_list)
	{
		console.log("INFO: Loading Precomputed File...")
		var data_cameras = data.split('\n');
		if(data_cameras.length != camera_list.length)
		{
			console.log("INFO: Precomputed File outdated, need to recompute")
			return true
		}
		else
		{
			for(var index_cam=0; index_cam < data_cameras.length; ++index_cam)
			{
				camera_list[index_cam].rays = []
				var data_camera = data_cameras[index_cam].split(' ')
				while(data_camera[0] == "")
					data_camera.shift()
				var num_rays = data_camera[0]

				for(var ray = 0; ray < num_rays; ++ray)
				{
					var x = data_camera[ray*3+1]
					var y = data_camera[ray*3+1+1]
					var z = data_camera[ray*3+1+2]
					var position_ray = new Vector3(x,y,z);
					camera_list[index_cam].rays.push(position_ray);
				}
				camera_list[index_cam].similitudes = []
				for(var simil_cam_index = 0; simil_cam_index <camera_list.length; ++simil_cam_index)
				{
					var simil = data_camera[num_rays*3+1+simil_cam_index]
					camera_list[index_cam].similitudes.push(simil)
				}
			}
			this.computeSimilitudesIndicesOrdered(camera_list)
			return false
		}
		console.log("INFO: Loading Precomputed File: DONE")

		
		
			
	}
	static savePrecomputedFile(camera_list)
	{
		console.log("INFO: Saving Precomputed File...")
		var parts = []
		for(var index_cam=0; index_cam < camera_list.length; ++index_cam)
		{	

			parts.push(camera_list[index_cam].rays.length);

			for(var index_ray=0; index_ray < camera_list[index_cam].rays.length; ++index_ray)
			{
				var raypos = camera_list[index_cam].rays[index_ray]
				parts.push(" " + raypos.x + " " + raypos.y + " " + raypos.z);
			}
			for(var index_sim=0; index_sim < camera_list[index_cam].similitudes.length; ++index_sim)
			{
				var sim = camera_list[index_cam].similitudes[index_sim]
				parts.push(" " + sim);
			}
			if(index_cam < camera_list.length -1)
				parts.push("\n");
		}
		var blob = new Blob(parts);
		saveAs(blob, 'precomputedCameraData.txt')
		console.log("INFO: Saving Precomputed File: DONE")
	}
	static precomputeRays(camera_list, rays_x, rays_y, i)
	{
		console.log("INFO: precomputing rays...")

		camera_list[i].camera.updateProjectionMatrix()
		camera_list[i].rays = []
		for(var x = 0; x <= 1; x +=(1/(rays_x-1)))
		{
			for(var y = 0; y <= 1; y +=(1/(rays_y-1)))
			{
				var NDC_position = new THREE.Vector2(x*2-1,y*2-1); 
				var point = getWorldIntersectFromNDCxy(camera_list[i].camera, NDC_position, m_scene_models);
				if(point !=null)
					camera_list[i].rays.push(point);
			}
		}
		var completation = Math.floor((i/camera_list.length)*90)

		document.getElementById("loadingText").innerHTML = "Precomputing rays: "+completation.toString() +"%";

		console.log("      finished precomputing capture positions for cam: "+i+" , rays found: "+camera_list[i].rays.length)
	
		
		console.log("INFO: finished precomputing rays")
		
	}
	
}

export { DataLoader };