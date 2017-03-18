/**
 * Refactored THREE.CSS2DObject
 * @author mrdoob / http://mrdoob.com/
 */

export class CSS2DObject extends THREE.Object3D {
   constructor(public element) {
      super();

      element = element;
      element.style.position = "absolute";

      this.addEventListener("removed", function ( event ) {
         if ( this.element.parentNode !== null ) {
            this.element.parentNode.removeChild( this.element );
         }
      });
   }
}