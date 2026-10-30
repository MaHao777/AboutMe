import {
  AdditiveBlending, BufferGeometry, DataTexture, DoubleSide, Float32BufferAttribute,
  Group, LinearFilter, Mesh, PlaneGeometry, RedFormat, ShaderMaterial, Vector4,
} from 'three';
import type { Camera } from 'three';
import { BLACK_HOLE_Z } from './universeData';
import {
  accretionHalfThickness, accretionLight, LENS_JOIN_END, LENS_JOIN_START,
  LENS_RADIUS, LENS_SHOULDER_COEFFICIENTS,
} from './accretionProfile';

export const EVENT_HORIZON_RADIUS = 22;
export const ACCRETION_OUTER_RADIUS = 112;
const DISK_ROLL = .13;

const vertex = /* glsl */ `
  varying vec2 vProfile;
  void main() {
    vProfile = position.xy / 22.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 两个光学层共用同一股流体，光纹只沿盘面流动，不生成外圈光丝。
const plasma = /* glsl */ `
  uniform float uTime;
  uniform float uExposure;
  uniform float uOuterRadius;
  uniform sampler2D uRadialLight;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise2(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }
  float gaussian(float x, float width) { float q = x/width; return exp(-q*q); }
  float flowingPlasma(float radius, float angle) {
    // 内圈转得更快；圆周坐标连续，接缝处不会跳动或周期闪回。
    float phase = angle + uTime*.16 / pow(max(radius, 1.0), 1.35);
    vec2 orbit = vec2(cos(phase), sin(phase));
    float broad = noise2(orbit*3.8 + vec2(radius*2.2, -radius*.9));
    float detail = noise2(orbit*12.0 + vec2(radius*8.0, radius*3.1));
    float turbulence = broad*.72 + detail*.28;
    float ribbonPhase = radius*87.0 + turbulence*7.0;
    float finePhase = radius*213.0 + detail*4.0 + broad*2.0;
    // 远景滤掉小于像素的光纹，避免环面出现网格与摩尔纹。
    float ribbons = mix(.3125, pow(.5+.5*sin(ribbonPhase), 3.0),
                        1.0-smoothstep(.8, 3.0, fwidth(ribbonPhase)));
    float fine = .5+.5*sin(finePhase)*(1.0-smoothstep(.8, 3.0, fwidth(finePhase)));
    return .37 + turbulence*.32 + ribbons*.40 + fine*.11;
  }
  vec3 temperature(float heat) {
    vec3 copper = vec3(.67, .18, .038);
    vec3 gold = vec3(1.0, .57, .22);
    vec3 ivory = vec3(1.0, .91, .72);
    return mix(mix(copper, gold, smoothstep(0.0, .58, heat)),
               ivory, smoothstep(.48, 1.0, heat));
  }
