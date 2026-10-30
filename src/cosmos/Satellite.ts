import { Color, Group, Mesh, MeshStandardMaterial, ShaderMaterial, SphereGeometry } from 'three';
import type { OrbitOrientation, SatelliteData } from './universeData';
import { satelliteOrbitPosition } from './orbits';
import { createAtmosphere } from './planetMaterials';

/** Every satellite gets a surface motif tied to its content, within one safe sphere. */
const themes: Record<string, { index: number; base: string; accent: string; metal: number; rough: number }> = {
  education: { index: 0, base: '#59412d', accent: '#eed39b', metal: .62, rough: .4 },
  awards: { index: 1, base: '#a97527', accent: '#ffdf91', metal: .78, rough: .28 },
  languages: { index: 2, base: '#d3d5ce', accent: '#4d96af', metal: .2, rough: .43 },
  skills: { index: 3, base: '#173c46', accent: '#f1cc82', metal: .73, rough: .35 },
  wavefront: { index: 4, base: '#145a70', accent: '#9bebff', metal: .5, rough: .28 },
  fringe: { index: 5, base: '#173448', accent: '#a7efff', metal: .6, rough: .22 },
  detection: { index: 6, base: '#174950', accent: '#80f0d5', metal: .62, rough: .32 },
  configuration: { index: 7, base: '#34354f', accent: '#c5a7f4', metal: .82, rough: .32 },
  testing: { index: 8, base: '#3d3652', accent: '#a9e1df', metal: .6, rough: .4 },
  ros2: { index: 9, base: '#302e48', accent: '#d2baff', metal: .66, rough: .32 },
  music: { index: 10, base: '#141c24', accent: '#bfd6aa', metal: .42, rough: .3 },
  basketball: { index: 11, base: '#bd6227', accent: '#2d251e', metal: .02, rough: .88 },
  writing: { index: 12, base: '#c9c0a5', accent: '#2c5552', metal: .12, rough: .65 },
  qq: { index: 13, base: '#1b6b8c', accent: '#d9f0f4', metal: .42, rough: .28 },
  wechat: { index: 14, base: '#1b6e54', accent: '#cef0cf', metal: .22, rough: .32 },
  github: { index: 15, base: '#191b29', accent: '#c9c1eb', metal: .72, rough: .28 },
  gmail: { index: 16, base: '#c8b7a6', accent: '#b83b42', metal: .24, rough: .42 },
};

