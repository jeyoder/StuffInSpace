import * as THREE from 'three';
import SceneComponent from './interfaces/SceneComponent';

type Mesh = THREE.Mesh;

class Sun implements SceneComponent {
  static deg2RadMult = (Math.PI / 180);

  lightSouce: THREE.Object3D | undefined;
  lightSourceGeometery: THREE.Object3D | undefined;
  hour = 0;

  degreesToReadians (degrees: number) {
    return degrees * Sun.deg2RadMult;
  }

  calculateSunLoc () {
    const distance = 25;

    // let time = DateTime.utc();

    // time = time.set({ hour: 18 });

    // adjust by 180, since left of texture is at 0
    const angle = ((this.hour / 24) * 360) + + 180;

    const point = {
      x: distance * Math.cos( this.degreesToReadians(angle) ),
      z: distance * Math.sin( this.degreesToReadians(angle) ),
    };

    // console.log('..', time.hour, 'angle: ', angle, point);

    return point;
  }

  init (scene: THREE.Scene) {
    this.calculateSunLoc();
    const sunLoc = this.calculateSunLoc();
    const coords = { x: sunLoc.x, y: 0, z: sunLoc.z};

    this.lightSouce = new THREE.PointLight(0xffffff, 2000);
    this.lightSouce.position.set(coords.x, coords.y, coords.z);
    scene.add(this.lightSouce);

    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    this.lightSourceGeometery = new THREE.Mesh( geometry );
    this.lightSourceGeometery.position.set(coords.x, coords.y, coords.z)
    scene.add( this.lightSourceGeometery );

    // setInterval(() => {
    //   this.hour += 0.1;
    //   // this.updateLightSource();
    // }, 50);
  }

  update(_scene?: THREE.Scene | undefined): void | Promise<void> {
    const sunLoc = this.calculateSunLoc();
    const coords = { x: sunLoc.x, y: 0, z: sunLoc.z};

    if (this.lightSouce && this.lightSourceGeometery) {
      this.lightSouce.position.set(coords.x, coords.y, coords.z);
      this.lightSourceGeometery.position.set(coords.x, coords.y, coords.z);
    }
  }
}

export default Sun;