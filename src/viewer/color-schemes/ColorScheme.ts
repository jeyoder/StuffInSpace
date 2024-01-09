import SatelliteGroup from '../SatelliteGroup';
import { SatelliteObject } from '../interfaces/SatelliteObject';

class ColorScheme {
  name: string;
  colorizer: (satellite: SatelliteObject, group?: SatelliteGroup) => { color: number[], pickable: boolean };

  constructor (name: string, colorizer: (satellite: SatelliteObject) => { color: number[], pickable: boolean }) {
    this.name = name;
    this.colorizer = colorizer;
  }

  getSatelliteColor (satellite: SatelliteObject, group?: SatelliteGroup): { color: number[], pickable: boolean } {
    return this.colorizer(satellite, group);
  }
}

export default ColorScheme;