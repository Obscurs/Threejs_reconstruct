uniform sampler2D texture1;
uniform sampler2D texture2;
uniform bool showRedArea;
uniform bool projectCapture;
uniform bool squareVR;
uniform vec2 vUv_VR_square_min;
uniform vec2 vUv_VR_square_max;
varying vec2 vUv;
varying vec3 capturePos;
void main() {
  //gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
  //if(capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > 0.0 && capturePos.y < 1.0 && capturePos.z > -1.0 && capturePos.z < 1.0)
  //if(squareVR && capturePos.x > vUv_VR_square_min.x && capturePos.x < vUv_VR_square_max.x && capturePos.y > vUv_VR_square_min.x && capturePos.y < vUv_VR_square_max.y)
  if(squareVR )
  {
  		if(capturePos.x > vUv_VR_square_min.x && capturePos.y > vUv_VR_square_min.y && capturePos.x < vUv_VR_square_max.x && capturePos.y < vUv_VR_square_max.y)
  		{
  			gl_FragColor = vec4(mix(vec3(0.0,0.0,1.0), texture2D(texture1, vUv).xyz, 0.6), 1.0);
  		}
  		else
  		{
  			gl_FragColor = texture2D(texture1, vUv); 
  		}
  		//if(capturePos.x < -0.95 || capturePos.x > 0.95 || capturePos.y < -0.95 || capturePos.y > 0.95)
  		
  		//else
  		//	gl_FragColor = texture2D(texture1, vUv); 
  } 
  else if(projectCapture)
  {
  	if(capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > -1.0 && capturePos.y < 1.0 && capturePos.z > -1.0 && capturePos.z < 1.0)
  	{
  		vec2 texCoords = vec2((capturePos.x+1.0f)/2.0f,(capturePos.y+1.0f)/2.0f);
  		gl_FragColor = texture2D(texture2, texCoords);
  	}
  	else
  	{
  		gl_FragColor = texture2D(texture1, vUv); 
  	}
  }
  else if(showRedArea && capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > -1.0 && capturePos.y < 1.0 && capturePos.z > -1.0 && capturePos.z < 1.0)
  {

  	if(capturePos.x < -0.95 || capturePos.x > 0.95 || capturePos.y < -0.95 || capturePos.y > 0.95)
  		gl_FragColor = vec4(mix(vec3(1.0,0.0,0.0), texture2D(texture1, vUv).xyz, 0.6), 1.0);
  	else
  		gl_FragColor = vec4(mix(vec3(1.0,0.0,0.0), texture2D(texture1, vUv).xyz, 0.8), 1.0);
  }
  else 
  {
  		gl_FragColor = texture2D(texture1, vUv); 
  }

  
   
}