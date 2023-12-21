import { LineBasicMaterial, Color, Line, BufferGeometry, Float32BufferAttribute, Group } from '../utils/three';
import SceneComponent from './interfaces/SceneComponent';
import OrbitCalculationWorker from './workers/OrbitCalculationWorker?worker';
import SatelliteGroup from './SatelliteGroup';
import SatelliteStore from './SatelliteStore';
import SatelliteOrbitScene from './SatelliteOrbitScene';
import logger from '../utils/logger';
import SatelliteGroups from './SatelliteGroups';
import SelectableSatellite from './interfaces/SelectableSatellite';

class Orbits implements SceneComponent, SelectableSatellite {
  config: Record<string, any> = {};
  segmentCount = 255;
  orbitWorker?: Worker;
  selectedSatellites: number[] = [];
  hoverSatelliteIdx: number = -1;
  satelliteGroups?: SatelliteGroups;
  satelliteGroup?: SatelliteGroup;
  inProgress: boolean[] = [];
  scene?: SatelliteOrbitScene;
  selectColor = [0.0, 1.0, 0.0, 1.0];
  hoverColor = [1.0, 0.92, 0.23, 1.0];
  groupColor = [0.3, 0.5, 1.0, 0.4];
  orbitTracks: (Line | undefined)[] = [];
  satelliteStore?: SatelliteStore;
  satelliteOrbitGroup?: Group;

  calculateOrbits (satelliteIds: number[]) {
    satelliteIds = satelliteIds.filter((satelliteIdx: number) => !this.inProgress[satelliteIdx]);

    if (this.orbitWorker) {
      this.orbitWorker.postMessage(JSON.stringify({
        isInit: false,
        satId: satelliteIds
      }));
    } else {
      logger.error('Orbit worker is undefined');
    }

    satelliteIds.forEach((satelliteIdx: number) => this.inProgress[satelliteIdx] = true);
  }

  onSatellitesLoaded () {
    if (!this.satelliteStore) {
      return;
    }

    this.inProgress = new Array(this.satelliteStore.size());
    this.orbitTracks = new Array(this.satelliteStore.size());

    if (this.orbitWorker) {
      this.orbitWorker.postMessage(JSON.stringify({
        isInit: true,
        satData: this.satelliteStore.satData,
        numSegs: this.segmentCount
      }));
    }
  }

  private isTrackVisible (satId: number) {
    return (
      this.selectedSatellites.indexOf(satId) > -1
      || satId === this.hoverSatelliteIdx
      || (this.satelliteGroup && this.satelliteGroup.hasSat(satId))
    );
  }

  private getTrackColor (satId: number): Color {
    let color = [1, 1, 0];

    if (satId === this.hoverSatelliteIdx) {
      color = this.hoverColor;
    } else if (this.selectedSatellites.indexOf(satId) > -1) {
      color = this.selectColor;
    } else if (this.satelliteGroup && this.satelliteGroup.hasSat(satId)) {
      color = this.groupColor;
    }

    return new Color(color[0], color[1], color[2]);
  }

