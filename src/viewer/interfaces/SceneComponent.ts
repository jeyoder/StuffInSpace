import SatelliteOrbitScene from '../SatelliteOrbitScene';

interface SceneComponent {
  init (scene: SatelliteOrbitScene): void | Promise<void>;
  update (scene?: SatelliteOrbitScene): void | Promise<void>;
}

export default SceneComponent;