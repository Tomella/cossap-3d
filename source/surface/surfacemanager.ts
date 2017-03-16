import { longestSide } from "../utils/geoutils";
import { Surface } from "./surface";
import { SurfaceLauncher } from "../workers/launcher/surfacelauncher";
import { SurfaceEvent } from "./surfaceevent";
declare var Explorer3d;

export class SurfaceManager extends THREE.EventDispatcher {
   private THRESHOLD_WIDTH = 1000; // 1km needed for hi res.

   surface: Surface;
   loadHiresOn: boolean;
   hiResSurface: Surface;
   bbox: number[];
   aspectRatio: number;
   lastSurfaceName = "image";

   constructor(public options: any) {
      super();
   }

   parse() {
      this.loadHiresOn = true;
      this.surface = new Surface(this.options);
      // console.log("options1");
      // console.log(this.options);
      this.surface.addEventListener(Explorer3d.WcsEsriImageryParser.BBOX_CHANGED_EVENT, event => {
         this.dispatchEvent(event);
         let data = event.data;
         let side = longestSide(data.bbox);
         this.loadHiresOn = side > this.THRESHOLD_WIDTH;

         if (this.loadHiresOn) {
            this.loadHiRes(data);
         }
      });

      this.surface.addEventListener(SurfaceEvent.MATERIAL_LOADED, event => {
         this.dispatchEvent(event);
      });

      return this.surface.parse().then(data => {
         if (!this.loadHiresOn) {
            this.dispatchEvent({
               type: SurfaceEvent.SURFACE_ELEVATION,
               data
            });
         }
         return data;
      }).catch(function (err) {
         Explorer3d.Logger.error(err);
         throw err;
      });
   }

   private loadHiRes(data) {
      // console.log(data);

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
         this.dispatchEvent({
            type: SurfaceEvent.SURFACE_ELEVATION,
            data: event.data
         });
         this.dispatchEvent(event);
      });

      this.hiResSurface.parse();
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}