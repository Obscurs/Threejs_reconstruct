varying vec2 vUv;
varying vec2 squaredUV;
uniform vec2 offsetTexel;
uniform vec2 factorTexel;
uniform vec2 minSel; 
uniform vec2 maxSel; 

void main() {
	vec2 finalOffsetTexel = offsetTexel;
	vec2 centerSelection = vec2(minSel.x+(maxSel.x-minSel.x)/2.0,minSel.y+(maxSel.y-minSel.y)/2.0);
	if(offsetTexel.x > 0.0)
	{
		if(centerSelection.x > 0.5 + offsetTexel.x/2.0)
			finalOffsetTexel.x = offsetTexel.x*2.0;
		else if(centerSelection.x < 0.5 - offsetTexel.x/2.0)
			finalOffsetTexel.x = 0.0;
	}
	else if(offsetTexel.y > 0.0)
	{
		if(centerSelection.y > 0.5 + offsetTexel.y/2.0)
			finalOffsetTexel.y = offsetTexel.y*2.0;
		else if(centerSelection.y < 0.5 - offsetTexel.y/2.0)
			finalOffsetTexel.y = 0.0;
	}
	squaredUV = vec2(uv.x*factorTexel.x+finalOffsetTexel.x, uv.y*factorTexel.y+finalOffsetTexel.y);
	vUv = uv;
  gl_Position =   projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0);

}