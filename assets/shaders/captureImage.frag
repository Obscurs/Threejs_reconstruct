uniform sampler2D texture1;
uniform bool showTexture;

varying vec2 vUv;
varying vec3 capturePos;
void main() {
  //gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
  //if(capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > 0.0 && capturePos.y < 1.0 && capturePos.z > -1.0 && capturePos.z < 1.0)
  if(showTexture && capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > -1.0 && capturePos.y < 1.0)
  {
  		vec2 texCoords = vec2((capturePos.x+1.0f)/2.0f,(capturePos.y+1.0f)/2.0f);
  		gl_FragColor = texture2D(texture1, texCoords);
  }
  else 
  {
  	discard;
		//gl_FragColor = texture2D(texture1, vUv); 
		//discard;
  }

}