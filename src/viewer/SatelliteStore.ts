import EventManager from "../utils/event-manager";

class SatelliteStore {
  eventManager: EventManager;
  satData: Record<string, any>[] = [];
  satelliteVelocities: Float32Array = new Float32Array();
  satellitePositions: Float32Array = new Float32Array();
  satelliteAltitudes: Float32Array = new Float32Array();
  gotExtraData = false;
  gotPositionalData = false;

  constructor () {
    this.eventManager = new EventManager();
  }

  setSatelliteData (satData: Record<string, any>[], includesExtraData = false) {
    this.satData = satData;
    this.gotExtraData = includesExtraData;
    this.eventManager.fireEvent('satdataloaded', undefined);
  }

  setPositionalData (satelliteVelocities: Float32Array, satellitePositions: Float32Array, satelliteAltitudes: Float32Array) {
    this.satelliteVelocities = satelliteVelocities;
    this.satellitePositions = satellitePositions;
    this.satelliteAltitudes = satelliteAltitudes;
    this.gotPositionalData = true;
  }

  getSatData (): Record<string, any>[] {
    return this.satData || [];
  }

  getPositions () {
    return this.satellitePositions;
  }

  getAltitudes () {
    return this.satelliteAltitudes;
  }

  getVelocitities() {
    return this.satelliteVelocities;
  }

  size () : number {
    return this.satData.length;
  }

  searchNameRegex (regex: RegExp) {
    const res = [];
    for (let i = 0; i < this.satData.length; i++) {
      if (regex.test(this.satData[i].OBJECT_NAME)) {
        res.push(i);
      }
    }
    return res;
  }

  search (query: Record<string, any>): any[] {
    const keys = Object.keys(query);
    let data = Object.assign([], this.satData);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      data = data.filter((entry: Record<string, any>) => entry[key] === query[key]);
    }
    return data;
  }

  searchName (name: string) {
    const res = [];
    for (let i = 0; i < this.satData.length; i++) {
      if (this.satData[i].OBJECT_NAME === name) {
        res.push(i);
      }
    }
    return res;
  }

  getIdFromIntlDes (intlDes: any) {
    for (let i = 0; i < this.satData.length; i++) {
      if (this.satData[i].INTLDES === intlDes || this.satData[i].intlDes === intlDes) {
        return i;
      }
    }
    return null;
  }

  getSatellite (satelliteId: number) {
    if (!satelliteId || satelliteId === -1 || !this.satData) {
      return undefined;
    }

    const satellite = this.satData[satelliteId];

    if (!satellite) {
      return null;
    }

    if (this.gotPositionalData) {
      satellite.altitude = this.satelliteAltitudes[satelliteId];
      satellite.velocity = Math.sqrt(
        this.satelliteVelocities[satelliteId * 3] * this.satelliteVelocities[satelliteId * 3]
        + this.satelliteVelocities[satelliteId * 3 + 1] * this.satelliteVelocities[satelliteId * 3 + 1]
        + this.satelliteVelocities[satelliteId * 3 + 2] * this.satelliteVelocities[satelliteId * 3 + 2]
      );
      satellite.position = {
        x: this.satellitePositions[satelliteId * 3],
        y: this.satellitePositions[satelliteId * 3 + 1],
        z: this.satellitePositions[satelliteId * 3 + 2]
      };
    }

    return satellite;
  }

  addEventListener(eventName: string, listener: any) {
    this.eventManager.addEventListener(eventName, listener);
  }
}

export default new SatelliteStore();