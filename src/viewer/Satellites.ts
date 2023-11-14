// import THREE, { Object3D } from "three";
import * as THREE from 'three';
import axios from 'axios';
import SceneComponent from './interfaces/SceneComponent';
import config from '../config';
import satelliteStore from './SatelliteStore';
import SatCruncherWorker from './workers/SatCruncherWorker?worker';
import logger from '../utils/logger';
import SatelliteOrbitScene from './SatelliteOrbitScene';
import ColorScheme from './ColorScheme';

// type Mesh = THREE.Mesh;
class Satellites implements SceneComponent{
  // sphere: Mesh | undefined = undefined;
  tleUrl = `${config.baseUrl}/data/TLE.json`;
  worker?: Worker;
  currentColorScheme?: ColorScheme;
  satData: any;
  gotExtraData: any;
  satExtraData: any;
  numSats: number = 1;
  size = 0;
  maxSize = 0;
  satPos: Float32Array = new Float32Array();
  satVel: Float32Array = new Float32Array();
  satAlt: Float32Array = new Float32Array();
  cruncherReady = false;
  satDataString?: string;
  scene?: SatelliteOrbitScene;
  particles: THREE.Points[] = [];
  geometry?: THREE.BufferGeometry;
  convertGeoCoord2Position (latutude: number, longitude: number, altitudeInKm: number) {

  }

  setColorScheme (colorScheme: ColorScheme) {
    this.currentColorScheme = colorScheme;
  }

  onMessage (message: any) {
    if (!this || !this.satData) {
      return;
    }

    try {
      if (!this.gotExtraData) { // store extra data that comes from crunching
        const start = performance.now();

        if (message.data.extraData) {
          this.satExtraData = JSON.parse(message.data.extraData);

          if (!this.satExtraData) {
            return;
          }

          for (let i = 0; i < this.numSats; i++) {
            this.satData[i].inclination = this.satExtraData[i].inclination;
            this.satData[i].eccentricity = this.satExtraData[i].eccentricity;
            this.satData[i].raan = this.satExtraData[i].raan;
            this.satData[i].argPe = this.satExtraData[i].argPe;
            this.satData[i].meanMotion = this.satExtraData[i].meanMotion;

            this.satData[i].semiMajorAxis = this.satExtraData[i].semiMajorAxis;
            this.satData[i].semiMinorAxis = this.satExtraData[i].semiMinorAxis;
            this.satData[i].apogee = this.satExtraData[i].apogee;
            this.satData[i].perigee = this.satExtraData[i].perigee;
            this.satData[i].period = this.satExtraData[i].period;
          }

          satelliteStore.setSatData(this.satData);

          logger.debug(`sat.js copied extra data in ${performance.now() - start} ms`);
          this.gotExtraData = true;
          return;
        }
      }

      console.log('....', message.data);
      this.satPos = new Float32Array(message.data.satPos);
      this.satVel = new Float32Array(message.data.satVel);
      this.satAlt = new Float32Array(message.data.satAlt);
      satelliteStore.setSatExtraData(
        this.satVel, this.satPos, this.satAlt
      )
      if (!this.cruncherReady) {
        document.querySelector('#load-cover')?.classList.add('hidden');
        // this.setColorScheme(this.currentColorScheme); // force color recalc
        this.cruncherReady = true;
        console.log('ready');

        // this.eventManager.fireEvent(Events.cruncherReady, { satData: this.satData });
      }
      this.addSatellites();
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
      this.satData = response.data;
      this.size = this.satData.size;

      this.satDataString = JSON.stringify(this.satData);

      logger.debug('Sending data to sat cruncher worker, to perform work');
      this.worker.postMessage(this.satDataString);
    } else {
      logger.error('worker is not available');
    }
  }

