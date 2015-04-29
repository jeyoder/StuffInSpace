importScripts('/scripts/satellite.js');

var satCache = [];
var satPos, satVel;


onmessage = function(m) {
  var start = performance.now();
  var len = m.data.satData.length;
  
  var extraData = [];
  for(var i = 0; i < len; i++) {
    var ei = {};
    var satrec = satellite.twoline2satrec( //perform and store sat init calcs
      m.data.satData[i].TLE_LINE1, m.data.satData[i].TLE_LINE2);
    
    //keplerian elements
    ei.inclination  = satrec.inclo;  //rads
    ei.eccentricity = satrec.ecco;
    ei.raan         = satrec.nodeo;   //rads
    ei.argPe        = satrec.argpo;  //rads
    ei.meanMotion   = satrec.no * 60 * 24 / (2 * Math.PI);     // convert rads/minute to rev/day
    
    //fun other data
    ei.semiMajorAxis = Math.pow(8681663.653 / ei.meanMotion, (2/3));   
    ei.apogee = ei.semiMajorAxis * (1 + ei.eccentricity) - 6371;
    ei.perigee = ei.semiMajorAxis * (1 - ei.eccentricity) - 6371;
    
    extraData.push(ei);
    satCache.push(satrec);
  }	
  
  satPos = new Float32Array(len * 3);
  satVel = new Float32Array(len * 3);
  
  postMessage(extraData);
  console.log('sat-cruncher init: ' + (performance.now() - start) + ' ms');
  propagate();
};

function propagate() {
  var start = performance.now();
  
  var now = new Date();   
  var j = jday(now.getUTCFullYear(), 
               now.getUTCMonth() + 1, // Note, this function requires months in range 1-12. 
               now.getUTCDate(),
               now.getUTCHours(), 
               now.getUTCMinutes(), 
               now.getUTCSeconds());
  j += now.getUTCMilliseconds() * 1.15741e-8; //days per millisecond     
  
  for(var i=0; i < satCache.length; i++) {
    var m = (j - satCache[i].jdsatepoch) * 1440.0; //1440 = minutes_per_day
    var pv = satellite.sgp4(satCache[i], m); 
    try{
      var x = pv.position.x; // translation of axes from earth-centered inertial
      var y = pv.position.y; // to OpenGL is done in shader with projection matrix
      var z = pv.position.z; // so we don't have to worry about it
      var vx = pv.velocity.x;
      var vy = pv.velocity.y;
      var vz = pv.velocity.z;
    } catch(e) {
      var x = 0;
      var y = 0;
      var z = 0;
      var vx = 0;
      var vy = 0;
      var vz = 0;
    }
  //    console.log('x: ' + x + ' y: ' + y + ' z: ' + z);
    satPos[i*3] = x;
    satPos[i*3+1] = y;
    satPos[i*3+2] = z;
    
    satVel[i*3] = vx;
    satVel[i*3+1] = vy;
    satVel[i*3+2] = vz;
  }
 
  postMessage({satPos: satPos.buffer, satVel: satVel.buffer}, [satPos.buffer, satVel.buffer]);
  satPos = new Float32Array(satCache.length * 3);
  satVel = new Float32Array(satCache.length * 3);
  
 // console.log('sat-cruncher propagate: ' + (performance.now() - start) + ' ms');
  
  setTimeout(propagate, 1000);
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