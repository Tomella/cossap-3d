import { UrlParameters } from "../utils/query";

export class Storage extends THREE.EventDispatcher {
   static MIN_SIDE_LENGTH = 0.004;
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
      let bbox = this.parseBbox("[" + UrlParameters.parameters().bbox + "]");
      let width = bbox[2] - bbox[0];
      let height = bbox[3] - bbox[1];

      // What about the duffer that puts it around the wrong way?
      if (width < 0) {
         let temp = bbox[2];
         bbox[2] = bbox[0];
         bbox[0] = temp;
         width = Math.abs(width);
      }
      if (height < 0) {
         let temp = bbox[3];
         bbox[3] = bbox[1];
         bbox[1] = temp;
         height = Math.abs(height);
      }

      let centerX = (bbox[2] + bbox[0]) * 0.5;
      let centerY = (bbox[3] + bbox[1]) * 0.5;
      let halfwit = Storage.MIN_SIDE_LENGTH * 0.5;
      // What about the duffer who puts in the same lat or lng?
      if (width < Storage.MIN_SIDE_LENGTH) {
         bbox[0] = centerX - halfwit;
         bbox[2] = centerX + halfwit;
      }
      if (height < Storage.MIN_SIDE_LENGTH) {
         bbox[1] = centerY - halfwit;
         bbox[3] = centerY + halfwit;
      }

      this.bbox = bbox;
   }

   private parseBbox(bboxStr) {
      if (bboxStr) {
         try {
            let parts = JSON.parse(bboxStr);
            if (Array.isArray(parts) && parts.every(num => !isNaN(num)) && parts.length === 4) {
               return parts;
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