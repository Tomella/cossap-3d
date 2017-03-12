import { RocksLoader } from "./rocksloader";
declare var proj4;

export class RocksManager {
   rocks: RocksLoader;
   bbox3857: number[];
   points;
   zoom: number;

   constructor(public options: {dataUrl: string, serviceUrl: string, circumference: number, bbox: number[]}) {
      this.bbox3857 = bboxToEpsg3857(this.options.bbox);

      let length = longestSide(this.bbox3857);
      let ratio = this.options.circumference / length;
      console.log("Mr rocks here");
      console.log({length, ratio, options});

   }


   parse() {
      this.rocks =  new RocksLoader(this.options);

      return this.rocks.load().then(data => {



         return null;
      });
   }

   destroy() {

   }
}

function bboxToEpsg3857(bbox) {
   let ll = proj4("EPSG:4326", "EPSG:3857", [bbox[0], bbox[1]]);
   let ur = proj4("EPSG:4326", "EPSG:3857", [bbox[2], bbox[3]]);
   return [ll[0], ll[1], ur[0], ur[1]];
}

function longestSide(bbox: number[]): number {
   return Math.max(bbox[0] - bbox[2], bbox[1] - bbox[3]);
}