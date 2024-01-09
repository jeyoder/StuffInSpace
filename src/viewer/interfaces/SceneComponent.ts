import { ViewerContext } from '..';
import SatelliteOrbitScene from '../SatelliteOrbitScene';

interface SceneComponent {
  init (scene: SatelliteOrbitScene, context: ViewerContext): void | Promise<void>;
  update (scene?: SatelliteOrbitScene): void;
}

export default SceneComponent;