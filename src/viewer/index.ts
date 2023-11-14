import * as THREE from 'three';

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

const sceneComponents: SceneComponent[] = [];
const sceneComponentsByName: Record<string, SceneComponent> = {};
let scene: SatelliteOrbitScene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let renderer: THREE.WebGLRenderer;
let context: Record<string, any> = {};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function idleRotateCamera (camera: THREE.Camera, time: number = 0) {
  const distance = 13;
  const offset = new THREE.Vector3();

  time = time / 10;
  // alert('Inactive for 5 seconds');
  // for (let i = -0.5; i < 0.5; i++) {
  const mesh = (sceneComponents[0] as any).getMesh();
  if (mesh) {
    offset.x = distance * Math.sin( time * 0.001 );
    offset.z = distance * Math.cos( time * 0.001 );

    // camera.position.copy( camera.position ).add( offset );
    camera.position.copy( mesh.position ).add( offset );


    camera.lookAt( mesh.position );
  }
};

async function registerScenComponent (name: string, sceneComponent: SceneComponent) {
  sceneComponents.push(sceneComponent);
  sceneComponentsByName[name] = sceneComponent;
  await sceneComponent.init(scene, context);
}

async function init () {
  scene = new SatelliteOrbitScene();
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight);
  document.body.appendChild( renderer.domElement );

  controls = new OrbitControls( camera, renderer.domElement );
  camera.position.set( 15, 0, 10000 );
  controls.update();

  camera.position.z = 5;

  const satelliteGroups = new SatelliteGroups(config.satelliteGroups);
  context.satelliteGroups = satelliteGroups;
  context.config = config;

  registerScenComponent('earth', new Earth());
  registerScenComponent('sun', new Sun());
  registerScenComponent('universe', new Universe());
  registerScenComponent('satellites', new Satellites());
  registerScenComponent('orbits', new Orbits());

  controls.minDistance = 4;
  controls.maxDistance = 100;

  window.addEventListener('resize', onWindowResize);
}

function animate() {
	requestAnimationFrame( animate );

  for (let i = 0; i < sceneComponents.length; i++) {
    sceneComponents[i].update(scene);
  }

  controls.update();

  // idleRotateCamera(camera, time)
	renderer.render( scene, camera );
}


await init();
animate();