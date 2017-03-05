declare var Explorer3d;

export class Mappings extends THREE.EventDispatcher {
   private _surface;
   private _boreholes;
   private _surfaceMaterialSelect;

   constructor(public factory, public dom) {
      super();
      this.mapVerticalExagerate();
      this.mapSurfaceOpacity();
      this.mapShowHideBoreholes();
      this.mapSurfaceMaterialRadio();
   }

   private mapVerticalExagerate() {
      let element = this.dom.verticalExaggeration;
      let view = this.dom.verticalExaggerationView;
      // We'll attach something to change vertical exaggeration now.
      let verticalExaggerate = new Explorer3d.VerticalExaggerate(this.factory).onChange(function() {
         Explorer3d.Logger.log("We have a trigger to vertical exaggerate");
         verticalExaggerate.set(+element.value);
         view.innerHTML = element.value;
      });

      element.addEventListener("change", function() {
         verticalExaggerate.set(+element.value);
         view.innerHTML = element.value;
      });
   }

   set surface(surface) {
      let opacity = this.dom.surfaceOpacity.value;
      console.log("Setting opacity to " + opacity);
      this._surface = surface;
      if (surface) surface.material.opacity = opacity;
   }

   mapSurfaceOpacity() {
      let element = this.dom.surfaceOpacity;
      element.addEventListener("change", () => {
         if (this._surface) {
            this._surface.material.opacity = this.dom.surfaceOpacity.value;
         }this.dom.surfaceOpacity.blur();
      });
   }

   set boreholes(boreholes) {
      this._boreholes = boreholes;
      if (boreholes) boreholes.visible = this.dom.showHideBoreholes.checked;
   }

   set material(mat) {
      this.dom.surfaceMaterialSelect.value = mat;
   }

   get material() {
      return this.dom.surfaceMaterialSelect.value;
   }

   mapSurfaceMaterialRadio() {
      let elements = Array.from<Element>(this.dom.surfaceMaterialRadio);
      let self = this;

      elements.forEach(element => {
         element.addEventListener("change", eventHandler);
      });
      function eventHandler(event) {
         self.dispatchEvent({type: "material.changed", name: event.target.value});
      };
   }

   mapShowHideBoreholes() {
      let element = this.dom.showHideBoreholes;

      element.addEventListener("change", () => {
         if (this._boreholes) this._boreholes.visible = this.dom.showHideBoreholes.checked;
      });
   }
}