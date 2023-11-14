class ColorScheme {
  name: string;
  colorizer: (satellite: Record<string, any>) => { color: number[], pickable: boolean };

  constructor (name: string, colorizer: (satellite: Record<string, any>) => { color: number[], pickable: boolean }) {
    this.name = name;
    this.colorizer = colorizer;
  }

  getSatelliteColor (satellite: Record<string, any>): { color: number[], pickable: boolean } {
    return this.colorizer(satellite);
  }
}

export default ColorScheme;