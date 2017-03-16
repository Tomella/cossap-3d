import { RocksContainer } from "./rockscontainer";
import { RocksLoader } from "./rocksloader";
import { RocksParticles } from "./rocksparticles";
import { longestSide, featureToEpsg3857 } from "../utils/geoutils";
declare var proj4;

/**
 * Shows rock properties. All layers are contained in a single THREE.Object3d
 * and this manages them.
 * It loads up a summary,
 * Creates a container
 * Draws spheres representing each of the cells or tiles,
 * For any counts below a threshold, it goes off and fetches them.
 * As each tile shows up it draws the points and hides the sphere.
 */
export class RocksManager {
   container: THREE.Object3D;
   containers: RocksContainer[];
   rocksParticles: RocksParticles;
   static CELL_ZERO_DEGREES = 180;
   zoom: number;

   constructor(public options: {
         any,
         workerLocation?: string,
         maxCount: number,
         baseUrl: string,
         summaryService: string,
         dataUrl: string,
         serviceUrl: string,
         featuresService: string,
         queryService: string,
         elevationLookup: string,
         circumference: number,
         bbox: number[]
   }) {
      let degrees = longestSide(options.bbox);
      this.zoom = Math.ceil(Math.log(RocksManager.CELL_ZERO_DEGREES / degrees)) + 3;
   }

   parse(): Promise<THREE.Object3D> {
      let bbox = this.options.bbox;
      let rocks =  new RocksLoader({
         template: this.options.baseUrl + this.options.summaryService,
         zoom: this.zoom,
         bbox
      });

      return rocks.loadSummary().then((data: GeoJSON.FeatureCollection<GeoJSON.Point>) => {
         if (data && data.features && data.features.length) {
            this.rocksParticles = new RocksParticles(data, this.zoom);

            let count = this.rocksParticles.count;
            let original = this.options;
            let options = {
               summaryOnly: count > original.maxCount,
               bbox: original.bbox,
               baseUrl: original.baseUrl,
               workerLocation: original.workerLocation,
               queryService: original.queryService,
               featuresService: original.featuresService,
               elevationLookup: original.elevationLookup
            };


            this.containers = data.features.map(feature => new RocksContainer(featureToEpsg3857(feature), options));
            this.container = new THREE.Object3D();
            this.container.add(this.rocksParticles.points);

            this.containers.forEach(container => {
               container.addEventListener(RocksContainer.PARTICLES_LOADED, particlesEvent => {
                  this.rocksParticles.add(particlesEvent.data);
               });
               this.container.add(container.create());
            });
            return this.container;
         } else {
            console.log("rocks.load");
            console.log(data);
            return null;
         }
      });
   }

   destroy() {

   }
}