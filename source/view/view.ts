import { Bind } from "../app/bind";
import { BoreholesManager } from "../boreholes/boreholesmanager";
import { CossapCameraPositioner } from "./cossapcamerapositioner";
import { ElevationLookup } from "../elevation/elevationlookup";
import { Mappings } from "./mappings";
import { RocksManager } from "../rocks/rocksmanager";
import { SurfaceEvent } from "../surface/surfaceevent";
import { SurfaceManager } from "../surface/surfacemanager";
declare var Explorer3d;
declare var proj4;

export class View {
   elevationLookup: ElevationLookup;
   factory;
   mappings: Mappings;
   surface: SurfaceManager;
   boreholes: BoreholesManager;
   rocks: RocksManager;

   constructor(public bbox: number[], public options: any) {

      if (bbox) {
         this.draw();
         this.mappings = new Mappings(this.factory, Bind.dom);
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

      this.elevationLookup = new ElevationLookup();

      this.surface = new SurfaceManager(options);
      this.surface.addEventListener(SurfaceEvent.SURFACE_LOADED, event => {
         this.factory.extend(event.data, false);
      });

      this.surface.addEventListener(SurfaceEvent.SURFACE_ELEVATION, event => {
         this.elevationLookup.setMesh(event.data);
      });

      this.surface.addEventListener(SurfaceEvent.MATERIAL_LOADED, event => {
         this.mappings.addMaterial(event.data);
      });


      this.surface.parse().then(surface => {
         // We got back a document so transform and show.
         this.factory.show(surface);
         this.fetchBoreholes(bbox);
         this.fetchRocks(bbox);
      }).catch(err => {
         // If we can't get a surface we may as well give up because that is the 3D part.
         this.mappings.dead();
      });
   }

   fetchRocks(bbox) {
      this.rocks = new RocksManager(Object.assign({ bbox, elevationLookup: this.elevationLookup }, this.options.rocks));
      this.rocks.parse().then(data => {
         this.mappings.rocks = data;
         if (data) {
            this.factory.extend(data, false);
         }
         // window["larry"] = this.factory;
      }).catch(err => {
         console.log("ERror rocks");
         console.log(err);
      });
   }

   fetchBoreholes(bbox) {
      this.boreholes = new BoreholesManager(Object.assign({ bbox }, this.options.boreholes));
      this.boreholes.parse().then(data => {
         if (data) {
            this.mappings.boreholes = data;
            this.factory.extend(data, false);
         }
      }).catch(err => {
         console.log("ERror boReholes");
         console.log(err);
      });
   }

   destroy() {

   }
}
