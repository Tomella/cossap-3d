import { CSS2DRenderer } from "./css2drenderer";
import { CSS2DObject } from "./css2dobject";

export class LabelRenderer extends CSS2DRenderer {
   renderer;
   private _root: THREE.Group;

   constructor(public element: HTMLElement) {
      super();
      this._root = new THREE.Group();
   }

   create() {
      let bounds = this.element.getBoundingClientRect();

      this.setSize(bounds.width, bounds.height);
      this.domElement.style.position = "absolute";
      this.domElement.style.top = "0";
      this.domElement.style.pointerEvents = "none";
      this.element.appendChild(this.domElement);

      window.addEventListener("resize", () => {
         let bounds = this.element.getBoundingClientRect();
         this.setSize(bounds.width, bounds.height);
      }, false );
   }

   add(text: string, position: THREE.Vector3): void {
      let target = document.createElement("div");
      target.className = "label-renderer";
      target.style.color = "rgb(255,255,255)";
      target.textContent = text;
      let label = new CSS2DObject(target);
      label.position.copy(position);
      this._root.add(label);
   }

   get labels() {
      return this._root;
   }
}