const surfaceFunctions = /* glsl */ `
varying vec3 vSatelliteSurface;
uniform vec3 uSatelliteBase;
uniform vec3 uSatelliteAccent;
uniform float uSatelliteTheme;
float satelliteLine(float value, float width) {
  float aa = max(fwidth(value), .002);
  return 1. - smoothstep(width - aa, width + aa, abs(value));
}
float satelliteGrid(vec2 uv, vec2 count, float width) {
  vec2 cell = abs(fract(uv * count) - .5);
  return max(satelliteLine(cell.x - .48, width), satelliteLine(cell.y - .48, width));
}
vec3 satellitePaint(vec3 p) {
  float lon = atan(p.z, p.x);
  float lat = asin(clamp(p.y, -.999, .999));
  vec2 uv = vec2(lon / 6.2831853 + .5, lat / 3.1415927 + .5);
  vec2 front = p.xy;
  float radial = length(front);
  float angle = atan(front.y, front.x);
  vec3 base = uSatelliteBase;
  float ink = 0.;
  if (uSatelliteTheme < .5) {
    // An armillary globe: latitude rules, engraved meridians and the equator.
    ink = max(satelliteLine(sin(lon * 6.), .055), satelliteLine(sin(lat * 7.), .045)) * .58;
    ink = max(ink, satelliteLine(p.y, .045));
  } else if (uSatelliteTheme < 1.5) {
    // Medallion, concentric rim and a five-point emblem.
    ink = satelliteLine(radial - .73, .024) + satelliteLine(radial - .62, .012);
    float star = .34 + .1 * cos(angle * 5.);
    ink = max(ink, 1. - smoothstep(star - .025, star + .025, radial));
    base *= .88 + .12 * cos(lon * 32.);
  } else if (uSatelliteTheme < 2.5) {
    // Typographic bands, abstract strokes rather than counterfeit written text.
    vec2 tile = fract(uv * vec2(18., 8.));
    float row = step(.22, tile.y) * step(tile.y, .76);
    ink = row * max(satelliteLine(tile.x - .25, .045), satelliteLine(tile.y - .48, .045)) * .7;
    ink = max(ink, satelliteLine(p.y - .48, .025));
  } else if (uSatelliteTheme < 3.5) {
    // A ceramic processor with solder lanes.
    ink = satelliteGrid(uv, vec2(10., 7.), .018) * .55;
    vec2 q = abs(front);
    ink = max(ink, satelliteLine(max(q.x, q.y) - .42, .028));
    ink = max(ink, satelliteLine(q.x - .58, .018) * step(q.y, .38));
  } else if (uSatelliteTheme < 4.5) {
    // Optical wavefront contours.
    float wave = radial + .09 * sin(angle * 3.);
    ink = satelliteLine(sin(wave * 25.), .12) * .8;
    base = mix(base, uSatelliteAccent * .4, .25 + .2 * p.y);
  } else if (uSatelliteTheme < 5.5) {
    // Interference fringes drift across a polished dark surface.
    float phase = 21. * (p.x + .18 * p.y * p.y);
    ink = pow(.5 + .5 * cos(phase), 4.);
  } else if (uSatelliteTheme < 6.5) {
    // Radar circles and a bright detected point.
    ink = max(satelliteLine(radial - .28, .012), satelliteLine(radial - .6, .012));
    ink = max(ink, satelliteLine(front.x, .012) * .5);
    ink = max(ink, satelliteLine(front.y, .012) * .5);
    ink = max(ink, 1. - smoothstep(.035, .065, distance(front, vec2(.3, .22))));
  } else if (uSatelliteTheme < 7.5) {
    // Gear-like segmented engineering shell.
    float teeth = step(.2, cos(lon * 12.));
    ink = satelliteLine(p.y, .035) + satelliteLine(abs(p.y) - .49, .025) * teeth;
    base *= .8 + .2 * smoothstep(-.2, .2, cos(lon * 12.));
  } else if (uSatelliteTheme < 8.5) {
    // Diagnostic grid and a verification tick.
    ink = satelliteGrid(uv, vec2(12., 8.), .012) * .26;
    float tick = min(abs(front.y - front.x - .08) + max(-front.x - .12, 0.) * 3., abs(front.y + front.x + .16) + max(front.x + .12, 0.) * 3.);
    ink = max(ink, satelliteLine(tick, .045) * step(radial, .68));
  } else if (uSatelliteTheme < 9.5) {
    // ROS messages connect six embedded nodes.
    ink = satelliteLine(radial - .52, .014) * .6;
    for (int i = 0; i < 6; i++) {
      float a = float(i) * 1.04719755;
      vec2 node = vec2(cos(a), sin(a)) * .52;
      ink = max(ink, 1. - smoothstep(.055, .085, distance(front, node)));
    }
    ink = max(ink, satelliteLine(front.x, .012) * step(abs(front.y), .52));
  } else if (uSatelliteTheme < 10.5) {
    // Vinyl grooves, ivory label and a small spindle.
    ink = satelliteLine(sin(radial * 95.), .09) * .23;
    ink = max(ink, (1. - smoothstep(.26, .29, radial)) * .8);
    ink *= smoothstep(.035, .055, radial);
  } else if (uSatelliteTheme < 11.5) {
    // Basketball: inset dark seams on pebbled burnt-orange leather.
    float seam = max(satelliteLine(p.y, .028), satelliteLine(p.x, .028));
    seam = max(seam, satelliteLine(p.z + .4 * p.x * p.y, .027));
    ink = seam;
    base *= .94 + .06 * sin(lon * 190.) * sin(lat * 150.);
  } else if (uSatelliteTheme < 12.5) {
    // Paper-like ivory ruled with ink and a dark binding band.
    ink = satelliteLine(sin(lat * 25.), .08) * .43;
    ink = max(ink, satelliteLine(p.x + .5, .055));
  } else if (uSatelliteTheme < 13.5) {
    // QQ: cool icy blue with a white equatorial message path.
    ink = satelliteLine(p.y + .08 * sin(lon * 3.), .075);
    ink = max(ink, satelliteLine(abs(p.y) - .64, .022));
  } else if (uSatelliteTheme < 14.5) {
    // Two conversation bubbles with inset ellipses.
    vec2 a = (front - vec2(-.2, .16)) / vec2(.42, .31);
    vec2 b = (front - vec2(.23, -.21)) / vec2(.36, .28);
    ink = max(1. - smoothstep(.93, 1., length(a)), (1. - smoothstep(.93, 1., length(b))) * .75);
    ink *= 1. - max(1. - smoothstep(.025, .045, distance(front, vec2(-.34,.18))), 1. - smoothstep(.025, .045, distance(front, vec2(-.09,.18))));
  } else if (uSatelliteTheme < 15.5) {
    // Obsidian shell and branching open-source circuits.
    ink = satelliteGrid(uv, vec2(9., 6.), .012) * .35;
    ink = max(ink, satelliteLine(abs(front.x) - .28, .022) * step(abs(front.y), .43));
    ink = max(ink, satelliteLine(radial - .36, .017));
  } else {
    // Red envelope chevron on a warm ceramic shell.
    ink = satelliteLine(front.y - abs(front.x) * .8 + .13, .065) * step(abs(front.x), .72);
    ink = max(ink, satelliteLine(abs(front.x) - .7, .055) * step(abs(front.y), .52));
    ink = max(ink, satelliteLine(front.y - .51, .035) * step(abs(front.x), .7));
  }
  return mix(base, uSatelliteAccent, clamp(ink, 0., 1.));
}
`;

