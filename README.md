# Things in Space

Original author: James Yoder (https://github.com/jeyoder)

A real-time interactive WebGL visualisation of objects in Earth orbit

The official live version is hosted at http://stuffin.space/

## Installation

For the most part it is simply a question of dropping
the files into a folder and serving them up from there.

If any changes are made to the underlying javascript
files, then the script-loader.php will need to be run, as follows:

    php script-loader.php > scripts/script-loader.js

This step is done to avoid needing an environment that provides php on the public facing server. For example,
this allows the project to hosted on `github.io`.

## Getting TLE data

While TLE data (Two-Line Elements) is included in the project, it won't be up to date.

If you wish to get current TLE data, then head over to [Space Track](https://www.space-track.org/),
login and then you can use the following URL:

https://www.space-track.org/basicspacedata/query/class/tle_latest/ORDINAL/1/EPOCH/%3Enow-30/orderby/NORAD_CAT_ID/format/json

## License

MIT license