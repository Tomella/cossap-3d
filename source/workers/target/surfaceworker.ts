export class SurfaceWorker extends THREE.EventDispatcher {
   static XYZ_LOADED = "xyz.loaded";
   static COLOR_LOADED = "color.loaded";
   static DEFAULT_MAX_DEPTH = 5000;
   static DEFAULT_MAX_ELEVATION = 2200;

   constructor(public options: any) {
      super();
   }

   load(): Promise<any> {
      let restLoader = new Elevation.WcsXyzLoader(this.options);
      console.log("Running surface worker");

      return restLoader.load().then(res => {
         console.log("Loaded surface worker xyz");
         this.dispatchEvent({
            type: SurfaceWorker.XYZ_LOADED,
            data: res
         });

         this.dispatchEvent({
            type: SurfaceWorker.COLOR_LOADED,
            data: this.createColors(res)
         });

         return null;
      });
   }

   createColors(res) {
      let resolutionX = this.options.resolutionX;
      let resolutionY = this.options.resolutionY;

      // TODO: Some magic numbers. I need think about them. I think the gradient should stay the same.
      let maxDepth = this.options.maxDepth ? this.options.maxDepth : SurfaceWorker.DEFAULT_MAX_DEPTH;
      let maxElevation = this.options.maxElevation ? this.options.maxElevation : SurfaceWorker.DEFAULT_MAX_ELEVATION;
      let blue = new THREE.Lut("water", maxDepth);
      let lut  = new THREE.Lut("land", maxElevation);
      blue.setMax(0);
      blue.setMin(-maxDepth);
      lut.setMax(Math.floor(maxElevation));
      lut.setMin(0);

      let index = 0;
      let count = 0;



      return res.map((item, i) => {
         let color, z = item.z;

         if (z > 0) {
            color = lut.getColor(z);
         } else {
            color = blue.getColor(z);
         }
         return {
            x: i % resolutionX,
            y: Math.floor(i / resolutionX),
            r: color.r * 255,
            g: color.g * 255,
            b: color.b * 255,
            a: 255
         };
      });
   }
}