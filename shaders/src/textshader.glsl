uniform bool marked;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void)  {
	fragColor += texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));

	if (marked && fragColor[3] == 0.0)
		fragColor = vec4(0.0,0.0,1.0,1.0);
}