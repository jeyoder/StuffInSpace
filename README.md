# Things in Space

Original author: James Yoder (https://github.com/jeyoder)

A real-time interactive WebGL visualisation of objects in Earth orbit

The official live version is hosted at http://stuffin.space/

## Running for Development

 1. Install dependencies: `npm run install`
 2. Run the project `npm run dev`

Connect to it at http://localhost:5173

## Building for Deployment

 1. Install dependencies: `npm run install`
 2. Build the project `npm run build`

The resulting assets will be in the `dist` folder, which you can
then make available on your website.

Note, the current setup assumes the project will be run at the root
of the website.

## Getting TLE data

While TLE data (Two-Line Elements) is included in the project, it won't be up to date.

If you wish to get current TLE data, then head over to [Space Track](https://www.space-track.org/),
login and then you can use the following URL:

https://www.space-track.org/basicspacedata/query/class/tle_latest/ORDINAL/1/EPOCH/%3Enow-30/orderby/NORAD_CAT_ID/format/json

Once you have the latest data, then update `public/data/TLE.json`, if running in
development or `data/TLE.json` if deployed.

## License

MIT license