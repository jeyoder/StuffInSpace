<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Droid+Sans" type="text/css">
    <link rel="stylesheet" href="/icomoon.css" type="text/css">
    <link rel="stylesheet" href="/perfect-scrollbar.min.css" type="text/css">
    <link rel="stylesheet" href="/style.css" type="text/css">
    
    <script src="http://code.jquery.com/jquery-2.1.3.min.js"></script>
    <script src="/scripts/satellite.min.js"></script>
    <script src="/script-loader.php"></script>
    
    <?php if($_SERVER['HTTP_HOST'] === 'stuffin.space' || $_SERVER['HTTP_HOST'] === 'www.stuffin.space') { ?>
      <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      
        ga('create', 'UA-64721672-1', 'auto');
        ga('send', 'pageview');
      </script> 
   <?php } else { ?>
    <!-- analytics disabled for host "<?= $_SERVER['HTTP_HOST'] ?>" -->
   <?php } ?>
    
    <title>Stuff in Space</title>
    
  </head>
  <body>
  <div id="no-webgl">
    Stuff in Space requires <a href="http://caniuse.com/#feat=webgl">WebGL</a> and <a href="http://caniuse.com/#feat=webworkers">Web Worker</a> support. 
  </div>
  <div id="canvas-holder">
    <canvas id="canvas"></canvas>
    <div id="menu-left" class="menubar">
      <div id="search-holder" class="menu-item">
        <span class="icon-search"></span>
        <input type="text" id="search"></input>
      </div>
      <div id="menu-groups" class="menu-item">
        <div class="menu-title">Groups</div>
        <ul id="groups-display" class="dropdown submenu">
          <li data-group="<clear>" class="clear-option">Clear</li>
          <li data-group="GPSGroup">GPS</li>
          <li data-group="IridiumGroup">Iridium</li>
          <li data-group="GlonassGroup">GLONASS</li>
          <li data-group="GalileoGroup">Galileo</li>
          <li data-group="Iridium33DebrisGroup">Iridium 33 Collision Debris</li>
          <li data-group="WestfordNeedlesGroup">Westford Needles</li>
          <li data-group="SpaceXGroup">SpaceX</li>
        </ul>
      </div>
     <!-- <div id="menu-color-schemes" class="menu-item">
        <div class="menu-title">Color Schemes</div>
        <ul id="color-schemes-submenu" class="submenu">
          <li data-color="default">Type</li>
          <li data-color="velocity">Velocity</li>
          <li data-color="apogee">Apogee</li>
        </ul>
      </div>-->
    </div>
    <div id="menu-right" class="menubar">
      <div id="menu-help" class="menu-item">
        <div class="menu-title">Help</div>
        <div id="help-box" class="menubox submenu">
          <span class="box-header">Legend</span>
          <ul id="legend">
            <li>
               <img class="dot" src="/dot-red.png"></img>
               Satellite
             </li>
            <li>
              <img class="dot" src="/dot-blue.png"></img>
              Rocket body
            </li>
            <li>
              <img class="dot" src="/dot-grey.png"></img>
              Debris
            </li>
          </ul>
          <ul id="controls-info">
            <li>
              Left/Right click and drag to rotate camera
            </li>
            <li> Mousewheel to scroll </li>
            <li>
              Left click to select an object
            </li>
          </ul>
        
        </div>
      </div>
      <div id="menu-about" class="menu-item">
        <div class="menu-title">About</div>
        <div id="about-box" class="menubox submenu">
          <span class="box-header">Stuff in Space</span>
          <p>Stuff in Space is a realtime 3D map of objects in Earth orbit, visualized using WebGL.</p>
          
          <p>The website updates daily with orbit data from <a href="http://www.space-track.org">Space-Track.org</a> 
          and uses the excellent <a href="https://github.com/shashwatak/satellite-js">satellite.js</a> Javascript library
          to calculate satellite positions.</p>
          
          <span class="box-header">About the author</span>
        <!--  <p>My name is James Yoder; I'm an alumnus of <a href="http://www.usfirst.org/roboticsprograms/frc"><i>FIRST</i> Robotics
          Competition </a> (FRC) <a href="http://team624.org">Team 624</a> and an incoming Electrical and Computer Engineering freshman at the 
          University of Texas at Austin. </p> -->
          <p>Contact: <a href="mailto:info@stuffin.space">info@stuffin.space</a></p>
          <p>See Stuff in Space on <a href="https://github.com/jeyoder/ThingsInSpace"> GitHub </a></p>
        </div>
      </div>
    </div>
      <div id="search-results"></div>
    <div id="sat-hoverbox">(none)</div>
    <div id="sat-infobox">
      <div id="sat-info-title">This is a title</div>
      <div id="all-objects-link" class="link">Find all objects from this launch...</div>
      <div class="sat-info-row">
        <div class="sat-info-key">Int'l Designator</div>
        <div class="sat-info-value" id="sat-intl-des">1998-067A</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Type</div>
        <div class="sat-info-value" id="sat-type">PAYLOAD</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Apogee</div>
        <div class="sat-info-value" id="sat-apogee">100 km</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Perigee</div>
        <div class="sat-info-value" id="sat-perigee">100 km</div>
      </div>
       <div class="sat-info-row">
        <div class="sat-info-key">Inclination</div>
        <div class="sat-info-value" id="sat-inclination">123.45°</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Altitude</div>
        <div class="sat-info-value" id="sat-altitude">100  km</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Velocity</div>
        <div class="sat-info-value" id="sat-velocity">100  km/s</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Period</div>
        <div class="sat-info-value" id="sat-period">100  min</div>
      </div>
    </div>
    <div id="zoom-controls">
      <div id="zoom-in" class="zoom-button">+</div>
      <div id="zoom-out" class="zoom-button">-</div>
    </div>
    <div id="load-cover">
      <div id="loader">
        <div id="spinner"></div>
        <div id="loader-text">
          Downloading resources...
        </div>
      </div>
    </div>
  </div>
  </body>
</html>

