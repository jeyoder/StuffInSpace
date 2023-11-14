import SatGroup from './SatelliteGroup';
import logger from '../utils/logger';

class SatelliteGroups {
  groups: Record<string, SatGroup> = {};
  selectedGroup?: SatGroup;
  sats: any[] = [];

  constructor (satelliteGroups: Record<string, any>[]) {
    this.resetConfig(satelliteGroups);
  }

  asArray (): SatGroup[] {
    return Object.values(this.groups);
  }

  selectGroup (group: SatGroup) {
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

  resetConfig (satelliteGroups: Record<string, any>[]) {
    const groupConfigs = satelliteGroups;
    for (let i = 0; i < groupConfigs.length; i++) {
      logger.debug(`registering satellite group ${groupConfigs[i].name} (id: ${groupConfigs[i].id})`);
      this.groups[groupConfigs[i].id.toLowerCase()] = new SatGroup(
        groupConfigs[i].id.toLowerCase(),
        groupConfigs[i].name,
        groupConfigs[i].groupType,
        groupConfigs[i].data
      );
    }
  }
}

export default SatelliteGroups;
