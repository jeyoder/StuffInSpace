import SatelliteGroup from '@satellite-viewer/SatelliteGroup';
import ColorScheme from './ColorScheme';

class GroupColorScheme extends ColorScheme {
  constructor () {
    super ('Group color scheme', (satellite: Record<string, any>, group?: SatelliteGroup) => {
      if (satellite) {
        if (group && group.hasSat(satellite.id)) {
          return {
            color: [1.0, 0.2, 0.0, 1.0],
            pickable: true
          };
        }
      }

      return {
        color: [1.0, 1.0, 1.0, 0.2],
        pickable: true
      };
    });
  }
}

export default GroupColorScheme;