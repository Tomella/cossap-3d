(function (context) {
   importScripts(
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r83/three.js',
      'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.15/proj4.js',
      '../cossap3d/bower_components/geotiffparser/js/GeotiffParser.js',
      '../cossap3d/bower_components/elevation/dist/elevation.js',
      '../cossap3d/bower_components/explorer-3d/dist/explorer3d.js',
      '../cossap3d/workerlib.js');

   context.addEventListener('message', function (e) {
      parse(e.data);
   });

   function parse(options) {
      let extentBbox = options.extent
      extent = new Elevation.Extent2d(extentBbox[0], extentBbox[1], extentBbox[2], extentBbox[3]);


      let mergedOptions = Object.assign({}, options, {
         extent: extent
      });
      console.log(mergedOptions)

      let parser = new Explorer3d.WcsEsriImageryParser(mergedOptions);

      parser.addEventListener(Explorer3d.WcsEsriImageryParser.BBOX_CHANGED_EVENT, event => {
         // Careful here. The event name
         this.dispatchEvent(event);
         let data = event.data;
         this.bbox = data.bbox;
         this.aspectRatio = data.aspectRatio;
      });

      parser.addEventListener(Explorer3d.WcsEsriImageryParser.TEXTURE_LOADED_EVENT, event => {
         console.log("We have an event");
         // this.dispatchEvent(event);
      });
debugger
      return parser.parse().then(data => {
         this.surface = data;
         Explorer3d.Logger.log(Date.now() + ": We have shown the document");
         setTimeout(() => {
            //this.fetchMaterials();
         });
         return data;
      }).catch(function (err) {
         Explorer3d.Logger.error("We failed in the simple example");
         Explorer3d.Logger.error(err);
      });
   }

   function to3857(coords) {
      return proj4("EPSG:4326", "EPSG:3857", [coords[0], coords[1]]);
   };
})(this);