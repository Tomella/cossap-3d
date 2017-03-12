import { Config } from "../../app/config";
import { Surface } from "../../surface/surface";
import { SurfaceEvent } from "../../surface/surfaceevent";
import { LayerSwitch } from "../../layer/layerswitch";
import { WorkerEvent } from "../workerevent";
declare var Explorer3d;

export class SurfaceLauncher extends Surface {
   materials: any = {};
   surface;
   bbox: number[];
   aspectRatio: number;

   private switches: LayerSwitch[] = [];
   private materialComplete = false;
   private geometry;
   private startMilli: number;

   constructor(options: any) {
      super(options);
   }

   private since() {
      return Date.now() - this.startMilli;
   }

   parse() {
      this.startMilli = Date.now();
      let worker = new Worker(Config.preferences.surfaceWorkerLocation);
      let width = this.options.hiResTopoWidth ? this.options.hiResTopoWidth : 512;
      let height = Math.floor(width * this.options.resolutionY / this.options.resolutionX);

      let extent: Elevation.Extent2d = this.options.extent;
      let options = {
         type: "surface",
         extentBbox: this.options.extent.toBbox(),
         bbox: this.options.bbox,
         template: this.options.template,
         resolutionX: this.options.resolutionX,
         resolutionY: this.options.resolutionY,
         width,
         height
      };

      let heapMapState;
      let geometryState;

      this.createImageMaterial();
      this.createTopoMaterial(options);

      worker.addEventListener("message", message => {
         let data = message.data;
         if (data.type === WorkerEvent.XYZ_LOADED) {
            console.log("WorkerEvent.XYZ_LOADED: " + this.since());
            this.completeGeometry(geometryState.geometry);
            this.checkComplete();
         } else if (data.type === WorkerEvent.XYZ_BLOCK) {
            console.log("WorkerEvent.XYZ_BLOCK: " + this.since());
            this.extendGeometry(geometryState, data.data);
         } else if (data.type === WorkerEvent.COLOR_BLOCK) {
            console.log("WorkerEvent.COLOR_BLOCK: " + this.since());
            this.extendHeatmapMaterial(heapMapState, options, data.data);
         } else if (data.type === WorkerEvent.COLOR_LOADED) {
            console.log("WorkerEvent.COLOR_LOADED: " + this.since());
            this.completeHeatmapMaterial(heapMapState.mask, options);
         }
      });

      worker.postMessage(options);

      heapMapState = this.prepareHeatMapMaterial(options);
      geometryState = this.prepareGeometry();
   }

   prepareGeometry(): {geometry, count} {
      console.log("createGeometry start: " + this.since());
      let resolutionX = this.options.resolutionX;
      let resolutionY = this.options.resolutionY;
      let geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
      return {
         geometry,
         count: 0
      };
   }

   extendGeometry(state, res) {
      let geometry = state.geometry;
      let count = state.count;
      res.forEach(xyz => {
         let vertice = geometry.vertices[count++];
         vertice.z = xyz.z;
         vertice.x = xyz.x;
         vertice.y = xyz.y;
      });
      state.count = count;
   }

   completeGeometry(geometry) {
      console.log("createGeometry compute start: " + this.since());
      geometry.computeBoundingSphere();
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      this.geometry = geometry;
      console.log("createGeometry end: " + this.since());
   }

   prepareHeatMapMaterial(options): {mask, context, id, d} {
      console.log("createHeatmapMaterial start: " + this.since());
      let mask = document.createElement("canvas");
      mask.width = options.resolutionX;
      mask.height = options.resolutionY;

      let context = mask.getContext("2d");
      let id = context.createImageData(1, 1);
      let d = id.data;

      return { mask, context, id, d};
   }

   extendHeatmapMaterial({mask, context, id, d}, options, res) {
      console.log("createHeatmapMaterial continue: " + this.since());
      res.forEach(({ x, y, r, g, b, a }) => {
         d[0] = r;
         d[1] = g;
         d[2] = b;
         d[3] = a;
         context.putImageData(id, x, y);
      });
   }

   completeHeatmapMaterial(mask, options) {
      let texture = new THREE.Texture(mask);
      texture.needsUpdate = true;
      let opacity = options.opacity ? options.opacity : 1;

      let material = new THREE.MeshPhongMaterial({
         map: texture,
         transparent: true,
         opacity: opacity,
         side: THREE.DoubleSide
      });

      this.materials.heatmap = material;
      this.pushMaterialLoadedEvent(new LayerSwitch("heatmap", this, material));
      console.log("createHeatmapMaterial end: " + this.since());
   }


   private pushMaterialLoadedEvent(data?: LayerSwitch): void {
      if (data) {
         this.switches.push(data);
      }

      if (this.surface) {
         this.switches.forEach(data => this.dispatchEvent({type: SurfaceEvent.MATERIAL_LOADED, data}));
         this.switches = [];
      }
   }

   checkComplete() {
      if (this.materialComplete && this.geometry) {
         this.createMesh();
         this.dispatchEvent({
            type: SurfaceEvent.SURFACE_LOADED,
            data: this.surface
         });
         this.pushMaterialLoadedEvent();
      }
   }

   createTopoMaterial(data) {
      let self = this;
      this.materials.topo = new Explorer3d.WmsMaterial({
         template: this.options.topoTemplate,
         width: data.width,
         height: data.height, // Yeah, I know it is the same
         transparent: true,
         bbox: data.bbox,
         opacity: 0.7,
         onLoad: () => {
            self.pushMaterialLoadedEvent(new LayerSwitch("topo", self, self.materials.topo));
         }
      });
   }

   createImageMaterial() {
      console.log("createImageMaterial start: " + this.since());
      let url = this.options.esriTemplate
            .replace("${bbox}", this.options.bbox)
            .replace("${format}", "Image")
            .replace("${size}", this.options.imageWidth + "," + this.options.imageHeight);
      let loader = new THREE.TextureLoader();

      loader.crossOrigin = "";

      let opacity = this.options.opacity ? this.options.opacity : 1;
      let material = this.materials.image = new THREE.MeshPhongMaterial({
         map: loader.load(url, event => {
            this.materialComplete = true;
            this.pushMaterialLoadedEvent(new LayerSwitch("image", this, material));
            this.checkComplete();
         }),
         transparent: true,
         opacity: opacity,
         side: THREE.DoubleSide
      });
      console.log("createImageMaterial end: " + this.since());
   }

   createMesh() {
      this.surface = new THREE.Mesh(this.geometry, this.materials.image);
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}