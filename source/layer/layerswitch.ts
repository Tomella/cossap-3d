import { Layer } from "../layer/layer";

export class LayerSwitch {
   constructor(public name: string, public layer: Layer, public material: THREE.Material, public priority: number = 0) {}

   on(opacity: number = 1) {
      this.layer.switch(this.name, opacity);
   }

   off() {
      this.layer.visible = false;
   }
}