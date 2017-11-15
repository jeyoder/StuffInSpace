(function() {
var D2R = Math.PI / 180.0;

function currentDirection() {
  var now = new Date();
  var j = 	jday(now.getUTCFullYear(), 
             now.getUTCMonth() + 1, // Note, this function requires months in range 1-12. 
             now.getUTCDate(),
             now.getUTCHours(), 
             now.getUTCMinutes(), 
             now.getUTCSeconds());
  j += now.getUTCMilliseconds() * 1.15741e-8; //days per millisecond   
  
  return getDirection(j);
}

function getDirection(jd) {
  var n = jd - 2451545;
  var L = (280.460) + (0.9856474 * n); //mean longitude of sun
  var g = (357.528) + (0.9856003 * n); //mean anomaly
  L = L % 360.0;
  g = g % 360.0;
  
  var ecLon = L + 1.915 * Math.sin(g * D2R) + 0.020 * Math.sin(2 * g * D2R);
  var ob = getObliquity(jd);

  var x = Math.cos(ecLon * D2R);
  var y = Math.cos(ob * D2R) * Math.sin(ecLon * D2R);
  var z = Math.sin(ob * D2R) * Math.sin(ecLon * D2R);
  
  return [x, y, z];
 //return [1, 0, 0];
}

function getObliquity(jd) {
  var t = (jd - 2451545) / 3652500;
  var ob =  //arcseconds
    84381.448
   - 4680.93  * t
   -    1.55  * Math.pow(t, 2)
   + 1999.25  * Math.pow(t, 3)
   -   51.38  * Math.pow(t, 4)
   -  249.67  * Math.pow(t, 5)
   -   39.05  * Math.pow(t, 6)
   +    7.12  * Math.pow(t, 7)
   +   27.87  * Math.pow(t, 8)
   +    5.79  * Math.pow(t, 9)
   +    2.45  * Math.pow(t, 10);
  
  return ob / 3600.0;
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

window.sun = {
  getDirection: getDirection,
  currentDirection: currentDirection
};

})();
