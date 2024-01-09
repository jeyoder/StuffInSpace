import SatGroup from './SatelliteGroup';
import logger from '../utils/logger';
import SatelliteStore from './SatelliteStore';
import type SatelliteGroup from './SatelliteGroup';

class SatelliteGroups {
  groups: Record<string, SatGroup> = {};
  selectedGroup?: SatGroup;
  sats: any[] = [];
  satelliteStore: SatelliteStore;

  constructor (satelliteGroups: SatelliteGroup[], satelliteStore: SatelliteStore) {
    if (!satelliteStore) {
      throw new Error('satelliteStore is required');
    }

    this.satelliteStore = satelliteStore;
    this.resetConfig(satelliteGroups);
    this.satelliteStore.addEventListener('satdataloaded', this.onSatDataLoaded.bind(this));
  }

  asArray (): SatGroup[] {
    return Object.values(this.groups);
  }

  selectGroup (group?: SatGroup) {
    this.selectedGroup = group;
    if (!group) {
      this.clearSelect();
      return;
    }
  }

  forEach (callback: (satId: number) => void) {
    for (let i = 0; i < this.sats.length; i++) {
      callback(this.sats[i].satId);
    }
  }

  clearSelect () {
    this.selectedGroup = undefined;
  }

  getGroupById (groupId: string): SatGroup | undefined {
    if (groupId) {
      groupId = groupId.toLowerCase();
      return this.groups[groupId];
    }
    return undefined;
  }

  getSelectedGroup () {
    return this.selectedGroup;
  }

  reloadGroups () {
    const keys = Object.keys(this.groups);
    for (let i = 0; i < keys.length; i++) {
      this.groups[keys[i]].reload();
    }
  }

  resetConfig (satelliteGroups: SatelliteGroup[]) {
    const groupConfigs = satelliteGroups;
    for (let i = 0; i < groupConfigs.length; i++) {
      logger.debug(`registering satellite group ${groupConfigs[i].name} (id: ${groupConfigs[i].id})`);
      this.groups[groupConfigs[i].id.toLowerCase()] = new SatGroup(
        groupConfigs[i].id.toLowerCase(),
        groupConfigs[i].name,
        groupConfigs[i].groupType,
        groupConfigs[i].data,
        this.satelliteStore as SatelliteStore
      );
    }
  }

  onSatDataLoaded () {
    this.reloadGroups();
  }
}

export default SatelliteGroups;
