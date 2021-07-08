import { Vector3, Raycaster } from '../../build/three.module.js';
export function getWorldIntersectFromNDCxy(camera, ndc_pos, models)
{
	camera.updateProjectionMatrix();
	var NDC_position = new Vector3(ndc_pos.x,ndc_pos.y,1);
	var pointIntersect = new Vector3();
	NDC_position.unproject(camera);

	//m_camera_list[i].getWorldDirection( directionPhoto );
	//var raycasterPhoto =  new Raycaster(camera.position, NDC_position,0, 10000); 

	 var raycaster =  new Raycaster();  

   	raycaster.setFromCamera( ndc_pos, camera );

	var intersectsPhoto = raycaster.intersectObjects( models );  




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
	var dir = new Vector3(point2.x-point1.x,point2.y-point1.y,point2.z-point1.z)
	dir.normalize();
	var raycaster =  new Raycaster(point1, dir);    
	var intersects = raycaster.intersectObjects( models );

	for(var i =0; i < intersects.length; i++)
	{
		var point = intersects[i].point
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
	var projected = new Vector3();
	projected.copy(worldpos)
	projected.project(camera)
	return projected;
}
export function getWorldFromNDC(camera, NDC_position)
{
	var res = new Vector3(NDC_position.x,NDC_position.y,NDC_position.z)
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
