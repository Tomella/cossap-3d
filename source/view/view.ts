import { Bind } from "../app/bind";
import { BoreholesManager } from "../boreholes/boreholesmanager";
import { CossapCameraPositioner } from "./cossapcamerapositioner";
import { ElevationBroadcaster } from "../elevation/elevationbroadcaster";
import { ElevationLookup } from "../elevation/elevationlookup";
import { ElevationView } from "./elevationview";
import { EllipsoidalToAhd } from "../mapper/ellipsoidaltoahd";
import { LabelRenderer } from "../label/labelrenderer";
import { Mappings } from "./mappings";
import { MessageBus } from "../message/messagebus";
import { RocksManager } from "../rocks/rocksmanager";
import { SurfaceEvent } from "../surface/surfaceevent";
import { SurfaceManager } from "../surface/surfacemanager";
declare var Explorer3d;
declare var proj4;

export class View {
   elevationLookup: ElevationLookup;
   elevationView: ElevationView;
   messageBus: MessageBus;
   factory;
   mappings: Mappings;
   surface: SurfaceManager;
   boreholes: BoreholesManager;
   rocks: RocksManager;

   constructor(public bbox: number[], public options: any) {
      if (bbox) {
         this.draw();
      } else {
         this.die();
      }
   }

   die() {
      Bind.dom.invalidParameter.classList.remove("hide");
   }

   draw() {
      this.messageBus = MessageBus.instance;
      this.messageBus.log("Loading...");

      let options = Object.assign({}, this.options.surface);
      let bbox = this.bbox;
      // Grab ourselves a world factory
      let viewOptions = this.options.worldView;
      viewOptions.cameraPositioner = new CossapCameraPositioner();

      let factory = this.factory = new Explorer3d.WorldFactory(this.options.target, viewOptions);
      this.mappings = new Mappings(factory, Bind.dom);
      this.mappings.messageDispatcher = this.messageBus;

      let ll = proj4("EPSG:4326", "EPSG:3857", [bbox[0], bbox[1]]);
      let ur = proj4("EPSG:4326", "EPSG:3857", [bbox[2], bbox[3]]);
      options.bbox = ll;
      options.bbox.push(ur[0]);
      options.bbox.push(ur[1]);

      options.imageHeight = Math.round(options.imageWidth * (options.bbox[3] - options.bbox[1]) / (options.bbox[2] - options.bbox[0]));

      this.elevationLookup = new ElevationLookup();

      this.surface = new SurfaceManager(options);
      this.surface.addEventListener(SurfaceEvent.SURFACE_LOADED, event => {
         this.messageBus.log("Loaded Hi Res surface", 4000);
         this.factory.extend(event.data, false);
      });

      this.surface.addEventListener(SurfaceEvent.SURFACE_ELEVATION, event => {
         this.messageBus.log("Loaded elevation details", 4000);
         this.elevationLookup.setWorld(factory.state.world);
         this.elevationLookup.setMesh(event.data);

         let elevationBroadcaster = new ElevationBroadcaster( Bind.dom.target);
         elevationBroadcaster.setWorld(factory.state.world);
         elevationBroadcaster.setMesh(event.data);

         this.elevationView = new ElevationView(elevationBroadcaster, Bind.dom.elevationView, function (vector3: THREE.Vector3) {
            let point = proj4("EPSG:3857", "EPSG:4326", [vector3.x, vector3.y]);
            return new THREE.Vector3(point[0], point[1], vector3.z);
         });

      });

      this.surface.addEventListener(SurfaceEvent.MATERIAL_LOADED, event => {
         let data = event.data;
         this.messageBus.log("Loaded " + data.name + " surface", 4000);
         this.mappings.addMaterial(data);
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
            this.messageBus.log("Rocks loading...", 4000);
         }
         // window["larry"] = this.factory;
      }).catch(err => {
         console.log("ERror rocks");
         console.log(err);
      });
   }

   fetchBoreholes(bbox) {
      let options = Object.assign({ bbox }, this.options.boreholes);
      // We only want to massage boreholes to match surface if zoomed in tightly as it is expensive.
      if (bbox[3] - bbox[1] < 0.001 && bbox[2] - bbox[0] < 0.001) {
        options.elevationLookup = (points) => this.elevationLookup.lookupPoints(points);
      } else {
         let ellipsoidalToAhd = new EllipsoidalToAhd();
         options.elevationLookup = (points) => ellipsoidalToAhd.pointsToAhd(points);
      }
      this.boreholes = new BoreholesManager(options);
      this.boreholes.parse().then(data => {
         if (data) {
            this.messageBus.log("Boreholes complete", 4000);
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
