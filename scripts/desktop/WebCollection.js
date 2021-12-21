import * as THREE from '../../build/three.module.js';
import {UIElement} from './../ui/UIElement.js';
import { DataLoader } from './../DataLoader.js';
import { ThumbnailSprite } from './../ThumbnailSprite.js';
export class WebCollection extends UIElement{
	constructor(name, doParentEvents) {
		super(name, doParentEvents)
		this.position.z = -4
		
		this.c_scene_collections = new THREE.Scene();
		this.c_scene_collections.add(this);
		this.c_scene_collections.background = null;

		this.c_current_capture_under_mouse = null;
		this.c_current_capture_selected = null;
		this.c_camera_collections = null;
	}

	onStartClick(args = null)
	{
		
		/*console.log("start click")
		this.ui_clicking = true
		this.parent.onStartClick()*/
	}
	onEndClick(args = null)
	{
		/*console.log("end click")
		this.ui_clicking = false
		this.parent.onEndClick()*/
	}
	onStartDrag()
	{
		//this.parent.onStartDrag()
	}
	onDrag(dt)
	{
		//this.parent.onDrag(dt)
	}
	onEndDrag()
	{
		//this.ui_clicking = false
		//this.parent.onEndDrag()
	}
	onUpdateDrag(from, direction)
	{
		/*this.parent.onUpdateDrag(from, direction)*/
	}
	onCancelClick()
	{
		/*console.log("cancel click")
		this.ui_clicking = false
		this.parent.onCancelClick()*/
	}

	setEnabled(enabled)
	{
		/*this.ui_enabled = enabled*/
	}
	/*dispose()
	{

		
	}*/

	/*setPosition(x, y, z)
	{
		this.position.x = x
		this.position.y = y
		this.position.z = z
	}
	setScale(x, y, z)
	{
		this.scale.x = x
		this.scale.y = y
		this.scale.z = z
	}*/
	restart()
	{
		this.c_current_capture_selected = -1
		this.c_current_capture_under_mouse = -1;
		this.resetCamera()
		this.dispose()
	}
	setChildHovering(dt)
	{
		/*this.ui_childrenHovering = true*/
	}
	onStartHovering(dt)
	{
		/*this.ui_hovering = true*/
	}
	onEndHovering(dt)
	{
		/*this.ui_hovering = false*/
	}
	detectHovering(dt)
	{
		/*return false*/
	}
	onHover(dt)
	{
		/*this.parent.setChildHovering(dt)*/
	}
	update(dt, candidates)
	{
		this.updateCollectionsAnims(dt, candidates)
	}


	onWindowResize()
	{
		this.c_camera_collections.left = window.innerWidth / - 2;
		this.c_camera_collections.right =window.innerWidth / 2;
		this.c_camera_collections.top = window.innerHeight / 2;
		this.c_camera_collections.bottom = window.innerHeight / - 2;
		this.c_camera_collections.updateProjectionMatrix();
		this.showCollections(false, Scorer.getCurrentCandidates())
	}

	getCurrentCaptureInViewIndex()
	{
		return this.c_current_capture_selected
	}

	setCollectionOpacity(opacity)
	{
		const arrayLength = this.children.length;
		for (let i = 0; i < arrayLength; i++) {
			this.children[i].setUniformOpacity(opacity);
		}
	}
	clearCollectionSprites()
	{
		while(this.children.length > 0){ 
			this.children[0].dispose();
		    this.remove(this.children[0]); 
		}
	}
	resetCaptureIndexUnderMouse()
	{
		this.c_current_capture_under_mouse = -1;
	}
	getCaptureUnderMouse(event)
	{
		const mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
	                            -( event.clientY / window.innerHeight ) * 2 + 1,  
	                            0.5 );     
	    const raycaster =  new THREE.Raycaster();                                        
		raycaster.setFromCamera( mouse3D, this.c_camera_collections );
	    const intersects = raycaster.intersectObjects( this.children );


