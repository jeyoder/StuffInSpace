import { Camera, PerspectiveCamera, WebGLRenderer } from '../utils/three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Earth from './Earth';
import Sun from './Sun';

import Universe from './Universe';
import Satellites from './Satellites';
import Orbits from './Orbits';
import SceneComponent from './interfaces/SceneComponent';
import SatelliteOrbitScene from './SatelliteOrbitScene';
import SatelliteGroups from './SatelliteGroups';
import SatelliteStore from './SatelliteStore';
import EventManager from '../utils/event-manager';
import SatelliteGroup from './SatelliteGroup';

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
  config: Record<string, any> = {
    canvasSelector: '.viewer'
  };

  sceneComponents: SceneComponent[] = [];
  sceneComponentsByName: Record<string, SceneComponent> = {};
  scene?: SatelliteOrbitScene;
  camera?: PerspectiveCamera;
  controls?: OrbitControls;
  renderer?: WebGLRenderer;
  context: Record<string, any> = {};
  satelliteGroups?: SatelliteGroups;
  satelliteStore?: SatelliteStore;
  selectedSatelliteIdx: number = -1;
  eventManager = new EventManager();
  ready = false;

  satellites?: Satellites;
  orbits?: Orbits;

  constructor (config?: Record<string, any>) {
    this.config = { ...config, ...this.config };
  }

  async registerSceneComponent (name: string, sceneComponent: SceneComponent) {
    this.sceneComponents.push(sceneComponent);
    this.sceneComponentsByName[name] = sceneComponent;
    await sceneComponent.init(this.scene as SatelliteOrbitScene, this.context);
  }

  onWindowResize () {
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
  }

  onSatDataLoaded (satData: Record<string, any>) {
    this.eventManager.fireEvent('satdataloaded', satData);
    this.ready = true;
  }

  async init () {
    this.scene = new SatelliteOrbitScene();
    this.camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

    this.renderer = new WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document
      .querySelector(this.config.canvasSelector)
      ?.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.camera.position.set( 15, 0, 10000 );
    this.controls.update();

    this.camera.position.z = 5;

    this.satelliteStore = new SatelliteStore(this.config);

    this.satelliteGroups = new SatelliteGroups(
      this.config.satelliteGroups,
      this.satelliteStore
    );

    this.context.satelliteGroups = this.satelliteGroups;
    this.context.config = this.config;
    this.context.satelliteStore = this.satelliteStore;

    this.satelliteStore.addEventListener('satdataloaded', this.onSatDataLoaded.bind(this));

    await this.registerSceneComponent('earth', new Earth());
    await this.registerSceneComponent('sun', new Sun());
    await this.registerSceneComponent('universe', new Universe());
    this.satellites = new Satellites();
    await this.registerSceneComponent('satellites', this.satellites);
    this.orbits = new Orbits();
    await this.registerSceneComponent('orbits', this.orbits);

    this.controls.minDistance = 4;
    this.controls.maxDistance = 100;

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  animate () {
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
    return this.satelliteStore;
  }

  getSatelliteGroups () {
    return this.satelliteGroups;
  }

  zoomIn () {
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

  setHoverSatellite (satelliteIdx: number) {
    this.satellites?.setHoverSatellite(satelliteIdx);
    this.orbits?.setHoverSatellite(satelliteIdx);
  }

  setSelectedSatellite (satelliteIdx: number) {
    this.satellites?.setSelectedSatellite(satelliteIdx);
    this.orbits?.setSelectedSatellite(satelliteIdx);
  }

  setSelectedSatelliteGroup (satelliteGroup: SatelliteGroup | undefined) {
    this.satelliteGroups?.selectGroup(satelliteGroup);
    this.orbits?.setSatelliteGroup(satelliteGroup);
  }

  getSelectedSatellite (): Record<string, any> | undefined {
    if (this.satelliteStore) {
      return this.satelliteStore.getSatellite(this.selectedSatelliteIdx);
    }
    return undefined;
  }

  getSelectedSatelliteIdx (): number {
    return this.selectedSatelliteIdx;
  }

  addEventListener (eventName: string, listener: any) {
    this.eventManager.addEventListener(eventName, listener);
  }
}

function createViewer (config?: Record<string, any>) {
  return new Viewer(config);
}

export { createViewer, Viewer};
