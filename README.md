Things in Space
===============

Original author: James Yoder (https://github.com/jeyoder)

A real-time interactive WebGL visualisation of objects in Earth orbit

The official live version is hosted at http://stuffin.space/

Installation
------------

For the most part it is simply a question of dropping
the files into a folder and serving them up from there.

If any changes are made to the underlying javascript 
files, then the script-loader.php will need to be run, as follows:

    php script-loader.php > scripts/script-loader.js
    
This step is done to avoid needing an environment that provides php on the public facing server. For example, 
this allows the project to hosted on `github.io`.