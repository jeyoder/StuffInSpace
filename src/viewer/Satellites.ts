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
  cruncherReady = false;
  scene?: SatelliteOrbitScene;
  particles?: Points;
  geometry?: BufferGeometry;
  satelliteStore?: SatelliteStore;
  shaderStore?: ShaderStore;
  selectedSatelliteIdx = -1;
  hoverSatelliteIdx = -1;

  setColorScheme (colorScheme: ColorScheme) {
    this.currentColorScheme = colorScheme;
  }

  updateSatellites () {
    if (this.satPos && this.satPos.length > 0) {
      if (this.geometry && this.geometry.attributes) {
        // update satellite positions
        if (this.geometry.attributes.position) {
          this.geometry.setAttribute('position', new Float32BufferAttribute( this.satPos, 3 ) );
        }

        // update point colours
        if (this.geometry.attributes.color && this.currentColorScheme) {
          const colors: number[] = [];
          if (!this.satelliteStore) {
            return;
          }
          const satellites = this.satelliteStore.satData;
          for (let i = 0; i < satellites.length; i++) {
            const color = this.currentColorScheme?.getSatelliteColor(satellites[i])?.color || [0, 0, 0];
            // colors.push(color[0], color[1], color[2]);
            colors.push(color[0], color[1], color[2], color[3]);
          }
          this.geometry.setAttribute('color', new Float32BufferAttribute( colors, 4 ) );
        }
      }
    }
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

      // console.log(JSON.stringify(this.satPos));
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

  setSelectedSatellite (satelliteIdx: number) {
    this.selectedSatelliteIdx = satelliteIdx;
  }

  setHoverSatellite (satelliteIdx: number) {
    this.hoverSatelliteIdx = satelliteIdx;
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
    const colors: number[] = [];

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

  getObject3D (): Object3D | undefined {
    return this.particles;
  }

  async init (scene: SatelliteOrbitScene, context: Record<string, any>) {
    this.satelliteStore = context.satelliteStore;
    this.shaderStore = context.shaderStore;
    this.scene = scene;
    logger.info('Kicking off sat-cruncher-worker');
    this.worker = new SatCruncherWorker();
    this.worker.onmessage = this.onMessage.bind(this);

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