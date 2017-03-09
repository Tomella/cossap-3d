(function (context) {
   importScripts(
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r83/three.js',
      'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.15/proj4.js',
      '../../cossap3d/bower_components/geotiffparser/js/GeotiffParser.js',
      '../../cossap3d/bower_components/elevation/dist/elevation.js',
      '../../cossap3d/bower_components/explorer-3d/dist/explorer3d.js',
      '../../cossap3d/workerlib.js');

   context.addEventListener('message', function (e) {
      var data = e.data;
      var type = data.type;

      switch (type) {
         case "surface":
            loadSurface(data);
            break;
      }
   });

   function loadSurface(options) {
      var extentBbox = options.extentBbox;

      var mergedOptions = Object.assign({}, options, {
         extent: new Elevation.Extent2d(extentBbox[0], extentBbox[1], extentBbox[2], extentBbox[3])
      });

      var loader = new Cossap3d.SurfaceWorker(mergedOptions);

      // Put in some listeners here.
      loader.addEventListener(Cossap3d.SurfaceWorker.XYZ_LOADED, event => {
         context.postMessage({
            type: event.type,
            data:event.data
         });
      });

      // Put in some listeners here.
      loader.addEventListener(Cossap3d.SurfaceWorker.COLOR_LOADED, event => {
         context.postMessage({
            type: event.type,
            data:event.data
         });
      });

      loader.load().then(function(data) {
         console.log("Tadah!");
         console.log(data);
      })

   }
})(this);