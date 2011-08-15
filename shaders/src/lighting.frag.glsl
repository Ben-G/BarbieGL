uniform vec3 uAmbientColor0;
uniform vec3 uAmbientColor1;
uniform vec3 uAmbientColor2;
uniform vec3 uAmbientColor3;
uniform vec3 uAmbientColor4;
uniform vec3 uAmbientColor5;
uniform vec3 uAmbientColor6;
uniform vec3 uAmbientColor7;
uniform int  uAmbientLightsCount;

uniform vec3 uDirectionalColor0;
uniform vec3 uDirectionalColor1;
uniform vec3 uDirectionalColor2;
uniform vec3 uDirectionalColor3;
uniform vec3 uDirectionalColor4;
uniform vec3 uDirectionalColor5;
uniform vec3 uDirectionalColor6;
uniform vec3 uDirectionalColor7;

uniform vec3 uDirectionalDirection0;
uniform vec3 uDirectionalDirection1;
uniform vec3 uDirectionalDirection2;
uniform vec3 uDirectionalDirection3;
uniform vec3 uDirectionalDirection4;
uniform vec3 uDirectionalDirection5;
uniform vec3 uDirectionalDirection6;
uniform vec3 uDirectionalDirection7;
uniform int uDirectionalLightsCount;

uniform vec3 uPointColor0;
uniform vec3 uPointColor1;
uniform vec3 uPointColor2;
uniform vec3 uPointColor3;
uniform vec3 uPointColor4;
uniform vec3 uPointColor5;
uniform vec3 uPointColor6;
uniform vec3 uPointColor7;
uniform vec3 uPointColor8;
uniform vec3 uPointColor9;
uniform vec3 uPointColor10;
uniform vec3 uPointColor11;
uniform vec3 uPointColor12;
uniform vec3 uPointColor13;
uniform vec3 uPointColor14;
uniform vec3 uPointColor15;
uniform vec3 uPointColor16;
uniform vec3 uPointPosition0;
uniform vec3 uPointPosition1;
uniform vec3 uPointPosition2;
uniform vec3 uPointPosition3;
uniform vec3 uPointPosition4;
uniform vec3 uPointPosition5;
uniform vec3 uPointPosition6;
uniform vec3 uPointPosition7;
uniform vec3 uPointPosition8;
uniform vec3 uPointPosition9;
uniform vec3 uPointPosition10;
uniform vec3 uPointPosition11;
uniform vec3 uPointPosition12;
uniform vec3 uPointPosition13;
uniform vec3 uPointPosition14;
uniform vec3 uPointPosition15;
uniform vec3 uPointPosition16;
uniform int uPointLightsCount;

varying vec4 transformedNormal;
varying vec4 mvPosition;

uniform bool useSpecularLights;
uniform float uShininess;
uniform vec3 uSpecularColor;



vec3 pointLight(vec4 transformedNormal, vec4 mvPosition, vec3 uPointColor, vec3 pointPosition) {
	vec3 lightDirection = normalize(pointPosition - mvPosition.xyz);
	float pointLightWeighting = max(dot(transformedNormal.xyz, lightDirection), 0.0);
	pointLightWeighting += max(dot(-transformedNormal.xyz, lightDirection), 0.0);
	vec3 pointLight = uPointColor * pointLightWeighting;
	return pointLight;
}

vec3 specularLight(vec4 transformedNormal, vec4 mvPosition, vec3 pointPosition, float shininess, vec3 color) {
	vec3 normal = normalize(transformedNormal.xyz);
	vec3 eyeDirection = normalize(-mvPosition.xyz);

	vec3 lightDirection = normalize(pointPosition - mvPosition.xyz);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specularLightWeighting =  pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess);
	vec3 specLight = color * specularLightWeighting;

	return specLight;
}

vec3 directionalLight(vec4 transformedNormal, vec3 direction,  vec3 color) {
	return color * (max(dot(transformedNormal.xyz, direction), 0.0) + max(dot(-transformedNormal.xyz, direction), 0.0));
}


