class ColorScheme {
  name: string;
  colorizer: (satelliteId: number) => void

  constructor (name: string, colorizer: (satelliteId: number) => void) {
    this.name = name;
    this.colorizer = colorizer;
  }

  colorize (satelliteId: number) {
    this.colorizer(satelliteId);
  }
}

export default ColorScheme;