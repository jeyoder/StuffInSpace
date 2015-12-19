(function() {
  var time = {};

  /*
  these three vars determine the flow of time in the simulation. Time ticks at a determined rate
  relative to a fixed point that ties a simulation time to how long ago it occurred in real life.
  */
  var rate = 1;
  var timeOriginRealWorld = new Date();
  var timeOriginSimulation = new Date();

  time.getSimulationTime = function() {
    var real_dt = (Date.now() - timeOriginRealWorld.getTime()); //in ms
    var sim_dt = real_dt * rate;
    return new Date(timeOriginSimulation.getTime() + sim_dt);
  };

  time.setRate = function(_rate) {
    //mark a new origin
    timeOriginSimulation = time.getSimulationTime();
    timeOriginRealWorld = new Date();

    rate = _rate;

  };

  time.resetSimulationTime = function() {
    rate = 1;
    timeOriginRealWorld = new Date();
    timeOriginSimulation = new Date();
  };

  time.updateDisplay = function() {
    $('#real-time').html((new Date()).toISOString());
    $('#sim-time').html(time.getSimulationTime().toISOString());
  }

  window.time = time;
})();