void main(void)
{
	vec3 lightWeighting = vec3(0.0,0.0,0.0);

	
	// AMBIENT LIGHT
	if(uAmbientLightsCount > 0) {
		lightWeighting += uAmbientColor0;
		if(uAmbientLightsCount >= 2) lightWeighting += uAmbientColor1;
		if(uAmbientLightsCount >= 3) lightWeighting += uAmbientColor2;
		if(uAmbientLightsCount >= 4) lightWeighting += uAmbientColor3;
		if(uAmbientLightsCount >= 5) lightWeighting += uAmbientColor4;
		if(uAmbientLightsCount >= 6) lightWeighting += uAmbientColor5;
		if(uAmbientLightsCount >= 7) lightWeighting += uAmbientColor6;
		if(uAmbientLightsCount >= 8) lightWeighting += uAmbientColor7;
	}

	// DIR LIGHT
	if(uDirectionalLightsCount > 0) {
		lightWeighting += directionalLight(transformedNormal, uDirectionalDirection0, uDirectionalColor0);
		if(uDirectionalLightsCount >= 2) lightWeighting += directionalLight(transformedNormal, uDirectionalDirection1, uDirectionalColor1);
		if(uDirectionalLightsCount >= 3) lightWeighting += directionalLight(transformedNormal, uDirectionalDirection2, uDirectionalColor2);
		if(uDirectionalLightsCount >= 4) lightWeighting += directionalLight(transformedNormal, uDirectionalDirection3, uDirectionalColor3);
		if(uDirectionalLightsCount >= 5) lightWeighting += directionalLight(transformedNormal, uDirectionalDirection4, uDirectionalColor4);
		if(uDirectionalLightsCount >= 6) lightWeighting += directionalLight(transformedNormal, uDirectionalDirection5, uDirectionalColor5);
		if(uDirectionalLightsCount >= 7) lightWeighting += directionalLight(transformedNormal, uDirectionalDirection6, uDirectionalColor6);
		if(uDirectionalLightsCount >= 8) lightWeighting += directionalLight(transformedNormal, uDirectionalDirection7, uDirectionalColor7);
	}
	
	
	// POINT LIGHT
	if(uPointLightsCount > 0) {
		vec3 ptLight = vec3(0.0,0.0,0.0);
		ptLight += pointLight(transformedNormal, mvPosition, uPointColor0, uPointPosition0);
		if(uPointLightsCount >=2) ptLight += pointLight(transformedNormal, mvPosition, uPointColor1, uPointPosition1);
		if(uPointLightsCount >=3) ptLight += pointLight(transformedNormal, mvPosition, uPointColor2, uPointPosition2);
		if(uPointLightsCount >=4) ptLight += pointLight(transformedNormal, mvPosition, uPointColor3, uPointPosition3);
		if(uPointLightsCount >=5) ptLight += pointLight(transformedNormal, mvPosition, uPointColor4, uPointPosition4);
		if(uPointLightsCount >=6) ptLight += pointLight(transformedNormal, mvPosition, uPointColor5, uPointPosition5);
		if(uPointLightsCount >=7) ptLight += pointLight(transformedNormal, mvPosition, uPointColor6, uPointPosition6);
		if(uPointLightsCount >=8) ptLight += pointLight(transformedNormal, mvPosition, uPointColor7, uPointPosition7);
		if(uPointLightsCount >=9) ptLight += pointLight(transformedNormal, mvPosition, uPointColor8, uPointPosition8);
		if(uPointLightsCount >=10) ptLight += pointLight(transformedNormal, mvPosition, uPointColor9, uPointPosition9);
		if(uPointLightsCount >=11) ptLight += pointLight(transformedNormal, mvPosition, uPointColor10, uPointPosition10);
		if(uPointLightsCount >=12) ptLight += pointLight(transformedNormal, mvPosition, uPointColor11, uPointPosition11);
		if(uPointLightsCount >=13) ptLight += pointLight(transformedNormal, mvPosition, uPointColor12, uPointPosition12);
		if(uPointLightsCount >=14) ptLight += pointLight(transformedNormal, mvPosition, uPointColor13, uPointPosition13);
		if(uPointLightsCount >=15) ptLight += pointLight(transformedNormal, mvPosition, uPointColor14, uPointPosition14);
		if(uPointLightsCount >=16) ptLight += pointLight(transformedNormal, mvPosition, uPointColor15, uPointPosition15);
		lightWeighting += ptLight;
	}
	
	// SPEC LIGHT

	if(useSpecularLights && uPointLightsCount > 0) {
		vec3 specLight = vec3(0,0,0);
		specLight += specularLight(transformedNormal, mvPosition, uPointPosition0, uShininess, uSpecularColor);
		if(uPointLightsCount >=2) specLight += specularLight(transformedNormal, mvPosition, uPointPosition1, uShininess, uSpecularColor);
		if(uPointLightsCount >=3) specLight += specularLight(transformedNormal, mvPosition, uPointPosition2, uShininess, uSpecularColor);
		if(uPointLightsCount >=4) specLight += specularLight(transformedNormal, mvPosition, uPointPosition3, uShininess, uSpecularColor);
		if(uPointLightsCount >=5) specLight += specularLight(transformedNormal, mvPosition, uPointPosition4, uShininess, uSpecularColor);
		if(uPointLightsCount >=6) specLight += specularLight(transformedNormal, mvPosition, uPointPosition5, uShininess, uSpecularColor);
		if(uPointLightsCount >=7) specLight += specularLight(transformedNormal, mvPosition, uPointPosition6, uShininess, uSpecularColor);
		if(uPointLightsCount >=8) specLight += specularLight(transformedNormal, mvPosition, uPointPosition7, uShininess, uSpecularColor);
		if(uPointLightsCount >=9) specLight += specularLight(transformedNormal, mvPosition, uPointPosition8, uShininess, uSpecularColor);
		if(uPointLightsCount >=10) specLight += specularLight(transformedNormal, mvPosition, uPointPosition9, uShininess, uSpecularColor);
		if(uPointLightsCount >=11) specLight += specularLight(transformedNormal, mvPosition, uPointPosition10, uShininess, uSpecularColor);
		if(uPointLightsCount >=12) specLight += specularLight(transformedNormal, mvPosition, uPointPosition11, uShininess, uSpecularColor);
		if(uPointLightsCount >=13) specLight += specularLight(transformedNormal, mvPosition, uPointPosition12, uShininess, uSpecularColor);
		if(uPointLightsCount >=14) specLight += specularLight(transformedNormal, mvPosition, uPointPosition13, uShininess, uSpecularColor);
		if(uPointLightsCount >=15) specLight += specularLight(transformedNormal, mvPosition, uPointPosition14, uShininess, uSpecularColor);
		if(uPointLightsCount >=16) specLight += specularLight(transformedNormal, mvPosition, uPointPosition15, uShininess, uSpecularColor);
		lightWeighting += specLight;
	}
	
	
	
	fragColor += vec4(lightWeighting,1.0);

}

