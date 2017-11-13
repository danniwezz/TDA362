﻿#version 420

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

	 if( dot(n, wi) <= 0){
	 return vec3(0.0f); 
	 
	 }


	///////////////////////////////////////////////////////////////////////////
	// Task 1.3 - Calculate the diffuse term and return that as the result
	///////////////////////////////////////////////////////////////////////////
	 vec3 diffuse_term = material_color * (1.0 / PI) * abs(dot(n , wi)) * Li;
	 //return diffuse_term;

	///////////////////////////////////////////////////////////////////////////
	// Task 2 - Calculate the Torrance Sparrow BRDF and return the light 
	//          reflected from that instead
	///////////////////////////////////////////////////////////////////////////
	vec3 wh = normalize(wi + wo);

	float Fwi = material_fresnel + (1 - material_fresnel) *  pow((1 - dot(wh, wi)),5);

	float Dwh = ((material_shininess+2)/(2*PI)) * pow(dot(n,wh),material_shininess);
	
	float Gwiwo = min(1, min( 2 * ((dot(n, wh) * dot(n, wo)) / dot(wo, wh)), 2 * ((dot(n, wh) * dot(n, wi)) / dot(wo, wh))));
	float brdf = (Fwi * Dwh * Gwiwo) / (4 * (dot(n,wo) * (dot(n,wi))));

	//return brdf * dot(n,wi) * Li;

	///////////////////////////////////////////////////////////////////////////
	// Task 3 - Make your
	///////////////////////////////////////////////////
	//return vec3(material_color);
	vec3 LiValue = dot(n, wi) * Li ;

	vec3 dielectric_term = brdf * LiValue  + (1- Fwi) * diffuse_term;

	vec3 metal_term = brdf * material_color * LiValue;
	float m = material_metalness;

	vec3 microfacet_term = m * metal_term + ((1 - m) * dielectric_term);
	float r = material_reflectivity; 

	return (r * microfacet_term + (1-r)* diffuse_term);

}

vec3 calculateIndirectIllumination(vec3 wo, vec3 n)
{
	///////////////////////////////////////////////////////////////////////////
	// Task 5 - Lookup the irradiance from the irradiance map and calculate
	//          the diffuse reflection
	///////////////////////////////////////////////////////////////////////////



	//float nws = viewInverse * n;

	//diffuse_term = material_color * (1.0 / PI) * irradience;





	///////////////////////////////////////////////////////////////////////////
	// Task 6 - Look up in the reflection map from the perfect specular 
	//          direction and calculate the dielectric and metal terms. 
	///////////////////////////////////////////////////////////////////////////

	return vec3(0.0);
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
