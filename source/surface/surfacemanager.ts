import { Surface } from "./surface";
import { SurfaceLauncher } from "../workers/launcher/surfacelauncher";
import { SurfaceEvent } from "./surfaceevent";
declare var Explorer3d;

export class SurfaceManager extends THREE.EventDispatcher {
   surface: Surface;
   hiResSurface: Surface;
   bbox: number[];
   aspectRatio: number;
   lastSurfaceName = "image";

   constructor(public options: any) {
      super();
   }

   parse() {
      this.surface = new Surface(this.options);
      console.log("options1");
      console.log(this.options);
      this.surface.addEventListener(Explorer3d.WcsEsriImageryParser.BBOX_CHANGED_EVENT, event => {
         this.dispatchEvent(event);
         this.loadHiRes(event.data);
      });

      this.surface.addEventListener(SurfaceEvent.MATERIAL_LOADED, event => {
         this.dispatchEvent(event);
      });

      return this.surface.parse().then(data => {
         return data;
      }).catch(function (err) {
         Explorer3d.Logger.error("We failed in the simple example");
         Explorer3d.Logger.error(err);
      });
   }

   private loadHiRes(data) {
      console.log(data);

      let aspectRatio = data.width / data.height;
      let width, height, imageWidth, imageHeight;
      if (aspectRatio > 1) {
         imageWidth = this.options.hiResImageWidth;
         imageHeight = Math.round(this.options.hiResImageWidth / aspectRatio);
         width = this.options.hiResX;
         height = Math.round(this.options.hiResX / aspectRatio);
      } else {
         imageWidth = Math.round(this.options.hiResImageWidth * aspectRatio);
         imageHeight = this.options.hiResImageWidth;
         height = this.options.hiResX;
         width = Math.round(this.options.hiResX * aspectRatio);
      }

      let options = Object.assign({},
         this.options,
         {
            bbox: data.bbox,
            template: this.options.template,
            loadImage: true,
            resolutionX: width,
            resolutionY: height,
            imageWidth: imageWidth,
            imageHeight: imageHeight
         }
      );

      this.hiResSurface = new SurfaceLauncher(options);
      // this.hiResSurface = new Surface(options);
      this.hiResSurface.addEventListener(SurfaceEvent.MATERIAL_LOADED, event => {
         // Set the priority higher than lo-res
         event.data.priority = 1;
         this.dispatchEvent(event);
      });

      // this.hiResSurface = new Surface(options);
      this.hiResSurface.addEventListener(SurfaceEvent.SURFACE_LOADED, event => {
         this.dispatchEvent(event);
      });

      this.hiResSurface.parse();
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}