import { jday } from 'satellite.js';

const D2R = Math.PI / 180.0;

function currentDirection () {
  const now = new Date();
  let j = jday(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );
  j += now.getUTCMilliseconds() * 1.15741e-8; // days per millisecond

  return this.getDirection(j);
}

function getDirection (jd) {
  const n = jd - 2451545;
  let L = (280.460) + (0.9856474 * n); // mean longitude of sun
  let g = (357.528) + (0.9856003 * n); // mean anomaly
  L %= 360.0;
  g %= 360.0;

  const ecLon = L + 1.915 * Math.sin(g * D2R) + 0.020 * Math.sin(2 * g * D2R);
  const ob = this.getObliquity(jd);

  const x = Math.cos(ecLon * D2R);
  const y = Math.cos(ob * D2R) * Math.sin(ecLon * D2R);
  const z = Math.sin(ob * D2R) * Math.sin(ecLon * D2R);

  return [x, y, z];
}

function getObliquity (jd) {
  const t = (jd - 2451545) / 3652500;
  // oObliquity in arcseconds
  const obliquity = (
    84381.448
    - 4680.93 * t
    - 1.55 * t ** 2
    + 1999.25 * t ** 3
    - 51.38 * t ** 4
    - 249.67 * t ** 5
    - 39.05 * t ** 6
    + 7.12 * t ** 7
    + 27.87 * t ** 8
    + 5.79 * t ** 9
    + 2.45 * t ** 10
  );

  return obliquity / 3600.0;
}

export default {
  currentDirection,
  getDirection,
  getObliquity
};
