export class ElevationMaterial extends THREE.MeshPhongMaterial {
   /**
    * Options:
    *    mandatory:
    *       resolutionX
    *       resolutionY
    *       data          // Single dimension array of z values

    *    optional:
    *       maxDepth     // Used to scale water, default 5000m (positive depth)
    *       maxElevation // Used to scale elevation, default 2200m
    */
   constructor(public options: any) {
      super(options);

      let res = options.data;
      let mask = document.createElement("canvas");
      let resolutionX = mask.width = options.resolutionX;
      let resolutionY = mask.height = options.resolutionY;
      let context = mask.getContext("2d");
      let id = context.createImageData(1, 1);
      let d  = id.data;

      // TODO: Some magic numbers. I need think about them. I think the gradient should stay the same.
      res.forEach((item, i) => {
         let color = item.color;
         drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
      });

      let texture = new THREE.Texture(mask);
      texture.needsUpdate = true;
      let opacity = options.opacity ? options.opacity : 1;

      this.setValues({
         map: texture,
         transparent: true,
         opacity: opacity,
         side: THREE.DoubleSide
      });

      function drawPixel(x, y, r, g, b, a) {
         d[0]   = r;
         d[1]   = g;
         d[2]   = b;
         d[3]   = a;
         context.putImageData( id, x, y );
      }
   }
}