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
  segmentCount = 255;
  orbitWorker?: Worker;
  selectedSatelliteIdx: number = -1;
  hoverSatelliteIdx: number = -1;
  satelliteGroups?: SatelliteGroups;
  satelliteGroup?: SatelliteGroup;
  inProgress: boolean[] = [];
  scene?: SatelliteOrbitScene;
  selectColor = [0.0, 1.0, 0.0, 1.0];
  hoverColor = [0.5, 0.5, 1.0, 1.0];
  groupColor = [0.3, 0.5, 1.0, 0.4];
  orbitTracks: (Line | undefined)[] = [];
  satelliteStore?: SatelliteStore;
  satelliteOrbitGroup?: Group;

  calculateOrbits (satelliteIds: number[]) {
    satelliteIds = satelliteIds.filter((satelliteIdx: number) => !this.inProgress[satelliteIdx]);

    if (this.orbitWorker) {
      this.orbitWorker.postMessage({
        isInit: false,
        satId: satelliteIds
      });
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
      this.orbitWorker.postMessage({
        isInit: true,
        satData: JSON.stringify(this.satelliteStore.satData),
        numSegs: this.segmentCount
      });
    }
  }

  private updateOrbitTrack (satId: number) {
    if (this.orbitTracks[satId]) {
      const line = this.orbitTracks[satId] as Line;
      const material = line.material as LineBasicMaterial;
      material.color = this.getTrackColor(satId);
      material.needsUpdate = true;
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


  getTrackColor (satId: number): Color {
    let color = [0, 0, 9];

    if (satId === this.hoverSatelliteIdx) {
      color = this.hoverColor;
    } else if (satId === this.selectedSatelliteIdx) {
      color = this.selectColor;
    } else if (this.satelliteGroup && this.satelliteGroup.hasSat(satId)) {
      color = this.groupColor;
    }

    return new Color(color[0], color[1], color[2]);
  }

  onMessage (message: any) {
    const { satId } = message.data;

    if (this.scene) {
      if (this.orbitTracks[satId]) {
        const line = this.orbitTracks[satId] as Line;
        line.geometry.setAttribute( 'position', new Float32BufferAttribute( message.data.pointsOut, 3 ) );
        this.updateOrbitTrack(satId);
      } else {
        const color = this.getTrackColor(satId);

        const material = new LineBasicMaterial({
          color,
          linewidth: 10
        });

        const geometry = new BufferGeometry();
        geometry.setAttribute( 'position', new Float32BufferAttribute( message.data.pointsOut, 3 ) );
        const line = new Line( geometry, material );
        if (this.satelliteOrbitGroup) {
          this.satelliteOrbitGroup.add(line);
        }

        this.orbitTracks[satId] = line;
      }
    }

    this.inProgress[satId] = false;
  }

  setSelectedSatellite (satelliteIdx: number) {
    if (this.selectedSatelliteIdx > -1) {
      if (this.orbitTracks[this.selectedSatelliteIdx]) {
        if (!this.satelliteGroup || !this.satelliteGroup.hasSat(this.selectedSatelliteIdx)) {
          this.removeOrbitTrack(this.selectedSatelliteIdx);
        } else {
          this.updateOrbitTrack(this.selectedSatelliteIdx);
        }
      }
      this.selectedSatelliteIdx = -1;
    }

    this.selectedSatelliteIdx = satelliteIdx;
    this.calculateOrbits([satelliteIdx]);
  }

  setHoverSatellite (satelliteIdx: number) {
    if (this.hoverSatelliteIdx !== undefined && this.hoverSatelliteIdx > -1 || satelliteIdx !== this.hoverSatelliteIdx) {
      if (!this.satelliteGroup || !this.satelliteGroup.hasSat(this.hoverSatelliteIdx) || this.selectedSatelliteIdx !== this.hoverSatelliteIdx) {
        this.removeOrbitTrack(this.hoverSatelliteIdx);
      } else {
        this.updateOrbitTrack(this.hoverSatelliteIdx);
      }
    }
    this.hoverSatelliteIdx = satelliteIdx;
    this.calculateOrbits([satelliteIdx]);
  }

  setSatelliteGroup (group: SatelliteGroup | undefined) {
    // remove current rendered tracks
    if (this.satelliteGroup) {
      this.selectedSatelliteIdx = -1;
      this.hoverSatelliteIdx = -1;
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
    this.scene = scene;
    this.orbitWorker = new OrbitCalculationWorker();
    this.orbitWorker.onmessage = this.onMessage.bind(this);
    this.satelliteStore = context.satelliteStore;

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