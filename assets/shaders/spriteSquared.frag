uniform vec2 minSel; 
uniform vec2 maxSel; 
uniform sampler2D texture1;
uniform float opacity;
uniform bool selected;

varying vec2 vUv;
varying vec2 squaredUV;
float borderSel = 0.007;
void main() {

	if(vUv.x > 0.98 || vUv.x < 0.02 || vUv.y > 0.98 || vUv.y < 0.02)
	{
		if(selected)
			gl_FragColor = vec4(0.0,1.0,0.0,opacity);
		else
			gl_FragColor = vec4(0.0,0.0,0.0,opacity);
	}
	else
	{
		vec4 color;
		if(minSel != maxSel && (
			(squaredUV.x > minSel.x && squaredUV.x < minSel.x+borderSel && squaredUV.y > minSel.y && squaredUV.y < maxSel.y+borderSel) ||
			(squaredUV.y > minSel.y && squaredUV.y < minSel.y+borderSel && squaredUV.x > minSel.x && squaredUV.x < maxSel.x+borderSel) ||
			(squaredUV.x > maxSel.x && squaredUV.x < maxSel.x+borderSel && squaredUV.y > minSel.y && squaredUV.y < maxSel.y+borderSel) ||
			(squaredUV.y > maxSel.y && squaredUV.y < maxSel.y+borderSel && squaredUV.x > minSel.x && squaredUV.x < maxSel.x+borderSel)
			))
		{
			color = vec4(1.0,0.0,0.0,opacity);
		}
		else
		{
			color = texture2D(texture1, squaredUV); 
			
		}
		color.a = opacity;
		gl_FragColor = color;
		
	}
}