// import THREE, { Object3D } from "three";
import * as THREE from 'three';
// import { DateTime } from 'luxon';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteOrbitScene from './SatelliteOrbitScene';

// type Mesh = THREE.Mesh;

class Earth implements SceneComponent {
  basePath = '/StuffInSpace/images';
  radiusInKm = 6371.0;
  pxToRadius = 3185.5;

  sphere: THREE.Mesh | undefined = undefined;
  group: THREE.Group | undefined = undefined;


  init (scene: SatelliteOrbitScene) {
    const dayTexture = new THREE.TextureLoader().load(`${this.basePath}/earth-blue-marble.jpg`);
    const nightTexture = new THREE.TextureLoader().load(`${this.basePath}/nightearth-4096.png`);
    const bumpTexture = new THREE.TextureLoader().load(`${this.basePath}/earth-topology.png`);
    const earthSpecularMap = new THREE.TextureLoader().load(`${this.basePath}/earth-water.png`);

    const dayMaterial = new THREE.MeshPhongMaterial({
      map: dayTexture,
      bumpMap: bumpTexture,
      emissiveMap: nightTexture,
      emissive: new THREE.Color(0x888888),
      emissiveIntensity: 5,
      specularMap: earthSpecularMap,
      specular: 1,
      shininess: 15,
      bumpScale: 1
    });

    const radius = scene.km2pixels(this.radiusInKm);
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    this.sphere = new THREE.Mesh( geometry, dayMaterial );
    scene.add(this.sphere);
  }

  update(_scene?: THREE.Scene | undefined): void | Promise<void> {
    if (this.sphere) {
    //  this.sphere.rotation.y += 0.005;
    //  this.
    }
  }

  getMesh () {
    return this.sphere;
  }
}

export default Earth;