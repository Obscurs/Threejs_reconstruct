import * as THREE from '../build/three.module.js';
import { PLYLoader } from '../jsm/loaders/PLYLoader.js';
import { compareSimilitudes } from './compareFuncs.js';
import { CameraInfo} from './CameraInfo.js';
import { ModelInfo} from './ModelInfo.js';
import { getWorldIntersectFromNDCxy, getNDCposFromWorld, checkWallBetweenTwoPoints } from './utils.js';


const NUM_SHADERS_TO_LOAD = 8;

class DataLoader {

	static c_num_cameras_loaded = 0
	static c_num_models_loaded = 0
	static c_num_shaders_loaded = 0
	static c_num_cameras_to_load = 0
	static c_num_models_to_load = 0
	static c_precomputed_file_loaded = false
	static c_precomputation_done = false
	static c_textures_loaded = false
	static c_count_precomputation_iterations = 0
	static c_camera_list = []
	static c_current_model = null
	static c_capture_rays_need_recomputation = false
	static c_model_values = []

	static c_sceneModels = []
	static c_sceneModelsCol = []


	static c_shaders = 
	{
		captureImageFrag: null,
		sceneFrag: null,
		sceneVert: null,
		screenFrag: null,
		spriteVert: null,
		spriteFrag: null,
		spriteSquaredVert: null,
		spriteSquaredFrag: null,
	}


