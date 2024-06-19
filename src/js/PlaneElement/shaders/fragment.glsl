varying vec2 vUv;

uniform float u_time;
uniform float u_aspect;

uniform float u_noiseScale;

vec2 getAspectCoords(vec2 coords) {
  coords.x *= u_aspect;

  return coords;
}

float simplexNoiseFBM(vec3 x) {
	float v = 0.0;
	float a = 0.5;
	vec3 shift = vec3(100);

	for (int i = 0; i < NOISE_OCTAVES; ++i) {
		v += a * snoise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

void main() {
  vec2 coords = getAspectCoords(vUv);
  float time = u_time * 0.0075;

  vec3 randColor = vec3(sin(time), 0.3, cos(time));

  float noise = simplexNoiseFBM(vec3(coords * u_noiseScale, time));
  noise = clamp(noise, 0.0, 1.0);

  vec3 bgColor = randColor * 0.1;
  vec3 noiseColor = 1.0 - randColor;
  vec3 outputColor = mix(bgColor, noiseColor, noise);

  gl_FragColor = vec4(outputColor, 1.0);
}
