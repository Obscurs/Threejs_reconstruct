uniform sampler2D texture1;
uniform sampler2D texture2;
uniform bool showRedArea;
uniform bool projectCapture;
uniform bool squareVR;
uniform bool isLoading;
uniform vec2 vUv_VR_square_min;
uniform vec2 vUv_VR_square_max;
uniform float u_time;
uniform bool isDisabled;
varying vec2 vUv;
varying vec3 capturePos;


void setFinalColor(vec4 color)
{
  if(isDisabled)
  {
    gl_FragColor = mix(color, vec4(0.0,0.0,0.0,1.0), 0.7);
  }
  else
  {
    gl_FragColor = color;
  }

}
void main() {
  //gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
  //if(capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > 0.0 && capturePos.y < 1.0 && capturePos.z > -1.0 && capturePos.z < 1.0)
  //if(squareVR && capturePos.x > vUv_VR_square_min.x && capturePos.x < vUv_VR_square_max.x && capturePos.y > vUv_VR_square_min.x && capturePos.y < vUv_VR_square_max.y)
  if(squareVR )
  {
  		if(capturePos.x > vUv_VR_square_min.x && capturePos.y > vUv_VR_square_min.y && capturePos.x < vUv_VR_square_max.x && capturePos.y < vUv_VR_square_max.y)
  		{
        setFinalColor(vec4(mix(vec3(0.0,0.0,1.0), texture2D(texture1, vUv).xyz, 0.6), 1.0));
  			
  		}
  		else
  		{
  			setFinalColor(texture2D(texture1, vUv)); 
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
      if(isLoading)
      {
        vec4 col = texture2D(texture2, texCoords);
        vec3 colWave = vec3(1.0,1.0,1.0);
          
        float x = (0.5f-texCoords.x);
        float y = (0.5f-texCoords.y);
        
        float r = -(x*x + y*y);
        float z = 1.0 + 0.5*sin((r+u_time*0.15f)/0.043);
        
        vec3 texcol = vec3(z,z,z);
        
        setFinalColor(mix(vec4(colWave*texcol,1.0),col,0.8));
      }
      else
      {
        setFinalColor(texture2D(texture2, texCoords));
      }
  	}
  	else
  	{
  		setFinalColor(texture2D(texture1, vUv)); 
  	}
  }
  else if(showRedArea && capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > -1.0 && capturePos.y < 1.0 && capturePos.z > -1.0 && capturePos.z < 1.0)
  {

  	if(capturePos.x < -0.95 || capturePos.x > 0.95 || capturePos.y < -0.95 || capturePos.y > 0.95)
  		setFinalColor(vec4(mix(vec3(1.0,0.0,0.0), texture2D(texture1, vUv).xyz, 0.6), 1.0));
  	else
  		setFinalColor(vec4(mix(vec3(1.0,0.0,0.0), texture2D(texture1, vUv).xyz, 0.8), 1.0));
  }
  else 
  {
  		setFinalColor(texture2D(texture1, vUv)); 
  }

  
   
}