	    if ( intersects.length > 0 ) 
	    {
	    	let curr_index = intersects[ 0 ].object.imageIndex
	    	let curr_depth = intersects[ 0 ].object.renderOrder
	    	for(let i=0; i <intersects.length; i++)
	    	{
	    		if(intersects[ i ].object.renderOrder > curr_depth)
	    		{
	    			curr_depth = intersects[ i ].object.renderOrder;
	    			curr_index = intersects[ i ].object.imageIndex;

	    		}
	    	}
	    	return curr_index
	    }
	    else
	    	return -1
	}
	resetCamera()
	{
		this.c_camera_collections = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0, 10);
	}
	updateSelectedSprite(index)
	{
		if(index== -1)
			console.log("HHH")
		this.c_current_capture_selected = index
		for(let i = 0; i < this.children.length; ++i)
		{
			if(this.children[i].getIndex() == index && index >=0)
				this.children[i].setUniformSelected(true)
			else
				this.children[i].setUniformSelected(false)
		}
	}


	showCollectionSprite(_min_pos, _max_pos, index_capture, order, useNewSprites = false, isShifting = false, opacity = 1)
	{
		const camera_list = DataLoader.getCameraList()
		

		const min_pos = new THREE.Vector3(_min_pos.x,_min_pos.y,0);
		const max_pos = new THREE.Vector3(_max_pos.x,_max_pos.y,0);
		const offset_x = -window.innerWidth/2;
		const offset_y = window.innerHeight/2;
		
		
		const scale = max_pos.x -min_pos.x



		if(useNewSprites)
		{
			const pathSprite = 'models/'+DataLoader.getCurrentModel().path+'/thumbnails/'+camera_list[index_capture].name
			const newsprite = new ThumbnailSprite(pathSprite, index_capture, camera_list[index_capture].width,camera_list[index_capture].height)
			this.add(newsprite)
			camera_list[index_capture].spriteProperties.indexInGroup = this.children.length -1
		}
		const sprite = this.children[camera_list[index_capture].spriteProperties.indexInGroup]


		const _x = min_pos.x+offset_x
		const _y = min_pos.y+offset_y
		const spritepos = new THREE.Vector3(_x,_y,0);

		sprite.scale.set(scale, scale, 1);
		sprite.position.set(spritepos.x+scale/2,spritepos.y-scale/2, spritepos.z);

		sprite.renderOrder = order;
		
		
		//console.log(camera_list[index_capture].spriteProperties)
		
		sprite.setUniformMinSel(camera_list[index_capture].spriteProperties.minSel)
		sprite.setUniformMaxSel(camera_list[index_capture].spriteProperties.maxSel)

		sprite.setUniformSelected(this.c_current_capture_selected == sprite.name)
		sprite.setUniformOpacity(opacity);
		


	}

	showCollection(candidates, min_pos, max_pos, index_collection, useNewSprites = false, isShifting = false, offsetAnim = 0)
	{
		let animOffset = 0;
		if(offsetAnim > 0)
		{
			animOffset = 1-offsetAnim;
		} else if(offsetAnim < 0)
		{
			animOffset = -(offsetAnim+1);
		}
		let offset_per_image = 10-2
		if(offset_per_image < 2)
			offset_per_image = 2
		
		offset_per_image = 2
		const half_offset_per_image = offset_per_image/2
		const currentOffset = new THREE.Vector2(half_offset_per_image+animOffset*half_offset_per_image,half_offset_per_image+animOffset*half_offset_per_image)
		const remaining_width = max_pos.x-min_pos.x-currentOffset.x;
		const remaining_height = max_pos.y-min_pos.y-currentOffset.y;

		const num_elems = candidates[index_collection].elems.length
		const width_image = remaining_width-num_elems*offset_per_image
		const height_image = remaining_height-num_elems*offset_per_image
		for(let i = num_elems-1; i >= 0; i--)
		{
			const min = new THREE.Vector3( min_pos.x+currentOffset.x, min_pos.y-currentOffset.y,-1 );
			const max = new THREE.Vector3( min_pos.x+currentOffset.x+width_image+animOffset*half_offset_per_image ,min_pos.y+currentOffset.y+height_image+animOffset*half_offset_per_image,-1);
			currentOffset.x = currentOffset.x + offset_per_image;
			currentOffset.y = currentOffset.y + offset_per_image;
			let opacity = 1
			if(animOffset > 0 && i == 0)
			{
				opacity = 1 - animOffset
			} else if(animOffset < 0 && i == num_elems-1)
			{
				opacity = 1 - animOffset*(-1)
			}
				
			this.showCollectionSprite(min, max, candidates[index_collection].elems[i],num_elems-i,useNewSprites, isShifting, opacity)
		}
		
	}
	showCollections(useNewSprites, candidates)
	{
		let remaining_width = window.innerWidth-200;
		let current_min_x = 0;
		const collection_height = 500
		
		if(useNewSprites)
			this.clearCollectionSprites()


		for(let i = 0; i < candidates.length; i++)
		{
			const collection_width = remaining_width/4
			const min = new THREE.Vector2( current_min_x, 0 );
			const max = new THREE.Vector2(current_min_x+ collection_width,collection_height);
			candidates[i].min = min;
			candidates[i].max = max;
			this.showCollection(candidates, min,max,i, useNewSprites);
			remaining_width = remaining_width - collection_width;
			current_min_x = current_min_x + collection_width;
		}
	}
	render(renderer, view_index)
	{
		renderer.clearDepth();
		const left = Math.floor( window.innerWidth * m_views[view_index].left );
		const bottom = Math.floor( window.innerHeight * m_views[view_index].bottom );
		const width = Math.floor( window.innerWidth * m_views[view_index].width );
		const height = Math.floor( window.innerHeight * m_views[view_index].height );

		renderer.setViewport( left, bottom, width, height );
		renderer.setScissor( left, bottom, width, height );
		renderer.render( this.c_scene_collections, this.c_camera_collections );
	}

	shiftCollectionSprites(collection,index, direction)
	{
		if(direction > 0)
		{
			const elem = collection.elems.shift()
			collection.elems.push(elem)
			//console.log("shifted1")
		} else
		{
			const elem = collection.elems.pop();
			collection.elems.unshift(elem);
			//console.log("shifted2")
		}
		
	}
	updateCollectionsAnims(delta, candidates)
	{
		for(let i=0; i < candidates.length; i++)
		{
			if(candidates[i].animating !=0)
			{
				const value_shift = candidates[i].animating
				if(candidates[i].animating >0)
				{
					candidates[i].animating = candidates[i].animating - delta*2;
					if(candidates[i].animating < 0)
						candidates[i].animating = 0
				}
				else 
				{
					candidates[i].animating = candidates[i].animating + delta*2;
					if(candidates[i].animating > 0)
						candidates[i].animating = 0
				}
				if(candidates[i].animating == 0)
					this.shiftCollectionSprites(candidates[i],i, value_shift)
				const offset = candidates[i].animating
				this.showCollection(candidates, candidates[i].min, candidates[i].max,i, false, true, offset)
			}
		}
		//m_application_state.
	}
}