import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Group, Points, ShaderMaterial } from 'three';
import type { Camera } from 'three';
import { BLACK_HOLE_Z } from './universeData';
import { MOTTO_TEXT, mottoTimeline } from './mottoTimeline';

const PARTICLE_COUNT = 6200;
let typographyReady: Promise<unknown> | undefined;

function loadTypography() {
  typographyReady ??= Promise.allSettled([
    new FontFace('Cosmos Han', 'url(/fonts/SmileySans-Oblique.ttf.woff2)').load(),
    new FontFace('Cosmos Latin', 'url(/fonts/Orbitron-Variable.ttf)', { weight: '400 900' }).load(),
  ]).then((fonts) => {
    for (const font of fonts) if (font.status === 'fulfilled') document.fonts.add(font.value);
  });
  return typographyReady;
}

/** Text is sampled into particles once; no glyph texture is rendered in the scene. */
export class ParticleMotto {
  readonly group = new Group();
  private material: ShaderMaterial;
  private elapsed = 0;
  private state = mottoTimeline(0);

  constructor() {
    this.group.name = 'particle-motto';
    this.group.position.set(0, 62, BLACK_HOLE_Z - 14);
    const chinese = sampleText(MOTTO_TEXT[0]);
    const english = sampleText(MOTTO_TEXT[1]);
    const seed = new Float32Array(PARTICLE_COUNT * 3);
    const size = new Float32Array(PARTICLE_COUNT);
    for (let index = 0; index < PARTICLE_COUNT; index++) {
      seed.set([random(index * 3 + 1), random(index * 3 + 2), random(index * 3 + 3)], index * 3);
      size[index] = 1.25 + random(index + 1701) * 1.1;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(chinese, 3));
    geometry.setAttribute('aChinese', new Float32BufferAttribute(chinese, 3));
    geometry.setAttribute('aEnglish', new Float32BufferAttribute(english, 3));
    geometry.setAttribute('aSeed', new Float32BufferAttribute(seed, 3));
    geometry.setAttribute('aSize', new Float32BufferAttribute(size, 1));
    // Scatter has a larger extent than either assembled word cloud.
    geometry.computeBoundingSphere();
    if (geometry.boundingSphere) {
      let furthest = 0;
      for (const cloud of [chinese, english]) for (let i = 0; i < cloud.length; i += 3) {
        furthest = Math.max(furthest, Math.hypot(cloud[i], cloud[i + 1], cloud[i + 2]));
      }
      geometry.boundingSphere.radius = furthest + 34;
    }
    this.material = new ShaderMaterial({
      uniforms: {
        uSource: { value: 0 }, uTarget: { value: 0 }, uProgress: { value: 1 },
        uTime: { value: 0 }, uMotion: { value: 1 }, uDpr: { value: Math.min(window.devicePixelRatio || 1, 1.7) },
        uCyan: { value: new Color('#87dce6') }, uGold: { value: new Color('#e8bc81') },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aChinese;
        attribute vec3 aEnglish;
        attribute vec3 aSeed;
        attribute float aSize;
        uniform float uSource;
        uniform float uTarget;
        uniform float uProgress;
        uniform float uTime;
        uniform float uMotion;
        uniform float uDpr;
        varying float vTint;
        varying float vIntensity;
        void main() {
          vec3 from=mix(aChinese,aEnglish,uSource);
          vec3 to=mix(aChinese,aEnglish,uTarget);
          float eased=uProgress*uProgress*(3.0-2.0*uProgress);
          float scatter=sin(uProgress*3.14159265);
          float theta=aSeed.x*6.2831853+uProgress*3.4;
          vec3 drift=vec3(cos(theta)*(8.0+aSeed.y*17.0),sin(theta)*(3.5+aSeed.z*8.0),(aSeed.z-.5)*19.0);
          vec3 p=mix(from,to,eased)+drift*scatter;
          // Keep the assembled letters alive between the two-minute rebuilds.
          // Most particles remain in the strokes; a few drift out and return.
          float idle=(1.0-scatter)*uMotion;
          float phase=aSeed.x*6.2831853;
          float breath=sin(uTime*.92);
          p.xy*=1.0+breath*.012*idle;
          vec3 ripple=vec3(
            sin(uTime*.85+p.y*.18+phase)*.24,
            cos(uTime*.72+p.x*.13+aSeed.y*6.2831853)*.33,
            sin(uTime*.60+phase)*.18
          );
          p+=ripple*idle;
          float life=fract(uTime*(.13+aSeed.y*.045)+aSeed.x);
          float excursion=pow(sin(life*3.14159265),4.0)*step(.86,aSeed.z)*idle;
          float orbit=phase+life*3.2+uTime*.24;
          p+=vec3(cos(orbit)*(1.4+aSeed.y*1.8),sin(orbit)*1.9+life*1.8,sin(phase+life*4.0)*1.3)*excursion;
          float sweep=exp(-pow((p.x-(mod(uTime*11.0+90.0,180.0)-90.0))/7.5,2.0))*uMotion;
          vec4 view=modelViewMatrix*vec4(p,1.0);
          gl_Position=projectionMatrix*view;
          gl_PointSize=clamp(aSize*340.0/max(1.0,-view.z),.95,5.0)*uDpr*(1.0+(.07*breath+.16*sweep)*idle);
          vTint=clamp(smoothstep(.2,.85,aSeed.y)+sweep*.25,0.0,1.0);
          float twinkle=mix(.92,.73+.22*sin(uTime*1.35+phase)+sweep*.52,uMotion);
          vIntensity=twinkle*(1.0-scatter*.24)*(1.0-excursion*.20);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uCyan;
        uniform vec3 uGold;
        varying float vTint;
        varying float vIntensity;
        void main() {
          float radius=length(gl_PointCoord-.5)*2.0;
          if(radius>1.0) discard;
          float halo=exp(-radius*radius*3.8);
          float core=exp(-radius*radius*16.0);
          float alpha=(halo*.29+core*.62)*vIntensity;
          vec3 color=mix(uCyan,uGold,vTint)*(.85+core*.65);
          gl_FragColor=vec4(color,alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true, depthWrite: false, blending: AdditiveBlending,
    });
    const points = new Points(geometry, this.material);
    points.name = 'bilingual-reassembling-light-particles';
    this.group.add(points);

    // 字体就绪后重采样两套字形，不打断已经运行的语言切换与粒子动画。
    let disposed = false;
    geometry.addEventListener('dispose', () => { disposed = true; });
    void loadTypography().then(() => {
      if (disposed) return;
      for (const [name, text] of [['aChinese', MOTTO_TEXT[0]], ['aEnglish', MOTTO_TEXT[1]]] as const) {
        geometry.setAttribute(name, new Float32BufferAttribute(sampleText(text), 3));
      }
    });
  }

  get language(): 'zh' | 'en' { return this.state.text === MOTTO_TEXT[0] ? 'zh' : 'en'; }
  get text() { return this.state.text; }
  get morphProgress() { return this.state.progress; }
  get isMorphing() { return this.state.changing; }
  get elapsedSeconds() { return this.elapsed; }

  update(dt: number, camera: Camera, reducedMotion: boolean) {
    if (Number.isFinite(dt)) this.elapsed += Math.max(0, dt);
    this.state = mottoTimeline(this.elapsed, reducedMotion);
    this.material.uniforms.uSource.value = this.state.source;
    this.material.uniforms.uTarget.value = this.state.target;
    this.material.uniforms.uProgress.value = this.state.progress;
    this.material.uniforms.uTime.value = reducedMotion ? 0 : this.elapsed % 3600;
    this.material.uniforms.uMotion.value = reducedMotion ? 0 : 1;
    this.material.uniforms.uDpr.value = Math.min(window.devicePixelRatio || 1, 1.7);
    this.group.quaternion.copy(camera.quaternion);
  }
}

function random(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function sampleText(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 2000; canvas.height = 340;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas 2D is required to prepare particle typography');
  context.fillStyle = '#ffffff';
  const chinese = text === MOTTO_TEXT[0];
  context.font = chinese
    ? '190px "Cosmos Han", "Microsoft YaHei", sans-serif'
    : '800 164px "Cosmos Latin", "Bahnschrift", sans-serif';
  context.textAlign = 'left'; context.textBaseline = 'middle';
  // 独立字距保留英文的宽阔轮廓，以及中文斜切字形的留白。
  const glyphs = [...text], spacing = chinese ? 24 : 13;
  const widths = glyphs.map((glyph) => context.measureText(glyph).width);
  const total = widths.reduce((sum, width) => sum+width, 0) + spacing*(glyphs.length-1);
  let cursor = (canvas.width-total)/2;
  glyphs.forEach((glyph, index) => {
    context.fillText(glyph, cursor, canvas.height/2);
    cursor += widths[index]+spacing;
  });
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const samples: [number, number][] = [];
  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
  for (let y = 0; y < canvas.height; y += 2) for (let x = 0; x < canvas.width; x += 2) {
    if (pixels[(y * canvas.width + x) * 4 + 3] < 96) continue;
    samples.push([x, y]);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  if (!samples.length) throw new Error(`Unable to sample particle text: ${text}`);
  // Preserve Chinese glyph proportions instead of stretching four square glyphs.
  const scale = Math.min(125 / Math.max(1, maxX - minX), 18 / Math.max(1, maxY - minY));
  const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
  const cloud = new Float32Array(PARTICLE_COUNT * 3);
  for (let index = 0; index < PARTICLE_COUNT; index++) {
    const [x, y] = samples[Math.floor(random(index + 7103) * samples.length)];
    cloud[index * 3] = (x - centerX) * scale + (random(index + 1901) - .5) * .09;
    cloud[index * 3 + 1] = (centerY - y) * scale + (random(index + 2701) - .5) * .09;
    cloud[index * 3 + 2] = (random(index + 3701) - .5) * .24;
  }
  return cloud;
}
