<?php
$basePath = dirname(__FILE__);
// $_SERVER['DOCUMENT_ROOT'];
header('Content-type: text/javascript');

$scriptFiles = [

//libraries
'gl-matrix-min.js',
'spin.min.js',
'perfect-scrollbar.jquery.min.js',
//'satellite.js',

//our script files
'shader-loader.js',
'color-scheme.js',
'groups.js',
'search-box.js',
'orbit-display.js',
'line.js',
'earth.js',
'sun.js',
'sat.js',
'main.js'
];

$shaderFiles = [
'earth-fragment.glsl',
'earth-vertex.glsl',
'dot-fragment.glsl',
'dot-vertex.glsl',
'pick-fragment.glsl',
'pick-vertex.glsl',
'path-fragment.glsl',
'path-vertex.glsl'
];

echo "// This file is generated using the scripts-loader.php file";
echo "// Source code changes should be made in the files that are";
echo "// used for this file";
echo "//";

foreach($scriptFiles as $f) {
  echo '// **** ' . $f . " ***\r\n";
  echo file_get_contents($basePath . '/scripts/' . $f);
  echo "\r\n// **** end " . $f . " ***\r\n\r\n";
} 

$shaderData = [];
foreach($shaderFiles as $f) {
  $shaderData[] = [
    'name' => $f,
    'code' => file_get_contents($basePath . '/shaders/' . $f)
  ];
}
?>

var shaderData = <?= json_encode($shaderData) ?>;
