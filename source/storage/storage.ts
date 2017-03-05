import { UrlParameters } from "../utils/query";

export class Storage extends THREE.EventDispatcher {
   static BBOX_KEY = "cossap3d.bbox";
   static BBOX_EVENT = "bbox.change";

   static STATE_KEY = "cossap3d.state";

   bbox: number[];

   constructor() {
      super();
      this.parseParameters();
      this.prepareEvents();
   }

   get state() {
      try {
         return JSON.parse(localStorage.getItem(Storage.STATE_KEY));
      } catch (e) {
         localStorage.removeItem(Storage.STATE_KEY);
         return null;
      }
   }

   set state(state) {
      if (state) {
         localStorage.setItem(Storage.STATE_KEY, JSON.stringify(state));
      } else {
         localStorage.removeItem(Storage.STATE_KEY);
      }
   }

   private parseParameters() {
      this.bbox = this.parseBbox("[" + UrlParameters.parameters().bbox + "]");
   }

   private parseBbox(bboxStr) {
      if (bboxStr) {
         try {
            let parts = JSON.parse(bboxStr);
            if (Array.isArray(parts) && parts.every(num => !isNaN(num)) && parts.length === 4) {
               // We don't range check but we do check ll < ur.
               if (parts[0] < parts[2] && parts[1] < parts[3]) {
                  return parts;
               }
            }
         } catch (e) {
            console.log(e);
         }
      }
      return null;
   }

   private prepareEvents() {
      let self = this;
      window.addEventListener("storage", dispatch);

      function dispatch(evt) {
         if (evt.key === Storage.BBOX_KEY) {
            if (self.bbox && !evt.newValue) {
               self.bbox = null;
               self.dispatchEvent({
                  type: Storage.BBOX_EVENT
               });
            } else {
               let oldBbox = self.bbox;
               let bbox = self.parseBbox(evt.newValue);
               self.bbox = bbox;
               if (!bbox || bbox.length !== 4) {
                  self.dispatchEvent({
                     type: Storage.BBOX_EVENT,
                     bbox: null
                  });
               } else if (
                  oldBbox[0] !== bbox[0] ||
                  oldBbox[1] !== bbox[1] ||
                  oldBbox[2] !== bbox[2] ||
                  oldBbox[3] !== bbox[3]
               ) {
                  self.dispatchEvent({
                     type: Storage.BBOX_EVENT,
                     bbox: bbox
                  });
               }
            }
         }
      }
   }
}