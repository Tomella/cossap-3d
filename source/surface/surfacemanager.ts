import { Surface } from "./surface";
declare var Explorer3d;

export class SurfaceManager extends THREE.EventDispatcher {
   static HIRES_LOADED = "surfacemanager.hires.loaded";
   materials: any = {};
   surface;
   hiResSurface;
   bbox: number[];
   aspectRatio: number;

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
      console.log("data");
      console.log(data);

      let aspectRatio = data.width / data.height;

      let options = Object.assign({},
         this.options,
         {
            resolutionX: this.options.hiResX,
            resolutionY: Math.round(this.options.hiResX * aspectRatio),
            imageWidth: this.options.hiResImageWidth,
            imageHeight: Math.round(this.options.hiResImageWidth / aspectRatio)
         }
      );
      this.hiResSurface = new Surface(options);
      this.hiResSurface.addEventListener(Surface.TEXTURE_LOADED_EVENT, event => {
         let data = event.data;
         this.surface.surface.visible = false;
         // We now have the hires THREE JS layer.
         this.hiResSurface = data;
         this.dispatchEvent({type: SurfaceManager.HIRES_LOADED, data});
      });

      this.hiResSurface.parse();
   }

   switchSurface(name) {
      let opacity = this.surface.surface.material.opacity;
      this.surface.surface.material = this.materials[name];
      this.surface.surface.material.opacity = opacity;
      this.surface.surface.material.needsUpdate = true;
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}