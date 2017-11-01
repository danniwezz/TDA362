#version 420

// required by GLSL spec Sect 4.5.3 (though nvidia does not, amd does)
precision highp float;

in vec3 outColor;

// >>> @task 3.4

layout(location = 0) out vec4 fragmentColor;

void main() 
{
	// >>> @task 3.5
	fragmentColor = vec4(outColor, 1.0); 
}