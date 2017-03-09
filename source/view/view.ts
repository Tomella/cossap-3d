import { CossapCameraPositioner } from "./cossapcamerapositioner";
import { Mappings } from "./mappings";
import { Bind } from "../app/bind";
import { SurfaceManager } from "../surface/surfacemanager";
import { BoreholesManager } from "../boreholes/boreholesmanager";
declare var Explorer3d;
declare var proj4;

export class View {
   factory;
   mappings: Mappings;
   surface: SurfaceManager;
   boreholes;

   constructor(public bbox: number[], public options: any) {

      if (bbox) {
         this.draw();
         this.mappings = new Mappings(this.factory, Bind.dom);

         this.mappings.addEventListener("material.changed", event => {
            this.surface.switchSurface(event["name"]);
         });
      } else {
         this.die();
      }
   }

   die() {
      Bind.dom.invalidParameter.classList.remove("hide");
   }

   draw() {
      let options = Object.assign({}, this.options.surface);
      let bbox = this.bbox;
      // Grab ourselves a world factory
      let viewOptions = this.options.worldView;
      viewOptions.cameraPositioner = new CossapCameraPositioner();
      let factory = this.factory = new Explorer3d.WorldFactory(this.options.target, viewOptions);

      let ll = proj4("EPSG:4326", "EPSG:3857", [bbox[0], bbox[1]]);
      let ur = proj4("EPSG:4326", "EPSG:3857", [bbox[2], bbox[3]]);
      options.bbox = ll;
      options.bbox.push(ur[0]);
      options.bbox.push(ur[1]);

      options.imageHeight = Math.round(options.imageWidth * (options.bbox[3] - options.bbox[1]) / (options.bbox[2] - options.bbox[0]));

      this.surface = new SurfaceManager(options);
      this.surface.addEventListener(SurfaceManager.HIRES_LOADED, event => {
         let surface = event.data;
         this.mappings.surface = surface;
         this.factory.extend(surface, false);
      });

      this.surface.addEventListener(SurfaceManager.SURFACE_CHANGED, event => {
         let surface = event.data;
         this.mappings.surface = surface;
      });

      this.surface.parse().then(surface => {
         this.mappings.surface = surface;

         this.boreholes = new BoreholesManager(Object.assign({bbox}, this.options.boreholes));
         this.boreholes.parse().then(data => {
            if (data) {
               this.mappings.boreholes = data;
               this.factory.extend(data, false);
            }
         }).catch(err => {
            console.log("ERror boReholes");
            console.log(err);
         });
         // We got back a document so transform and show.
         this.factory.show(surface);
      });
   }

   destroy() {

   }
}
