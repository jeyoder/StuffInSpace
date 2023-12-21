import SatelliteStore from './SatelliteStore';

class SatelliteGroup {
  sats: { satId: number, isIntlDes: boolean, strIndex: number }[] = [];
  id: string;
  name: string;
  groupType: string;
  data: number[] | string[] | RegExp | string;
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

    switch (this.groupType) {
    case 'intlDes':
      this.searchIntlDes();
      break;
    case 'nameRegex':
      this.searchNameRegex();
      break;
    case 'idList':
      this.searchIdList();
      break;
    case 'objectType':
      this.searchObjectType();
      break;
    default:
      throw new Error('Invalid groupType');
    }
  }

  /**
   * Searches for satellite objects of a specific type.
   * @throws {Error} If objectType is not a string.
   */
  private searchObjectType () {
    if (typeof this.data !== 'string') {
      throw new Error('objectType must be a string');
    }
    const field = 'OBJECT_TYPE';
    const satIdList = this.satelliteStore.search({ [field]: this.data });
    for (const satId of satIdList) {
      this.sats.push({
        satId: satId.id,
        isIntlDes: false,
        strIndex: 0
      });
    }
  }

  /**
   * Searches the id list and adds satellites to the 'sats' array.
   * @throws {Error} If 'idList' is a string.
   */
  private searchIdList () {
    if (typeof this.data === 'string') {
      throw new Error('idList must be an array');
    }
    for (const satId of this.data as number[]) {
      this.sats.push({
        satId: satId,
        isIntlDes: false,
        strIndex: 0
      });
    }
  }

  /**
   * Searches for satellite names that match the specified regular expression.
   *
   * @throws {Error} If nameRegex is not a string.
   */
  private searchNameRegex () {
    if (typeof this.data !== 'string') {
      throw new Error('nameRegex must be a string');
    }
    const regex = new RegExp(this.data);
    const satIdList = this.satelliteStore.searchNameRegex(regex);
    for (const satId of satIdList) {
      this.sats.push({
        satId: satId,
        isIntlDes: false,
        strIndex: 0
      });
    }
  }

  /**
   * Searches for international designators in the data and adds them to the sats array.
   * @throws {Error} Throws an error if intlDes is a string.
   */
  private searchIntlDes () {
    if (typeof this.data === 'string') {
      throw new Error('intlDes must be an array');
    }
    for (const intlDes of this.data as string[]) {
      this.sats.push({
        satId: this.satelliteStore.getIdFromIntlDes(intlDes) as number,
        isIntlDes: true,
        strIndex: 0
      });
    }
  }

  /**
   * Retrieves a satellite object based on the provided satellite ID.
   * @param satId - The ID of the satellite to retrieve.
   * @returns The satellite object matching the provided ID, or undefined if not found.
   *
   * @deprecated Use SatelliteStore.getSat instead.
   * TODO: This is a duplicate of the method in SatelliteStore. It should be removed from here.
   */
  getSat (satId: number) {
    return this.satelliteStore.satData.find((satellite) => satellite.id === satId);
  }

  hasSat (satId: number) {
    for (const sat of this.sats) {
      if (sat.satId === satId) {
        return true;
      }
    }
    return false;
  }
}

export default SatelliteGroup;
