import { AdditiveBlending, BackSide, Color, DoubleSide, ShaderMaterial } from 'three';

const vertex = /* glsl */`
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
void main() {
  vLocal = normalize(position);
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPosition = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

/** Deterministic, texture-free materials: each world carries its subject in its surface. */
export function createPlanetSurface(theme: number, color: string) {
  return new ShaderMaterial({
    uniforms: { uTheme: { value: theme }, uColor: { value: new Color(color) }, uHighlight: { value: 0 } },
    vertexShader: vertex,
    fragmentShader: /* glsl */`
precision highp float;
uniform float uTheme;
uniform vec3 uColor;
uniform float uHighlight;
varying vec3 vLocal;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

float hash(vec3 p) { p = fract(p * 0.3183099 + vec3(.17,.31,.53)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float f = .52 * noise(p); p = p * 2.03 + 7.2;
  f += .26 * noise(p); p = p * 2.01 + 3.1;
  f += .13 * noise(p); p = p * 2.07 + 9.3;
  return f + .065 * noise(p);
}
float line(float p, float width) { return 1.0 - smoothstep(width, width * 1.7, abs(p)); }
float grid(float x, float frequency, float width) { return line(fract(x * frequency) - .5, width); }

void main() {
  vec3 p = normalize(vLocal), n = normalize(vWorldNormal);
  vec3 view = normalize(cameraPosition - vWorldPosition);
  vec3 light = normalize(vec3(-.7, .8, 1.15));
  float diffuse = max(dot(n, light), 0.0);
  float facing = max(dot(n, view), 0.0);
  float rim = pow(1.0 - facing, 3.5);
  float longitude = atan(p.z, p.x) / 6.2831853 + .5;
  float latitude = asin(p.y) / 3.14159265 + .5;
  float terrain = fbm(p * 4.2);
  vec3 base = vec3(.1);
  vec3 emission = vec3(0.0);
  float metal = .0;

  if (uTheme < .5) {
    // A warm observatory globe: weathered amber, engraved meridians and a gold equator.
    float bands = fbm(vec3(p.x * 2.5, p.y * 16.0, p.z * 2.5));
    base = mix(vec3(.115,.054,.018), vec3(.63,.35,.115), smoothstep(.15,.8,bands));
    base = mix(base, vec3(.88,.67,.31), .24 * smoothstep(.56,.75,terrain));
    float meridians = max(grid(longitude, 16.0, .008), grid(latitude, 10.0, .010));
    base *= 1.0 - meridians * .46;
    emission = vec3(.94,.61,.22) * (line(p.y, .007) * .32 + meridians * .045);
    metal = .16;
  } else if (uTheme < 1.5) {
    // Optical research: inky sapphire, concentric interference and a luminous caustic.
    float wave = sin(p.y * 27.0 + sin(p.x * 9.0 + p.z * 5.0) * 1.8 + terrain * 4.0);
    float waveLine = pow(.5 + .5 * wave, 15.0);
    base = mix(vec3(.013,.06,.105), vec3(.045,.27,.38), terrain);
    base += vec3(.03,.14,.18) * (.5 + .5 * wave);
    emission = vec3(.14,.72,.92) * waveLine * .38;
    float pole = line(p.y + .1 * p.x, .008);
    emission += vec3(.63,.97,1.0) * pole * .5;
    metal = .65;
  } else if (uTheme < 2.5) {
    // Engineering: machined ceramic tiles, inset seams and a violet power bus.
    vec2 tile = vec2(longitude * 22.0, latitude * 14.0);
    tile.x += mod(floor(tile.y), 2.0) * .5;
    vec2 cell = abs(fract(tile) - .5);
    float seam = smoothstep(.45, .49, max(cell.x, cell.y));
    float tileNoise = hash(vec3(floor(tile), 5.0));
    base = mix(vec3(.085,.072,.135), vec3(.15,.132,.215), tileNoise);
    base *= 1.0 - .8 * seam;
    float power = line(p.y, .011) + line(p.y - .43, .005) * .35;
    emission = vec3(.63,.38,1.0) * (power * .55 + seam * .06);
    metal = .9;
  } else if (uTheme < 3.5) {
    // A living world: continents, deep jade oceans, coastal shelves and cloud veils.
    float continent = fbm(p * 3.3 + vec3(3.4,1.0,8.7));
    float land = smoothstep(.46,.49,continent);
    vec3 ocean = mix(vec3(.006,.038,.052), vec3(.018,.18,.19), smoothstep(.23,.49,continent));
    vec3 earth = mix(vec3(.04,.14,.075), vec3(.27,.39,.19), terrain);
    earth = mix(earth, vec3(.55,.56,.37), smoothstep(.65,.77,continent) * .5);
    float coast = smoothstep(.43,.465,continent) * (1.0 - smoothstep(.47,.49,continent));
    base = mix(ocean, earth, land) + vec3(.07,.17,.12) * coast;
    float ice = smoothstep(.86,.98,abs(p.y) + terrain * .08);
    base = mix(base, vec3(.66,.76,.70), ice);
    float cloud = smoothstep(.64,.78,fbm(p * 8.0 + vec3(p.y * 3.0,0,0)));
    base = mix(base, vec3(.67,.78,.72), cloud * .62);
    metal = (1.0 - land) * .45;
  } else {
    // Communications: black pearl substrate under rose-gold network great circles.
    float a = line(dot(p, normalize(vec3(.4,.7,.6))), .009);
    float b = line(dot(p, normalize(vec3(-.7,.3,.4))), .009);
    float c = line(dot(p, normalize(vec3(.3,-.7,.65))), .009);
    float routes = max(a,max(b,c));
    float nodes = max(a*b, max(b*c,c*a));
    base = mix(vec3(.035,.016,.036), vec3(.17,.065,.095), terrain);
    emission = vec3(1.0,.46,.43) * (routes * .28 + nodes * 1.1);
    float latitudeBand = grid(latitude, 10.0, .012);
    base += vec3(.04,.015,.025) * latitudeBand;
    metal = .8;
  }
  float specular = pow(max(dot(n,normalize(light + view)),0.0), mix(28.0,85.0,metal));
  vec3 lighting = base * (.16 + diffuse * 1.22);
  lighting += vec3(.72,.86,1.0) * specular * metal * .42;
  lighting += emission * .75;
  lighting += uColor * rim * .12;
  gl_FragColor = vec4(lighting,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
  });
}

