export class ElevationLookup {
   callbacks: Function[];

   constructor(public mesh?: THREE.Mesh) {
      if (!mesh) {
         this.callbacks = [];
      }
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
            resolve(getElevation(this.mesh, point));
         });

      } else {
         return new Promise((resolve, reject) => {
            this.callbacks.push((mesh) => {
               console.log("Calling back");
               resolve(getElevation(mesh, point));
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

function getElevation(mesh: THREE.Mesh, point: number[]): number {
   let intersection = getIntersection(mesh, point);
   let z = intersection ? intersection.point.z : 0;
   return z;
}