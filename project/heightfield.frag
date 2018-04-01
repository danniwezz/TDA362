#version 420

// required by GLSL spec Sect 4.5.3 (though nvidia does not, amd does)
precision highp float;

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////
#define PI 3.14159265359
uniform vec3 point_light_color = vec3(1.0, 1.0, 1.0);
uniform float point_light_intensity_multiplier = 50.0;
uniform float environment_multiplier;

///////////////////////////////////////////////////////////////////////////////
// Input uniform variables
///////////////////////////////////////////////////////////////////////////////
uniform mat4 viewInverse;
uniform vec3 viewSpaceLightPosition;

in vec2 texCoord;
in vec3 vertColor;
in vec3 viewSpaceNormal;
in vec3 viewSpacePosition;

layout(location = 0) out vec4 fragmentColor;
layout(binding = 1) uniform sampler2D diffusecolortexture;
layout(binding = 7) uniform sampler2D irradianceMap;

// This simple fragment shader is meant to be used for debug purposes
// When the geometry is ok, we will migrate to use shading.frag instead.



vec3 calculateDirectIllumiunation(vec3 wo, vec3 n)
{

	///////////////////////////////////////////////////////////////////////////
	// Task 1.2 - Calculate the radiance Li from the light, and the direction
	//            to the light. If the light is backfacing the triangle, 
	//            return vec3(0); 
	///////////////////////////////////////////////////////////////////////////
	 
	 float d = length(viewSpacePosition - viewSpaceLightPosition);

	 vec3 wi = normalize(viewSpaceLightPosition - viewSpacePosition);
	 vec3 Li = point_light_intensity_multiplier * point_light_color * (1/(pow(d,2)));
	 //return vec3(dot(n.xzy, wi));
	 //if( dot(n, wi) <= 0){
	 //return vec3(0.0f, 1.0, 0.0); 
	 //
	 //}
	///////////////////////////////////////////////////////////////////////////
	// Task 1.3 - Calculate the diffuse term and return that as the result
	///////////////////////////////////////////////////////////////////////////
	 vec3 diffuse_term =  texture2D(diffusecolortexture, texCoord.xy).xyz * (1.0 / PI) * abs(dot(n , wi)) * Li;
	 return diffuse_term;


	}

	vec3 calculateIndirectIllumination(vec3 wo, vec3 n)
{
	///////////////////////////////////////////////////////////////////////////
	// Task 5 - Lookup the irradiance from the irradiance map and calculate
	//          the diffuse reflection
	///////////////////////////////////////////////////////////////////////////
	vec3 v = vec3(viewInverse);
	vec3 nws = v  * n;
	vec3 dir = nws;

	// Calculate the spherical coordinates of the direction
	float theta = acos(max(-1.0f, min(1.0f, dir.y)));
	float phi = atan(dir.z, dir.x);
	if (phi < 0.0f) phi = phi + 2.0f * PI;


	// Use these to lookup the color in the environment map
	vec2 lookup = vec2(phi / (2.0 * PI), theta / PI);
	vec3 irradience = environment_multiplier * texture(irradianceMap, lookup).rgb;

	vec3 diffuse_term = texture2D(diffusecolortexture, texCoord.xy).xyz * (1.0 / PI) * irradience;

	return diffuse_term;

	
}

void main() 
{
	

	vec3 wo = -normalize(viewSpacePosition);
	vec3 n = normalize(viewSpaceNormal);

	// Direct illumination
	vec3 indirect_illumination_term = calculateIndirectIllumination(wo, n);
	vec3 direct_illumination_term = calculateDirectIllumiunation(wo, n);
	fragmentColor = vec4(direct_illumination_term + indirect_illumination_term, 1.0);
	//fragmentColor = texture2D(diffusecolortexture, texCoord.xy);
	//fragmentColor = vec4(n, 1.0);
}
