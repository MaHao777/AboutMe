import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';

export class Spaceship {
  readonly group = new Group();
  private flames: Mesh[] = [];

  constructor() {
    const hull = new MeshStandardMaterial({ color: '#b6c7d4', metalness: .65, roughness: .38 });
    const dark = new MeshStandardMaterial({ color: '#263947', metalness: .6, roughness: .4 });
    const glass = new MeshStandardMaterial({ color: '#8ce3f5', emissive: '#32748a', emissiveIntensity: .6, metalness: .7, roughness: .18 });
    const body = new Mesh(new ConeGeometry(.7, 3.7, 6), hull);
    body.rotation.x = -Math.PI / 2;
    this.group.add(body);
    const canopy = new Mesh(new BoxGeometry(.65, .32, 1.15), glass);
    canopy.position.set(0, .48, -.55); this.group.add(canopy);
    for (const side of [-1, 1]) {
      const wing = new Mesh(new ConeGeometry(.8, 2.8, 3), hull);
      wing.rotation.set(-Math.PI / 2, 0, side * -.23);
      wing.scale.set(1.05, 1, .17); wing.position.set(side * .9, -.12, .65);
      this.group.add(wing);
      const engine = new Mesh(new CylinderGeometry(.22, .3, 1.45, 12), dark);
      engine.rotation.x = Math.PI / 2; engine.position.set(side * .92, -.1, 1.05);
      this.group.add(engine);
      const flame = new Mesh(new ConeGeometry(.2, 1.1, 12), new MeshBasicMaterial({ color: '#96eaff', transparent: true, opacity: .85 }));
      flame.rotation.x = Math.PI / 2; flame.position.set(side * .92, -.1, 2.2);
      this.flames.push(flame); this.group.add(flame);
    }
  }

  update(distance: number, velocity: number, time: number, reducedMotion: boolean) {
    this.group.position.z = -distance;
    const speed = Math.abs(velocity) / 48;
    this.group.position.y = reducedMotion ? 0 : Math.sin(time * 1.3) * .045;
    this.group.rotation.z = reducedMotion ? 0 : Math.sin(time * 1.1) * .012 * speed;
    this.group.rotation.x = -velocity * .0009;
    this.flames.forEach((flame, index) => {
      flame.scale.y = .25 + speed * 1.8 + (reducedMotion ? 0 : Math.sin(time * 25 + index) * .035);
    });
  }
}
