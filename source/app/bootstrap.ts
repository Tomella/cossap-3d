import { Storage } from "../storage/storage";
import { View } from "../view/view";
import { Bind } from "./bind";
import { DomBind } from "../bind/dombind";
import { Config } from "./config";

let view = null;

export function bootstrap() {
   let storage = new Storage();

   // let domBind = new DomBind(document.body);

   drawView(storage.bbox);

   storage.addEventListener(Storage.BBOX_EVENT, (evt) => {
      drawView(storage.bbox);
   });

}

function drawView(bbox) {
   if (view) {
      view.destroy();
      view = null;
   }

   if (bbox) {
      view = new View(bbox, createOptions());
   }
}

function createOptions() {
   return Object.assign(Config.preferences, {
      target: Bind.dom.target
   });
}