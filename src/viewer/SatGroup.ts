import orbitDisplay from './Orbits';
import satelliteStore from './SatelliteStore';

class SatGroup {
  sats: any[];
  id: string;
  name: string;
  groupType: string;
  data: any;

  constructor (groupId: string, name: string, groupType: string, data: any) {
    this.sats = [];
    this.id = groupId;
    this.name = name;
    this.groupType = groupType;
    this.data = data;
  }

  reload () {
    this.sats = [];
    if (this.groupType === 'intlDes') {
      for (let i = 0; i < this.data.length; i++) {
        this.sats.push({
          satId: satelliteStore.getIdFromIntlDes(this.data[i]),
          isIntlDes: true,
          strIndex: 0
        });
      }
    } else if (this.groupType === 'nameRegex') {
      const satIdList = satelliteStore.searchNameRegex(this.data);
      for (let i = 0; i < satIdList.length; i++) {
        this.sats.push({
          satId: satIdList[i],
          isIntlDes: false,
          strIndex: 0
        });
      }
    } else if (this.groupType === 'idList') {
      for (let i = 0; i < this.data.length; i++) {
        this.sats.push({
          satId: this.data[i],
          isIntlDes: false,
          strIndex: 0
        });
      }
    } else if (this.groupType === 'objectType') {
      const field = 'OBJECT_TYPE';
      const satIdList = satelliteStore.search({ [field]: this.data });
      for (let i = 0; i < satIdList.length; i++) {
        this.sats.push({
          satId: satIdList[i].id,
          isIntlDes: false,
          strIndex: 0
        });
      }
    }
  }

  getSat (satId: number) {
    return this.sats.find((satellite) => satellite.id === satId);
  }

  hasSat (satId: number) {
    const len = this.sats.length;
    for (let i = 0; i < len; i++) {
      if (this.sats[i].satId === satId) {
        return true;
      }
    }
    return false;
  }

  // updateOrbits () {
  //   for (let i = 0; i < this.sats.length; i++) {
  //     orbitDisplay.updateOrbitBuffer(this.sats[i].satId);
  //   }
  // }
}

export default SatGroup;
