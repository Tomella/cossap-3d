import { ElevationLookup } from "../elevation/elevationlookup";
import { RocksParticlesLauncher } from "../workers/launcher/rocksparticleslauncher";
import { TextSprite } from "../textsprite/textsprite";
import { WorkerEvent } from "../workers/workerevent";

export class RocksContainer extends THREE.EventDispatcher {
   static PARTICLES_LOADED = WorkerEvent.PARTICLES_LOADED;
   static PARTICLES_COMPLETE = WorkerEvent.PARTICLES_COMPLETE;

   private container: THREE.Object3D;
   private cluster: THREE.Object3D;
   widthFactor: number;
   zoom: number;
   id: string;

   constructor(public feature: GeoJSON.Feature<GeoJSON.Point>,
               public options: {
                  any,
                  summaryOnly: boolean,
                  bbox: number[],
                  baseUrl: string,
                  workerLocation: string,
                  queryService: string,
                  featuresService: string,
                  elevationLookup?: ElevationLookup
               }
   ) {
      super();
      this.container = new THREE.Object3D();
      this.id = feature.id;
      let zoom = this.zoom = +this.id.split("/")[0];
      this.widthFactor = 3000 / Math.pow(2, zoom);

      this.createCluster();
   }

   private optionalParticles() {
      // Bail out if we have been told to.
      if (this.options.summaryOnly) {
         return;
      }
      let launcher = new RocksParticlesLauncher({
         bbox: this.options.bbox,
         id: this.id,
         template: this.options.baseUrl + this.options.featuresService,
         workerLocation: this.options.workerLocation
      });

      launcher.addEventListener(WorkerEvent.PARTICLES_LOADED, event => {
         this.dispatchEvent(event);
      });

      launcher.addEventListener(WorkerEvent.PARTICLES_COMPLETE, event => {
         // Sometimes we do not create them
         if (this.cluster) this.cluster.visible = false;
         this.dispatchEvent(event);
      });
      launcher.parse();
   }

   private createCluster() {
      // Use the canonical EPSG:3857 point
      let xy = this.feature.geometry.coordinates;
      let count = this.count;
      let widthFactor = this.widthFactor;
      let zoom = this.zoom;
      let container = this.container;

      if (this.options.elevationLookup) {
         this.options.elevationLookup.intersect(xy).then(intersection => {
            if (intersection) {
               this.cluster = createCluster(xy, intersection.point.z);
            }
            this.optionalParticles();
         });
      } else {
         this.cluster = createCluster(xy, 2000);
         this.optionalParticles();
      }

      function createCluster(xy, z) {
         let group = new THREE.Object3D();
         let texture = new THREE.TextureLoader().load( "resources/imgs/red_brick.jpg" );
         let material = new THREE.MeshPhongMaterial({
               map: texture,
               side: THREE.DoubleSide
         });
         let radius = widthFactor * (100 + Math.pow(count, 0.45));
         let object = new THREE.Mesh( new THREE.CylinderBufferGeometry(radius, radius, radius * 1.2, 20), material );
         object.rotation.x = Math.PI / 2;
         object.position.set( xy[0], xy[1], z);

         let sprite = new TextSprite({scale: 150000000 / Math.pow(zoom, 5.5), borderColor: { r: 255, g: 255, b: 255, a: 1 }, rounding: 1, fontsize: 14});
         let text = sprite.make(count.toLocaleString());
         text.material.map.image.addEventListener("mouseover", event => {
            console.log(event)
         })

         text.position.set(xy[0], xy[1], z + radius * 0.6);
         group.add(text);

         group.add(object);
         container.add(group);
         return group;
      }
   }

   get count() {
      return this.feature.properties["count"];
   }

   create(): THREE.Object3D {
      return this.container;
   }
}
