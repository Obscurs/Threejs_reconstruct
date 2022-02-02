import { Vector3, Raycaster } from '../../build/three.module.js';
import { compareSimilitudes, compareCandidates, compareCanditateIndices} from './compareFuncs.js';
export function getWorldIntersectFromNDCxy(camera, ndc_pos, models)
{
	camera.updateProjectionMatrix();
	const NDC_position = new Vector3(ndc_pos.x,ndc_pos.y,1);
	const pointIntersect = new Vector3();
	NDC_position.unproject(camera);

	//m_camera_list[i].getWorldDirection( directionPhoto );
	//var raycasterPhoto =  new Raycaster(camera.position, NDC_position,0, 10000); 

	const raycaster =  new Raycaster();  

   	raycaster.setFromCamera( ndc_pos, camera );

	const intersectsPhoto = raycaster.intersectObjects( models );  




	////////////////////////////////////// BEGIN
	/*const material = new LineBasicMaterial( { color: 0x0000ff } );
	const points = [];

	points.push( camera.position );
	points.push( NDC_position );
	

	const geometry = new BufferGeometry().setFromPoints( points );
	const line = new Line( geometry, material );
	m_scene.add( line );
	m_debug.debug_mesh_lines.push(line)*/

	//console.log(intersectsPhoto)
	//console.log(ndc_pos)
	//////////////////////////////////// END
	if(intersectsPhoto.length > 0)
	{
		pointIntersect.copy(intersectsPhoto[0].point)
		////////////////////////// BEGIN
		/*const geometry2 = new SphereGeometry( 0.5, 32, 32 );
		const material2 = new MeshBasicMaterial( {color: 0xffff00} );
		var sphere = new Mesh( geometry2, material2 );
		sphere.position.set(pointIntersect.x,pointIntersect.y,pointIntersect.z);
		sphere.name ="theball"
		sphere.scale.set( 0.01,0.01,0.01);
		m_scene.add( sphere );
		//////////////////////////// END*/
		return pointIntersect;
	} 
	else
	{
		return null;
	}
}

export function checkWallBetweenTwoPoints(point1, point2, models)
{
	const dir = new Vector3(point2.x-point1.x,point2.y-point1.y,point2.z-point1.z)
	dir.normalize();
	const raycaster =  new Raycaster(point1, dir);    
	const intersects = raycaster.intersectObjects( models );

	for(let i =0; i < intersects.length; i++)
	{
		const point = intersects[i].point
		if(point.distanceTo(point1) > 0.01 && point.distanceTo(point2) > 0.01 && point1.distanceTo(point) < point1.distanceTo(point2))
		{
			return true
		}
			
	} 
	return false
}
export function getNDCposFromWorld(camera, worldpos)
{
	if(worldpos == null)
		return null;
	const projected = new Vector3();
	projected.copy(worldpos)
	projected.project(camera)
	return projected;
}
export function getWorldFromNDC(camera, NDC_position)
{
	const res = new Vector3(NDC_position.x,NDC_position.y,NDC_position.z)
	camera.updateProjectionMatrix();
	res.unproject(camera);
	return res;
}
export function positionAtT(inVec,t,p,v,g) {
    inVec.copy(p);
    inVec.addScaledVector(v,t);
    inVec.addScaledVector(g,0.5*t**2);
    return inVec;
}
export function intersectionObjectLine(models, pos, dir)
{

    const raycaster =  new Raycaster(pos, dir);    
	const intersects = raycaster.intersectObjects( models,true );

	//console.log(intersects)
	//setDefaultColorsCameras();
	
    if ( intersects.length > 0 ) 
    {
    	
    	let curr_index = intersects[ 0 ]
    	let curr_depth = intersects[ 0 ].distance
    	for(let i=0; i <intersects.length; i++)
    	{
    		if(intersects[ i ].distance < curr_depth || (curr_index.object.parent && curr_index.object.parent.isUIelem && !curr_index.object.parent.ui_isVisible ))
    		{
    			curr_depth = intersects[ i ].distance;
    			curr_index = intersects[ i ];
    		}
    	}
    	return curr_index
    }
    else
    	return null
}


