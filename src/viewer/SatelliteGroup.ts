import SatelliteStore from './SatelliteStore';

class SatelliteGroup {
  sats: { satId: number, isIntlDes: boolean, strIndex: number }[] = [];
  id: string;
  name: string;
  groupType: string;
  data: any;
  private satelliteStore: SatelliteStore;

  constructor (groupId: string, name: string, groupType: string, data: any, satelliteStore: SatelliteStore) {
    this.id = groupId;
    this.name = name;
    this.groupType = groupType;
    this.data = data;
    this.satelliteStore = satelliteStore;

    if (!this.satelliteStore) {
      throw new Error('satelliteStore is required');
    }
  }

  reload () {
    this.sats = [];

    if (this.groupType === 'intlDes') {
      for (let i = 0; i < this.data.length; i++) {
        this.sats.push({
          satId: this.satelliteStore.getIdFromIntlDes(this.data[i]) as number,
          isIntlDes: true,
          strIndex: 0
        });
      }
    } else if (this.groupType === 'nameRegex') {
      let regex = this.data;
      if (typeof regex === 'string') {
        regex = new RegExp(regex);
      }
      const satIdList = this.satelliteStore.searchNameRegex(regex);
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
      const satIdList = this.satelliteStore.search({ [field]: this.data });
      for (let i = 0; i < satIdList.length; i++) {
        this.sats.push({
          satId: satIdList[i].id,
          isIntlDes: false,
          strIndex: 0
        });
      }
    }
  }

  getSat (satId: number): Record<string, any> | undefined {
    return this.satelliteStore.satData.find((satellite) => satellite.id === satId);
  }

  hasSat (satId: number): boolean {
    const len = this.sats.length;
    for (let i = 0; i < len; i++) {
      if (this.sats[i].satId === satId) {
        return true;
      }
    }
    return false;
  }
}

export default SatelliteGroup;
