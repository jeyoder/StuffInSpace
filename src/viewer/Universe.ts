import { ViewerContext } from './interfaces/ViewerContext';
import { TextureLoader } from '../utils/three';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteOrbitScene from './SatelliteOrbitScene';

class Universe implements SceneComponent {
  init (scene: SatelliteOrbitScene, context: ViewerContext) {
    const baseUrl = context.config.baseUrl;
    const texture = new TextureLoader().load(`${baseUrl}textures/example_render.jpg`);

    scene.background = texture;
  }

  update (): void  {
    // do nothing
  }
}

export default Universe;