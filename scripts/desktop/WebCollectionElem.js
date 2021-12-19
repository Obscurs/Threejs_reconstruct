import * as THREE from '../../build/three.module.js';
import {UIElement} from './../ui/UIElement.js';

export class WebCollectionElem extends UIElement{
	constructor(name, doParentEvents) {
		super()
		this.ui_name = name
		//this.type = ObjectTypes.UI_ELEMENT
		this.ui_enabled = true;
		this.ui_childrenHovering = false
		this.ui_doParentEvents = doParentEvents
		this.ui_clicking = false
		this.ui_hovering = false
		this.ui_dragging = false
	}

	onStartClick()
	{
		console.log("start click")
		this.ui_clicking = true
		this.parent.onStartClick()
	}
	onEndClick()
	{
		console.log("end click")
		this.ui_clicking = false
		this.parent.onEndClick()
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
		this.parent.onUpdateDrag(from, direction)
	}
	onCancelClick()
	{
		console.log("cancel click")
		this.ui_clicking = false
		this.parent.onCancelClick()
	}

	setEnabled(enabled)
	{
		this.ui_enabled = enabled
	}
	dispose()
	{
		for(let i=0; i < this.children.length; ++i)
		{
			this.children[i].dispose()
		}
		
	}

	setPosition(x, y, z)
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
	}
	setChildHovering(dt)
	{
		this.ui_childrenHovering = true
	}
	onStartHovering(dt)
	{
		this.ui_hovering = true
	}
	onEndHovering(dt)
	{
		this.ui_hovering = false
	}
	detectHovering(dt)
	{
		return false
	}
	onHover(dt)
	{
		this.parent.setChildHovering(dt)
	}
	update(dt)
	{
		this.ui_childrenHovering = false
		for(let i=0; i < this.children.length; ++i)
		{
			this.children[i].update(dt)
		}

		let hoveringPrevFrame = this.ui_hovering
		if(!hoveringPrevFrame && (this.ui_childrenHovering || this.detectHovering(dt)))
			onStartHovering(dt)
		else if(!this.detectHovering(dt) && !this.ui_childrenHovering && hoveringPrevFrame)
			onEndHovering(dt)
		if(this.ui_hovering)
			onHover(dt)
	}
}