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

   export class World {
      camera: THREE.Camera;
      dataContainer: THREE.Object3D;
   }
}