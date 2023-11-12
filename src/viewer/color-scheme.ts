class ColorScheme {
  colorizer: any;
  schemeName: string;
  app: any;
  colorBuf: any;
  pickableBuf: any;

  constructor (colorizer: any, schemeName: string) {
    this.colorizer = colorizer;
    this.schemeName = schemeName;
    this.app = undefined;
  }

  calculateColorBuffers () {
    const { gl } = this.app;
    const { numSats } = this.app.satSet;
    const colorData = new Float32Array(numSats * 4);
    const pickableData = new Float32Array(numSats);

    for (let i = 0; i < numSats; i++) {
      const colors = this.colorizer(i);
      colorData[i * 4] = colors.color[0]; // R
      colorData[i * 4 + 1] = colors.color[1]; // G
      colorData[i * 4 + 2] = colors.color[2]; // B
      colorData[i * 4 + 3] = colors.color[3]; // A
      pickableData[i] = colors.pickable ? 1 : 0;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pickableBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pickableData, gl.STATIC_DRAW);

    return {
      colorBuf: this.colorBuf,
      pickableBuf: this.pickableBuf
    };
  }

  init (app: any) {
    this.app = app;

    const gl = app.gl as WebGL2RenderingContext;

    this.colorBuf = gl.createBuffer();
    this.pickableBuf = gl.createBuffer();

    if (this.colorizer) {
      this.colorizer = this.colorizer.bind(this, this.app);
    }
  }
}

const defaultColorScheme = new ColorScheme(((app: any, satId: number) => {
  const { satSet } = app;
  const sat = satSet.getSat(satId);
  let color = [1.0, 1.0, 0.0, 1.0];
  let pickable = false;

  if (sat) {
    pickable = true;
    if (sat.OBJECT_TYPE === 'PAYLOAD') {
      color = [1.0, 0.2, 0.0, 1.0];
    } else if (sat.OBJECT_TYPE === 'ROCKET BODY') {
      color = [0.2, 0.5, 1.0, 0.85];
      //  return [0.6, 0.6, 0.6];
    } else if (sat.OBJECT_TYPE === 'DEBRIS') {
      color = [0.5, 0.5, 0.5, 0.85];
    }
  }

  return {
    color,
    pickable
  };
}), 'default');

const apogeeColorScheme = new ColorScheme((app: any, satId: number) => {
  const { satSet } = app;
  const ap = satSet.getSat(satId).apogee;
  const gradientAmt = Math.min(ap / 45000, 1.0);
  return {
    color: [1.0 - gradientAmt, gradientAmt, 0.0, 1.0],
    pickable: true
  };
}, 'apogee');

const velocityColorScheme = new ColorScheme((app: any, satId: number) => {
  const { satSet } = app;
  const vel = satSet.getSat(satId).velocity;
  const gradientAmt = Math.min(vel / 15, 1.0);
  return {
    color: [1.0 - gradientAmt, gradientAmt, 0.0, 1.0],
    pickable: true
  };
}, 'velocity');

const groupColorScheme = new ColorScheme((app: any, satId: number) => {
  const { groups } = app;
  if (groups.selectedGroup.hasSat(satId)) {
    return {
      color: [1.0, 0.2, 0.0, 1.0],
      pickable: true
    };
  }
  return {
    color: [1.0, 1.0, 1.0, 0.1],
    pickable: false
  };
}, 'group');

function initColorSchemes (app: any) {
  apogeeColorScheme.init(app);
  velocityColorScheme.init(app);
  groupColorScheme.init(app);
  defaultColorScheme.init(app);
}

export default ColorScheme;
export {
  defaultColorScheme,
  apogeeColorScheme,
  velocityColorScheme,
  groupColorScheme,
  initColorSchemes
};
