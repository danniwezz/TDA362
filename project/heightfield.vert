#version 420
///////////////////////////////////////////////////////////////////////////////
// Input vertex attributes
///////////////////////////////////////////////////////////////////////////////
layout(location = 0) in vec3 position;
layout(location = 2) in vec2 texCoordIn;


layout(binding = 0) uniform sampler2D heighttexture;


///////////////////////////////////////////////////////////////////////////////
// Input uniform variables
///////////////////////////////////////////////////////////////////////////////

uniform mat4 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelViewProjectionMatrix;
uniform mat4 lightMatrix;
uniform int tesselation;

///////////////////////////////////////////////////////////////////////////////
// Output to fragment shader
///////////////////////////////////////////////////////////////////////////////
out vec2 texCoord;
out vec3 viewSpacePosition;
out vec3 viewSpaceNormal;
out	vec3 vertColor;

float hash( float n ) { return fract(sin(n) * 753.5453123); }

float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
	
    float n = p.x + p.y * 157.0 + 113.0 * p.z;
    return mix(mix(mix( hash(n +   0.0), hash(n +   1.0), f.x),
                   mix( hash(n + 157.0), hash(n + 158.0), f.x), f.y),
               mix(mix( hash(n + 113.0), hash(n + 114.0), f.x),
                   mix( hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
}

// Fractal Brownian Motion Noise
float fbm(vec3 pp){
    float f = 0.0;
    mat3 m = mat3( 0.00,  0.80,  0.60,
                  -0.80,  0.36, -0.48,
                  -0.60, -0.48,  0.64 ) * 2;
    f  = 0.5000 * noise( pp ); pp = m*pp;
    f += 0.2500 * noise( pp ); pp = m*pp;
    f += 0.1250 * noise( pp ); pp = m*pp;
    f += 0.0625 * noise( pp ); pp = m*pp;
    f += 0.03125 * noise( pp ); pp = m*pp;
    f += 0.0150625 * noise( pp ); pp = m*pp;
    return f;
}

void main() 
{
	vec3 resizedpos = position;
	resizedpos.xz = 500.0*((resizedpos.xz*2.0)-1.0);
	
	vec3 worldSpaceNormal;
	texCoord = texCoordIn;
	
	float height = texture2D(heighttexture, texCoord.xy).r;
	resizedpos.y = 250.0*height;

	//Shadow calc
	vec2 texCoordSample2;
	vec2 texCoordSample3;

	float scale = 1.0/float(tesselation);
	texCoordSample2.x = texCoord.x ;
	texCoordSample2.y = texCoord.y + scale;

	texCoordSample3.x = texCoord.x + scale;
	texCoordSample3.y = texCoord.y ;

	float height2 = texture2D(heighttexture, texCoordSample2.xy).r;
	float height3 = texture2D(heighttexture, texCoordSample3.xy).r;

	vec3 resizedpos2;
	vec3 resizedpos3;

	resizedpos2.y = 250.0*height2;
	resizedpos3.y = 250.0*height3;


	//compute worldspacenormal

	vec3 positionSample2;
	vec3 positionSample3;


	positionSample2.x = position.x;
	positionSample2.y = height2;
	positionSample2.z = position.z + scale;

	positionSample3.x = position.x + scale;
	positionSample3.y = height3;
	positionSample3.z = position.z;

	vec3 v1 = positionSample2 - position ;
	vec3 v2 = positionSample3 - position ;


	worldSpaceNormal = cross(v1, v2);


	//send Viewnormalnormal to frag//////////////

	viewSpaceNormal = (normalMatrix * vec4(worldSpaceNormal, 0.0)).xyz;
	viewSpacePosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

	gl_Position = modelViewProjectionMatrix * vec4(resizedpos, 1.0);
	
	
	
	
	vertColor = vec3(1.0f);
}
