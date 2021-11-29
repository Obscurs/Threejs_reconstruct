varying vec2 vUv; 
varying vec3 capturePos;
varying vec4 modelViewPosition; 
varying vec3 vecNormal;
uniform mat4 viewMatrixCapture;
uniform mat4 projectionMatrixCapture;

void main() {
	vUv = uv;
	vec4 auxCapture = projectionMatrixCapture * viewMatrixCapture * modelMatrix* vec4(position,1.0);
	capturePos = vec3(auxCapture.x/auxCapture.w,auxCapture.y/auxCapture.w,auxCapture.z/auxCapture.w);
	//capturePos =   (projectionMatrixCapture *  modelViewMatrix * vec4(position,1.0)).xyz;
  //vUv = position; 
  //vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  //vecNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz; //????????
  //gl_Position = projectionMatrix * modelViewPosition; 
  gl_Position =   projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0);
  
  //gl_Position = capturePos;
}