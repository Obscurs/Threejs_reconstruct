uniform vec2 minSel; 
uniform vec2 maxSel; 
uniform sampler2D texture1;
uniform float opacity;
uniform bool selected;

varying vec2 vUv;
float borderSel = 0.015;
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
			(vUv.x > minSel.x && vUv.x < minSel.x+borderSel && vUv.y > minSel.y && vUv.y < maxSel.y+borderSel) ||
			(vUv.y > minSel.y && vUv.y < minSel.y+borderSel && vUv.x > minSel.x && vUv.x < maxSel.x+borderSel) ||
			(vUv.x > maxSel.x && vUv.x < maxSel.x+borderSel && vUv.y > minSel.y && vUv.y < maxSel.y+borderSel) ||
			(vUv.y > maxSel.y && vUv.y < maxSel.y+borderSel && vUv.x > minSel.x && vUv.x < maxSel.x+borderSel)
			))
		{
			color = vec4(1.0,0.0,0.0,opacity);
		}
		else
		{
			color = texture2D(texture1, vUv); 
			
		}
		color.a = opacity;
		gl_FragColor = color;
		
	}
}