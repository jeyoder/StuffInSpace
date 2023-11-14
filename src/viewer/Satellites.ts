// import THREE, { Object3D } from "three";
import * as THREE from 'three';
import axios from 'axios';
import SceneComponent from './interfaces/SceneComponent';
import config from '../config';
import satelliteStore from './SatelliteStore';
import SatCruncherWorker from './workers/SatCruncherWorker?worker';
import logger from '../utils/logger';
import SatelliteOrbitScene from './SatelliteOrbitScene';
import ColorScheme from './color-schemes/ColorScheme';
import DefaultColorScheme from './color-schemes/DefaultColorScheme';

// type Mesh = THREE.Mesh;
class Satellites implements SceneComponent{
  tleUrl = `${config.baseUrl}/data/TLE.json`;
  worker?: Worker;
  currentColorScheme?: ColorScheme = new DefaultColorScheme();
  numSats: number = 1;
  size = 0;
  maxSize = 0;
  satPos: Float32Array = new Float32Array();
  satVel: Float32Array = new Float32Array();
  satAlt: Float32Array = new Float32Array();
  cruncherReady = false;
  satDataString?: string;
  scene?: SatelliteOrbitScene;
  particles?: THREE.Points;
  geometry?: THREE.BufferGeometry;

  setColorScheme (colorScheme: ColorScheme) {
    this.currentColorScheme = colorScheme;
  }

  updateSatellites () {
    if (this.satPos && this.satPos.length > 0) {
      if (this.geometry && this.geometry.attributes) {
        // update satellite positions
        if (this.geometry.attributes.position) {
          this.geometry.setAttribute('position', new THREE.Float32BufferAttribute( this.satPos, 3 ) );
        }

        // update point colours
        if (this.geometry.attributes.color && this.currentColorScheme) {
          let colors: number[] = [];
          const satellites = satelliteStore.satData;
          for (let i = 0; i < satellites.length; i++) {
            const color = this.currentColorScheme?.getSatelliteColor(satellites[i])?.color || [0, 0, 0];
            colors.push(color[0], color[1], color[2])
          }
          this.geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ) );
        }
      }
    }
  }

  onMessage (message: any) {
    let satData = satelliteStore.getSatData();
    if (!satData) {
      return;
    }

    let satExtraData: Record<string, any>[];

    try {
      if (!satelliteStore.gotExtraData) { // store extra data that comes from crunching
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

          satelliteStore.setSatelliteData(satData);

          logger.debug(`sat.js copied extra data in ${performance.now() - start} ms`);
          satelliteStore.setSatelliteData(satData, true);
          return;
        }
      }

      this.satPos = new Float32Array(message.data.satPos);
      this.satVel = new Float32Array(message.data.satVel);
      this.satAlt = new Float32Array(message.data.satAlt);

      satelliteStore.setPositionalData(
        this.satVel, this.satPos, this.satAlt
      )

      if (!this.cruncherReady) {
        document.querySelector('#load-cover')?.classList.add('hidden');
        // this.setColorScheme(this.currentColorScheme); // force color recalc
        this.cruncherReady = true;

        // this.eventManager.fireEvent(Events.cruncherReady, { satData: satData });
      }
      this.updateSatellites();
    } catch (error) {
      logger.debug('Error in worker response', error);
      logger.debug('worker message', message);
    }
  }

  async loadSatelliteData () {
    if (this.worker) {
      logger.debug('Loading satellite data');
      const response = await axios.get(this.tleUrl, {
        params: {
          t: Date.now()
        }
      });

      logger.debug('Satellite data received');
      const satData = response.data;
      this.size = satData.length;
      satelliteStore.setSatelliteData(satData);

      const satDataString = JSON.stringify(satData);

      logger.debug('Sending data to sat cruncher worker, to perform work');
      this.worker.postMessage(satDataString);
    } else {
      logger.error('worker is not available');
    }
  }

  async init (scene: SatelliteOrbitScene) {
    this.scene = scene;
    logger.info('Kicking off sat-cruncher-worker');
    this.worker = new SatCruncherWorker();
    this.worker.onmessage = this.onMessage.bind(this);
    await this.loadSatelliteData();

    const geometry = new THREE.BufferGeometry();
    let vertices: Float32Array = new Float32Array();
    let colors: number[] = [];

    vertices.fill(0, 0, satelliteStore.satData.length * 3);
    colors.fill(0, 0, satelliteStore.satData.length * 3);

    // for (let i = 0; i < satelliteStore.satData.length; i++) {
    //   colors.push(0, 0, 0);
    // }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    const material= new THREE.PointsMaterial({
      color: 'grey',
      size: 3,
      sizeAttenuation: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    this.geometry = geometry;
    this.particles = new THREE.Points( geometry, material );

    if (this.scene) {
      this.scene.add( this.particles );
    }

    if (satelliteStore.gotExtraData) {
      this.updateSatellites();
    }
  }

  update(_scene?: SatelliteOrbitScene | undefined): void | Promise<void> {
    // do nothing for now
  }
}

export default Satellites;