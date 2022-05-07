import * as THREE from '../../build/three.module.js';
import {UIElement} from './../ui/UIElement.js';
import { CaptureSelected } from './../CaptureSelected.js';

const MAX_SCALE = 0.002
const MIN_SCALE = 0.0001
export class VRGUIZoomedPhoto extends UIElement {
	constructor() {
		super("ZOOMED IMAGE", true)

		this.c_zoomed_mesh = null
		this.scale.set(MIN_SCALE, MIN_SCALE, 1.0)
		this.c_timer_zoom = 0

	}

	setImage(image)
	{
		if(this.c_zoomed_mesh)
			this.remove(this.c_zoomed_mesh)
		this.c_zoomed_mesh = image


		if(this.c_zoomed_mesh)
		{
			//this.c_zoomed_mesh.renderOrder = 3

			this.c_zoomed_mesh.hasClickFunctions = true

			function funStartClick() { this.parent.onStartClick()}
			function funEndClick() { this.parent.onEndClick()}
			function funStartDrag() { this.parent.onStartDrag()}
			function funEndDrag() { this.parent.onEndDrag()}
			function funCancelClick() { this.parent.onCancelClick()}
			function funHover() { this.parent.onHover()}
			function funUpdateDrag(p1, p2) { this.parent.onUpdateDrag(p1,p2)}
			this.c_zoomed_mesh.onStartClick = funStartClick
			this.c_zoomed_mesh.onEndClick = funEndClick
			this.c_zoomed_mesh.onStartDrag = funStartDrag
			this.c_zoomed_mesh.onEndDrag = funEndDrag
			this.c_zoomed_mesh.onUpdateDrag = funUpdateDrag
			this.c_zoomed_mesh.onCancelClick = funCancelClick
			this.c_zoomed_mesh.onHover = funHover


			this.c_zoomed_mesh.position.z = 0


			this.add(this.c_zoomed_mesh)
		}
		
	}
	dispose()
	{
		if(this.c_zoomed_mesh)
			this.remove(this.c_zoomed_mesh)
		super.dispose()
	}
	show()
	{
		console.log("show")
		this.c_timer_zoom = -1.0
		this.scale.set(MIN_SCALE, MIN_SCALE, 1.0)
		
	}
	hide()
	{
		console.log("hide")
		if(this.c_timer_zoom == 0.0)
			this.c_timer_zoom = 1.0
	}
	update(dt)
	{
		super.update(dt)
		if(this.c_timer_zoom <0.0)
		{
			let normalized = (MAX_SCALE-MIN_SCALE)
			
			if(this.c_zoomed_mesh.c_high_loaded && this.c_timer_zoom >= -1 )
			{
				this.c_zoomed_mesh.visible = true
				this.c_timer_zoom += dt*2
			}
			else
			{
				this.c_timer_zoom += dt	
			}
			if(this.c_timer_zoom > 0)
				this.c_timer_zoom = 0.0
			let currentScale = normalized*(1.0-this.c_timer_zoom*(-1))
			this.scale.set(currentScale, currentScale, 1.0)
			
		}
		else if(this.c_timer_zoom > 0.0)
		{
			this.c_timer_zoom -= dt*3
			let normalized = (MAX_SCALE-MIN_SCALE)
			if(this.c_timer_zoom <= 0.0)
			{
				this.c_timer_zoom = 0.0
				this.c_zoomed_mesh.visible = false
			}
			let currentScale = normalized*(this.c_timer_zoom)
			this.scale.set(currentScale, currentScale, 1.0)
		}
	}
	onEndClick()
	{
		super.onEndClick()
		this.hide()
	}
	
}