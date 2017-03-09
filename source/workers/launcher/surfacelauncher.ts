import { Config } from "../../app/config";
import { Surface } from "../../surface/surface";
declare var Explorer3d;

export class SurfaceLauncher extends Surface {
   materials: any = {};
   surface;
   bbox: number[];
   aspectRatio: number;

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
      let geometry, material;
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

      worker.addEventListener('message', message => {
         let data = message.data;
         if (data.type === "xyz.loaded") {
            this.createGeometry(options, data.data).then(geom => {
               this.geometry = geom;
               this.checkComplete();
            });;
         } else if (data.type === "color.loaded") {
            this.createHeatmapMaterial(options, data.data);
         }
      });

      worker.postMessage(options);

      this.createImageMaterial();
      this.fetchTopoMaterial(options);
   }

   checkComplete() {
      if (this.materialComplete && this.geometry) {
         this.createMesh();
         this.dispatchEvent({
            type: Explorer3d.WcsEsriImageryParser.TEXTURE_LOADED_EVENT,
            data: this.surface
         });
      }
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
      let material = new THREE.MeshPhongMaterial({
         map: loader.load(url, event => {
            this.materialComplete = true;
            this.checkComplete();
         }),
         transparent: true,
         opacity: opacity,
         side: THREE.DoubleSide
      });
      this.materials.image = material;
      console.log("createImageMaterial end: " + this.since());
   }

   createHeatmapMaterial(options, res) {
      console.log("createHeatmapMaterial start: " + this.since());
      let self = this;
      let mask = document.createElement("canvas");
      mask.width = options.resolutionX;
      mask.height = options.resolutionY;

      let context = mask.getContext("2d");
      let id = context.createImageData(1, 1);
      let d = id.data;

      let count = 0;
      fillColor();

      function fillColor() {
         setTimeout(function () {
            if (count >= res.length) {
               complete();
               return;
            }

            do {
               let item = res[count++];
               if (count > res.length) {
                  break;
               }
               drawPixel(item);
             } while (count % 1000);

            fillColor();
         }, 5);
      }

      function complete() {
         let texture = new THREE.Texture(mask);
         texture.needsUpdate = true;
         let opacity = options.opacity ? options.opacity : 1;

         let material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
         });


         self.materials.heatmap = material;

         console.log("createHeatmapMaterial end: " + self.since());
      }

      function drawPixel(item: { x, y, r, g, b, a }) {
         d[0] = item.r;
         d[1] = item.g;
         d[2] = item.b;
         d[3] = item.a;
         context.putImageData(id, item.x, item.y);
      }
   }

   createMesh() {
      this.surface = new THREE.Mesh(this.geometry, this.materials.image);
   }

   createGeometry(options, res) {
      let self = this;
      console.log("createGeometry start: " + this.since());
      let resolutionX = this.options.resolutionX;
      let resolutionY = res.length / resolutionX;
      let geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
      let bbox = this.options.bbox;

      return new Promise((resolve, reject) => {
         let count = 0;

         if (res.length) {
            processBlock();
         } else {
            reject("No data");
         }

         function processBlock() {
            setTimeout(function () {
               if (count >= res.length) {
                  cleanUp();
                  return;
               }

               do {
                  let vertice = geometry.vertices[count];
                  let xyz = res[count++];
                  if (count > res.length) {
                     break;
                  }

                  vertice.z = xyz.z;
                  vertice.x = xyz.x;
                  vertice.y = xyz.y;
               } while (count % 1000);
               processBlock();
            }, 5);

            function cleanUp() {
               geometry.computeBoundingSphere();
               geometry.computeFaceNormals();
               geometry.computeVertexNormals();
               resolve(geometry);
               console.log("createGeometry end: " + self.since());
            }
         }
      });
   }

   switchSurface(name) {
      let opacity = this.surface.material.opacity;
      this.surface.visible = true;
      this.surface.material = this.materials[name];
      this.surface.material.opacity = opacity;
      this.surface.material.needsUpdate = true;
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}