import { TextureLoader } from '../utils/three';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteOrbitScene from './SatelliteOrbitScene';

class Universe implements SceneComponent {
  init (scene: SatelliteOrbitScene, context: Record<string, any>) {
    const baseUrl = context.config.baseUrl;
    const texture = new TextureLoader().load(`${baseUrl}textures/example_render.jpg`);

    scene.background = texture;
  }

  update (): void  {
    // do nothing
  }
}

export default Universe;