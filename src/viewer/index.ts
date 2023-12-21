import { Camera, Mesh, PerspectiveCamera, WebGLRenderer } from '../utils/three';

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
import ShaderStore from './ShaderStore';
import logger from '@/utils/logger';
import { ArrowHelper, Raycaster, Vector2, Vector3 } from 'three';

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
  shaderStore?: ShaderStore;
  selectedSatelliteIdx: number = -1;
  eventManager = new EventManager();
  ready = false;
  raycaster?: Raycaster;
  showRaycastArrow = false;
  raycastArrow?: ArrowHelper;
  satellites?: Satellites;
  orbits?: Orbits;
  earth?: Earth;
  targetZoom = 5;

  /** The maximum zoom level for the viewer. This controls how close the camera can get to the earth. */
  private readonly maxZoomLevel = 60;
  /** The minimum zoom level for the viewer. This controls how far the camera can get from the earth. */
  private readonly minZoomLevel = 2;
  /** The ideal number of frames to take to zoom in or out. Higher number slows down the zoom animation. */
  private readonly framesPerZoomUpdate = 25;
  /** The allowable margin for zooming in or out. If within this margin, the zoom level is set directly to the target zoom. */
  private readonly zoomAllowableMargin = 0.01;

  constructor (config?: Record<string, any>) {
    this.config = { ...config, ...this.config };
  }

  async registerSceneComponent (name: string, sceneComponent: SceneComponent) {
    logger.debug(`Registering scene component ${name}`);
    this.sceneComponents.push(sceneComponent);
    this.sceneComponentsByName[name] = sceneComponent;
    await sceneComponent.init(this.scene as SatelliteOrbitScene, this.context);
  }

  private getCenterPoint (mesh: Mesh): Vector3 | undefined {
    if (mesh) {
      const geometry = mesh.geometry;
      geometry.computeBoundingBox();
      const center = new Vector3();
      if (geometry.boundingBox) {
        geometry.boundingBox.getCenter( center );
        mesh.localToWorld( center );
        return center;
      }
    }
    return undefined;
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

  /**
   * Handles the scroll wheel event.
   */
  onWheel (event: WheelEvent) {
    if (event.deltaY > 0) {
      this.zoomOut();
    } else {
      this.zoomIn();
    }
  }

  onSatDataLoaded (satData: Record<string, any>) {
    this.eventManager.fireEvent('satdataloaded', satData);
    this.ready = true;
  }

  private findSatellitesAtMouse (point: { x: number, y: number }): number[] {
    const canvas = this.renderer?.domElement;

    if (!this.raycaster || !this.scene || !this.camera || !canvas) {
      return [];
    }

    // adjust this to control the number of point candidates
    this.raycaster.params.Points.threshold = 0.05;

    const bounds = canvas.getBoundingClientRect();
    const mouse: Vector2 = new Vector2();
    mouse.x = (((point.x - bounds.left) / canvas.clientWidth) * 2) - 1;
    mouse.y = -(((point.y - bounds.top) / canvas.clientHeight) * 2) + 1;

    this.raycaster.setFromCamera( mouse, this.camera);

    if (this.showRaycastArrow) {
      if (this.raycastArrow) {
        this.scene.remove(this.raycastArrow);
        this.raycastArrow.dispose();
        this.raycastArrow = undefined;
      }
      this.raycastArrow = new ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 300, 0xffff00, undefined, 1) ;
      this.scene.add(this.raycastArrow);
    }

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      // TODO deal with lines
      // let satIndexes = intersects.filter(intersect => intersect.object.type === 'Points').map(intersect => intersect.index) as number[];
      intersects.sort((intersectA, intersectB) => {
        if (intersectA.object.type === 'Line' && intersectB.object.type === 'Points') {
          return 1;
        } else if (intersectA.object.type === 'Points' && intersectB.object.type === 'Line') {
          return -1;
        }
        return 0;
      });

      let satIndexes = intersects.map(intersect => {
        if (intersect.object.type === 'Points') {
          return intersect.index;
        } else if (intersect.object.type === 'Line') {
          return parseInt(intersect.object.name);
        }
        return -1;
      }).filter(satIdx => satIdx !== -1) as number[];

      if (satIndexes.length > 0) {
        const filteredSatIndexes: number[] = [];
        for (let i = 0; i < satIndexes.length; i++) {
          if (this.isValidTarget(satIndexes[i])) {
            filteredSatIndexes.push(satIndexes[i]);
          }
        }
        satIndexes = filteredSatIndexes;
      }
      return satIndexes;
    }

    return [];
  }

  isValidTarget (satelliteIdx: number): boolean {
    const satelliteGroup = this.satellites?.getSatellitegroup();

    if (satelliteGroup) {
      return satelliteGroup.hasSat(satelliteIdx);
    }

    return true;
  }

  onClick (event: MouseEvent) {
    const canvas = this.renderer?.domElement;

    if (!this.raycaster || !this.scene || !this.camera || !canvas) {
      return;
    }

    const satelliteIds = this.findSatellitesAtMouse({
      x: event.clientX,
      y: event.clientY
    });

    let satIdx = -1;
    let satellite;
    if (satelliteIds && satelliteIds.length > 0) {
      satIdx = satelliteIds[0];
      satellite = this.satelliteStore?.getSatellite(satIdx);
    }

    this.satellites?.setSelectedSatellite(satIdx);
    this.orbits?.setSelectedSatellite(satIdx);
    this.eventManager.fireEvent('selectedSatChange', satellite);
  }

  onMouseMove () {
    this.mouseMoved = true;
  }

  onMouseDown () {
    this.mouseMoved = false;
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseUp (event: MouseEvent) {
    if (!this.mouseMoved) {
      this.onClick(event);
    }
    this.mouseMoved = false;
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onHover (event: MouseEvent) {
    const canvas = this.renderer?.domElement;

    if (!this.raycaster || !this.scene || !this.camera || !canvas) {
      return;
    }

    const satelliteIds = this.findSatellitesAtMouse({
      x: event.clientX,
      y: event.clientY
    });

    let satIdx = -1;
    let satellite;
    if (satelliteIds && satelliteIds.length > 0) {
      satIdx = satelliteIds[0];
      satellite = this.satelliteStore?.getSatellite(satIdx);
    }

    this.satellites?.setHoverSatellite(satIdx);
    this.orbits?.setHoverSatellite(satIdx);
    this.eventManager.fireEvent('sathoverChange', satellite);
    this.mouseMoved = true;
  }

  async init () {
    try {
      this.scene = new SatelliteOrbitScene();
      this.camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

      this.renderer = new WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document
        .querySelector(this.config.canvasSelector)
        ?.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.camera.position.set( 15, 0, -100 );
      this.controls.update();

      this.camera.position.y = 5;
      this.camera.zoom = 5;

      this.raycaster = new Raycaster();

      this.satelliteStore = new SatelliteStore(this.config);

      this.satelliteGroups = new SatelliteGroups(
        this.config.satelliteGroups,
        this.satelliteStore
      );

      this.shaderStore = new ShaderStore(this.config.baseUrl);
      logger.debug('loading shaders');
      await this.shaderStore.load();

      this.context.satelliteGroups = this.satelliteGroups;
      this.context.config = this.config;
      this.context.satelliteStore = this.satelliteStore;
      this.context.shaderStore = this.shaderStore;

      this.satelliteStore.addEventListener('satdataloaded', this.onSatDataLoaded.bind(this));

      this.earth = new Earth();
      await this.registerSceneComponent('earth', this.earth);
      await this.registerSceneComponent('sun', new Sun());
      await this.registerSceneComponent('universe', new Universe());
      this.satellites = new Satellites();
      await this.registerSceneComponent('satellites', this.satellites);
      this.orbits = new Orbits();
      await this.registerSceneComponent('orbits', this.orbits);

      const centrePoint = this.getCenterPoint(this.earth.getMesh() as Mesh);
      if (centrePoint) {
        this.controls.target = centrePoint;
      }

      this.camera.position.y = 42;
      this.controls.enablePan = false;
      this.controls.enableZoom = false;
      // this.controls.enableDamping = true;
      // this.controls.autoRotate = true;
      // this.controls.autoRotateSpeed = 0.5;

      this.camera.updateProjectionMatrix();

      window.addEventListener('resize', this.onWindowResize.bind(this));
      window.addEventListener('wheel', this.onWheel.bind(this));

      const canvasElement = this.renderer.domElement;
      canvasElement.addEventListener('mousedown', this.onMouseDown.bind(this));
      canvasElement.addEventListener('mouseup', this.onMouseUp.bind(this));
      canvasElement.addEventListener('mousemove', this.onHover.bind(this));
    } catch (error) {
      logger.error('Error while initialising scene', error);
    }
  }

  animate () {
    requestAnimationFrame(this.animate.bind(this));

    this.updateCamera();

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

  /**
   * Updates the camera zoom based on the target zoom value.
   * If the zoom target is different from the current zoom, it gradually zooms towards the target.
   * If the zoom target is within a margin of 0.1 from the current zoom, it directly sets the zoom to the target.
   * After updating the zoom, it clamps the zoom value and updates the camera's projection matrix.
   */
  private updateCamera () {
    if (this.camera) {
      if (Math.abs(this.camera.zoom - this.targetZoom) > this.zoomAllowableMargin) {
        this.camera.zoom += (this.targetZoom - this.camera.zoom) / this.framesPerZoomUpdate;
        this.clampZoom();
        this.camera.updateProjectionMatrix();
      } else if (this.camera.zoom !== this.targetZoom) {
        this.camera.zoom = this.targetZoom;
        this.clampZoom();
        this.camera.updateProjectionMatrix();
      }
    }
  }

  getSatelliteStore () {
    return this.satelliteStore;
  }

  getSatelliteGroups () {
    return this.satelliteGroups;
  }

  zoomToSatellite (satelliteId: number) {
    const position = this.satelliteStore?.getSatellitePosition(satelliteId);
    if (position) {
      // TODO
    }
  }

  /**
   * Clamps the zoom level of the camera to ensure it stays within a certain range.
   * The targetZoom is adjusted to be no more than 5 times the current zoom level
   * and no less than 1/5th of the current zoom level. The camera's zoom level is then
   * clamped to the specified minimum and maximum zoom levels.
   */
  private clampZoom () {
    if (this.camera) {
      if (this.targetZoom > this.camera.zoom * 5) {
        this.targetZoom = this.camera.zoom * 5;
      } else if (this.targetZoom < this.camera.zoom / 5) {
        this.targetZoom = this.camera.zoom / 5;
      }

      this.camera.zoom = Math.min(Math.max(this.camera.zoom, this.minZoomLevel), this.maxZoomLevel);
      this.targetZoom = Math.min(Math.max(this.targetZoom, this.minZoomLevel), this.maxZoomLevel);
    }
  }

  /**
   * Zooms in the camera. Fired when the user scrolls up or presses the zoom in button.
   */
  zoomIn ():void {
    if (this.camera) {
      this.targetZoom += (this.camera.zoom / 4);
      this.clampZoom();
    }
  }

  /**
   * Zooms out the camera. Fired when the user scrolls down or presses the zoom out button.
   */
  zoomOut ():void {
    if (this.camera) {
      this.targetZoom -= (this.camera.zoom / 6);
      this.clampZoom();
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

  /**
   * Sets the active satellite group, or if `undefined`,
   * then it unsets the active satellite group.
   *
   * @param satelliteGroup
   */
  setSelectedSatelliteGroup (satelliteGroup?: SatelliteGroup) {
    this.setSelectedSatellite(-1);

    this.satelliteGroups?.selectGroup(satelliteGroup);
    this.orbits?.setSatelliteGroup(satelliteGroup);
    this.satellites?.setSatelliteGroup(satelliteGroup);
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
