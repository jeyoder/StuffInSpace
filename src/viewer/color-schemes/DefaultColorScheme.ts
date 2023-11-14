import ColorScheme from './ColorScheme';

class DefaultColorScheme extends ColorScheme {
  constructor () {
    super ('Default color scheme', (satellite: Record<string, any>) => {
      let color = [1.0, 1.0, 0.0, 1.0];
      let pickable = false;

      if (satellite) {
        pickable = true;
        if (satellite.OBJECT_TYPE === 'PAYLOAD') {
          color = [1.0, 0.2, 0.0, 1.0];
        } else if (satellite.OBJECT_TYPE === 'ROCKET BODY') {
          color = [0.2, 0.5, 1.0, 0.85];
          //  return [0.6, 0.6, 0.6];
        } else if (satellite.OBJECT_TYPE === 'DEBRIS') {
          color = [0.5, 0.5, 0.5, 0.85];
        }
      }

      return {
        color,
        pickable
      };
    });
  }
}

export default DefaultColorScheme;