declare var Explorer3d;

export class Surface extends THREE.EventDispatcher {
   static META_DATA_LOADED = Explorer3d.WcsEsriImageryParser.BBOX_CHANGED_EVENT;
   static TEXTURE_LOADED_EVENT = Explorer3d.WcsEsriImageryParser.TEXTURE_LOADED_EVENT;
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
         this.fetchTopoMaterial(data);
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

   fetchTopoMaterial(data) {
      this.materials.topo = new Explorer3d.WmsMaterial({
         template: this.options.topoTemplate,
         width: data.width,
         height: data.height, // Yeah, I know it is the same
         transparent: true,
         bbox: data.bbox,
         opacity: 0.7
      });
   }

   fetchWireframeMaterial() {
      this.materials.wireframe = new THREE.MeshBasicMaterial({
         color: 0xeeeeee,
         transparent: true,
         opacity: 0.7,
         wireframe: true
      });
   }

   fetchMaterials() {
      let points = this.surface.geometry.vertices;
      let resolutionX = this.options.resolutionX;
      this.materials.image = this.surface.material;
      this.materials.heatmap = new Explorer3d.ElevationMaterial({
         resolutionX: resolutionX,
         resolutionY: points.length / resolutionX,
         data: points,
         transparent: true,
         opacity: 1,
         side: THREE.DoubleSide
      });
   }

   switchSurface(name) {
      let opacity = this.surface.material.opacity;
      this.surface.material = this.materials[name];
      this.surface.material.opacity = opacity;
      this.surface.material.needsUpdate = true;
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}