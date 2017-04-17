import { ElevationLookup } from "./elevationlookup";

export class ElevationBroadcaster extends THREE.EventDispatcher {
   static OVER_POINT = "overpoint";
   private mesh: THREE.Mesh;
   private world: Explorer3d.World;

   constructor(public element: HTMLElement) {
      super();
      let timer;
      let raycaster = new THREE.Raycaster();
      let down, sx, sy;

      element.addEventListener("mousemove", event => {
         // Do nothing if we do not have a mesh.
         if (!this.mesh || !this.world.camera) {
            return;
         }

         let cX = event.offsetX;
         let cY = event.offsetY;
         let mouse = new THREE.Vector2();

         event.preventDefault();

         mouse.x = (cX / element.clientWidth) * 2 - 1;
         mouse.y = - (cY / element.clientHeight) * 2 + 1;

         raycaster.setFromCamera(mouse, this.world.camera);

         let intersects = raycaster.intersectObject(this.mesh);

         if (intersects.length > 0) {
            let feature = intersects[0];
            let point: THREE.Vector3 = feature.point;
            point.z /= this.world.dataContainer.scale.z;
            this.dispatchEvent({
               type: ElevationBroadcaster.OVER_POINT,
               point: point
            });
         }
      });
   }

   setMesh(mesh: THREE.Mesh) {
      this.mesh = mesh;
   }

   setWorld(world: Explorer3d.World) {
      this.world = world;
   }
}