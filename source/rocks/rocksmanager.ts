import { RocksContainer } from "./rockscontainer";
import { RocksLoader } from "./rocksloader";
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
   static CELL_ZERO_DEGREES = 180;
   zoom: number;

   constructor(public options: {any, baseUrl: string, summaryService: string, dataUrl: string, serviceUrl: string, circumference: number, bbox: number[]}) {
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
            this.containers = data.features.map(feature => new RocksContainer(featureToEpsg3857(feature), this.options));
            this.container = new THREE.Object3D();
            this.containers.forEach(container => {
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

function featureToEpsg3857(feature: GeoJSON.Feature<GeoJSON.Point>): GeoJSON.Feature<GeoJSON.Point> {
   let point = feature.geometry.coordinates;
   feature.properties["point"] = [point[0], point[1]];
   feature.geometry.coordinates = pointToEpsg3857(point);
   return feature;
}

function pointToEpsg3857(point) {
   return proj4("EPSG:4326", "EPSG:3857", [point[0], point[1]]);
}

function bboxToEpsg3857(bbox) {
   let ll = pointToEpsg3857([bbox[0], bbox[1]]);
   let ur = pointToEpsg3857([bbox[2], bbox[3]]);
   return [ll[0], ll[1], ur[0], ur[1]];
}

function longestSide(bbox: number[]): number {
   return Math.max(bbox[2] - bbox[0], bbox[3] - bbox[1]);
}