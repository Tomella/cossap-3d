import { Surface } from "./surface";
import { SurfaceLauncher } from "../workers/launcher/surfacelauncher";
declare var Explorer3d;

export class SurfaceManager extends THREE.EventDispatcher {
   static HIRES_LOADED = "surfacemanager.hires.loaded";
   static SURFACE_CHANGED = "surfacemanager.surface.changed";
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
      this.surface.addEventListener(Surface.META_DATA_LOADED, event => {
         this.dispatchEvent(event);
         this.loadHiRes(event.data);
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
         height = Math.round(this.options.hiResX / aspectRatio)
      } else {
         imageWidth = Math.round(this.options.hiResImageWidth * aspectRatio)
         imageHeight = this.options.hiResImageWidth;
         height = this.options.hiResX;
         width = Math.round(this.options.hiResX * aspectRatio)
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
      this.hiResSurface.addEventListener(Surface.TEXTURE_LOADED_EVENT, event => {
         let data = event.data;
         this.transitionToHiRes(data);
         this.dispatchEvent({type: SurfaceManager.HIRES_LOADED, data});
      });

      this.hiResSurface.parse();
   }

   private transitionToHiRes(data) {
      let loRes = this.surface.surface;
      let opacity = loRes.material.opacity;
      console.log("Running loRes = " + opacity);
      loRes.visible = false;
   }

   switchSurface(name) {
      let actor: Surface;
      if (!this.hiResSurface || !this.hiResSurface.surface) {
         actor = this.surface;
      } else {
         if (name === "wireframe") {
            actor = this.surface;
            this.hiResSurface.surface.visible = false;
         } else {
            actor = this.hiResSurface;
            this.surface.surface.visible = false;
         }
         this.dispatchEvent({ type: SurfaceManager.SURFACE_CHANGED, data: actor.surface});
      }
      actor.switchSurface(name);
      return actor;
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}