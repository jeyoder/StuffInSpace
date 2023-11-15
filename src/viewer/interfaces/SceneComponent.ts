import SatelliteOrbitScene from '../SatelliteOrbitScene';

interface SceneComponent {
  init (scene: SatelliteOrbitScene, context: Record<string, any>): void | Promise<void>;
  update (scene?: SatelliteOrbitScene): void;
}

export default SceneComponent;