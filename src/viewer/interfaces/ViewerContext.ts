import type SatelliteGroups from '../SatelliteGroups';
import type SatelliteStore from '../SatelliteStore';
import type ShaderStore from '../ShaderStore';


export interface ViewerContext {
  satelliteGroups: SatelliteGroups;
  config: Record<string, any>;
  satelliteStore: SatelliteStore;
  shaderStore: ShaderStore;
}