export function createAtmosphere(color: string) {
  return new ShaderMaterial({
    uniforms: { uColor: { value: new Color(color) }, uHighlight: { value: 0 } },
    vertexShader: vertex,
    fragmentShader: /* glsl */`
uniform vec3 uColor;
uniform float uHighlight;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
void main() {
  vec3 view = normalize(cameraPosition - vWorldPosition);
  float facing = abs(dot(normalize(vWorldNormal),view));
  // Fade at both shell boundaries, rather than drawing a hard glowing rim.
  float edge = exp(-pow((facing-.17)/.16,2.0)) * smoothstep(0.0,.085,facing);
  gl_FragColor = vec4(uColor, edge * (.045 + uHighlight * .12));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
    side: BackSide, transparent: true, blending: AdditiveBlending, depthWrite: false,
  });
}

export function createPlanetRing(color: string, organic: boolean) {
  return new ShaderMaterial({
    uniforms: { uColor: { value: new Color(color) }, uOrganic: { value: organic ? 1 : 0 } },
    vertexShader: /* glsl */`varying vec3 vPosition; void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */`
uniform vec3 uColor;
uniform float uOrganic;
varying vec3 vPosition;
void main() {
  float radius = length(vPosition.xy);
  float normalizedRadius = (radius - 1.19) / .36;
  float fine = sin(radius * 390.0) * .5 + .5;
  float broad = .5 + .5 * sin(radius * 73.0 + sin(radius * 127.0) * .6);
  float gap = 1.0 - smoothstep(.018,.024,abs(radius - 1.36));
  float opacity = (.15 + fine * .25 + broad * .16) * (1.0 - gap * .9);
  opacity *= smoothstep(0.0,.06,normalizedRadius) * (1.0 - smoothstep(.92,1.0,normalizedRadius));
  vec3 tint = mix(uColor, vec3(.8,.88,.76), uOrganic * .2 + fine * .12);
  gl_FragColor = vec4(tint,opacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,
    side: DoubleSide, transparent: true, depthWrite: false,
  });
}
