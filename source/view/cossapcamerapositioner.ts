declare namespace Explorer3d {
   export class CameraPositioner {
      onCreate(z: number, radius: number, center: { x, y, z });
      onResize(z: number, radius: number, center: { x, y, z });
      onExtend(z: number, radius: number, center: { x, y, z });
      lookAt(z: number, radius: number, center: { x, y, z });
      position(z: number, radius: number, center: { x, y, z });
      up(z: number, radius: number, center: { x, y, z });
      near(z: number, radius: number, center: { x, y, z });
      far(z: number, radius: number, center: { x, y, z });
   }
};

export class CossapCameraPositioner extends Explorer3d.CameraPositioner {
   constructor() {
      super();
   }

   position(z: number, radius: number, center: { x, y, z }) {
      return {
         x: center.x,
         y: center.y - 0.5 * radius,
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