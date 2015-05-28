/* global satellite */
importScripts('/scripts/satellite.min.js');

var satCache = [];
var satPos, satVel, satAlt;


onmessage = function(m) {
  var start = Date.now();
  
  var satData = JSON.parse(m.data);
  var len = satData.length;

  var extraData = [];
  for(var i = 0; i < len; i++) {
    var extra = {};
    var satrec = satellite.twoline2satrec( //perform and store sat init calcs
      satData[i].TLE_LINE1, satData[i].TLE_LINE2);
    
    //keplerian elements
    extra.inclination  = satrec.inclo;  //rads
    extra.eccentricity = satrec.ecco;
    extra.raan         = satrec.nodeo;   //rads
    extra.argPe        = satrec.argpo;  //rads
    extra.meanMotion   = satrec.no * 60 * 24 / (2 * Math.PI);     // convert rads/minute to rev/day
    
    //fun other data
    extra.semiMajorAxis = Math.pow(8681663.653 / extra.meanMotion, (2/3));
    extra.semiMinorAxis = extra.semiMajorAxis * Math.sqrt(1 - Math.pow(extra.eccentricity, 2));   
    extra.apogee = extra.semiMajorAxis * (1 + extra.eccentricity) - 6371;
    extra.perigee = extra.semiMajorAxis * (1 - extra.eccentricity) - 6371;
    extra.period = 1440.0 / extra.meanMotion;
    
    extraData.push(extra);
    satCache.push(satrec);
  }
  
  satPos = new Float32Array(len * 3);
  satVel = new Float32Array(len * 3);
  satAlt = new Float32Array(len);
  
  var postStart = Date.now();
  postMessage({
    extraData : JSON.stringify(extraData),
  });
  console.log('sat-cruncher init: ' + (Date.now() - start) + ' ms  (incl post: ' + (Date.now() - postStart) + ' ms)');
  propagate();
};

function propagate() {
//  var start = Date.now();
  
  var now = new Date();   
  var j = jday(now.getUTCFullYear(), 
               now.getUTCMonth() + 1, // Note, this function requires months in range 1-12. 
               now.getUTCDate(),
               now.getUTCHours(), 
               now.getUTCMinutes(), 
               now.getUTCSeconds());
  j += now.getUTCMilliseconds() * 1.15741e-8; //days per millisecond     
  var gmst = satellite.gstime_from_jday(j);
  
  for(var i=0; i < satCache.length; i++) {
    var m = (j - satCache[i].jdsatepoch) * 1440.0; //1440 = minutes_per_day
    var pv = satellite.sgp4(satCache[i], m); 
    var x,y,z,vx,vy,vz,alt;
    try{
       x = pv.position.x; // translation of axes from earth-centered inertial
       y = pv.position.y; // to OpenGL is done in shader with projection matrix
       z = pv.position.z; // so we don't have to worry about it
       vx = pv.velocity.x;
       vy = pv.velocity.y;
       vz = pv.velocity.z;
       alt = satellite.eci_to_geodetic(pv.position, gmst).height;
    } catch(e) {
       x = 0;
       y = 0;
       z = 0;
       vx = 0;
       vy = 0;
       vz = 0;
       alt = 0;
    }
  //    console.log('x: ' + x + ' y: ' + y + ' z: ' + z);
    satPos[i*3] = x;
    satPos[i*3+1] = y;
    satPos[i*3+2] = z;
    
    satVel[i*3] = vx;
    satVel[i*3+1] = vy;
    satVel[i*3+2] = vz;
    
    satAlt[i] = alt;
  }
 
  postMessage({satPos: satPos.buffer, satVel: satVel.buffer, satAlt: satAlt.buffer}, [satPos.buffer, satVel.buffer, satAlt.buffer]);
  satPos = new Float32Array(satCache.length * 3);
  satVel = new Float32Array(satCache.length * 3);
  satAlt = new Float32Array(satCache.length);
 // console.log('sat-cruncher propagate: ' + (performance.now() - start) + ' ms');
  
  setTimeout(propagate, 500);
}

function jday(year, mon, day, hr, minute, sec){ //from satellite.js
  'use strict';
  return (367.0 * year -
        Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
        Math.floor( 275 * mon / 9.0 ) +
        day + 1721013.5 +
        ((sec / 60.0 + minute) / 60.0 + hr) / 24.0  //  ut in days
        //#  - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
        );
}