`;

/** A tilted annular surface with a separate gravitationally lensed optical image. */
export class BlackHole {
  readonly group = new Group();
  private profile = new Group();
  private radialLight = createRadialLight();
  private uniforms = {
    uTime: { value: 0 }, uExposure: { value: 1 },
    uOuterRadius: { value: ACCRETION_OUTER_RADIUS / EVENT_HORIZON_RADIUS },
    uRadialLight: { value: this.radialLight },
    uShoulder: { value: new Vector4(...LENS_SHOULDER_COEFFICIENTS) },
  };
  private time = 0;
  private exposure = 1;

  constructor() {
    this.group.name = 'cinematic-black-hole';
    this.group.position.set(0, 1.3, BLACK_HOLE_Z);
    this.group.add(this.profile);
    const geometry = new PlaneGeometry(244, 126);

    // 黑色视界写入深度，遮住远处星光与吸积盘的后半面。
    const shadow = new Mesh(geometry, new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: /* glsl */ `
        varying vec2 vProfile;
        void main() {
          float coverage = 1.0-smoothstep(1.075, 1.11, length(vProfile));
          if (coverage < .002) discard;
          gl_FragColor = vec4(vec3(.0003, .0004, .0007), coverage);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      side: DoubleSide, transparent: true, depthWrite: true,
    }));
    shadow.name = 'opaque-event-horizon';
    this.profile.add(shadow);

    const diskMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        varying vec2 vProfile;
        varying float vSurface;
        void main() {
          vProfile = position.xy / 22.0;
          vSurface = .64+.36*abs(normal.z);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vProfile;
        varying float vSurface;
        ${plasma}
        void main() {
          float radius = length(vProfile);
          float angle = atan(vProfile.y, vProfile.x);
          float inner = smoothstep(1.12, 1.23, radius);
          float outer = 1.0-smoothstep(uOuterRadius-.65, uOuterRadius, radius);
          float inward = clamp((uOuterRadius-radius)/(uOuterRadius-1.12), 0.0, 1.0);
          float energy = texture2D(uRadialLight, vec2(inward, .5)).r;
          float heat = pow(inward, 1.65);
          float flow = flowingPlasma(radius, angle);
          float doppler = mix(.48, 1.55, smoothstep(-1.7, 2.6, vProfile.x));
          float surface = (.015+energy*1.85)*flow*vSurface;
          vec3 light = temperature(heat)*surface*doppler;
          // 薄而柔和的相邻光带增加盘面的层次，外缘逐渐融入暗处。
          light += vec3(1.0, .66, .32)*gaussian(radius-1.25, .08)*.06;
          light *= uExposure;
          float opacity = inner*outer*(.24+energy*.74)*mix(.35, 1.0, uExposure);
          if (max(light.r, max(light.g, light.b)) < .001) discard;
          gl_FragColor = vec4(light, opacity);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true, depthWrite: false,
    });
    const disk = new Mesh(createAccretionBody(), diskMaterial);
    disk.name = 'thick-inner-thin-outer-accretion-body';
    // 隆起的内圈与闭合侧壁赋予真实厚度，整体仍保留倾斜盘面的透视。
    disk.rotation.x = -1.23;
    const diskTilt = new Group();
    diskTilt.name = 'accretion-plane-roll';
    diskTilt.rotation.z = DISK_ROLL;
    diskTilt.add(disk);
    disk.renderOrder = 1;
    this.profile.add(diskTilt);

    const emission = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertex,
      fragmentShader: /* glsl */ `
        varying vec2 vProfile;
        ${plasma}
        uniform vec4 uShoulder;
        vec2 lensCurve(float x) {
          float start = ${LENS_JOIN_START.toFixed(6)};
          float end = ${LENS_JOIN_END.toFixed(6)};
          if (x <= start) {
            float height = sqrt(${(LENS_RADIUS ** 2).toFixed(6)}-x*x);
            return vec2(height, -x/height);
          }
          float t = clamp((x-start)/(end-start), 0.0, 1.0);
          float height = ((uShoulder.x*t+uShoulder.y)*t+uShoulder.z)*t+uShoulder.w;
          float slope = ((3.0*uShoulder.x*t+2.0*uShoulder.y)*t+uShoulder.z)/(end-start);
          return vec2(height, slope);
        }
        vec3 lensedBand(vec2 p, float side) {
          float horizontal = side>0.0 ? 1.0 : .86;
          float x = abs(p.x)/horizontal;
          vec2 curve = lensCurve(x)*side;
          curve.y /= horizontal;
          float distance = (p.y-curve.x)/sqrt(1.0+curve.y*curve.y);
          float join = smoothstep(${LENS_JOIN_START.toFixed(6)}, ${LENS_JOIN_END.toFixed(6)}, x);
          float width = (side>0.0 ? .13 : .055)+join*.028;
          float sourceRadius = clamp(1.4+distance*4.0, 1.12, uOuterRadius);
          float flow = flowingPlasma(sourceRadius, atan(p.y, p.x));
          vec3 light = vec3(1.0, .81, .48)*gaussian(distance, width)*flow*1.85;
          light += vec3(1.0, .95, .80)*gaussian(distance+.026, .032)*flow*.32;
          light += vec3(1.0, .35, .085)*gaussian(distance, width*1.9)*.12;
          // 亮弧沿共同切线融入盘面，在已有盘面内才逐渐淡出。
          float tail = 1.0-smoothstep(1.22, 2.36, x);
          float core = smoothstep(1.095, 1.17, length(p));
          return light*tail*core*(side>0.0 ? 1.0 : .25);
        }
        void main() {
          vec2 p = vProfile;
          float radius = length(p);
          float doppler = mix(.78, 1.25, smoothstep(-1.4, 1.4, p.x));
          vec3 light = (lensedBand(p, 1.0)+lensedBand(p, -1.0))*doppler;

          float photon = gaussian(radius-1.015, .009);
          float photonBloom = gaussian(radius-1.015, .033);
          light += vec3(1.0, .84, .49)*(photon*1.35+photonBloom*.18);
          light *= uExposure;
          if (max(light.r, max(light.g, light.b)) < .001) discard;
          gl_FragColor = vec4(light, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      // 世界坐标的 .02 间隔在远景小于一个深度格，使用缓冲偏移稳定光学层。
      // 保留深度测试，前景星球与飞船仍能正常遮住黑洞。
      side: DoubleSide, transparent: true, depthWrite: false, blending: AdditiveBlending,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2,
    });
    emission.addEventListener('dispose', () => this.radialLight.dispose());
    const glow = new Mesh(geometry, emission);
    glow.name = 'flowing-gravitationally-lensed-disk';
    glow.position.z = .02;
    glow.rotation.z = DISK_ROLL;
    glow.renderOrder = 2;
    this.profile.add(glow);
  }

  update(dt: number, camera: Camera, reducedMotion: boolean, exploring = false) {
    if (!reducedMotion) this.time += dt;
    this.uniforms.uTime.value = this.time;
    const desired = exploring ? .22 : 1;
    this.exposure += (desired-this.exposure)*(reducedMotion ? 1 : 1-Math.exp(-dt*4));
    this.uniforms.uExposure.value = this.exposure;
    this.profile.quaternion.copy(camera.quaternion);
  }
}

function createRadialLight() {
  const size = 1024;
  const samples = new Uint8Array(size);
  for (let index = 0; index < size; index++) samples[index] = Math.round(accretionLight(index/(size-1))*255);
  const texture = new DataTexture(samples, size, 1, RedFormat);
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** 上下表面和内外侧壁共用顶点，形成向外收薄的闭合盘体。 */
function createAccretionBody() {
  const rings = 96, segments = 256, stride = segments+1;
  const layerSize = (rings+1)*stride;
  const inner = EVENT_HORIZON_RADIUS*1.12;
  const positions: number[] = [], indices: number[] = [];
  for (const side of [1, -1]) for (let ring = 0; ring <= rings; ring++) {
    const outward = ring/rings;
    const radius = inner+(ACCRETION_OUTER_RADIUS-inner)*outward;
    const height = accretionHalfThickness(1-outward)*side;
    for (let segment = 0; segment <= segments; segment++) {
      const angle = segment/segments*Math.PI*2;
      positions.push(radius*Math.cos(angle), radius*Math.sin(angle), height);
    }
  }
  for (let layer = 0; layer < 2; layer++) for (let ring = 0; ring < rings; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const a = layer*layerSize+ring*stride+segment;
      const b = a+stride, c = b+1, d = a+1;
      if (layer === 0) indices.push(a, b, d, b, c, d);
      else indices.push(a, d, b, b, d, c);
    }
  }
  for (let segment = 0; segment < segments; segment++) {
    const innerTop = segment, innerBottom = segment+layerSize;
    const outerTop = rings*stride+segment, outerBottom = outerTop+layerSize;
    indices.push(innerTop, innerTop+1, innerBottom, innerBottom, innerTop+1, innerBottom+1);
    indices.push(outerTop, outerBottom, outerTop+1, outerBottom, outerBottom+1, outerTop+1);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
