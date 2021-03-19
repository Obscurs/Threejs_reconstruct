function vertexShader() {
  return `
    varying vec2 vUv; 
    varying vec3 capturePos;
    varying vec4 modelViewPosition; 
    varying vec3 vecNormal;
    uniform mat4 modelViewMatrixCapture;
    uniform mat4 projectionMatrixCapture;

    void main() {
    	vUv = uv;
    	capturePos = (projectionMatrixCapture * modelViewMatrixCapture * modelMatrix* vec4(position,1.0)).xyz;
    	//capturePos =   (projectionMatrixCapture *  modelViewMatrix * vec4(position,1.0)).xyz;
      //vUv = position; 
      //vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      //vecNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz; //????????
      //gl_Position = projectionMatrix * modelViewPosition; 
      gl_Position =   projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0);
      
      //gl_Position = capturePos;
    }
  `
}

function fragmentShader() {
  return `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      uniform sampler2D texture1;
      
      varying vec2 vUv;
      varying vec3 capturePos;
      void main() {
        //gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
        if(capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > 0.0 && capturePos.y < 1.0 && capturePos.z > -1.0 && capturePos.z < 1.0)
        //if(capturePos.x > -1.0 && capturePos.x < 1.0 && capturePos.y > -1.0 && capturePos.y < 1.0 && capturePos.z > 0.0 && capturePos.z < 1.0)
        {
        	gl_FragColor = vec4(capturePos.x,capturePos.y,capturePos.z,1.0);
        	//gl_FragColor = vec4(mix(vec3(1.0,0.0,0.0), texture2D(texture1, vUv).xyz, 0.5), 1.0);
        }
        else
        {
			//gl_FragColor = texture2D(texture1, vUv); 
			discard;
        }
         
      }
  `
}