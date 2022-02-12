import * as THREE from '../../build/three.module.js';

export class UIElement extends THREE.Group{
	constructor(name, doParentEvents) {
		super()
		this.name = name
		//this.type = ObjectTypes.UI_ELEMENT
		this.ui_enabled = true;
		this.ui_childrenHovering = false
		this.ui_doParentEvents = doParentEvents
		this.ui_clicking = false
		this.ui_hovering = false
		this.ui_hoveredThisFrame = false
		this.ui_dragging = false
		this.ui_isVisible = true

		this.hasClickFunctions = true
		this.isUIelem = true

	}

	setVisible(value)
	{
		this.ui_isVisible = value
		this.visible = value
	}
	
	isVisible()
	{
		if(!this.ui_isVisible)
			return false
		else if(this.parent && this.parent.isUIelem)
			return this.parent.isVisible()
		else
			return true
	}

	onStartClick(args = null)
	{
		console.log("start click")
		this.ui_clicking = true
		if(this.ui_doParentEvents && this.ui_enabled)
			this.parent.onStartClick()
	}
	onEndClick(args = null)
	{
		console.log("end click")
		this.ui_clicking = false
		if(this.ui_doParentEvents && this.ui_enabled)
			this.parent.onEndClick()
	}

	onStartDrag()
	{
		if(this.ui_doParentEvents && this.ui_enabled)
			this.parent.onStartDrag()
	}
	onEndDrag()
	{
		if(this.ui_doParentEvents)
			this.parent.onEndDrag()
	}
	onUpdateDrag(from, direction)
	{
		if(this.ui_doParentEvents && this.ui_enabled)
			this.parent.onUpdateDrag(from, direction)
	}


	onCancelClick()
	{
		console.log("cancel click")
		this.ui_clicking = false
		if(this.ui_doParentEvents && this.ui_enabled)
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
			if(this.children[i].isUIelem)
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
	setChildHovering()
	{
		this.ui_childrenHovering = true
	}
	onStartHovering()
	{
		this.ui_hovering = true
	}
	onEndHovering()
	{
		this.ui_hovering = false
	}

	onHover()
	{
		if(!this.ui_hovering)
			this.onStartHovering()
		this.ui_hoveredThisFrame = true
		if(this.ui_doParentEvents)
			this.parent.setChildHovering()
	}
	update(dt)
	{
		
		for(let i=0; i < this.children.length; ++i)
		{
			if(this.children[i].isUIelem)
				this.children[i].update(dt)
		}
		if(!this.ui_hoveredThisFrame && !this.ui_childrenHovering && this.ui_hovering)
			this.onEndHovering()
		
		this.ui_childrenHovering = false
		this.ui_hoveredThisFrame = false
	}
}