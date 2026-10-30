import { Group, Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from 'three';
import type { Camera, PerspectiveCamera } from 'three';

/** A camera-bound optical tunnel. Progress .5 is the fully covered reset seam. */
export class WarpTransit {
  readonly group = new Group();
  private screen: Mesh<PlaneGeometry, ShaderMaterial>;
  private direction = new Vector3();
  private worldPosition = new Vector3();

  constructor() {
    this.group.name = 'black-hole-transit';
    this.group.visible = false;
    const material = new ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uAspect: { value: 1 },
        uReducedMotion: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv=uv;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform float uProgress;
        uniform float uAspect;
        uniform float uReducedMotion;
        const float TAU=6.28318530718;

        float hash(vec2 p) {
          p=fract(p*vec2(123.34,456.21));
          p+=dot(p,p+45.32);
          return fract(p.x*p.y);
        }

        // A sparse polar lattice creates elongated points travelling down a
        // tunnel. Its angular twist changes with depth, never with random time.
        float starLayer(float radius,float angle,float travel,float layer) {
          float twist=angle+log(radius+.09)*(.085+layer*.023)+travel*.045;
          vec2 polar=vec2((twist/TAU+.5)*(94.0+layer*31.0),log(radius+.055)*(4.0+layer*.7)-travel*(6.0+layer));
          vec2 cell=floor(polar);
          float seed=hash(cell+layer*17.0);
          float across=fract(polar.x)-(.20+hash(cell.yx+8.0)*.60);
          float along=fract(polar.y);
          float width=max(.013+layer*.002,fwidth(polar.x)*.62);
          float streak=exp(-pow(across/width,2.0));
          float head=smoothstep(.035,.10,along)*(1.0-smoothstep(.17,.96,along));
          float rarity=smoothstep(.65,.87,seed);
          float centerFade=smoothstep(.07,.29,radius);
          return streak*head*rarity*centerFade*(.45+seed*.55);
        }

        void main() {
          float p=clamp(uProgress,0.0,1.0);
          if (uReducedMotion>.5) {
            float shade=smoothstep(0.0,.40,p)*(1.0-smoothstep(.60,1.0,p));
            gl_FragColor=vec4(vec3(.001,.002,.004),shade);
          } else {
            vec2 point=(vUv-.5)*2.0*vec2(uAspect,1.0);
            float action=sin(p*3.14159265);
            point-=vec2(sin(p*8.0)*.018,cos(p*7.0)*.012)*action;
            float radius=length(point);
            float angle=atan(point.y,point.x);
            float travel=p*p*12.0;
            float entering=smoothstep(.015,.18,p);
            float tunnel=smoothstep(.12,.34,p)*(1.0-smoothstep(.79,.98,p));
            float fullRadius=length(vec2(uAspect,1.0))+.35;

            // First the aperture closes around the viewer. The scene is fully
            // covered before .5; on the other side it opens from the centre.
            float coreRadius=mix(.0,fullRadius,smoothstep(.07,.43,p));
            float core=1.0-smoothstep(coreRadius-.08,coreRadius+.18,radius);
            float entryAlpha=clamp(entering*(.10+core*.90),0.0,1.0);
            float opening=smoothstep(.57,.97,p);
            float openingRadius=opening*fullRadius;
            float aperture=smoothstep(openingRadius-.13,openingRadius+.15,radius);
            float exitAlpha=aperture*(1.0-smoothstep(.93,1.0,p));
            float opacity=mix(entryAlpha,exitAlpha,smoothstep(.53,.64,p));

            float stars0=starLayer(radius,angle,travel,0.0);
            float stars1=starLayer(radius,angle,travel+.8,1.0);
            float stars2=starLayer(radius,angle,travel+2.1,2.0);
            float lattice=pow(.5+.5*sin(log(radius+.08)*21.0-travel*4.0+angle*2.0),18.0);
            float spiral=pow(.5+.5*sin(angle*5.0+log(radius+.10)*9.0-travel*1.6),7.0);
            float radialEnvelope=smoothstep(.12,.45,radius)*exp(-radius*.40);
            vec3 gold=vec3(.88,.38,.095);
            vec3 ice=vec3(.14,.48,.80);
            vec3 plasma=mix(gold,ice,smoothstep(.14,.39,p));
            vec3 color=vec3(.0015,.003,.009);
            color+=(plasma*stars0+vec3(.34,.65,.88)*stars1+gold*stars2*.55)*tunnel*1.7;
            color+=plasma*(lattice*.032+spiral*.028)*radialEnvelope*tunnel;

            // The old accretion glow stretches into the entry; a broad blue
            // rim gives the returning aperture depth without a white flash.
            float entryRing=exp(-pow((radius-coreRadius)/.105,2.0))*entering*(1.0-smoothstep(.30,.44,p));
            float returnRim=exp(-pow((radius-openingRadius)/.12,2.0))*smoothstep(.57,.67,p)*(1.0-smoothstep(.90,.99,p));
            color+=gold*entryRing*.24+vec3(.16,.36,.51)*returnRim*.22;
            float resetCover=1.0-smoothstep(.0,.075,abs(p-.5));
            color*=1.0-resetCover*.96;
            gl_FragColor=vec4(color,opacity);
          }
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.screen=new Mesh(new PlaneGeometry(2,2),material);
    this.screen.name='radial-star-tunnel-and-return-aperture';
    this.screen.renderOrder=1000;
    this.screen.frustumCulled=false;
    this.group.add(this.screen);
  }

  update(progress: number,camera: Camera,reducedMotion: boolean,aspect?: number) {
    const value=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;
    this.group.visible=value>0&&value<1;
    if (!this.group.visible) return;
    const perspective=camera as PerspectiveCamera;
    const ratio=aspect??perspective.aspect??1;
    const safeAspect=Number.isFinite(ratio)&&ratio>0?ratio:1;
    const fov=Number.isFinite(perspective.fov)?perspective.fov:53;
    const distance=1.5;
    const halfHeight=Math.tan(fov*Math.PI/360)*distance;
    camera.getWorldPosition(this.worldPosition);
    camera.getWorldDirection(this.direction);
    this.group.position.copy(this.worldPosition).addScaledVector(this.direction,distance);
    camera.getWorldQuaternion(this.group.quaternion);
    this.screen.scale.set(halfHeight*safeAspect*1.025,halfHeight*1.025,1);
    this.screen.material.uniforms.uProgress.value=value;
    this.screen.material.uniforms.uAspect.value=safeAspect;
    this.screen.material.uniforms.uReducedMotion.value=reducedMotion?1:0;
  }
}
