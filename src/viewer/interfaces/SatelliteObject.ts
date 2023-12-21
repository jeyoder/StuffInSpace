/**
 * Satellite object
 * lower case properties are generated inside the app
 * upper case properties are from the json file
 *
 * TODO: There should be two interfaces, one before parsing and one after. The post-parsing interface should not contain duplicate data or data that is not used.
 */

export interface SatelliteObject {
  /** Internal ID*/
  id: number;
  /** Number of minutes to complete one orbit = 1440 / meanMotion */
  period: number;
  /** Lowest point in orbit in Km */
  perigee: number;
  /** Highest point in orbit in Km */
  apogee: number;
  /** Semi major axis in Km */
  semiMajorAxis: number;
  /** Semi minor axis in Km */
  semiMinorAxis: number;
  /** Mean motion in revolutions per day */
  meanMotion: number;
  /** Argument of perigee in radians */
  argPe: number;
  /** Right ascension of ascending node in radians */
  raan: number;
  /** Eccentricity (0 = circular, 1 = parabolic) */
  eccentricity: number;
  /** Inclination in radians */
  inclination: number;
  /** Position in ECI coordinates (Km) */
  position: { x: number; y: number; z: number; };
  /** Total velocity (Km/s) */
  velocity: number;
  /** Altitude in Km */
  altitude: number;
  /** Parsed International Designator */
  intlDes: string;
  /** Satellite name */
  OBJECT_NAME: string;
  /** Raw International Designator */
  INTLDES: string;
  ORDINAL: string;
  COMMENT: string;
  ORIGINATOR: string;
  /** NORAD catalog ID */
  NORAD_CAT_ID: string;
  OBJECT_TYPE: string;
  CLASSIFICATION_TYPE: string;
  EPOCH: string;
  EPOCH_MICROSECONDS: string;
  MEAN_MOTION: string;
  ECCENTRICITY: string;
  INCLINATION: string;
  RA_OF_ASC_NODE: string;
  ARG_OF_PERICENTER: string;
  MEAN_ANOMALY: string;
  EPHEMERIS_TYPE: string;
  ELEMENT_SET_NO: string;
  REV_AT_EPOCH: string;
  BSTAR: string;
  MEAN_MOTION_DOT: string;
  MEAN_MOTION_DDOT: string;
  FILE: string;
  TLE_LINE0: string;
  TLE_LINE1: string;
  TLE_LINE2: string;
  OBJECT_ID: string;
  OBJECT_NUMBER: string;
  SEMIMAJOR_AXIS: string;
  PERIOD: string;
  APOGEE: string;
  PERIGEE: string;
  DECAYED: string;
}
