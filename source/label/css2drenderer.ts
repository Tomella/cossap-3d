import { CSS2DObject } from "./css2dobject";

/**
 * Refactored THREE.CSS2DRenderer
 * @author mrdoob / http://mrdoob.com/
 */

export class CSS2DRenderer {
   domElement: HTMLElement;

   private viewMatrix;
   private vector;
   private viewProjectionMatrix;
   private width: number;
   private height: number;
   private widthHalf: number;
   private heightHalf: number;

   constructor() {
      console.log("CSS2DRenderer", THREE.REVISION);

      this.vector = new THREE.Vector3();
      this.viewMatrix = new THREE.Matrix4();
      this.viewProjectionMatrix = new THREE.Matrix4();

      this.domElement = document.createElement("div");
      this.domElement.style.overflow = "hidden";
   }

   render(scene, camera) {
      let self = this;
      scene.updateMatrixWorld();

      if (camera.parent === null) camera.updateMatrixWorld();

      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      this.viewMatrix.copy(camera.matrixWorldInverse.getInverse(camera.matrixWorld));
      this.viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, this.viewMatrix);

      renderObject(scene, camera);

      function renderObject(object, camera) {
         if (object instanceof CSS2DObject) {
            camera.updateMatrixWorld();
            self.vector.setFromMatrixPosition(object.matrixWorld);
            self.vector.applyMatrix4(self.viewProjectionMatrix);

            let element = object.element;
            let x = (self.vector.x * self.widthHalf / 2200000  + self.widthHalf);
            let y = (-self.vector.y * self.heightHalf / 2400000 + self.heightHalf);

            let xStr = x.toString();
            let yStr = y.toString();
            let style = "translate(-50%,-50%) translate("
                        + xStr + "px,"
                        + yStr + "px)";

            element.style.WebkitTransform = style;
            element.style.MozTransform = style;
            element.style.oTransform = style;
            element.style.transform = style;

            if (element.parentNode !== self.domElement) {
               self.domElement.appendChild(element);
            }
         }

         for (let i = 0, l = object.children.length; i < l; i++) {
            renderObject(object.children[i], camera);
         }
      }


   }

   setSize(width, height) {
      this.width = width;
      this.height = height;

      this.widthHalf = this.width / 2;
      this.heightHalf = this.height / 2;

      this.domElement.style.width = width + "px";
      this.domElement.style.height = height + "px";
   }
}