export function singleLinkageClustering(num_clusters, num_elements_per_cluster, cameraList, candidates)
{


	const result = []
	for (let i = 0; i < candidates.length; i++) {
		//TODO use class for this structure
		const aux_collection_elem = {
			score: 0,
			elems: null,
			distances: null,
			animating: 0,
			min: null,
			max: null,
		}
		result.push(aux_collection_elem);
	}
	for (let i = 0; i < candidates.length; i++) {
		const pair_elem_score = {
			elem: candidates[i].index,
			similitude: candidates[i].score,
			score: candidates[i].score,
		}
		result[candidates[i].index].elems = [pair_elem_score]
		result[candidates[i].index].distances = cameraList[candidates[i].index].similitudes.slice()
	}
	let countNulls = 0
	for (let i = 0; i < result.length; i++) {

		if(result[i].elems[0].score == 0)
			countNulls = countNulls+1
	}
	while(true)
	{
		const mindist = 
		{
			c1: null,
			c2: null,
			dist: -1, //1 is the maximum distance allowed
		}
		for(let i = 0; i < result.length; i++)
		{
			if(result[i].elems.length <num_elements_per_cluster)
			{
				for(let j = i+1; j < result[i].distances.length; j++)
				{
				if(result[i].distances[j] > mindist.dist && result[j].elems[0].score > 0 )
				{
					mindist.dist = result[i].distances[j]
					mindist.c1 = i
					mindist.c2 = j
				}
				if(mindist.dist==1)
					break;
			}
			if(mindist.dist==1)
					break;
			}
			
		}
		if(mindist.dist == -1 && mindist.dist < 0.10)
			break;
		if(mindist.c1 > mindist.c2)
		{
			const c_aux = mindist.c1
			mindist.c1 = mindist.c2
			mindist.c2 = c_aux
		}

		const newdistances = []
		for(let i=0; i < result.length; i++)
		{
			const val1 = result[mindist.c1].distances[i]
			const val2 = result[mindist.c2].distances[i]
			if(i != mindist.c1 && i != mindist.c2)
				newdistances.push(Math.max(val1,val2))
		}
		newdistances.push(1)
		//TODO use class for this structure
		const aux_collection_elem = {
			score: 0,
			elems: result[mindist.c1].elems.concat(result[mindist.c2].elems),
			distances: newdistances.slice(),
			animating: 0,
			min: null,
			max: null,
		}
		//console.log("joined "+cameraList[result[mindist.c1].elems[0].elem].name+ " with "+cameraList[result[mindist.c2].elems[0].elem].name)
		result.splice(mindist.c2,1)
		result.splice(mindist.c1,1)
		for(let i = 0; i < result.length; i++)
		{
			result[i].distances.splice(mindist.c2,1)
			result[i].distances.splice(mindist.c1,1)
			result[i].distances.push(aux_collection_elem.distances[i])
		}
		result.push(aux_collection_elem)
	}
	
	for(let i = 0; i < result.length; i++)
	{
		result[i].elems.sort(compareSimilitudes)
		const aux_array = []
		for(let j = 0; j < Math.min(num_elements_per_cluster,result[i].elems.length); j++)
			aux_array.push(result[i].elems[j].elem)
		if(result[i].elems.length >0)
			result[i].score = result[i].elems[0].similitude
		result[i].elems = aux_array
	}
	result.sort(compareCandidates)

	while(result.length > num_clusters)
	{
		result.pop();
	}
	return result
}
export function basicClustering(num_clusters, num_elements_per_cluster, treshold, maxNumCollections, cameraList, candidates)
{
	const aux_candidate_list = []
	for (let i = 0; i < candidates.length; i++) {
		aux_candidate_list.push(candidates[i])
	}
	aux_candidate_list.sort(compareCanditateIndices)
	const result = []
	let current_collection_index = 0
	for (let i = 0; i < candidates.length; i++) {
		if(candidates[i].collection_index == -1 && result.length < num_clusters)
		{
			//TODO use class for this structure
			const aux_collection_elem = {
				score: candidates[i].score,
				elems: [candidates[i].index],
				animating: 0,
				min: null,
				max: null,
			}
			result.push(aux_collection_elem)
			candidates[i].collection_index=current_collection_index;
			let reached_treshold = false;
			let aux_index_capture = 0;
			while(!reached_treshold && aux_index_capture < cameraList[candidates[i].index].similitudes_indices_ordered.length)
			{
				if(cameraList[candidates[i].index].similitudes_indices_ordered[aux_index_capture].similitude > treshold)
				{

					if(aux_candidate_list[cameraList[candidates[i].index].similitudes_indices_ordered[aux_index_capture].index].collection_index == -1)
					{

						aux_candidate_list[cameraList[candidates[i].index].similitudes_indices_ordered[aux_index_capture].index].collection_index = current_collection_index;

						if(result[current_collection_index].elems.length < num_elements_per_cluster)
						{
							result[current_collection_index].elems.push(cameraList[candidates[i].index].similitudes_indices_ordered[aux_index_capture].index)
						}
						
					}
				}
				else
				{
					reached_treshold = true;
				}
				aux_index_capture = aux_index_capture+1;
			}
			current_collection_index = current_collection_index +1
		}
		else if(result.length >= maxNumCollections)
			break;
	}
	return result
}
