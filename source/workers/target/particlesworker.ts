import { featureToEpsg3857, pointToEpsg3857 } from "../../utils/geoutils";
import { Config } from "../../app/config";
import { EventDispatcher } from "../../utils/eventdispatcher";
import { WorkerEvent } from "../workerevent";
declare var proj4;

export class ParticlesWorker  extends EventDispatcher {
   static BLOCK_SIZE = 20000;
   startIndex: number;

   constructor(public options: {template: string, any, id: string, bbox: number[]}) {
      super();
      this.startIndex = 0;
   }

   load() {
      this.createBlocks();
   }

   createBlocks() {
      let index = this.startIndex;

      let url = this.options.template + this.options.id + "?startIndex=" + index + "&maxCount=" + ParticlesWorker.BLOCK_SIZE;

      let loader = new Elevation.HttpTextLoader(url);
      loader.load().then(str => JSON.parse(str)).then(featureCollection => {
         let features = featureCollection.features;
         let totalFeatures = featureCollection.totalFeatures;
         this.dispatchEvent({
            type: WorkerEvent.PARTICLES_LOADED,
            data: this.mapFeatures(features)
         });

         this.startIndex += features.length;
         // Don't trust the figures.
         if (features.length && totalFeatures > this.startIndex) {
            this.createBlocks();
         } else {
            this.dispatchEvent({
               type: WorkerEvent.PARTICLES_COMPLETE,
               data: { count: totalFeatures}
            });
         }
      });
   }

   private mapFeatures(features: GeoJSON.Feature<GeoJSON.Point>[]) {
      let bbox = this.options.bbox;
      let colorMap = Config.preferences.rocks.lithologyGroups;
      let unknown = colorMap.unknown;

      // We filter out those outside the bbox
      return features.filter(item => Elevation.positionWithinBbox(bbox, item.geometry.coordinates) ).map(feature => {
         let point = pointToEpsg3857(feature.geometry.coordinates);
         let color = colorMap[feature.properties["LITHOLOGYGROUP"]];
         color = color ? color : unknown;
         let response = {
            id: feature.id,
            point: {
               x: point[0],
               y: point[1],
               z: feature.properties["SAMPLE_ELEVATION"] ? feature.properties["SAMPLE_ELEVATION"] : 0
            },
            color
         };
         return response;
      });
   }
}