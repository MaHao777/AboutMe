import {
  AdditiveBlending, BufferGeometry, CircleGeometry, Color, CylinderGeometry, DoubleSide,
  ExtrudeGeometry, Float32BufferAttribute, Group, LatheGeometry, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, ShaderMaterial, Shape, SphereGeometry, TorusGeometry, Vector2,
} from 'three';

/** A compact twin-drive survey craft. The bow points along the negative Z axis. */
export class Spaceship {
  readonly group = new Group();
  private plumes: Mesh<BufferGeometry, ShaderMaterial>[] = [];
  private driveMaterials: MeshBasicMaterial[] = [];

  constructor() {
    const pearl = new MeshStandardMaterial({ color: '#d1d9de', metalness: .55, roughness: .32 });
    const titanium = new MeshStandardMaterial({ color: '#60717f', metalness: .72, roughness: .35 });
    const carbon = new MeshStandardMaterial({ color: '#10222d', metalness: .5, roughness: .43 });
    const seam = new MeshStandardMaterial({ color: '#263b49', metalness: .62, roughness: .38 });
    const glass = new MeshStandardMaterial({ color: '#071c2b', emissive: '#1a7185', emissiveIntensity: .12, metalness: .73, roughness: .12 });

    // Elliptical sections give the continuous hull a full curved shoulder and a
    // shallow underside. A shared ring topology keeps every highlight smooth.
    const hull = new Mesh(surveyHull(), pearl);
    this.group.add(hull);
    const belly = new Mesh(new SphereGeometry(1, 40, 24), carbon);
    belly.scale.set(.47, .18, 1.23); belly.position.set(0, -.14, -.08);
    this.group.add(belly);

    const canopy = new Mesh(new SphereGeometry(1, 48, 32), glass);
    canopy.scale.set(.335, .245, .91); canopy.position.set(0, .255, -.66);
    this.group.add(canopy);
    const canopyRim = new Mesh(new TorusGeometry(1, .016, 6, 64), titanium);
    canopyRim.rotation.x = Math.PI / 2; canopyRim.scale.set(.36, .93, 1);
    canopyRim.position.set(0, .285, -.66); this.group.add(canopyRim);

    // The swept lifting surfaces are shallow, bevelled solids rather than
    // intersecting cones. The dark inset leaves a clean pale leading edge.
    for (const side of [-1, 1]) {
      this.group.add(sweptPanel(side, pearl, .065, .04));
      const inset = sweptPanel(side, seam, .019, .015);
      inset.scale.set(.83, 1, .78); inset.position.set(side * .13, .045, .17);
      this.group.add(inset);

      const boom = new Mesh(new SphereGeometry(1, 32, 20), titanium);
      boom.scale.set(.19, .15, 1.17); boom.position.set(side * 1.07, -.02, .28);
      this.group.add(boom);
      const pod = new Mesh(new LatheGeometry([
        new Vector2(.035, -1.12), new Vector2(.12, -.98),
        new Vector2(.205, -.77), new Vector2(.235, -.48),
        new Vector2(.235, .62), new Vector2(.265, .85), new Vector2(.265, 1),
      ], 40), pearl);
      pod.rotation.x = Math.PI / 2; pod.position.set(side * 1.07, -.035, .37);
      this.group.add(pod);

      const collar = new Mesh(new CylinderGeometry(.275, .25, .19, 40), titanium);
      collar.rotation.x = Math.PI / 2; collar.position.set(side * 1.07, -.035, 1.41);
      this.group.add(collar);
      const nozzle = new Mesh(new CylinderGeometry(.211, .23, .16, 40, 1, true), carbon);
      nozzle.rotation.x = Math.PI / 2; nozzle.position.set(side * 1.07, -.035, 1.5);
      this.group.add(nozzle);
      const aperture = new Mesh(new CircleGeometry(.19, 40), new MeshBasicMaterial({ color: '#23495d' }));
      aperture.position.set(side * 1.07, -.035, 1.54); this.group.add(aperture);
      const rim = new Mesh(new TorusGeometry(.215, .021, 8, 40), titanium);
      rim.position.set(side * 1.07, -.035, 1.58); this.group.add(rim);
      const coreMaterial = new MeshBasicMaterial({ color: '#9fe9ff', toneMapped: false });
      this.driveMaterials.push(coreMaterial);
      const core = new Mesh(new CircleGeometry(.115, 32), coreMaterial);
      core.position.set(side * 1.07, -.035, 1.548); this.group.add(core);
      const driveRing = new Mesh(new TorusGeometry(.155, .009, 6, 40), new MeshBasicMaterial({ color: '#67d2f4', toneMapped: false }));
      driveRing.position.set(side * 1.07, -.035, 1.553); this.group.add(driveRing);

      const plasmaMaterial = new ShaderMaterial({
        uniforms: { throttle: { value: .15 }, tint: { value: new Color('#71d6ff') } },
        vertexShader: `varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform float throttle; uniform vec3 tint;
          void main() {
            float tail = pow(max(0.0, 1.0 - vUv.y), 2.0);
            float width = .15 + vUv.y * .08;
            float shaft = exp(-pow((vUv.x - .5) / width, 2.0) * 2.5);
            float tip = smoothstep(0.0, .045, vUv.y);
            vec3 color = mix(vec3(.77, .95, 1.0), tint, vUv.y);
            gl_FragColor = vec4(color * (1.15 + throttle), shaft * tail * tip * (.24 + throttle * .5));
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        transparent: true, blending: AdditiveBlending, side: DoubleSide,
        depthWrite: false, toneMapped: false,
      });
      const drive = new Group(); drive.position.set(side * 1.07, -.035, 1.56);
      for (const angle of [0, Math.PI / 2]) {
        const plume = new Mesh(plumeGeometry(), plasmaMaterial);
        plume.rotation.z = angle; drive.add(plume); this.plumes.push(plume);
      }
      this.group.add(drive);

      const navLight = new Mesh(new SphereGeometry(.036, 12, 8), new MeshBasicMaterial({ color: side < 0 ? '#e6b27a' : '#7dd4df', toneMapped: false }));
      navLight.position.set(side * 1.5, .046, .74); this.group.add(navLight);
      // One recessed service stripe on each nacelle supplies scale without
      // covering the craft in ornamental lines.
      const stripe = new Mesh(new CylinderGeometry(.237, .237, .035, 40), seam);
      stripe.rotation.x = Math.PI / 2; stripe.position.set(side * 1.07, -.035, .6);
      this.group.add(stripe);
    }

    const stern = new Mesh(new ExtrudeGeometry(new Shape([
      new Vector2(-.34, -.5), new Vector2(.34, -.5),
      new Vector2(.25, .32), new Vector2(-.25, .32),
    ]), { depth: .08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .035, bevelThickness: .035 }), carbon);
    stern.rotation.x = Math.PI / 2; stern.position.set(0, .13, .88);
    this.group.add(stern);
    const sensor = new Mesh(new SphereGeometry(.085, 20, 12), glass);
    sensor.scale.set(1, .55, 1.35); sensor.position.set(0, .13, -2.01);
    this.group.add(sensor);
  }

  update(distance: number, velocity: number, time: number, reducedMotion: boolean) {
    this.group.position.z = -distance;
    const speed = Math.min(1, Math.abs(velocity) / 48);
    this.group.position.y = reducedMotion ? 0 : Math.sin(time * 1.1) * .025;
    this.group.rotation.z = reducedMotion ? 0 : Math.sin(time * .8) * .009 * speed;
    this.group.rotation.x = -velocity * .00065;
    for (const plume of this.plumes) {
      plume.scale.z = .23 + speed * 1.35;
      plume.material.uniforms.throttle.value = .1 + speed * .85;
    }
    this.driveMaterials.forEach((material) => material.color.setRGB(.33 + speed * .35, .66 + speed * .25, .85 + speed * .15));
  }
}

function surveyHull() {
  const sections = [
    [-2.2, .018, .028, -.018], [-1.94, .16, .09, .005],
    [-1.48, .35, .16, .025], [-.82, .51, .235, .035],
    [-.04, .57, .25, .015], [.63, .49, .2, -.005],
    [1.14, .34, .15, -.015], [1.33, .26, .11, -.015],
  ];
  const count = 40, positions: number[] = [], indices: number[] = [];
  sections.forEach(([z, width, height, center]) => {
    for (let i = 0; i <= count; i++) {
      const angle = i / count * Math.PI * 2;
      positions.push(Math.cos(angle) * width, center + Math.sin(angle) * height, z);
    }
  });
  for (let ring = 0; ring < sections.length - 1; ring++) {
    for (let i = 0; i < count; i++) {
      const a = ring * (count + 1) + i, b = a + count + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  // Front and aft are capped so the body also reads as a finished volume below.
  for (let i = 1; i < count - 1; i++) {
    indices.push(0, i + 1, i);
    const start = (sections.length - 1) * (count + 1);
    indices.push(start, start + i, start + i + 1);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

function sweptPanel(side: number, material: MeshStandardMaterial, depth: number, bevel: number) {
  const shape = new Shape();
  shape.moveTo(side * .35, -.86);
  shape.lineTo(side * 1.53, .65);
  shape.quadraticCurveTo(side * 1.56, .77, side * 1.43, .88);
  shape.lineTo(side * .6, 1.23);
  shape.lineTo(side * .38, .57); shape.closePath();
  const mesh = new Mesh(new ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: bevel, bevelThickness: bevel,
  }), material);
  mesh.rotation.x = Math.PI / 2; mesh.position.y = -.035;
  return mesh;
}

function plumeGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([-.35, 0, 0, .35, 0, 0, -.35, 0, 1.8, .35, 0, 1.8], 3));
  geometry.setAttribute('uv', new Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
  geometry.setIndex([0, 1, 2, 2, 1, 3]);
  return geometry;
}
