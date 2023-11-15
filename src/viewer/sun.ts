import { DateTime } from 'luxon';
import { Object3D, SphereGeometry, PointLight, Mesh } from 'three';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteOrbitScene from './SatelliteOrbitScene';

class Sun implements SceneComponent {
  static deg2RadMult = (Math.PI / 180);

  lightSouce: Object3D | undefined;
  lightSourceGeometery: Object3D | undefined;
  hour = 0;

  degreesToReadians (degrees: number) {
    return degrees * Sun.deg2RadMult;
  }

  calculateSunLoc () {
    // This is a simple sun location calculator. Here until I get
    // original code back in
    const distance = 25;

    let hour = this.hour;
    // if we aren't overriding the hour, then calculate from actual time
    if (hour === undefined) {
      let time = DateTime.utc();

      time = time.set({ hour: 18 });
      hour = time.hour;
    }

    // adjust by 180, since left of texture is at 0
    const angle = ((hour / 24) * 360) + + 180;

    const point = {
      x: distance * Math.cos( this.degreesToReadians(angle) ),
      z: distance * Math.sin( this.degreesToReadians(angle) ),
    };

    return point;
  }

  init (scene: SatelliteOrbitScene) {
    this.calculateSunLoc();
    const sunLoc = this.calculateSunLoc();
    const coords = { x: sunLoc.x, y: 0, z: sunLoc.z};

    this.lightSouce = new PointLight(0xffffff, 2000);
    this.lightSouce.position.set(coords.x, coords.y, coords.z);
    scene.add(this.lightSouce);

    const geometry = new SphereGeometry(0.1, 32, 32);
    this.lightSourceGeometery = new Mesh( geometry );
    this.lightSourceGeometery.position.set(coords.x, coords.y, coords.z)
    scene.add( this.lightSourceGeometery );

    setInterval(() => {
      this.hour += 0.05;
    }, 100);
  }

  update(_scene?: SatelliteOrbitScene): void | Promise<void> {
    const sunLoc = this.calculateSunLoc();
    const coords = { x: sunLoc.x, y: 0, z: sunLoc.z};

    if (this.lightSouce && this.lightSourceGeometery) {
      this.lightSouce.position.set(coords.x, coords.y, coords.z);
      this.lightSourceGeometery.position.set(coords.x, coords.y, coords.z);
    }
  }
}

export default Sun;