	static clearData()
	{
		this.c_num_cameras_loaded = 0
		this.c_num_models_loaded = 0
		this.c_num_cameras_to_load = 0
		this.c_num_models_to_load = 0
		this.c_precomputed_file_loaded = false
		this.c_precomputation_done = false
		this.c_textures_loaded = false
		this.c_capture_rays_need_recomputation = false
		this.c_count_precomputation_iterations = 0
		this.c_camera_list = []

		this.disposeModels()
	}
	static disposeModels()
	{
		for(let i=0; i < this.c_sceneModels.length; ++i)
		{
			this.c_sceneModels[i].textureLoaded.dispose()
			this.c_sceneModels[i].material.dispose()
			this.c_sceneModels[i].geometry.dispose()
		}
		for(let i=0; i < this.c_sceneModelsCol.length; ++i)
		{
			this.c_sceneModelsCol[i].material.dispose()
			this.c_sceneModelsCol[i].geometry.dispose()
		}
		this.c_sceneModels = []
		this.c_sceneModelsCol = []
	}
	static getSceneModels()
	{
		return this.c_sceneModels
	}
	static getSceneModelsCol()
	{
		return this.c_sceneModelsCol
	}
	static restart(model, scene)
	{
		this.clearData()

		if(this.c_model_values.length == 0)
		{
			this.c_model_values["doma"] = new ModelInfo("doma" ,"doma-interior_meshed_tex.png", "doma-interior_meshed_simplified", 11.62, -0.137, 17.99, -1)
			this.c_model_values["pedret"] = new ModelInfo("pedret" ,"pedret-interior_meshed_tex.png", "pedret-interior_meshed_simplified", 2.51, 0.119, -7.99,-1)
			this.c_model_values["solsona"] = new ModelInfo("solsona" ,"solsona_meshed_tex.jpg", "solsona_meshed_simplified", 6.73, 0.54, 16.89,-1)
		}

		this.loadModels(this.c_model_values[model], scene);
		const xmlhttp = new XMLHttpRequest();
		var self = this
		xmlhttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		        var myObj = JSON.parse(this.responseText);
		        console.log("INFO: Capture info json loading... DONE")
		        self.loadCameras(myObj)
		    }
		};
		xmlhttp.open("GET", 'models/'+this.getCurrentModel().path+"/capture_info/cameraInfo.json", true);
		console.log("INFO: Capture info json loading...")
		xmlhttp.send();
	}
	static getShaders()
	{
		return this.c_shaders
	}
	static texturesLoaded()
	{
		return this.c_textures_loaded
	}
	static captureRaysNeedRecompute()
	{
		return this.c_capture_rays_need_recomputation
	}
	static precomputeFileLoaded()
	{
		return this.c_precomputed_file_loaded
	}
	static getCameraList()
	{
		return this.c_camera_list
	}

	static loadShaders()
	{
		function onLoadShader(self)
		{
			self.c_num_shaders_loaded +=1
			if(self.c_num_shaders_loaded ==NUM_SHADERS_TO_LOAD)
				console.log("INFO: SHADERS LOADED ")
		}
		this.c_num_shaders_loaded = 0
		const shaderLoader = new THREE.FileLoader();
		var self = this
		shaderLoader.load('assets/shaders/captureImage.frag',function ( data ) {self.c_shaders.captureImageFrag =  data; onLoadShader(self); },);
		shaderLoader.load('assets/shaders/scene.frag',function ( data ) {self.c_shaders.sceneFrag =  data; onLoadShader(self); },);
		shaderLoader.load('assets/shaders/scene.vert',function ( data ) {self.c_shaders.sceneVert =  data; onLoadShader(self); },);
		shaderLoader.load('assets/shaders/screen.frag',function ( data ) {self.c_shaders.screenFrag =  data; onLoadShader(self); },);
		shaderLoader.load('assets/shaders/sprite.vert',function ( data ) {self.c_shaders.spriteVert =  data; onLoadShader(self); },);
		shaderLoader.load('assets/shaders/sprite.frag',function ( data ) {self.c_shaders.spriteFrag =  data; onLoadShader(self); },);
		shaderLoader.load('assets/shaders/spriteSquared.vert',function ( data ) {self.c_shaders.spriteSquaredVert =  data; onLoadShader(self); },);
		shaderLoader.load('assets/shaders/spriteSquared.frag',function ( data ) {self.c_shaders.spriteSquaredFrag =  data; onLoadShader(self); },);
	}
	static loadCameras(cameras) {

		this.c_num_cameras_to_load = cameras.cameras.length
		console.log("INFO: Loading cameras...")

		for(let index = 0; index < cameras.cameras.length; ++index)
		{
			const element = cameras.cameras[index]
			const new_camera = new CameraInfo()
			new_camera.initFromLoad(element)
			this.c_camera_list.push(new_camera);
			this.c_num_cameras_loaded +=1


			const completation = Math.floor(((this.c_num_cameras_loaded+this.c_num_models_loaded*10)/(this.c_num_cameras_to_load+this.c_num_models_to_load*10))*80)

			document.getElementById("loadingText").innerHTML = "Loading: "+completation.toString() +"%";
		}
	}
	static shadersLoaded()
	{
		return this.c_num_shaders_loaded == NUM_SHADERS_TO_LOAD
	}


	static loadModel(model, scene)
	{
		console.log("INFO: Loading "+model.path+"...")
		const loader = new PLYLoader();


		var self = this
		loader.load( './models/'+model.path+'/meshes/'+model.mesh_name+"_colision_ground.ply", function ( geometry ) {
			geometry.computeVertexNormals();
			
		    const material = new THREE.MeshBasicMaterial( {
				opacity: 0.0,
				transparent: true,
			} );

			const mesh = new THREE.Mesh( geometry, material );

			const m2 = new THREE.Matrix4();
			m2.makeRotationX(THREE.Math.degToRad(-90))

			mesh.applyMatrix4(m2);

			mesh.isGUI = false
			mesh.name = PointedObjectNames.GROUND
			scene.add( mesh );
			self.c_sceneModelsCol.push(mesh);

			self.c_num_models_loaded +=1
			console.log("INFO: Loading Model Col ground: DONE")
			const completation = Math.floor(((self.c_num_cameras_loaded+self.c_num_models_loaded*10)/(self.c_num_cameras_to_load+self.c_num_models_to_load*10))*80)
			document.getElementById("loadingText").innerHTML = "Loading: "+completation.toString() +"%";


		} );
		loader.load( './models/'+model.path+'/meshes/'+model.mesh_name+"_colision_select.ply", function ( geometry ) {
			geometry.computeVertexNormals();
			
		    const material = new THREE.MeshBasicMaterial( {
				opacity: 0.0,
				transparent: true,
			} );

			const mesh = new THREE.Mesh( geometry, material );
			const m2 = new THREE.Matrix4();
			m2.makeRotationX(THREE.Math.degToRad(-90))

			mesh.applyMatrix4(m2);

			mesh.isGUI = false
			mesh.name = PointedObjectNames.WALL
			scene.add( mesh );
			self.c_sceneModelsCol.push(mesh);

			self.c_num_models_loaded +=1
			console.log("INFO: Loading Model Col select: DONE")
			const completation = Math.floor(((self.c_num_cameras_loaded+self.c_num_models_loaded*10)/(self.c_num_cameras_to_load+self.c_num_models_to_load*10))*80)
			document.getElementById("loadingText").innerHTML = "Loading: "+completation.toString() +"%";


		} );





		var self = this

		const manager = new THREE.LoadingManager();
		manager.dataLoader = this
		manager.onLoad = function(self)
		{
			//m_renderer.render( m_scene, camera );
		    console.log("INFO: DOMA_TEXTURE_LOADED");
		    this.dataLoader.c_textures_loaded = true
		}
		const loaderTex = new THREE.TextureLoader(manager);


		loader.load( './models/'+model.path+'/meshes/'+model.mesh_name+".ply", function ( geometry ) {

			geometry.computeVertexNormals();
			let tex = loaderTex.load('./models/'+model.path+'/textures/'+model.texture_name)
			let uniforms = {
		        viewMatrixCapture: {type: 'mat4', value: new THREE.Matrix4()},
		        projectionMatrixCapture: {type: 'mat4', value: new THREE.Matrix4()},
		        showRedArea: {type: 'bool', value: false},
		        projectCapture: {type: 'bool', value: false},
		        //texture1: { type: "t", value: THREE.ImageUtils.loadTexture( "./models/textures/doma-interior_texture16k.jpg" ) },
		        texture1: { type: "t", value: tex},
		        texture2: { type: "t", value: null },
		        u_time: { type: "f", value: 0 },
		        isLoading: {type: 'bool', value: false},
		        squareVR: {type: 'bool', value: false},
		        vUv_VR_square_min: {type: 'vec2', value: new THREE.Vector2()},
		        vUv_VR_square_max: {type: 'vec2', value: new THREE.Vector2()},

		    }
			const material = new THREE.ShaderMaterial( { 
				uniforms: uniforms,
			    fragmentShader: self.c_shaders.sceneFrag,
				vertexShader: self.c_shaders.sceneVert,
			} );
			const mesh = new THREE.Mesh( geometry, material );
			//mesh.renderOrder = 0
			mesh.textureLoaded = tex
			const m2 = new THREE.Matrix4();
			m2.makeRotationX(THREE.Math.degToRad(-90))

			mesh.applyMatrix4(m2);


			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.name = "THEMODEL"
			scene.add( mesh );
			self.c_sceneModels.push(mesh);

			//TODO Check cams loaded
			self.c_num_models_loaded +=1
			console.log("INFO: Loading Model: DONE")
			const completation = Math.floor(((self.c_num_cameras_loaded+self.c_num_models_loaded*10)/(self.c_num_cameras_to_load+self.c_num_models_to_load*10))*80)
			document.getElementById("loadingText").innerHTML = "Loading: "+completation.toString() +"%";

			//precomputeRays()

		} );
	} 
	static assetsLoaded()
	{
		return this.c_num_models_loaded == this.c_num_models_to_load 
				&& this.c_num_cameras_loaded == this.c_num_cameras_to_load
	}
	static loadModels(model, scene)
	{
		this.c_current_model = model
		this.c_num_models_to_load = 3
		this.loadModel(model, scene);
	}
	static getCurrentModel()
	{
		return this.c_current_model
	}

	static computeSimilitudeForCams(cam1, cam2)
	{
		
		let count_inside_rays_cam1 = 0
		let count_inside_rays_cam2 = 0
		let rate_cam1 = 0;
		let rate_cam2 = 0;
		for(let index_ray = 0; index_ray <cam1.rays.length; ++index_ray)
		{
			const projected = new THREE.Vector3();
			projected.copy(cam1.rays[index_ray])
			projected.project(cam2.camera)
			/*var projected = new THREE.THREE.Vector3();
			projected.copy(cam1.rays[index_ray])
			projected.project(cam2.camera)
			//console.log(projected)*/
			if(projected.x > -1.0 && projected.x < 1.0 && projected.y > -1.0 && projected.y < 1.0)
			{
				//console.log("added " + index_cam)
				const projected2 = new THREE.Vector3();
				projected2.copy(cam1.rays[index_ray])
				projected2.applyMatrix4( cam2.camera.matrixWorldInverse );
				if(projected2.z < 0)
				{
					if(!checkWallBetweenTwoPoints(cam2.camera.position,cam1.rays[index_ray],this.c_sceneModels))
						count_inside_rays_cam1 = count_inside_rays_cam1 +1
				}
					
			}
				
		}
		if(cam1.rays.length > 0)
			rate_cam1 = count_inside_rays_cam1/cam1.rays.length;

		for(let index_ray = 0; index_ray <cam2.rays.length; ++index_ray)
		{
			const projected = new THREE.Vector3();
			projected.copy(cam2.rays[index_ray])
			projected.project(cam1.camera)
			//console.log(projected)
			if(projected.x > -1.0 && projected.x < 1.0 && projected.y > -1.0 && projected.y < 1.0)
			{
				//console.log("added " + index_cam)
				const projected2 = new THREE.Vector3();
				projected2.copy(cam2.rays[index_ray])
				projected2.applyMatrix4( cam1.camera.matrixWorldInverse );
				if(projected2.z < 0)
				{
					if(!checkWallBetweenTwoPoints(cam1.camera.position,cam2.rays[index_ray],this.c_sceneModels))
						count_inside_rays_cam2 = count_inside_rays_cam2 +1
				}
					
			}
				
		}
		if(cam2.rays.length > 0)
			rate_cam2 = count_inside_rays_cam2/cam2.rays.length;

		return (rate_cam1+rate_cam2)/2
	}
	static computeSimilitudesIndicesOrdered()
	{
		for(let index_cam=0; index_cam < this.c_camera_list.length; ++index_cam)
		{	
			this.c_camera_list[index_cam].similitudes_indices_ordered = []
			for(let index_cam2=0; index_cam2 < this.c_camera_list[index_cam].similitudes.length; ++index_cam2)
			{
				const curr_sim = 
				{
					index: index_cam2,
					similitude: this.c_camera_list[index_cam].similitudes[index_cam2]
				}
				this.c_camera_list[index_cam].similitudes_indices_ordered.push(curr_sim)
			}
			this.c_camera_list[index_cam].similitudes_indices_ordered.sort(compareSimilitudes)
		}
	}
	static precomputeCaptureSimilitude()
	{
		let counter =0
		console.log("INFO: Precomputing Similitudes....")
		for(let index_cam=0; index_cam < this.c_camera_list.length; ++index_cam)
		{	
			this.c_camera_list[index_cam].similitudes = []
			for(let index_cam2=0; index_cam2 < this.c_camera_list.length; ++index_cam2)
			{
				console.log("INFO: ("+counter+"/"+this.c_camera_list.length*this.c_camera_list.length+") Computing similitudes for cams: "+this.c_camera_list[index_cam].name+" "+this.c_camera_list[index_cam2].name)
				this.c_camera_list[index_cam].similitudes.push(this.computeSimilitudeForCams(this.c_camera_list[index_cam],this.c_camera_list[index_cam2]))
				counter = counter + 1
			}
			//var completation = Math.floor((index_cam/this.c_camera_list.length)*50+50)

			//document.getElementById("loadingText").innerHTML = "Precomputed rays not found, precomputing again: "+completation.toString() +"%";
		}
		this.computeSimilitudesIndicesOrdered()
		console.log("INFO: Precomputing Similitudes: DONE")
	}

	static loadPrecomputedFile(data)
	{

		console.log("INFO: Loading Precomputed File...")
		const data_cameras = data.split('\n');
		if(data_cameras.length != this.c_camera_list.length)
		{
			console.log("INFO: Precomputed File outdated, need to recompute")
			this.c_capture_rays_need_recomputation = true
		}
		else
		{
			for(let index_cam=0; index_cam < data_cameras.length; ++index_cam)
			{
				this.c_camera_list[index_cam].rays = []
				const data_camera = data_cameras[index_cam].split(' ')
				while(data_camera[0] == "")
					data_camera.shift()
				const num_rays = data_camera[0]

				for(let ray = 0; ray < num_rays; ++ray)
				{
					const x = data_camera[ray*3+1]
					const y = data_camera[ray*3+1+1]
					const z = data_camera[ray*3+1+2]
					const position_ray = new THREE.Vector3(x,y,z);
					this.c_camera_list[index_cam].rays.push(position_ray);
				}
				this.c_camera_list[index_cam].similitudes = []
				for(let simil_cam_index = 0; simil_cam_index <this.c_camera_list.length; ++simil_cam_index)
				{
					const simil = data_camera[num_rays*3+1+simil_cam_index]
					this.c_camera_list[index_cam].similitudes.push(simil)
				}
			}
			this.computeSimilitudesIndicesOrdered(this.c_camera_list)
			this.c_capture_rays_need_recomputation = false
		}
		this.c_precomputed_file_loaded = true
		console.log("INFO: Loading Precomputed File: DONE")

			
	}
	static savePrecomputedFile()
	{
		console.log("INFO: Saving Precomputed File...")
		const parts = []
		for(let index_cam=0; index_cam < this.c_camera_list.length; ++index_cam)
		{	

			parts.push(this.c_camera_list[index_cam].rays.length);

			for(let index_ray=0; index_ray < this.c_camera_list[index_cam].rays.length; ++index_ray)
			{
				const raypos = this.c_camera_list[index_cam].rays[index_ray]
				parts.push(" " + raypos.x + " " + raypos.y + " " + raypos.z);
			}
			for(let index_sim=0; index_sim < this.c_camera_list[index_cam].similitudes.length; ++index_sim)
			{
				const sim = this.c_camera_list[index_cam].similitudes[index_sim]
				parts.push(" " + sim);
			}
			if(index_cam < this.c_camera_list.length -1)
				parts.push("\n");
		}
		const blob = new Blob(parts);
		saveAs(blob, 'precomputedCameraData.txt')
		console.log("INFO: Saving Precomputed File: DONE")
	}

	static saveQuestionarieData(times, distances, imageNames)
	{
		console.log("INFO: Saving Questionarie File...")
		const parts = []
		parts.push("TIMES:\n");
		for(let i = 0; i < times.length; ++i)
		{
			parts.push(times[i]+" ");
		}
		parts.push("\nDISTANCES:\n");
		for(let i = 0; i < times.length; ++i)
		{
			parts.push(distances[i]+" ");
		}
		parts.push("\nLAST IMAGES SELECTED:\n");
		for(let i = 0; i < times.length; ++i)
		{
			parts.push(imageNames[i]+", ");
		}
		const blob = new Blob(parts);
		const date = Date.now();
		saveAs(blob, 'questionarieData_'+date+'_.txt')
		console.log("INFO: Saving Questionarie File: DONE")
	}
	static precomputeRays(rays_x, rays_y, i)
	{
		console.log("INFO: precomputing rays...")

		this.c_camera_list[i].camera.updateProjectionMatrix()
		this.c_camera_list[i].rays = []
		for(let x = 0; x <= 1; x +=(1/(rays_x-1)))
		{
			for(let y = 0; y <= 1; y +=(1/(rays_y-1)))
			{
				const NDC_position = new THREE.Vector2(x*2-1,y*2-1); 
				const point = getWorldIntersectFromNDCxy(this.c_camera_list[i].camera, NDC_position, this.c_sceneModels);
				if(point !=null)
					this.c_camera_list[i].rays.push(point);
			}
		}
		const completation = Math.floor((i/this.c_camera_list.length)*90)

		document.getElementById("loadingText").innerHTML = "Precomputing rays: "+completation.toString() +"%";

		console.log("      finished precomputing capture positions for cam: "+i+" , rays found: "+this.c_camera_list[i].rays.length)
	
		
		console.log("INFO: finished precomputing rays")
		
	}

	static precomputeCaptureInfo(rays_x, rays_y, iteration)
	{
		this.precomputeRays(rays_x, rays_y, this.c_count_precomputation_iterations);
		this.c_count_precomputation_iterations = this.c_count_precomputation_iterations +1
		if(this.c_count_precomputation_iterations == this.getCameraList().length)
		{
			this.c_capture_rays_need_recomputation = false
			this.precomputeCaptureSimilitude();
			this.savePrecomputedFile()
			this.c_precomputation_done = true
			this.c_count_precomputation_iterations = 0
		}
	}
}

export { DataLoader };