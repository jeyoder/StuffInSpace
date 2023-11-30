import {
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  AdditiveBlending,
  TextureLoader,
  Color,
  ShaderMaterial,
  Object3D,
  PointsMaterial
} from '../utils/three';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteStore from './SatelliteStore';
import SatCruncherWorker from './workers/SatCruncherWorker?worker';
import logger from '../utils/logger';
import SatelliteOrbitScene from './SatelliteOrbitScene';
import ColorScheme from './color-schemes/ColorScheme';
import DefaultColorScheme from './color-schemes/DefaultColorScheme';
import SelectableSatellite from './interfaces/SelectableSatellite';
import ShaderStore from './ShaderStore';
import allPointCoords from '../AllPoints';

// type Mesh = Mesh;
class Satellites implements SceneComponent, SelectableSatellite {
  baseUrl = '';
  worker?: Worker;
  currentColorScheme?: ColorScheme = new DefaultColorScheme();
  numSats: number = 1;
  maxSize = 0;
  satPos: Float32Array = new Float32Array();
  satVel: Float32Array = new Float32Array();
  satAlt: Float32Array = new Float32Array();
  satelliteColors: number[] = [];
  cruncherReady = false;
  scene?: SatelliteOrbitScene;
  particles?: Points;
  geometry?: BufferGeometry;
  satelliteStore?: SatelliteStore;
  shaderStore?: ShaderStore;
  selectedSatelliteIndexes: number[] = [];

  hoverSatelliteIdx = -1;

  setColorScheme (colorScheme: ColorScheme) {
    this.currentColorScheme = colorScheme;
  }


  debugRaycastSelection () {
    if (!this.satelliteStore) {
      return;
    }

    if (this.satelliteColors.length === 0 && this.satelliteStore.satData.length > 0) {
      this.satelliteColors = new Array(this.satelliteStore.satData.length * 4);
      this.satelliteColors.fill(1, 0, this.satelliteColors.length);
      if (this.geometry) {
        this.geometry.setAttribute('color', new Float32BufferAttribute(this.satelliteColors as any, 4 ) );
      }
    }

    if (this.selectedSatelliteIndexes.length  > 0 && this.geometry) {
      for (let i = 0; i < this.selectedSatelliteIndexes.length; i++) {
        const idx = this.selectedSatelliteIndexes[i] * 4;
        this.satelliteColors[idx] = 1;
        this.satelliteColors[idx + 1] = 0;
        this.satelliteColors[idx + 2] = 0;
        this.satelliteColors[idx + 3] = 1;
      }

      this.geometry.setAttribute('color', new Float32BufferAttribute(this.satelliteColors as any, 4 ) );
    }
  }

  updateSatellites () {
    if (!this.satelliteStore) {
      return;
    }

    if (this.satPos && this.satPos.length > 0) {
      if (this.geometry && this.geometry.attributes) {
        if (!this.satelliteStore) {
          return;
        }

        // const satPos = allPointCoords as number[];
        const satPos = this.satPos;
        const satellites = this.satelliteStore.satData;
        const satCount = satellites.length;

        // update satellite positions
        if (this.geometry.attributes.position) {
          this.geometry.setAttribute('position', new Float32BufferAttribute(satPos, 3 ) );
        }

        // update point colours
        if (this.geometry.attributes.color && this.currentColorScheme) {
          // Adjust if the satellite count adjusts
          if (this.satelliteColors.length === 0 || (satCount * 4 !== this.satelliteColors.length)) {
            this.satelliteColors = new Array(this.satelliteStore.satData.length * 4);
            this.satelliteColors.fill(1, 0, this.satelliteColors.length);
          }

          for (let i = 0; i < satellites.length; i++) {
            const color = this.currentColorScheme?.getSatelliteColor(satellites[i])?.color || [0, 0, 0];
            const idx = i * 4;
            this.satelliteColors[idx] = color[0];
            this.satelliteColors[idx + 1] = color[1];
            this.satelliteColors[idx + 2] = color[2];
            this.satelliteColors[idx + 3] = color[3];
          }
          this.geometry.setAttribute('color', new Float32BufferAttribute(this.satelliteColors, 4));
        }
      }
    }

    this.debugRaycastSelection();
  }

  onMessage (message: any) {
    if (!this.satelliteStore) {
      return;
    }

    const satData = this.satelliteStore.getSatData();
    if (!satData) {
      return;
    }

    let satExtraData: Record<string, any>[];

    try {
      if (!this.satelliteStore.gotExtraData) { // store extra data that comes from crunching
        const start = performance.now();

        if (message.data.extraData) {
          satExtraData = JSON.parse(message.data.extraData);

          if (!satExtraData) {
            return;
          }

          for (let i = 0; i < this.numSats; i++) {
            satData[i].inclination = satExtraData[i].inclination;
            satData[i].eccentricity = satExtraData[i].eccentricity;
            satData[i].raan = satExtraData[i].raan;
            satData[i].argPe = satExtraData[i].argPe;
            satData[i].meanMotion = satExtraData[i].meanMotion;

            satData[i].semiMajorAxis = satExtraData[i].semiMajorAxis;
            satData[i].semiMinorAxis = satExtraData[i].semiMinorAxis;
            satData[i].apogee = satExtraData[i].apogee;
            satData[i].perigee = satExtraData[i].perigee;
            satData[i].period = satExtraData[i].period;
          }

          this.satelliteStore.setSatelliteData(satData);

          logger.debug(`sat.js copied extra data in ${performance.now() - start} ms`);
          this.satelliteStore.setSatelliteData(satData, true);
          return;
        }
      }

      this.satPos = new Float32Array(message.data.satPos);
      this.satVel = new Float32Array(message.data.satVel);
      this.satAlt = new Float32Array(message.data.satAlt);

      console.log('got coords', this.satPos.length);
      this.satelliteStore.setPositionalData(
        this.satVel, this.satPos, this.satAlt
      );

      if (!this.cruncherReady) {
        document.querySelector('#load-cover')?.classList.add('hidden');
        this.cruncherReady = true;

        // this.eventManager.fireEvent(Events.cruncherReady, { satData: satData });
      }
      this.updateSatellites();
    } catch (error) {
      logger.debug('Error in worker response', error);
      logger.debug('worker message', message);
    }
  }

