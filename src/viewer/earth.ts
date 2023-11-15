import { Color, TextureLoader, MeshPhongMaterial, SphereGeometry, Mesh, Group } from 'three';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteOrbitScene from './SatelliteOrbitScene';

class Earth implements SceneComponent {
  basePath = '/StuffInSpace/images';
  radiusInKm = 6371.0;
  pxToRadius = 3185.5;

  sphere: Mesh | undefined = undefined;
  group: Group | undefined = undefined;


  init (scene: SatelliteOrbitScene) {
    const dayTexture = new TextureLoader().load(`${this.basePath}/earth-blue-marble.jpg`);
    const nightTexture = new TextureLoader().load(`${this.basePath}/nightearth-4096.png`);
    const bumpTexture = new TextureLoader().load(`${this.basePath}/earth-topology.png`);
    const earthSpecularMap = new TextureLoader().load(`${this.basePath}/earth-water.png`);

    const dayMaterial = new MeshPhongMaterial({
      map: dayTexture,
      bumpMap: bumpTexture,
      emissiveMap: nightTexture,
      emissive: new Color(0x888888),
      emissiveIntensity: 5,
      specularMap: earthSpecularMap,
      specular: 1,
      shininess: 15,
      bumpScale: 1
    });

    const radius = scene.km2pixels(this.radiusInKm);
    const geometry = new SphereGeometry(radius, 32, 32);
    this.sphere = new Mesh( geometry, dayMaterial );
    scene.add(this.sphere);
  }

  update(_scene?: SatelliteOrbitScene | undefined): void | Promise<void> {
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