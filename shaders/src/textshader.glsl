uniform bool marked;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec3 textColor;

void main(void)  {
	vec4 base = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));

	if (marked && base[3] == 0.0)
		fragColor = vec4(0.0,0.0,1.0,1.0);

	if(base[3] > 0.0)
		fragColor = vec4(base.xyz * textColor, base[3]); // vec4(0.0,0.0,1.0,base[3]);
}
