import { defaultColorScheme, groupColorScheme } from './color-scheme';
import SatGroup from './sat-group';

// const gpSatellites = [
//   '90103A',
//   '93068A',
//   '96041A',
//   '97035A',
//   '99055A',
//   '00025A',
//   '00040A',
//   '00071A',
//   '01004A',
//   '03005A',
//   '03010A',
//   '03058A',
//   '04009A',
//   '04023A',
//   '04045A',
//   '05038A',
//   '06042A',
//   '06052A',
//   '07047A',
//   '07062A',
//   '08012A',
//   '09043A',
//   '10022A',
//   '11036A',
//   '12053A',
//   '13023A',
//   '14008A',
//   '14026A',
//   '14045A',
//   '14068A',
//   '15013A'
// ];

// const groupConfigs = [
//   {
//     id: 'GPSGroup', name: 'GPS', groupType: 'intlDes', data: gpSatellites
//   },
//   {
//     id: 'IridiumGroup', name: 'Iridium Debris', groupType: 'nameRegex', data: /IRIDIUM(?!.*DEB)/
//   },
//   {
//     id: 'Iridium33DebrisGroup', name: 'Iridium 33 Debris', groupType: 'nameRegex', data: /(COSMOS 2251|IRIDIUM 33) DEB/
//   },
//   {
//     id: 'GlonassGroup', name: 'Glonass', groupType: 'nameRegex', data: /GLONASS/
//   },
//   {
//     id: 'GalileoGroup', name: 'Galileo', groupType: 'nameRegex', data: /GALILEO/
//   },
//   {
//     id: 'FunGroup', name: 'Fun', groupType: 'nameRegex', data: /SYLDA/
//   },
//   {
//     id: 'WestfordNeedlesGroup', name: 'Westford Needles', groupType: 'nameRegex', data: /WESTFORD NEEDLES/
//   },
//   {
//     id: 'SpaceXGroup', name: 'Space X', groupType: 'nameRegex', data: /FALCON [19]/
//   },
//   {
//     id: 'DebrisGroup', name: 'Debris', groupType: 'objectType', data: 'DEBRIS'
//   },
//   {
//     id: 'Starlink', name: 'Starlink', groupType: 'nameRegex', data: /STARLINK/
//   },
//   {
//     id: 'Unknown', name: 'Unknown Objects', groupType: 'objectType', data: 'UNKNOWN'
//   }
// ];

class SatGroups {
  constructor (appContext) {
    this.app = appContext;
    this.groups = {};
    this.selectedGroup = null;
  }

  asArray () {
    return Object.values(this.groups);
  }

  selectGroup (group) {
    this.selectedGroup = group;
    if (!group) {
      this.clearSelect();
      return;
    }
    group.updateOrbits();
    this.app.satSet.setColorScheme(groupColorScheme);
  }

  forEach (callback) {
    for (let i = 0; i < this.sats.length; i++) {
      callback(this.sats[i].satId);
    }
  }

  clearSelect () {
    this.selectedGroup = undefined;
    this.app.satSet.setColorScheme(defaultColorScheme);
  }

  getGroup (groupId) {
    return this.groups[groupId];
  }

  reloadGroups () {
    const keys = Object.keys(this.groups);
    for (let i = 0; i < keys.length; i++) {
      this.groups[keys[i]].reload();
    }
  }

  init (appContext, satelliteGroups) {
    this.app = appContext;
    const groupConfigs = satelliteGroups || this.app.config.satelliteGroups;
    for (let i = 0; i < groupConfigs.length; i++) {
      this.groups[groupConfigs[i].id] = new SatGroup(
        groupConfigs[i].id,
        groupConfigs[i].name,
        groupConfigs[i].groupType,
        groupConfigs[i].data
      );
    }
    // this.reloadGroups();
  }
}

export default new SatGroups();