  onSatDataLoaded () {
    if (!this.satelliteStore) {
      return;
    }

    if (this.worker) {
      const satDataString = JSON.stringify(this.satelliteStore.satData);

      logger.debug('Sending data to sat cruncher worker, to perform work');
      this.worker.postMessage(satDataString);
    } else {
      logger.error('worker is not available');
    }
  }

  setSelectedSatellites (satelliteIndexes: number[]) {
    logger.debug('Updated selected satellite count')
    this.selectedSatelliteIndexes = satelliteIndexes;
    this.updateSatellites();
  }

  setSelectedSatellite (satelliteIdx: number) {
    this.setSelectedSatellites([satelliteIdx]);
  }

  setHoverSatellite (satelliteIdx: number) {
    this.hoverSatelliteIdx = satelliteIdx;
    this.updateSatellites();
  }

  private initGeometry () {
    if (!this.satelliteStore) {
      throw new Error('satelliteStore is not available');
    }

    if (!this.shaderStore) {
      throw new Error('sahderStore is not available');
    }

    const geometry = new BufferGeometry();
    const vertices: Float32Array = new Float32Array();
    const sizes: Float32Array = new Float32Array();
    const colors: number[] = new Array(this.satelliteStore.satData.length * 4);

    vertices.fill(0, 0, this.satelliteStore.satData.length * 3);
    colors.fill(0, 0, this.satelliteStore.satData.length * 3);
    sizes.fill(10, 0, this.satelliteStore.satData.length);

    geometry.setAttribute('position', new Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('color', new Float32BufferAttribute( colors, 4 ) );
    geometry.setAttribute('size', new Float32BufferAttribute( sizes, 1 ) );

    const texture = new TextureLoader().load(`${this.baseUrl}/images/circle.png`);
    const shader = this.shaderStore.getShader('dot2');

    const material = new PointsMaterial ({
      color: 'grey',
      size: 3,
      sizeAttenuation: false,
      vertexColors: true,
      blending: AdditiveBlending,
      depthTest: true
    });

    // const material = new ShaderMaterial({
    //   uniforms: {
    //     color: { value: new Color( 0xffffff ) },
    //     pointTexture: { value: texture }
    //   },
    //   clipping: true,
    //   vertexShader: shader.vertex,
    //   fragmentShader: shader.fragment,
    //   blending: AdditiveBlending,
    //   depthTest: true,
    //   transparent: true
    // });

    this.geometry = geometry;
    this.particles = new Points( geometry, material );

    if (this.scene) {
      this.scene.add( this.particles );
    }
  }

  initGeometry2 () {
    const geometry = new BufferGeometry();
    const vertices: Float32Array = new Float32Array(allPointCoords as number[]);
    const sizes: Float32Array = new Float32Array();

    const pointCount = allPointCoords.length / 3;

    const colors = Array.from({ length: pointCount * 3 });
    vertices.fill(0, 0, pointCount);
    colors.fill(1, 0, pointCount * 3);
    sizes.fill(10, 0, pointCount);

    // for (let i = 0; i < pointCount; i++) {
    //   const idx = i * 3;
    //   this.colors[idx] = 1;
    //   this.colors[idx + 1] = 1;
    //   this.colors[idx + 2] = 1;
    // }

    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));

    const material = new PointsMaterial ({
      color: 'grey',
      size: 3,
      sizeAttenuation: false,
      vertexColors: true,
      blending: AdditiveBlending,
      depthTest: true
    });

    this.geometry = geometry;
    this.particles = new Points( geometry, material );
    if (this.scene) {
      this.scene.add(this.particles);
    }
  }

  getObject3D (): Object3D | undefined {
    return this.particles;
  }

  initSatWorker (config: Record<string, any> = {}) {
    logger.info('Kicking off sat-cruncher-worker');
    this.worker = new SatCruncherWorker();
    this.worker.onmessage = this.onMessage.bind(this);
    this.worker.postMessage(JSON.stringify({
      config
    }));
  }

  async init (scene: SatelliteOrbitScene, context: Record<string, any>) {
    this.satelliteStore = context.satelliteStore;
    this.shaderStore = context.shaderStore;
    this.scene = scene;

    const config = context.config || {};
    let satWorkerConfig: Record<string, any> = {};
    if (config.satWorker) {
      satWorkerConfig = config.satWorker;
    }

    this.initSatWorker(satWorkerConfig);

    if (context?.config) {
      this.baseUrl = context.config.baseUrl;
    }

    if (!this.satelliteStore) {
      return;
    }

    this.satelliteStore.addEventListener('satdataloaded', this.onSatDataLoaded.bind(this));
    await this.satelliteStore.loadSatelliteData();

    this.initGeometry();

    if (this.satelliteStore.gotExtraData) {
      this.updateSatellites();
    }
  }

  update (): void {
    // do nothing for now
  }
}

export default Satellites;