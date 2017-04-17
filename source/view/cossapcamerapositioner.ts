export class CossapCameraPositioner extends Explorer3d.CameraPositioner {
   constructor() {
      super();
   }

   position(z: number, radius: number, center: { x, y, z }) {
      return {
         x: center.x,
         y: center.y - 2 * radius,
         z: center.z + 2 * radius
      };
   }

   up(z: number, radius: number, center: { x, y, z }) {
      return {
         x: 0,
         y: 0,
         z: 1
      };
   }

}