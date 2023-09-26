import orbitDisplay from './orbit-display';
import satSet from './sat';

class SatGroup {
  constructor (groupId, name, groupType, data) {
    this.sats = [];
    this.id = groupId;
    this.name = name;
    if (groupType === 'intlDes') {
      for (let i = 0; i < data.length; i++) {
        this.sats.push({
          satId: satSet.getIdFromIntlDes(data[i]),
          isIntlDes: true,
          strIndex: 0
        });
      }
    } else if (groupType === 'nameRegex') {
      const satIdList = satSet.searchNameRegex(data);
      for (let i = 0; i < satIdList.length; i++) {
        this.sats.push({
          satId: satIdList[i],
          isIntlDes: false,
          strIndex: 0
        });
      }
    } else if (groupType === 'idList') {
      for (let i = 0; i < data.length; i++) {
        this.sats.push({
          satId: data[i],
          isIntlDes: false,
          strIndex: 0
        });
      }
    } else if (groupType === 'objectType') {
      const field = 'OBJECT_TYPE';
      const satIdList = satSet.search({ [field]: data });
      for (let i = 0; i < satIdList.length; i++) {
        this.sats.push({
          satId: satIdList[i].id,
          isIntlDes: false,
          strIndex: 0
        });
      }
    }
  }

  hasSat (id) {
    const len = this.sats.length;
    for (let i = 0; i < len; i++) {
      if (this.sats[i].satId === id) {
        return true;
      }
    }
    return false;
  }

  updateOrbits () {
    for (let i = 0; i < this.sats.length; i++) {
      orbitDisplay.updateOrbitBuffer(this.sats[i].satId);
    }
  }
}

export default SatGroup;
