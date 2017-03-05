# explorer.3d

Core technologies are:
* Runtime (see the bower.json file)
  * ThreeJS
  * Proj4j
  * GeoTiffParser
* Developement time (See package.json)
  * NodeJS
  * Express
  * Gulp
  * Typescript 2.0
  * Rollup
* Integration testing - Whatever you feel like. The greater the diversity the better. Just use stuff that is available by CDN and everything should run smoothly.


## Developing.
### Global installs
* Gulp
* Typescript 2.x
* Run npm install
* Run bower install (this copies into the examples/bower-components directory)


## Typescript definitions.
No typings! We use the modern way (at this time, anyway) way of including typescript definitions, that is NPM. See package.json for the "@types"

## Unit testing
Not my strong point. If interested you can do a push request. Maybe I'll learn something.

## Integration testing
The examples directory has a demo app and I find it easiest to build in there or extend the existing apps so run:
`> node server`

This serves both the content from the `examples` directory as 'http://localhost:3000/' and directly from the `dist` directory as '/dist'

So having gulp running means that the code builds directly into the `dist` directory and is thus immediately available on a browser refresh.

## Consuming.
If you are going to use the library there are CDN repositories for:
* Proj4js - https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.15/proj4.js
* ThreeJS - https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min.js

Proj4js allows data stored in different projections to be transformed onto the projection of the viewport.

ThreeJS is the WebGL wrapper that allows 3D rendering in a more abstracted way.

## IE11
You need promises. You need promises in the web worker. The ES6-PROMISE is bundled as a resource so that the web workers can find the
location. NB: We don't load the library if in a browser that supports Promises.
### Problems
If you are going to support IE11 then there are a few things. It seems to hold onto memory even after the API has cleaned up therefore
for big data you are better off refreshing the page rather than deleting via the API and start again. It isn't the API
hanging onto the memory as profiling it shows it is holding nothing it shouldn't be. On my machine it seems to crash around 1.5 GB of
memory. Obvioulsy that will vary.

## Where do I find data?
All the the normal places. Go to the relevant autorities and search on "gocad"
http://www.ga.gov.au/search/
https://data.gov.au/

Usually they are in a zip file and some of them are huge like gigabytes. Unzip the files somewhere and tour the directories. The API handles three file types:
* Lines or polylines - File with a ".pl" after them
* Points - Typically files with a "vs" extension.
* Surfaces - Files with "ts" extension.

## But I'm still confused. Where is a simple dataset to get started with?
As usual we have to be careful with copyright so there are no files here. This one has a good range of vs files..
http://www.gsnsw.net/3D_data/20150807_Surat_Gunnedah_Basement_Gocad.zip

There are some monster files in there that will probably crash your browser. I can handle any on mine if I use:
* Microsoft Edge - It seems best of the browsers in handling large files (~250 MB is the largest in the linked dataset.)
* 16 GB RAM
* The rest shouldn't really matter too much but...
* An i7-6700hq cpu
* And its onboard intel graphics
* 1920x1080 resolution screen

The latest browsers supported in order of performance Edge, Chrome and Firefox. It might work on others, it just hasn't been tested.