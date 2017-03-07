import { Surface } from "./surface";
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
      console.log("data");
      console.log(data);

      let aspectRatio = data.width / data.height;

      let options = Object.assign({},
         this.options,
         {
            loadImage: true,
            resolutionX: this.options.hiResX,
            resolutionY: Math.round(this.options.hiResX * aspectRatio),
            imageWidth: this.options.hiResImageWidth,
            imageHeight: Math.round(this.options.hiResImageWidth / aspectRatio)
         }
      );
      this.hiResSurface = new Surface(options);
      this.hiResSurface.addEventListener(Surface.TEXTURE_LOADED_EVENT, event => {
         let data = event.data;
         this.transitionToHiRes(data);
         this.dispatchEvent({type: SurfaceManager.HIRES_LOADED, data});
      });

      this.hiResSurface.parse();
   }

   private transitionToHiRes(data) {
      let loRes = this.surface.surface;
      run();

      function run() {
         setTimeout(() => {
            let opacity = loRes.material.opacity - 0.05;
            console.log("Running loRes = " + opacity);
            if (opacity < 0) {
               loRes.visible = false;
            } else {
               loRes.material.opacity = opacity;
               run();
            }
         }, 30);
      }
   }

   switchSurface(name) {
      let actor: Surface;
      if (!this.hiResSurface) {
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