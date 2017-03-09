import { Storage } from "../storage/storage";
import { View } from "../view/view";
import { Bind } from "./bind";
import { DomBind } from "../bind/dombind";
import { Config } from "./config";
declare var proj4;
declare var ES6Promise;

let view = null;

if (!Promise && !!ES6Promise) {
   window["Promise"] = ES6Promise;
}

export function bootstrap() {
   let storage, bbox;
   try {
      storage = new Storage();
      bbox = storage.bbox;

      if (!bbox) {
         die("Where is the valid bounding box?");
      }
   } catch(e) {
      die("That's not a valid bounding box!");
   }

   // let domBind = new DomBind(document.body);
   proj4.defs("EPSG:4283", "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");
   drawView(bbox);

   storage.addEventListener(Storage.BBOX_EVENT, (evt) => {
      drawView(storage.bbox);
   });

}

function die(text: string) {
   drawView(null);
}

function drawView(bbox) {
   if (view) {
      view.destroy();
      view = null;
   }

   view = new View(bbox, createOptions());
}

function createOptions() {
   return Object.assign(Config.preferences, {
      target: Bind.dom.target
   });
}