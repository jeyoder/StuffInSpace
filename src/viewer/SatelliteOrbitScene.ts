import { Scene } from '../utils/three';

class SatelliteOrbitScene extends Scene {
  static earthRadiusInKm = 6371;
  pxToRadius = 3185.5;

  constructor () {
    super();
  }

  setPixels2Radius (pixelCount: number) {
    this.pxToRadius = pixelCount;
  }

  getPixels2Radius (): number {
    return this.pxToRadius;
  }

  km2pixels (distanceInKm:  number): number {
    return distanceInKm / this.pxToRadius;
  }

  alitudeToPixels (altitudeInKm:  number): number {
    return (SatelliteOrbitScene.earthRadiusInKm + altitudeInKm) / this.pxToRadius;
  }
}

export default SatelliteOrbitScene;