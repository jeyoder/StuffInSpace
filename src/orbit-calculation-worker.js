import { jday, twoline2satrec, sgp4 } from 'satellite.js';
import logger from './logger';

let numSegs;
const satCache = [];
let id;

// eslint-disable-next-line func-names, space-before-function-paren
onmessage = function (message) {
  logger.debug('WORKER: Orbital calculation worker handling message');
  if (message.data.isInit) {
    id = Date.now();
    logger.debug('id', id);
    logger.debug('message.data.isInit');
    const satData = JSON.parse(message.data.satData);

    for (let i = 0; i < satData.length; i++) {
      satCache[i] = twoline2satrec(satData[i].TLE_LINE1, satData[i].TLE_LINE2);
    }

    numSegs = message.data.numSegs;
  } else {
    // TODO: figure out how to calculate the orbit points on constant
    // position slices, not timeslices (ugly perigees on HEOs)
    const { satId } = message.data;
    const pointsOut = new Float32Array((numSegs + 1) * 3);

    if (!satCache || !satCache[satId]) {
      return;
    }

    const nowDate = new Date();
    let nowJ = jday(
      nowDate.getUTCFullYear(),
      nowDate.getUTCMonth() + 1,
      nowDate.getUTCDate(),
      nowDate.getUTCHours(),
      nowDate.getUTCMinutes(),
      nowDate.getUTCSeconds()
    );
    nowJ += nowDate.getUTCMilliseconds() * 1.15741e-8; // days per millisecond
    const now = (nowJ - satCache[satId].jdsatepoch) * 1440.0; // in minutes

    const period = (2 * Math.PI) / satCache[satId].no; // convert rads/min to min
    const timeslice = period / numSegs;

    for (let i = 0; i < numSegs + 1; i++) {
      const t = now + i * timeslice;
      const p = sgp4(satCache[satId], t).position;
      try {
        pointsOut[i * 3] = p.x;
        pointsOut[i * 3 + 1] = p.y;
        pointsOut[i * 3 + 2] = p.z;
      } catch (_err) {
        pointsOut[i * 3] = 0;
        pointsOut[i * 3 + 1] = 0;
        pointsOut[i * 3 + 2] = 0;
      }
    }

    postMessage({
      pointsOut: pointsOut.buffer,
      satId
    }, [pointsOut.buffer]);
  }
};