  addSatellites () {
    console.log('addSatellites xxxx', this.satData);



    if (satelliteStore.gotExtraData) {
      console.log('len',  this.satPos.length);
      if (this.geometry && this.geometry.attributes && this.geometry.attributes.position) {
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute( this.satPos, 3 ) );
      }
    }
    //   console.log('xxx', i , '...', this.particles[i]);
    //   this.particles[i].position.x = this.satPos[(i * 3)];
    //   this.particles[i].position.y = this.satPos[(i * 3 + 1)];
    //   this.particles[i].position.z = this.satPos[(i * 3 + 2)];
    // }

    console.log('...Geo..', this.geometry);
  }

  async init (scene: SatelliteOrbitScene) {
    this.scene = scene;
    logger.info('Kicking off sat-cruncher-worker');
    this.worker = new SatCruncherWorker();
    this.worker.onmessage = this.onMessage.bind(this);
    await this.loadSatelliteData();

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.BufferGeometry();
    let vertices: Float32Array = new Float32Array();
    const materials = [];

    const assignSRGB = ( texture: THREE.Texture ) => {
      texture.colorSpace = THREE.SRGBColorSpace;
    };

    const sprite1 = textureLoader.load( 'images/dot-grey.png', assignSRGB );
    // const sprite2 = textureLoader.load( 'images/dot-grey.png', assignSRGB );
    // const sprite3 = textureLoader.load( 'images/dot-red.png', assignSRGB );
    // const sprite4 = textureLoader.load( 'images/dot-blue.png', assignSRGB );
    // const sprite5 = textureLoader.load( 'images/dot-yellow.png', assignSRGB );

    // let size = this.satData.length;
    // if (this.maxSize !== -1) {
    //   size = Math.min(this.satData.length, 500);
    // }

    if (satelliteStore.gotExtraData) {
      vertices = this.satPos;
    }

    // if (!satelliteStore.gotExtraData) {
    //   console.log('BBBB');
    //   for ( let i = 0; i < size; i ++ ) {
    //     vertices.push( 0, 0, 0 );
    //   }
    // } else {
    //   for ( let i = 0; i < size; i ++ ) {
    //     const x = this.satPos[(i * 3)];
    //     const y = this.satPos[(i * 3 + 1)];
    //     const z = this.satPos[(i * 3 + 2)];

    //     vertices.push( x, y, z );
    //   }
    // }

    console.log('mmm', vertices);
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    // geometry.
    let spriteSize = 1;
    let parameters = [
      { color: [1.0, 0.2, 0.5 ], texture: sprite1, size: spriteSize },
      { color: [ 0.95, 0.1, 0.5 ], texture: sprite1, size: spriteSize },
      { color: [ 0.90, 0.05, 0.5 ], texture: sprite1, size: spriteSize },
      { color: [ 0.85, 0, 0.5 ], texture: sprite1, size: spriteSize },
      { color: [ 0.85, 0, 0.5 ], texture: sprite1, size: spriteSize }
    ]

    for ( let i = 0; i < 1; i ++ ) {
      // const color = parameters[ i ].color;
      // const sprite = parameters[ i ].texture
      // const size = parameters[ i ].size;

      // materials[ i ] = new THREE.PointsMaterial({
      //   size: size,
      //   map: sprite,
      //   blending: THREE.AdditiveBlending,
      //   depthTest: false,
      //   transparent: true
      // });
      // materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ], THREE.SRGBColorSpace );

      materials[i] = new THREE.PointsMaterial({
        color: "yellow",
        size: 2,
        sizeAttenuation: false
    });

      this.geometry = geometry;
      const particles = new THREE.Points( geometry, materials[ i ] );

      // const x = this.satPos[(i * 3)];
      // const y = this.satPos[(i * 3 + 1)];
      // const z = this.satPos[(i * 3 + 2)];

      // particles.rotation.x = Math.random() * 6;
      // particles.rotation.y = Math.random() * 6;
      // particles.rotation.z = Math.random() * 6;

      // this.particles.push(particles);

      if (this.scene) {
        this.scene.add( particles );
        // this.scene.remove
      }
    }
  }

  update(_scene?: SatelliteOrbitScene | undefined): void | Promise<void> {
    // TODO
    // if (this.sphere) {
    //  this.sphere.rotation.y += 0.005;
    // }
  }
}

export default Satellites;