#version 420

// required by GLSL spec Sect 4.5.3 (though nvidia does not, amd does)
precision highp float;

///////////////////////////////////////////////////////////////////////////////
// Material
///////////////////////////////////////////////////////////////////////////////
uniform vec3 material_color;
uniform float material_reflectivity;
uniform float material_metalness;
uniform float material_fresnel;
uniform float material_shininess;
uniform float material_emission;

///////////////////////////////////////////////////////////////////////////////
// Environment
///////////////////////////////////////////////////////////////////////////////
layout(binding = 6) uniform sampler2D environmentMap;
layout(binding = 7) uniform sampler2D irradianceMap;
layout(binding = 8) uniform sampler2D reflectionMap;
uniform float environment_multiplier;

///////////////////////////////////////////////////////////////////////////////
// Light source
///////////////////////////////////////////////////////////////////////////////
uniform vec3 point_light_color = vec3(1.0, 1.0, 1.0);
uniform float point_light_intensity_multiplier = 50.0;

///////////////////////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////////////////////
#define PI 3.14159265359

///////////////////////////////////////////////////////////////////////////////
// Input varyings from vertex shader
///////////////////////////////////////////////////////////////////////////////
in vec2 texCoord;
in vec3 viewSpaceNormal; 
in vec3 viewSpacePosition; 

///////////////////////////////////////////////////////////////////////////////
// Input uniform variables
///////////////////////////////////////////////////////////////////////////////
uniform mat4 viewInverse; 
uniform vec3 viewSpaceLightPosition;

///////////////////////////////////////////////////////////////////////////////
// Output color
///////////////////////////////////////////////////////////////////////////////
layout(location = 0) out vec4 fragmentColor;

float F(vec3 wi, vec3 wh){
	return material_fresnel + ((1.0 - material_fresnel) * pow((1.0 - max(0.0,dot(wh,wi))),5.0));
}
float D(vec3 wh, vec3 n){
	return ((material_shininess + 2.0)/(2.0*PI)) * pow(max(0.0,dot(n,wh)),material_shininess);
}
float G(vec3 wi, vec3 wo, vec3 wh, vec3 n){
	float nDotwh = max(0.0,dot(n,wh));
	float woDotwh = max(0.0,dot(wo,wh));
	float first = (nDotwh*max(0.0,dot(n,wo)))/woDotwh;
	float second = (nDotwh*max(dot(n,wi),0.0))/woDotwh;
	return min(1,min(2*first,2*second));
}
float brdf(vec3 wi, vec3 wh, vec3 n, vec3 wo){
	return (F(wi,wh) * D(wh,n) * G(wi,wo,wh,n))/(4.0*(max(0.0, dot(n,wo))*max(0.0,dot(n,wi))));
}

vec3 calculateDirectIllumiunation(vec3 wo, vec3 n)
{
	///////////////////////////////////////////////////////////////////////////
	// Task 1.2 - Calculate the radiance Li from the light, and the direction
	//            to the light. If the light is backfacing the triangle, 
	//            return vec3(0); 
	///////////////////////////////////////////////////////////////////////////
	vec3 wi = normalize(viewSpaceLightPosition - viewSpacePosition);
	if(dot(n,wi) <= 0 ){
		return vec3(0.0f);
	}
	float dist = length(viewSpaceLightPosition - viewSpacePosition);
	vec3 li = point_light_intensity_multiplier * point_light_color * (1/(dist*dist));
	
	///////////////////////////////////////////////////////////////////////////
	// Task 1.3 - Calculate the diffuse term and return that as the result
	///////////////////////////////////////////////////////////////////////////
	vec3 diffuse_term = material_color * (1.0f/PI) * abs(dot(n,wi)) * li;
	//return diffuse_term;

	vec3 wh = normalize(wi+wo);
	//return brdf(wi,wh,n,wo) * dot(n,wi) * li;


	///////////////////////////////////////////////////////////////////////////
	// Task 2 - Calculate the Torrance Sparrow BRDF and return the light 
	//          reflected from that instead
	///////////////////////////////////////////////////////////////////////////
	
	///////////////////////////////////////////////////////////////////////////
	// Task 3 - Make your shader respect the parameters of our material model.
	///////////////////////////////////////////////////////////////////////////

	vec3 dielectric_term = brdf(wi,wh,n,wo) * dot(n,wi) * li + (1-F(wi,wh)) * diffuse_term;
	vec3 metal_term = brdf(wi,wh,n,wo) * material_color* dot(n,wi)*li;
	vec3 microfacet_term = material_metalness * metal_term + (1-material_metalness) * dielectric_term;
	return material_reflectivity * microfacet_term + (1-material_reflectivity) * diffuse_term;

}

vec3 calculateIndirectIllumination(vec3 wo, vec3 n)
{
	///////////////////////////////////////////////////////////////////////////
	// Task 5 - Lookup the irradiance from the irradiance map and calculate
	//          the diffuse reflection
	///////////////////////////////////////////////////////////////////////////
	// Calculate the spherical coordinates of the direction
	float theta = acos(max(-1.0f, min(1.0f, dir.y)));
	float phi = atan(dir.z, dir.x);
	if (phi < 0.0f) phi = phi + 2.0f * PI;
	// Use these to lookup the color in the irradiance map
	vec4 inverse = (viewInverse * vec4(n,0.0));
	vec2 lookup = vec2(phi / (2.0 * PI), theta / PI) * inverse;
	vec4 irradiance = environment_multiplier * texture(irradianceMap, lookup);
	vec3 diffuse_term = material_color * (1.0 / PI) * irradiance;

	///////////////////////////////////////////////////////////////////////////
	// Task 6 - Look up in the reflection map from the perfect specular 
	//          direction and calculate the dielectric and metal terms. 
	///////////////////////////////////////////////////////////////////////////

	return diffuse_term;
}


void main()
{
	///////////////////////////////////////////////////////////////////////////
	// Task 1.1 - Fill in the outgoing direction, wo, and the normal, n. Both
	//            shall be normalized vectors in view-space. 
	///////////////////////////////////////////////////////////////////////////
	vec3 wo = -normalize(viewSpacePosition);
	vec3 n = normalize(viewSpaceNormal);

	vec3 direct_illumination_term = vec3(0.0);
	{ // Direct illumination
		direct_illumination_term = calculateDirectIllumiunation(wo, n);
	}

	vec3 indirect_illumination_term = vec3(0.0);
	{ // Indirect illumination
		indirect_illumination_term = calculateIndirectIllumination(wo, n);
	}

	///////////////////////////////////////////////////////////////////////////
	// Task 7 - Make glowy things glow!
	///////////////////////////////////////////////////////////////////////////
	vec3 emission_term = vec3(0.0);

	fragmentColor.xyz =
		direct_illumination_term +
		indirect_illumination_term +
		emission_term;
}
