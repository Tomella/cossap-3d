export class ElevationLookup {
   callbacks: Function[];
   world: Explorer3d.World;

   constructor(public mesh?: THREE.Mesh) {
      if (!mesh) {
         this.callbacks = [];
      }
   }

   setWorld(world: Explorer3d.World) {
      this.world = world;
   }

   setMesh(mesh: THREE.Mesh) {
      this.mesh = mesh;
      if (this.callbacks) {
         this.callbacks.forEach((callback: Function) => {
            callback(mesh);
         });
         this.callbacks = null;
      }
   }

   intersect(point: number[]): Promise<THREE.Intersection> {
      if (this.mesh) {
         return new Promise((resolve, reject) => {
            resolve(getIntersection(this.mesh, point));
         });

      } else {
         return new Promise((resolve, reject) => {
            this.callbacks.push((mesh) => {
               console.log("Calling back");
               resolve(getIntersection(mesh, point));
            });
         });
      }
   }

   lookup(point: number[]): Promise<number> {
      if (this.mesh) {
         return new Promise((resolve, reject) => {
            resolve(getElevation(this.mesh, point, this.world));
         });
      } else {
         return new Promise((resolve, reject) => {
            this.callbacks.push((mesh) => {
               console.log("Calling back");
               resolve(getElevation(mesh, point, this.world));
            });
         });
      }
   }

   lookupPoints(points: number[][]): Promise<number> {
      if (this.mesh) {
         return new Promise((resolve, reject) => {
            resolve(points.map(point => getElevation(this.mesh, point, this.world)));
         });
      } else {
         return new Promise((resolve, reject) => {
            this.callbacks.push((mesh) => {
               console.log("Calling back");
               resolve(points.map(point => getElevation(this.mesh, point, this.world)));
            });
         });
      }
   }
}

function getIntersection(mesh: THREE.Mesh, point: number[]): THREE.Intersection {
   let raycaster = new THREE.Raycaster();
   let origin = new THREE.Vector3(point[0], point[1], 50000);
   let direction = new THREE.Vector3(0, 0, -1);

   raycaster.set(origin, direction);
   let result = raycaster.intersectObject(mesh);
   return result.length ? result[0] : null;
}

function getElevation(mesh: THREE.Mesh, point: number[], world: Explorer3d.World): number {
   let intersection = getIntersection(mesh, point);
   let z = intersection ? intersection.point.z : 0;
   return z / world.dataContainer.scale.z;
}