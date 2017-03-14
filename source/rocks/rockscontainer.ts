import { ElevationLookup } from "../elevation/elevationlookup";

export class RocksContainer {
   private container: THREE.Object3D;
   widthFactor: number;
   id: string;

   constructor(public feature: GeoJSON.Feature<GeoJSON.Point>, public options: {any, baseUrl: string, queryService: string, featuresService: string, elevationLookup?: ElevationLookup}) {
      this.container = new THREE.Object3D();
      this.id = feature.id;
      let zoom = +this.id.split("/")[0];
      this.widthFactor = 3000 / Math.pow(2, zoom);

      this.createCluster();
   }

   private createCluster() {
      // Use the canonical EPSG:3857 point
      let xy = this.feature.geometry.coordinates;
      let count = this.count;
      let widthFactor = this.widthFactor;
      let container = this.container;

      if (this.options.elevationLookup) {
         this.options.elevationLookup.intersect(xy).then(intersection => {
            if (intersection) {
               createCluster(xy, intersection.point.z);
            }
            this.createparticles();
         });
      } else {
         createCluster(xy, 2000);
         this.createparticles();
      }

      function createCluster(xy, z) {
         let texture = new THREE.TextureLoader().load( "resources/imgs/red_brick.jpg" );
         let material = new THREE.MeshPhongMaterial({
               map: texture,
               side: THREE.DoubleSide
         });
         let radius = widthFactor * (100 + Math.pow(count, 0.45));
         let object = new THREE.Mesh( new THREE.CylinderBufferGeometry(radius, radius, radius * 1.2, 20), material );
         object.rotation.x = Math.PI / 2;
         object.position.set( xy[0], xy[1], z);
         container.add( object );
      }
   }

   private createparticles() {


   }

   get count() {
      return this.feature.properties["count"];
   }

   create(): THREE.Object3D {
      return this.container;
   }
}
