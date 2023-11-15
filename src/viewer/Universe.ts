import { TextureLoader } from 'three';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteOrbitScene from './SatelliteOrbitScene';

class Universe implements SceneComponent {
  init (scene: SatelliteOrbitScene) {
    const texture = new TextureLoader().load('textures/example_render.jpg');

    scene.background = texture;
  }

  update(_scene?: SatelliteOrbitScene): void | Promise<void> {
    // do nothing
  }
}

export default Universe;