import axios from 'axios';
import EventManager from '../utils/event-manager';
import logger from '../utils/logger';

const config = {
  baseUrl: import.meta.env.BASE_URL
};

class SatelliteStore {
  tleUrl = `${config.baseUrl}/data/TLE.json`;
  eventManager: EventManager;
  satData: Record<string, any>[] = [];
  satelliteVelocities: Float32Array = new Float32Array();
  satellitePositions: Float32Array = new Float32Array();
  satelliteAltitudes: Float32Array = new Float32Array();
  gotExtraData = false;
  gotPositionalData = false;
  loaded = false;

  constructor (options: Record<string, any> = {}) {
    this.eventManager = new EventManager();
    if (options.tleUrl) {
      this.tleUrl = options.tleUrl;
    }
  }

  async loadSatelliteData () {
    logger.debug('Loading satellite data');
    try {
      const response = await axios.get(this.tleUrl, {
        params: {
          t: Date.now()
        }
      });

      if (response.data) {
        this.satData = response.data;

        for (let i = 0; i < this.satData.length; i++) {
          if (this.satData[i].INTLDES) {
            let year = this.satData[i].INTLDES.substring(0, 2); // clean up intl des for display
            const prefix = (year > 50) ? '19' : '20';
            year = prefix + year;
            const rest = this.satData[i].INTLDES.substring(2);
            this.satData[i].intlDes = `${year}-${rest}`;
          } else {
            this.satData[i].intlDes = 'unknown';
          }
          this.satData[i].id = i;
        }
      }

      this.eventManager.fireEvent('satdataloaded', this.satData);
      this.loaded = true;
    } catch (error) {
      logger.error('error loading TLE data', error);
    }
  }

  setSatelliteData (satData: Record<string, any>[], includesExtraData = false) {
    this.satData = satData;
    this.gotExtraData = includesExtraData;
    if (includesExtraData) {
      this.eventManager.fireEvent('satextradataloaded', this.satData);
    }
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

  getVelocitities () {
    return this.satelliteVelocities;
  }

  size (): number {
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

  getSatellite (satelliteId: number): Record<string, any> | undefined {
    if (!satelliteId || satelliteId === -1 || !this.satData) {
      return undefined;
    }

    const satellite = this.satData[satelliteId];

    if (!satellite) {
      return undefined;
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

  addEventListener (eventName: string, listener: any) {
    this.eventManager.addEventListener(eventName, listener);
  }
}

export default SatelliteStore;
