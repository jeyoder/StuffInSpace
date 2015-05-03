<?php
// why is this a php file? lolidk
?>
<!doctype html>
<html>
  <head>
    <link href='http://fonts.googleapis.com/css?family=Droid+Sans' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="/icomoon.css">
    <link rel="stylesheet" href="/style.css">
    <script src="http://code.jquery.com/jquery-2.1.3.min.js"></script>
    <script src="/script-loader.php"></script>
    <title>Things in Space</title>
  </head>
  <body>

 
  <div id="canvas-holder">
    <canvas id="canvas"></canvas>
    <div id="search-holder">
      <span class="icon-search"></span>
      <input type="text" id="search"></input>
    </div>
    <div id="search-results"></div>
    <div id="sat-hoverbox">(none)</div>
    <div id="sat-infobox">
      <div id="sat-info-title">WAFFLESAT-5 R/B</div>
      <div class="sat-info-row">
        <div class="sat-info-key">Int'l Designator</div>
        <div class="sat-info-value" id="sat-intl-des">1998-067A</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Type</div>
        <div class="sat-info-value" id="sat-type">PAYLOAD</div>
      </div>
      <div class="sat-info-row">
        <div class="sat-info-key">Launch Site</div>
        <div class="sat-info-value">??</div>
      </div>
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

