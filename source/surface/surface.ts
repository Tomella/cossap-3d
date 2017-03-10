declare var Explorer3d;
import { SurfaceEvent } from "./surfaceevent";
import { SurfaceSwitch } from "./surfaceswitch";

export class Surface extends THREE.EventDispatcher {
   materials: any = {};
   surface;
   bbox: number[];
   aspectRatio: number;

   constructor(public options: any) {
      super();
   }

   parse() {
      let parser = new Explorer3d.WcsEsriImageryParser(this.options);

      parser.addEventListener(Explorer3d.WcsEsriImageryParser.BBOX_CHANGED_EVENT, event => {
         // Careful here. The event name
         this.dispatchEvent(event);
         let data = event.data;
         this.bbox = data.bbox;
         this.aspectRatio = data.aspectRatio;
      });

      parser.addEventListener(Explorer3d.WcsEsriImageryParser.TEXTURE_LOADED_EVENT, event => {
         this.dispatchEvent(event);
      });

      return parser.parse().then(data => {
         this.surface = data;
         Explorer3d.Logger.log(seconds() + ": We have shown the document");
         setTimeout(() => {
            this.fetchWireframeMaterial();
            this.fetchMaterials();
         });
         return data;
      }).catch(function (err) {
         Explorer3d.Logger.error("We failed in the simple example");
         Explorer3d.Logger.error(err);
      });
   }

   fetchWireframeMaterial() {
      this.materials.wireframe = new THREE.MeshBasicMaterial({
         color: 0xeeeeee,
         transparent: true,
         opacity: 0.7,
         wireframe: true
      });
      this.dispatchEvent({type: SurfaceEvent.MATERIAL_LOADED, data: new SurfaceSwitch("wireframe", this, this.materials.wireframe)});
   }

   fetchMaterials() {
      let points = this.surface.geometry.vertices;
      let resolutionX = this.options.resolutionX;
      this.materials.image = this.surface.material;
      this.dispatchEvent({type: SurfaceEvent.MATERIAL_LOADED, data: new SurfaceSwitch("image", this, this.materials.image)});
   }

   set visible(on) {
      this.surface.visible = on;
   }

   switchSurface(name: string, opacity: number) {
      this.surface.visible = true;
      this.surface.material = this.materials[name];
      this.surface.material.opacity = opacity;
      this.surface.material.needsUpdate = true;
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}