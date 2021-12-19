import { getWorldIntersectFromNDCxy, getNDCposFromWorld, positionAtT, getWorldFromNDC, singleLinkageClustering, basicClustering} from './utils.js';
import * as THREE from '../build/three.module.js';
import {compareCandidates} from './compareFuncs.js';

export class Scorer {
	static c_current_candidate_collections = []
	static c_min_pos = null
	static c_max_pos = null

	static init(camera_list)
	{
		const arrayLength = camera_list.length;
		for (let i = 0; i < arrayLength; i++) {
		    const pos =camera_list[i].camera.position; 

		    if(this.c_min_pos == null)
			{
				this.c_min_pos = new THREE.Vector3(pos.x,pos.y,pos.z)
			}
			if(this.c_max_pos == null)
			{
				this.c_max_pos = new THREE.Vector3(pos.x,pos.y,pos.z)
			}
			if(this.c_min_pos.x > pos.x)
				this.c_min_pos.x = pos.x
			if(this.c_min_pos.y > pos.z)
				this.c_min_pos.y = pos.z
			if(this.c_min_pos.z > pos.z)
				this.c_min_pos.z = pos.z

			if(this.c_max_pos.x < pos.x)
				this.c_max_pos.x = pos.x
			if(this.c_max_pos.y < pos.z)
				this.c_max_pos.y = pos.z
			if(this.c_max_pos.z < pos.z)
				this.c_max_pos.z = pos.z
		}
		
	}

	static genNewCandidates(camera_list, selection_rectangle, clusteringOptions, scoreOptions, mainCamera)
	{
		console.log("INFO: Updating candidates...")
		let changed = false
		const arrayLength = camera_list.length;
		const candidateScores = []
		for (let i = 0; i < arrayLength; i++) {
		    const scoreCam = this.getScoreCam(mainCamera, camera_list, i, selection_rectangle, scoreOptions)
		    const elem = {
			    'index': i,
			    'score': scoreCam,
			    'collection_index': -1,
			};
			//console.log(camera_list[i].name+" "+i + " score: "+ scoreCam)
			if(isNaN(elem.score) )
				elem.score = 0;
			
			if(i >= candidateScores.length)
			{
				candidateScores.push(elem)
			}

		}
		candidateScores.sort(compareCandidates)
		this.normalizeScores(candidateScores)
		this.performClustering(camera_list, clusteringOptions, candidateScores)
		console.log("INFO: Updating candidates: DONE")
	}

	static getCurrentCandidates()
	{
		return this.c_current_candidate_collections
	}

	static normalizeScores(candidateScores)
	{
		const biggest_score = candidateScores[0].score;
		for (let i = 0; i < candidateScores.length; i++) {
			candidateScores[i].score = candidateScores[i].score/biggest_score;
		}
	}

	static performClustering(camera_list, clusteringOptions, candidateScores)
	{
		if(clusteringOptions.clustering_method == ClusteringMethods.SINGLE_LINKAGE)
			this.c_current_candidate_collections = singleLinkageClustering(clusteringOptions.max_num_collections, clusteringOptions.max_collection_size, camera_list, candidateScores);
		else if(clusteringOptions.clustering_method == ClusteringMethods.BASIC)
			this.c_current_candidate_collections = basicClustering(clusteringOptions.max_num_collections, clusteringOptions.max_collection_size, clusteringOptions.similitude_treshold, clusteringOptions.max_num_collections, camera_list, candidateScores);
		else 
			console.log("ERROR: clustering method not defined")
	}


