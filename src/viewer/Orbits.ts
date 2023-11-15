import { LineBasicMaterial, Color, Line, BufferGeometry, Float32BufferAttribute } from 'three';
import SceneComponent from './interfaces/SceneComponent';
import OrbitCalculationWorker from './workers/OrbitCalculationWorker?worker';
import SatelliteGroup from './SatelliteGroup';
import satelliteStore from './SatelliteStore';
import SatelliteOrbitScene from './SatelliteOrbitScene';
import logger from '../utils/logger';
import SatelliteGroups from './SatelliteGroups';

class Orbits implements SceneComponent {
  segmentCount = 255;
  orbitWorker?: Worker;
  selectedSatelliteIdx: number = 10000; // -1;
  hoverSatelliteIdx: number = -1;
  satelliteGroups?: SatelliteGroups
  satelliteGroup?: SatelliteGroup;
  inProgress: boolean[] = [];
  scene?: SatelliteOrbitScene;
  selectColor = [0.0, 1.0, 0.0, 1.0];
  hoverColor = [0.5, 0.5, 1.0, 1.0];
  groupColor = [0.3, 0.5, 1.0, 0.4];
  orbitTracks: (Line | undefined)[] = [];

  updateOrbits (satelliteIdx: number) {
    if (!this.inProgress[satelliteIdx]) {
      logger.debug('Sending data to orbit worker, to update orbit buffer');
      if (this.orbitWorker) {
        this.orbitWorker.postMessage({
          isInit: false,
          satId: satelliteIdx
        });
      } else {
        logger.error('Orbit worker is undefined');
      }
      this.inProgress[satelliteIdx] = true;
    }
  }

  onSatellitesLoaded () {
    this.inProgress = new Array(satelliteStore.size());
    this.orbitTracks = new Array(satelliteStore.size());

    if (this.orbitWorker) {
      this.orbitWorker.postMessage({
        isInit: true,
        satData: JSON.stringify(satelliteStore.satData),
        numSegs: this.segmentCount
      });
    }

    if (this.selectedSatelliteIdx > -1) {
      this.updateOrbits(this.selectedSatelliteIdx);
    }

    // temporary, for testing
    if (this.satelliteGroups) {
      const group = this.satelliteGroups.getGroupById('GPSGroup');
      if (group) {
        group.reload();
        this.setSatelliteGroup(group);
      }
    }
  }

  onMessage (message: any) {
    const { satId } = message.data;

    if (this.scene) {
      let color = [0, 0, 9];

      if (satId === this.hoverSatelliteIdx) {
        color = this.hoverColor;
      } else if (satId === this.selectedSatelliteIdx) {
        color = this.selectColor;
      } else if (this.satelliteGroup && this.satelliteGroup.hasSat(satId)) {
        color = this.groupColor;
      }

      const material = new LineBasicMaterial({
        color: new Color(color[0], color[1], color[2]),
        linewidth: 10
      });

      const geometry = new BufferGeometry();
      geometry.setAttribute( 'position', new Float32BufferAttribute( message.data.pointsOut, 3 ) );
      const line = new Line( geometry, material );
      this.scene.add(line);
      this.orbitTracks[satId] = line;
    }

    this.inProgress[satId] = false;
  }

  setSelectedSatellite (satelliteIdx: number) {
    this.selectedSatelliteIdx = satelliteIdx;
    this.updateOrbits(satelliteIdx);
  }

  setHoverSatellite (satelliteIdx: number) {
    if (this.hoverSatelliteIdx !== undefined && this.hoverSatelliteIdx > -1) {
      if (this.orbitTracks) {
        const line = this.orbitTracks[this.hoverSatelliteIdx];
        if (line) {
          this.scene?.remove(line);
          this.orbitTracks[this.hoverSatelliteIdx] = undefined;
        }
      }
    }
    this.hoverSatelliteIdx = satelliteIdx;
    this.updateOrbits(satelliteIdx);
  }

  setSatelliteGroup (group: SatelliteGroup) {
    this.satelliteGroup = group;
    if (this.satelliteGroup) {
      const satellites = this.satelliteGroup.sats;
      if (this.orbitWorker) {
        const satelliteIds = satellites.map((entry: Record<string, any>) => entry.satId);
        this.orbitWorker.postMessage({
          isInit: false,
          satId: satelliteIds
        });

        console.log('satelliteIds.length', satelliteIds.length);
      }
    }
  }

  init (scene: SatelliteOrbitScene, context: Record<string, any>) {
    this.scene = scene;
    this.orbitWorker = new OrbitCalculationWorker();
    this.orbitWorker.onmessage = this.onMessage.bind(this);

    satelliteStore.addEventListener('satdataloaded', this.onSatellitesLoaded.bind(this));

    if (satelliteStore.size() > 0) {
      this.inProgress = new Array(satelliteStore.size());
      this.onSatellitesLoaded();
    }

    if (context.satelliteGroups) {
      this.satelliteGroups = context.satelliteGroups;
    }
  }

  update(_scene?: SatelliteOrbitScene): void | Promise<void> {

  }
}

export default Orbits;