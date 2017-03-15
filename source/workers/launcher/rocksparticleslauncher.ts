import { Config } from "../../app/config";
import { Surface } from "../../surface/surface";
import { SurfaceEvent } from "../../surface/surfaceevent";
import { LayerSwitch } from "../../layer/layerswitch";
import { WorkerEvent } from "../workerevent";
declare var Explorer3d;

export class RocksParticlesLauncher extends THREE.EventDispatcher {
   private startMilli: number;

   constructor(public options: {id, template, workerLocation, bbox}) {
      super();
   }

   private since() {
      return Date.now() - this.startMilli;
   }

   parse() {
      this.startMilli = Date.now();
      let worker = new Worker(this.options.workerLocation);
      console.log("started worker: " + this.options.workerLocation);

      worker.addEventListener("message", message => {
         let data = message.data;
         this.dispatchEvent(data);
         if (data.type === WorkerEvent.PARTICLES_COMPLETE) {
            worker.terminate();
         }
      });

      worker.postMessage(Object.assign({ type: "particles"}, this.options));
   }
}

function seconds() {
   return (Date.now() % 100000) / 1000;
}