  private addOrbitTrack (satId: number, points: number[]) {
    const color = this.getTrackColor(satId);

    const material = new LineBasicMaterial({
      color,
      linewidth: 10
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute( 'position', new Float32BufferAttribute(points, 3));
    const line = new Line( geometry, material );
    if (this.satelliteOrbitGroup) {
      this.satelliteOrbitGroup.add(line);
    }

    this.orbitTracks[satId] = line;
  }

  private updateOrbitTrack (satId: number, points?: number[]) {
    const line = this.orbitTracks[satId] as Line;
    if (line) {
      const material = line.material as LineBasicMaterial;
      material.color = this.getTrackColor(satId);
      material.needsUpdate = true;

      if (points) {
        line.geometry.setAttribute( 'position', new Float32BufferAttribute(points, 3));
        line.geometry.computeBoundingBox();
        line.geometry.computeBoundingSphere();
      }
    }
  }

  private removeOrbitTrack (satId: number) {
    if (this.orbitTracks[satId]) {
      const line = this.orbitTracks[satId] as Line;
      this.satelliteOrbitGroup?.remove(line);
      if (line.geometry) {
        line.geometry.dispose();
      }
      this.orbitTracks[satId] = undefined;
    }
  }

  onMessage (message: any) {
    const { satId } = message.data;

    if (this.scene) {
      if (this.orbitTracks[satId]) {
        this.updateOrbitTrack(satId, message.data.pointsOut);
      } else if (this.isTrackVisible(satId)) {
        this.addOrbitTrack(satId, message.data.pointsOut);
      }
    }

    this.inProgress[satId] = false;
  }

  isHoverSatellite (satelliteIdx: number): boolean {
    return this.hoverSatelliteIdx !== undefined && satelliteIdx !== -1 && this.hoverSatelliteIdx === satelliteIdx;
  }

  isSelectedSatellite (satelliteIdx: number): boolean {
    if (this.selectedSatellites.length > 0) {
      return this.selectedSatellites.indexOf(satelliteIdx) > -1;
    }

    return false;
  }

  refreshOrbits () {
    if (this.satelliteGroup) {
      const sats = this.satelliteGroup.sats;
      for (let i = 0; i < sats.length; i++) {
        this.updateOrbitTrack(sats[i].satId);
      }
    }
  }

  setSelectedSatellites (selectedSatellites: number[]) {
    if (this.selectedSatellites.length > 0) {
      for (let i = 0; i < this.selectedSatellites.length; i++) {
        const satId = this.selectedSatellites[i];
        if (this.orbitTracks[satId]) {
          if (!this.satelliteGroup || !this.satelliteGroup.hasSat(satId)) {
            this.removeOrbitTrack(satId);
          } else {
            this.updateOrbitTrack(satId);
          }
        }
      }
    }

    this.selectedSatellites = selectedSatellites;
    this.calculateOrbits(selectedSatellites);
    this.refreshOrbits();
  }

  setSelectedSatellite (satelliteIdx: number) {
    this.setSelectedSatellites([satelliteIdx]);
  }

  setHoverSatellite (satelliteIdx: number) {
    // deal wth removing hover satellite, in such a away it doesn't remove
    // groups satellite tracks or selected satellite tracks
    let remove = false;
    const previousHoverSatelliteIdx = this.hoverSatelliteIdx || -1;
    if (this.hoverSatelliteIdx && this.hoverSatelliteIdx > -1) {
      remove = this.selectedSatellites.indexOf(this.hoverSatelliteIdx) < 0;
      remove = remove && (!this.satelliteGroup || !this.satelliteGroup.hasSat(this.hoverSatelliteIdx));
    }

    this.hoverSatelliteIdx = satelliteIdx;

    if (remove) {
      this.removeOrbitTrack(previousHoverSatelliteIdx);
    } else {
      this.updateOrbitTrack(previousHoverSatelliteIdx);
    }

    this.calculateOrbits([satelliteIdx]);
    this.refreshOrbits();
  }

  setSatelliteGroup (group: SatelliteGroup | undefined) {
    // remove current rendered tracks
    if (this.satelliteGroup) {
      this.setSelectedSatellites([]);
      this.setHoverSatellite(-1);
      for (let i = 0; i < this.orbitTracks.length; i++) {
        if (this.orbitTracks[i]) {
          this.removeOrbitTrack(i);
        }
      }
    }

    this.satelliteGroup = group;

    // calculate tracks
    if (this.satelliteGroup) {
      const satellites = this.satelliteGroup.sats;
      const satelliteIds = satellites.map((entry: Record<string, any>) => entry.satId as number);
      this.calculateOrbits(satelliteIds);
    }
  }

  init (scene: SatelliteOrbitScene, context: Record<string, any>) {
    this.config = context.config;
    this.scene = scene;
    this.orbitWorker = new OrbitCalculationWorker();
    this.orbitWorker.onmessage = this.onMessage.bind(this);
    this.satelliteStore = context.satelliteStore;

    this.orbitWorker.postMessage(JSON.stringify({
      config: {
        logLevel: this.config.logLevel
      }
    }));

    if (this.satelliteStore) {
      this.satelliteStore.addEventListener('satdataloaded', this.onSatellitesLoaded.bind(this));

      if (this.satelliteStore.size() > 0) {
        this.inProgress = new Array(this.satelliteStore.size());
        this.onSatellitesLoaded();
      }
    }

    if (context.satelliteGroups) {
      this.satelliteGroups = context.satelliteGroups;
    }

    this.satelliteOrbitGroup = new Group();
    this.scene.add(this.satelliteOrbitGroup);
  }

  update (): void {
    // do nothing
  }
}

export default Orbits;