	static getScoreCam(mainCamera, camera_list, index_cam, selection_rectangle, scoreOptions)
	{
		let distanceScore, orientationScore, raysScore;
		distanceScore = orientationScore = raysScore = 0;
		if(selection_rectangle != null)
		{
			raysScore = this.getScoreRays(mainCamera, camera_list, index_cam,selection_rectangle.startNDC.x,selection_rectangle.endNDC.x,selection_rectangle.startNDC.y,selection_rectangle.endNDC.y);

			const minNDCpoint = getNDCposFromWorld(camera_list[index_cam].camera, selection_rectangle.startWorld)
			const maxNDCpoint = getNDCposFromWorld(camera_list[index_cam].camera, selection_rectangle.endWorld)
			
			//console.log("minmax")
			//console.log(minNDCpoint)
			//console.log(maxNDCpoint)
			if(minNDCpoint != null && maxNDCpoint !=null)
			{
				if(minNDCpoint.x >maxNDCpoint.x)
				{
					const aux = minNDCpoint.x;
					minNDCpoint.x = maxNDCpoint.x;
					maxNDCpoint.x = aux;
				}
				if(minNDCpoint.y >maxNDCpoint.y)
				{
					const aux = minNDCpoint.y;
					minNDCpoint.y = maxNDCpoint.y;
					maxNDCpoint.y = aux;
				}
				camera_list[index_cam].spriteProperties.minSel = new THREE.Vector2((minNDCpoint.x+1)/2,(minNDCpoint.y+1)/2);
				camera_list[index_cam].spriteProperties.maxSel = new THREE.Vector2((maxNDCpoint.x+1)/2,(maxNDCpoint.y+1)/2);
				
			}
			else
			{
				camera_list[index_cam].spriteProperties.minSel = new THREE.Vector2(0.0,0.0);
				camera_list[index_cam].spriteProperties.maxSel = new THREE.Vector2(0.0,0.0);
			}
			
			return raysScore;
		}
		else
		{
			if(scoreOptions.position)
				distanceScore = this.getScorePosition(mainCamera, camera_list, index_cam);
			if(scoreOptions.orientation)
				orientationScore = this.getScoreRotation(mainCamera, camera_list, index_cam);
			if(scoreOptions.projection)
				raysScore = this.getScoreRays(mainCamera, camera_list, index_cam,-1,1,-1,1);

			camera_list[index_cam].spriteProperties.minSel = new THREE.Vector2(0.0,0.0);
			camera_list[index_cam].spriteProperties.maxSel = new THREE.Vector2(0.0,0.0);
			return distanceScore*scoreOptions.position + orientationScore*scoreOptions.orientation + raysScore*scoreOptions.projection;
		}

		
	}

	static getScoreRays(main_camera, camera_list, index_cam, min_x, max_x, min_y, max_y)
	{


		main_camera.updateProjectionMatrix();
		main_camera.updateMatrixWorld();
		let count_inside_rays = 0
		for(let index_ray = 0; index_ray < camera_list[index_cam].rays.length; ++index_ray)
		{
			const projected = new THREE.Vector3();
			projected.copy(camera_list[index_cam].rays[index_ray])
			projected.project(main_camera)
				
			let aux_x_min = min_x
			let aux_y_min = min_y
			let aux_x_max = max_x
			let aux_y_max = max_y

			if(max_y < min_y)
			{
				aux_y_min = max_y
				aux_y_max = min_y
			}
			if(max_x < min_x)
			{
				aux_x_min = max_x
				aux_x_max = min_x
			}
			if(projected.x > aux_x_min && projected.x < aux_x_max && projected.y > aux_y_min && projected.y < aux_y_max)
			{
				let projected2 = new THREE.Vector3();
				projected2.copy(camera_list[index_cam].rays[index_ray])
				projected2.applyMatrix4( main_camera.matrixWorldInverse );
				if(projected2.z < 0)
					count_inside_rays = count_inside_rays +1
			}
				
		}
		//console.log(camera_list[index_cam].name +" "+count_inside_rays)
		if(camera_list[index_cam].rays.length > 0)
			return count_inside_rays/camera_list[index_cam].rays.length
		else
			return 0
	}
	static getScorePosition(main_camera, camera_list, index_cam)
	{
		const dist_max_aprox = (this.c_min_pos.distanceTo(this.c_max_pos))*2
		let dist = camera_list[index_cam].camera.position.distanceTo(main_camera.position)
		if(dist > dist_max_aprox)
			dist = dist_max_aprox;
		return (dist_max_aprox-dist)/dist_max_aprox;
		
	}
	static getScoreRotation(main_camera, camera_list, index_cam)
	{
		const direction1 = new THREE.Vector3();
		const direction2 = new THREE.Vector3();
		camera_list[index_cam].camera.getWorldDirection( direction1 );
		main_camera.getWorldDirection( direction2 );
		const dist = direction1.distanceTo(direction2);
		return dist/2;
		
	}
}








