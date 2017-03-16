import { EventDispatcher } from "../../utils/eventdispatcher";
import { WorkerEvent } from "../workerevent";

export class SurfaceWorker extends EventDispatcher {
   static DEFAULT_MAX_DEPTH = 5000;
   static DEFAULT_MAX_ELEVATION = 2200;
   static BLOCK_SIZE = 2000;

   constructor(public options: {template: string, any, blocks?: number, resolutionX: number, resolutionY: number, maxDepth?: number, maxElevation?: number}) {
      super();
   }

   load(): Promise<any> {
      let options = Object.assign({}, this.options, {}, {template: this.options.template + "&store=false"});
      let restLoader = new Elevation.WcsXyzLoader(this.options);
      // console.log("Running surface worker");

      return restLoader.load().then(res => {
         // console.log("Loaded surface worker xyz");
         this.createBlocks(res);
         return null;
      });
   }

   createBlocks(res) {
      let block = [];

      res.forEach( (item, i) => {
         if (block.length === SurfaceWorker.BLOCK_SIZE) {
            this.dispatchEvent({
               type: WorkerEvent.XYZ_BLOCK,
               data: block
            });
            block = [];
         }
         block.push(item);
      });

      if (block.length) {
         this.dispatchEvent({
            type: WorkerEvent.XYZ_BLOCK,
            data: block
         });
      }

      this.dispatchEvent({
         type: WorkerEvent.XYZ_LOADED
      });

      this.createColors(res);
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
      let length = res.length;
      let buffer = [];

      res.forEach( (item, i) => {
         if (buffer.length === SurfaceWorker.BLOCK_SIZE) {
            this.dispatchEvent({
               type: WorkerEvent.COLOR_BLOCK,
               data: buffer
            });
            buffer = [];
         }

         let color, z = item.z;

         if (z > 0) {
            color = lut.getColor(z);
         } else {
            color = blue.getColor(z);
         }
         buffer.push({
            x: i % resolutionX,
            y: Math.floor(i / resolutionX),
            r: color.r * 255,
            g: color.g * 255,
            b: color.b * 255,
            a: 255
         });
      });

      if (buffer.length) {
         this.dispatchEvent({
            type: WorkerEvent.COLOR_BLOCK,
            data: buffer
         });
      }

      this.dispatchEvent({
         type: WorkerEvent.COLOR_LOADED
      });
   }
}