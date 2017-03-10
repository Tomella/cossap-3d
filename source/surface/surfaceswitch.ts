import { Surface } from "./surface";

export class SurfaceSwitch {
   constructor(public name: string, public surface: Surface, public material: THREE.Material, public priority: number = 0) {}

   on(opacity: number = 1) {
      this.surface.switchSurface(this.name, opacity);
   }

   off() {
      this.surface.visible = false;
   }
}