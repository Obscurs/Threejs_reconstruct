import * as THREE from '../build/three.module.js';
import { DataLoader } from './DataLoader.js';
export class CaptureSelected {
	constructor(scene) {
		this.c_camera_capture = null;
		this.c_cameraHelper = null;
		this.c_textureChanged = false;
		this.c_plane_image_secondary = null;
		this.c_render_target_secondary = null;
		this.c_loader_low = null
		this.c_loader_high = null
		this.c_texture = null
		this.c_plane_render_target = null;
		this.c_group_widget = new THREE.Group()
		this.c_high_loaded = false

		this.init(scene)

	}
	dispose(scene)
	{
		if(this.c_camera_helper)
		{
			scene.remove(this.c_camera_helper)
		}
		if(this.c_texture)
		{
			this.c_texture.dispose()
		}
		if(this.c_plane_render_target)
		{
			this.c_plane_render_target.geometry.dispose();
			this.c_plane_render_target.material.dispose();
		}
		if(this.c_plane_image_secondary)
		{
			this.c_plane_image_secondary.geometry.dispose();
			this.c_plane_image_secondary.material.dispose();
		}

	}
	getCameraCapture()
	{
		return this.c_camera_capture
	}
	init(scene)
	{
		this.c_render_target_secondary = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
		this.c_camera_capture = new THREE.PerspectiveCamera( 50.5, 4000 / 2950, 0.1, 100 );
		this.c_camera_capture.position.set( 0,0,0 );
		this.c_cameraHelper = new THREE.CameraHelper(this.c_camera_capture);
		this.c_cameraHelper.name = "CaptureCameraHelper"
		let existing = scene.getObjectByName("CaptureCameraHelper");
		if(existing)
			scene.remove( existing );
		scene.add(this.c_cameraHelper);
		console.log("this was inited")

		this.c_loader_low = new THREE.TextureLoader();
		this.c_loader_high = new THREE.TextureLoader();
		this.setWidgetVisible(false)
	}
	setCapture(camera, scene)
	{
		const sceneModels = DataLoader.getSceneModels() 

		const directionCapture = new THREE.Vector3();
		camera.camera.getWorldDirection( directionCapture );
		const positionCapture = new THREE.Vector3();
		positionCapture.copy(camera.camera.position);

		this.c_camera_capture.copy(camera.camera,true)

		this.c_camera_capture.aspect = camera.width / camera.height;
		this.c_camera_capture.updateMatrixWorld();
		this.c_camera_capture.updateProjectionMatrix();
		
		const viewMat = new THREE.Matrix4();
		const projMat = new THREE.Matrix4();


		viewMat.copy(this.c_camera_capture.matrixWorldInverse);
		projMat.copy(this.c_camera_capture.projectionMatrix)
		sceneModels[0].material.uniforms.viewMatrixCapture.value = viewMat;
		sceneModels[0].material.uniforms.projectionMatrixCapture.value = projMat;
		this.c_camera_capture.fov = camera.camera.fov+30

		this.c_textureChanged = true
		this.c_high_loaded = false
		if(this.c_plane_render_target)
			this.c_plane_render_target.c_high_loaded = false
		this.loadLowTexture(camera)
		this.loadHighTexture(camera)


		const frustumHeightWorld_photo = 2 * this.c_camera_capture.near * Math.tan(THREE.Math.degToRad( camera.camera.fov * 0.5 ));
		const frustumHeightWorld_view = 2 * this.c_camera_capture.near * Math.tan(THREE.Math.degToRad( this.c_camera_capture.fov * 0.5 ));
		const scaleFact = frustumHeightWorld_view/frustumHeightWorld_photo;
		this.c_camera_capture.render_target_height = camera.height*scaleFact
		this.c_camera_capture.render_target_width = this.c_camera_capture.render_target_height * this.c_camera_capture.aspect

		this.c_render_target_secondary.setSize(this.c_camera_capture.render_target_width, this.c_camera_capture.render_target_height)


		let uniforms = {
			  viewMatrixCapture: {type: 'mat4', value: viewMat},
			  projectionMatrixCapture: {type: 'mat4', value: projMat},
		      showTexture: {type: 'bool', value: true},
		      texture1: { type: "t", value: "" }
		    }
		const material_plane = new THREE.ShaderMaterial( { 
				uniforms: uniforms,
				fragmentShader: DataLoader.c_shaders.captureImageFrag,
				vertexShader: DataLoader.c_shaders.sceneVert,
			    blending: THREE.NormalBlending,
	            //depthTest: false,
	            transparent: true
			} );


		const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.0001, 1.0001), material_plane);
		plane.name ="plane_photo"
		plane.translateZ( -(this.c_camera_capture.near+0.0001) );

		const existing = scene.getObjectByName("plane_photo");
		if(existing)
		{
			scene.remove( existing );
			existing.geometry.dispose();
			existing.material.dispose();
		}
		plane.applyMatrix(this.c_camera_capture.matrix)
		this.c_plane_image_secondary = plane;

		scene.add(this.c_plane_image_secondary)



		const material_plane_rt = new THREE.ShaderMaterial( { 
				uniforms: {tDiffuse: {value: this.c_render_target_secondary.texture}},
			    fragmentShader: DataLoader.c_shaders.screenFrag,
			    vertexShader: DataLoader.c_shaders.spriteVert,
			    //depthTest: false,
			    depthWrite: false,
			    transparent: true
			} );

		const plane_rt = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material_plane_rt);
		plane_rt.name ="plane_rt"
		plane_rt.position.z = -1

		if(this.c_plane_render_target)
		{
			this.c_plane_render_target.geometry.dispose();
			this.c_plane_render_target.material.dispose();
		}

		this.c_plane_render_target = plane_rt
		this.c_plane_render_target.renderOrder = 0
		/*if(this.c_renderer.xr.isPresenting)
		{
			if(this.c_plane_render_target != null)
				this.c_plane_render_target.renderOrder = 100
			plane_rt.position.x = + 0.75;
			plane_rt.rotation.y = -Math.PI / 3;
			
		}
		else
		{*/
			
		//}
		

		

	}
	loadLowTexture(camera)
	{
		var self = this

		var tex_name = camera.name
		this.c_loader_low.load(
			"models/"+DataLoader.getCurrentModel().path+"/thumbnails/"+camera.name,
			function ( texture ) {

				if(self.c_camera_capture.name == tex_name && !self.c_high_loaded) {self.updateTexture(texture)}
			},
			function ( err ) {
				console.error( 'Error trying to load texture (high res) for capture.' );
			}
		);
	}
	loadHighTexture(camera)
	{
		var self = this
		var tex_name = camera.name

		this.c_loader_high.load(
			"models/"+DataLoader.getCurrentModel().path+"/captures/"+camera.name,
			function ( texture ) {
				self.c_high_loaded = true
				self.c_plane_render_target.c_high_loaded = true
				if(self.c_camera_capture.name == tex_name) {self.updateTexture(texture)}
			},
			function ( err ) {
				console.error( 'Error trying to load texture (high res) for capture.' );
			}
		);
	}

	getCaptureResult()
	{
		return this.c_plane_render_target;
	}
	updateTexture(texture)
	{
		const sceneModels = DataLoader.getSceneModels() 
		if(this.c_texture)
		{
			this.c_texture.dispose()
		}
		this.c_texture = texture
		if(sceneModels.length >0)
			sceneModels[0].material.uniforms.texture2.value = this.c_texture;
		if(this.c_plane_image_secondary != null)
			this.c_plane_image_secondary.material.uniforms.texture1.value = this.c_texture;
		this.c_textureChanged = true
		console.log("INFO: Capture Tex updated")

	}

	render(renderer, scene, show_photo)
	{
		this.c_cameraHelper.update();
		if(this.c_plane_image_secondary != null)
		{
			this.c_plane_image_secondary.material.uniforms.showTexture.value = show_photo;

			const frustumHeight = 2 * this.c_camera_capture.near * Math.tan(THREE.Math.degToRad( this.c_camera_capture.fov * 0.5 ));
			const frustumWidth = frustumHeight * this.c_camera_capture.aspect;
			this.c_plane_image_secondary.scale.x = frustumWidth;
			this.c_plane_image_secondary.scale.y = frustumHeight;

			if(this.c_textureChanged)
			{
				renderer.xr.enabled = false;
				this.c_textureChanged = false
				//this.c_change_image_in_view = this.c_change_image_in_view +1
				//var old_rt = renderer.getRenderTarget()
				renderer.setRenderTarget(this.c_render_target_secondary)
				//this.c_camera_capture.aspect = width / height;
				this.c_camera_capture.updateProjectionMatrix();
				//var aux = false

				renderer.render( scene, this.c_camera_capture );
				console.log("INFO: Draw capture to render target")
				

				renderer.setRenderTarget(null)
				renderer.xr.enabled = true;
				
			}

			this.c_plane_render_target.scale.x = window.innerHeight*this.c_camera_capture.aspect
			this.c_plane_render_target.scale.y = window.innerHeight	
		}
		
	}
	setEnabled(value)
	{
		if(this.c_plane_image_secondary)
			this.c_plane_image_secondary.material.uniforms.showTexture.value = value
	}
	setWidgetVisible(value)
	{
		this.c_cameraHelper.visible = value
	}

}