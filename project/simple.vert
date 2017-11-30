#version 420

layout(location = 0) in vec4 particle;
uniform mat4 modelViewProjectionMatrix; 

void main() 
{
	gl_Position = modelViewProjectionMatrix * vec4(particle.xyz,1.0);
}
