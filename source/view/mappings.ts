import { LayerSwitch } from "../layer/layerswitch";
declare var Explorer3d;

/**
 * This is the bridge between the UI and the model
 */
export class Mappings {
   private _materials: any;
   private _radioMap: any;
   private _boreholes;
   private _rocks;
   private _surfaceMaterialSelect = "image";


   constructor(public factory, public dom) {
      this._materials = {};
      this._radioMap = {};
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

   mapSurfaceOpacity() {
      let element = this.dom.surfaceOpacity;
      element.addEventListener("change", () => {
         this._materials[this._surfaceMaterialSelect].on(+element.value);
      });
   }

   set rocks(rocks) {
      this._rocks = rocks;
      if (rocks) rocks.visible = this.dom.showHideBoreholes.checked;
   }

   set boreholes(boreholes) {
      this._boreholes = boreholes;
      if (boreholes) boreholes.visible = this.dom.showHideBoreholes.checked;
   }

   addMaterial(detail: LayerSwitch) {
      let name = detail.name;
      let material = this._materials[name];
      let keys = Object.keys(this._materials);

      if (!material || detail.priority > material.priority) {
         Object.keys(this._materials).forEach(key => {
            this._materials[key].off();
         });
         this._materials[name] = detail;
         this._radioMap[name].disabled = false;
      }

      if (this._materials[this._surfaceMaterialSelect]) {
         this._materials[this._surfaceMaterialSelect].on(+this.dom.surfaceOpacity.value);
      }
   }

   hasMaterial(name: string) {
      return !!this._materials[name];
   }

   mapSurfaceMaterialRadio() {
      let elements = Array.from<HTMLInputElement>(this.dom.surfaceMaterialRadio);

      elements.forEach(element => {
         element.addEventListener("change", event => {
            let name = event.target.value;
            this._surfaceMaterialSelect = name;
            let details = this._materials[name];
            let opacity = +this.dom.surfaceOpacity.value;
            Object.keys(this._materials).forEach(key => {
               this._materials[key].off();
            });
            details.on(opacity);
         });

         this._radioMap[(<HTMLInputElement> element).value] = element;
      });
   }

   mapShowHideBoreholes() {
      let element = this.dom.showHideBoreholes;

      element.addEventListener("change", () => {
         if (this._boreholes) {
            this._boreholes.visible = this.dom.showHideBoreholes.checked;
         };
      });
   }
}