export class Satellite {
  readonly group = new Group();
  readonly mesh: Mesh<SphereGeometry, MeshStandardMaterial>;
  private halo: Mesh<SphereGeometry, ShaderMaterial>;
  private glow = 0;
  private glowTarget = 0;

  constructor(readonly data: SatelliteData, color: string, readonly orbitRadius: number, private orientation: OrbitOrientation) {
    const theme = themes[data.id] ?? { index: 0, base: '#566472', accent: color, metal: .4, rough: .5 };
    const material = new MeshStandardMaterial({ color: '#ffffff', roughness: theme.rough, metalness: theme.metal, emissive: theme.base, emissiveIntensity: .015 });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uSatelliteBase = { value: new Color(theme.base) };
      shader.uniforms.uSatelliteAccent = { value: new Color(theme.accent) };
      shader.uniforms.uSatelliteTheme = { value: theme.index };
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSatelliteSurface;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvSatelliteSurface = normalize(position);');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\n${surfaceFunctions}`).replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = satellitePaint(normalize(vSatelliteSurface));');
    };
    material.customProgramCacheKey = () => 'cosmos-themed-satellite-v1';
    this.mesh = new Mesh(new SphereGeometry(data.radius * .96, 48, 32), material);
    this.mesh.rotation.z = data.phase * .14;
    this.group.add(this.mesh);
    this.halo = new Mesh(new SphereGeometry(data.radius, 32, 24), createAtmosphere(color));
    this.group.add(this.halo);
    this.update(0);
  }

  update(rotation: number, dt = 1 / 60, reducedMotion = false) {
    this.group.position.set(...satelliteOrbitPosition(this.orbitRadius, this.data.phase + rotation, this.orientation));
    this.mesh.rotation.y = rotation * .18;
    this.glow += (this.glowTarget - this.glow) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 10));
    this.halo.material.uniforms.uHighlight.value = this.glow;
  }

  highlight(active: boolean) { this.glowTarget = active ? 1 : 0; }
}
