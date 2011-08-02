vec3 pointLight(mat4 uNMatrix, vec3 aNormals, vec4 mvPosition, int lightsCount, PointLight lights[MAX_POINT_LIGHTS]) {
	vec3 pointLight = vec3(0.0,0.0,0.0);
 	vec4 transformedNormal = uNMatrix * vec4(aNormals, 1.0);
	int j = 0;
	for(int i = 0;i<MAX_POINT_LIGHTS;i++) {
		if(j >= lightsCount) break;
		
		vec3 lightDirection = normalize(lights[i].position - mvPosition.xyz);
		float pointLightWeighting = lights[i].intensity * max(dot(transformedNormal.xyz, lightDirection), 0.0);
		pointLight += lights[i].color * pointLightWeighting;
		j++;
	}
	return pointLight;
}