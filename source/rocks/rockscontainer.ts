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
      let xy = this.feature.geometry.coordinates;
      let texture = new THREE.TextureLoader().load( "resources/imgs/rock_small.png" );
      let material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide
      });
      let radius = this.widthFactor * (100 + Math.pow(this.count, 0.45));
      let object = new THREE.Mesh( new THREE.CylinderBufferGeometry(radius, radius, radius * 1.2, 50), material );
      object.rotation.x = Math.PI / 2;

      if (this.options.elevationLookup) {
         this.options.elevationLookup.lookup(xy).then(z => {
            object.position.set( xy[0], xy[1], z);
            this.container.add( object );
            this.createparticles();
         });
      } else {
         object.position.set( xy[0], xy[1], 2000); // + radius);
         this.container.add( object );
         this.createparticles();
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
