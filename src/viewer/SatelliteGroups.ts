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
    }
  }

  forEach (callback: (satId: number) => void) {
    for (const sat of this.sats) {
      callback(sat.satId);
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
    for (const key of keys) {
      this.groups[key].reload();
    }
  }

  resetConfig (satelliteGroups: SatelliteGroup[]) {
    const groupConfigs = satelliteGroups;
    for (const groupConfig of groupConfigs) {
      logger.debug(`registering satellite group ${groupConfig.name} (id: ${groupConfig.id})`);
      this.groups[groupConfig.id.toLowerCase()] = new SatGroup(
        groupConfig.id.toLowerCase(),
        groupConfig.name,
        groupConfig.groupType,
        groupConfig.data,
        this.satelliteStore
      );
    }
  }

  onSatDataLoaded () {
    this.reloadGroups();
  }
}

export default SatelliteGroups;
