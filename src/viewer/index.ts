import { Camera, PerspectiveCamera, WebGLRenderer } from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Earth from './Earth';
import Sun from './Sun';

import Universe from './Universe';
import Satellites from './Satellites';
import Orbits from './Orbits';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteOrbitScene from './SatelliteOrbitScene';
import config from '../config';
import SatelliteGroups from './SatelliteGroups';
import satelliteStore from './SatelliteStore';
import EventManager from '../utils/event-manager';
// function idleRotateCamera (camera: Camera, time: number = 0) {
//   const distance = 13;
//   const offset = new Vector3();
//
//   time = time / 10;
//   // alert('Inactive for 5 seconds');
//   // for (let i = -0.5; i < 0.5; i++) {
//   const mesh = (sceneComponents[0] as any).getMesh();
//   if (mesh) {
//     offset.x = distance * Math.sin( time * 0.001 );
//     offset.z = distance * Math.cos( time * 0.001 );
//
//     // camera.position.copy( camera.position ).add( offset );
//     camera.position.copy( mesh.position ).add( offset );
//     camera.lookAt( mesh.position );
//   }
// };

class Viewer {
  sceneComponents: SceneComponent[] = [];
  sceneComponentsByName: Record<string, SceneComponent> = {};
  scene?: SatelliteOrbitScene;
  camera?: PerspectiveCamera;
  controls?: OrbitControls;
  renderer?: WebGLRenderer;
  context: Record<string, any> = {};
  satelliteGroups?: SatelliteGroups;
  selectedSatelliteIdx: number = -1;
  eventManager = new EventManager();
  ready = false;

  async registerScenComponent (name: string, sceneComponent: SceneComponent) {
    this.sceneComponents.push(sceneComponent);
    this.sceneComponentsByName[name] = sceneComponent;
    await sceneComponent.init(this.scene as SatelliteOrbitScene, this.context);
  }

  onWindowResize() {
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
  }

  onSatDataLoaded (satData: Record<string, any>) {
    console.log('loaded');
    this.eventManager.fireEvent('satdataloaded', satData);
    this.ready = true;
  }

  async init () {
    this.scene = new SatelliteOrbitScene();
    this.camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

    this.renderer = new WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector('.viewer')?.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.camera.position.set( 15, 0, 10000 );
    this.controls.update();

    this.camera.position.z = 5;

    this.satelliteGroups = new SatelliteGroups(config.satelliteGroups);
    this.context.satelliteGroups = this.satelliteGroups;
    this.context.config = config;

    satelliteStore.addEventListener('satdataloaded', this.onSatDataLoaded.bind(this));

    this.registerScenComponent('earth', new Earth());
    this.registerScenComponent('sun', new Sun());
    this.registerScenComponent('universe', new Universe());
    this.registerScenComponent('satellites', new Satellites());
    this.registerScenComponent('orbits', new Orbits());

    this.controls.minDistance = 4;
    this.controls.maxDistance = 100;

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    for (let i = 0; i < this.sceneComponents.length; i++) {
      this.sceneComponents[i].update(this.scene);
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer) {
      this.renderer.render(this.scene as SatelliteOrbitScene, this.camera as Camera);
    }
  }

  getSatelliteStore () {
    return satelliteStore;
  }

  getSatelliteGroups () {
    return this.satelliteGroups;
  }

  zoomIn () {
    console.log('...', this.camera);
    if (this.camera) {
      this.camera.zoom += 0.1;
      this.camera.updateProjectionMatrix();
    }
  }

  zoomOut () {
    if (this.camera) {
      this.camera.zoom -= 0.1;
      this.camera.updateProjectionMatrix();
    }
  }

  setHoverSatellite (_satelliteIdx: number) {
    // TODO
  }

  setSelectedSatellite (_satelliteIdx: number) {
    // TODO
  }

  getSelectedSatellite (): Record<string, any> | undefined {
    return satelliteStore.getSatellite(this.selectedSatelliteIdx);
  }

  getSelectedSatelliteIdx (): number {
    return this.selectedSatelliteIdx;
  }

  addEventListener (eventName: string, listener: any) {
    this.eventManager.addEventListener(eventName, listener);
  }
}

async function createViewer () {
  return new Viewer();
}

// export default main;
export { createViewer, Viewer};
