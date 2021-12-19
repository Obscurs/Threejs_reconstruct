import * as THREE from '../build/three.module.js';
import { DataLoader } from './DataLoader.js';

export class ThumbnailSprite extends THREE.Mesh {
	constructor(path, name, width, height) {	
		const texture = new THREE.TextureLoader().load(path);

		
		let offsetTexel_x = 0.0
		let offsetTexel_y = 0.0
		let factorTexel_x = 1.0
		let factorTexel_y = 1.0
		if(height > width)
		{
			factorTexel_y = width/height
			offsetTexel_y = (1.0-factorTexel_y)/2.0
		}
		else
		{
			factorTexel_x = height/width
			offsetTexel_x = (1.0-factorTexel_x)/2.0
		}

		const uniformsSprite = {
	        minSel: {type: 'vec2', value: new THREE.Vector2(0,0)},
	        maxSel: {type: 'vec2', value: new THREE.Vector2(0,0)},
	        //texture1: { type: "t", value: THREE.ImageUtils.loadTexture( "./models/textures/doma-interior_texture16k.jpg" ) },
	        texture1: { type: "t", value: texture },
	        opacity: {type: 'f', value: null },
	        selected: {type: 'bool', value: false},
	        offsetTexel: {type: 'vec2', value: new THREE.Vector2(offsetTexel_x,offsetTexel_y)},
	        factorTexel: {type: 'vec2', value: new THREE.Vector2(factorTexel_x,factorTexel_y)},
	    }


		const material_sprite = new THREE.ShaderMaterial( { 
			uniforms: uniformsSprite,
		    fragmentShader:  DataLoader.getShaders().spriteSquaredFrag,
		    vertexShader:  DataLoader.getShaders().spriteSquaredVert,
		    blending: THREE.NormalBlending,
	        depthTest: false,
	        transparent: true
		} );
		const geometry_sprite = new THREE.PlaneGeometry(1,1);
		super(geometry_sprite, material_sprite)
		this.name = name;
		this.texture = texture

		this.hasClickFunctions = true
	}
	getName()
	{
		return this.name
	}

	onHover()
	{
		this.parent.onHover()
	}
	onStartClick()
	{
		this.parent.onStartClick(this)
	}
	onEndClick()
	{
		this.parent.onEndClick(this)
	}

	setUniformSelected(value)
	{
		this.material.uniforms.selected.value = value
	}
	setUniformOpacity(value)
	{
		this.material.uniforms.opacity.value = value
	}
	setUniformMinSel(value)
	{
		this.material.uniforms.minSel.value = value
	}
	setUniformMaxSel(value)
	{
		this.material.uniforms.maxSel.value = value
	}
	dispose()
	{
		this.texture.dispose();
		this.geometry.dispose();
		this.material.dispose();
	}
}
